import {
  type Balance,
  type Transaction,
  TransactionType,
} from "@prisma/client";
import { InitiateTransactionInput } from "prisma/zodSchemas/schemas";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  ExcessPaymentError,
  InsufficientBalanceError,
  createTransaction,
  deletePendingTransaction,
  getPendingTransactions,
  getVerifiedBalance,
  updateSettledTransaction,
} from "~/server/utils";

export const cardActionsRouter = createTRPCRouter({
  // Authorizes transaction and updates pending transactions and available credit
  // Returns updated pending transactions and availableCredit
  // TODO: refactor route into a transaction so that previous updates are cancelled in case a later step is invalid
  authorizeTransaction: protectedProcedure
    .input(InitiateTransactionInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Get verified balance; create balance if it does not exist
      let balance: Balance;
      try {
        balance = await getVerifiedBalance(userId);
        if (balance.availableBalance < input.amount) {
          throw new InsufficientBalanceError(
            "Insufficient available balance to authorize transaction",
          );
        }
      } catch (error) {
        if (error instanceof InsufficientBalanceError) {
          throw error;
        } else {
          throw new Error("Error retrieving verified balance");
        }
      }

      // Create pending transaction
      // Note: keep below structure in case we want to return transaction in the future
      const transaction: Transaction = await createTransaction(
        userId,
        TransactionType.PURCHASE,
        input.amount,
        input.name === "" ? "Untitled Transaction" : input.name,
      );

      // Get updated pending transactions
      const updatedPendingTransactions: Transaction[] =
        await getPendingTransactions(userId);

      // Decrement available balance by transaction amount
      let updatedBalance: Balance;
      try {
        updatedBalance = await ctx.db.balance.update({
          where: {
            id: userId,
          },
          data: {
            availableBalance: { decrement: input.amount },
          },
        });
      } catch (error) {
        throw new Error(
          "Error updating available balance while interacting with database",
        );
      }

      return {
        pendingTransactions: updatedPendingTransactions,
        availableBalance: updatedBalance.availableBalance,
      };
    }),
  // Note: payments are displayed as negative values, thus stored as negative numbers
  // TODO: refactor route into a transaction so that previous updates are cancelled in case a later step is invalid
  initiatePayment: protectedProcedure
    .input(InitiateTransactionInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Get verified payable balance and handle invalid inputs
      let balance: Balance;
      const payment = true;
      try {
        balance = await getVerifiedBalance(userId, payment);
        if (balance.payableBalance < input.amount) {
          throw new ExcessPaymentError(
            "Attempted payment amount exceeds payable balance",
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(
            "Error initiating payment while interacting with database",
          );
        }
      }

      // Create pending transaction
      // Note: keep below structure in case we want to return transaction in the future
      const transaction: Transaction = await createTransaction(
        userId,
        TransactionType.PAYMENT,
        -input.amount,
        input.name === "" ? "Untitled Transaction" : input.name,
      );

      // Get updated pending transactions
      const updatedPendingTransactions: Transaction[] =
        await getPendingTransactions(userId);

      // Decrement payable balance
      let updatedBalance: Balance;
      try {
        updatedBalance = await ctx.db.balance.update({
          where: {
            id: userId,
          },
          data: {
            // Note: decrementing as user input is positive (internally, we do end up storing as negative as seen above)
            payableBalance: { decrement: input.amount },
          },
        });
      } catch (error) {
        throw new Error(
          "Error updating available balance while interacting with database",
        );
      }
      return {
        pendingTransactions: updatedPendingTransactions,
        payableBalance: updatedBalance.payableBalance,
      };
    }),
  clearTransaction: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Sequentially clear pending transaction and increment available balance
      const cleared = await ctx.db.$transaction(async () => {
        // Remove pending transaction from database
        const clearedTransaction = await deletePendingTransaction(input.id);

        // Get updated pending transactions
        const updatedPendingTransactions: Transaction[] =
          await getPendingTransactions(userId);

        // Increment available balance
        const updatedBalance: Balance = await ctx.db.balance.update({
          where: {
            id: userId,
          },
          data: {
            availableBalance: {
              increment: clearedTransaction.amount,
            },
          },
        });
        return {
          pendingTransactions: updatedPendingTransactions,
          availableBalance: updatedBalance.availableBalance,
        };
      });

      return {
        pendingTransactions: cleared.pendingTransactions,
        availableBalance: cleared.availableBalance,
      };
    }),
  cancelPayment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Sequentially clear pending transaction and increment available balance
      // TODO: Create utility function for canceling transactions
      const canceled = await ctx.db.$transaction(async () => {
        // Remove pending transaction from database
        const canceledTransaction = await deletePendingTransaction(input.id);

        // Get updated pending transactions
        const updatedPendingTransactions: Transaction[] =
          await getPendingTransactions(userId);

        // Decrement payable balance
        const updatedBalance: Balance = await ctx.db.balance.update({
          where: {
            id: userId,
          },
          data: {
            payableBalance: {
              // Note: intuitively, we may want to "increment"
              // however, to incremenet, we "decrement" as payments are represented internally with negative values :)
              decrement: canceledTransaction.amount,
            },
          },
        });
        return {
          pendingTransactions: updatedPendingTransactions,
          payableBalance: updatedBalance.payableBalance,
        };
      });

      return {
        pendingTransactions: canceled.pendingTransactions,
        payableBalance: canceled.payableBalance,
      };
    }),
  settleTransaction: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        finalAmount: z
          .number()
          .positive("Final transaction amount must be greater than zero"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      if (input.finalAmount <= 0) {
        throw new Error(
          "Cannot process settlement: finalAmount less than or equal to zero",
        );
      }

      // Settle transaction and update balances sequentially
      const settled = await ctx.db.$transaction(async () => {
        // Change transaction status to settled and return amount
        const settledTransaction = await updateSettledTransaction(
          input.id,
          input.finalAmount,
        );

        // Get updated pending transactions
        const updatedPendingTransactions: Transaction[] =
          await getPendingTransactions(userId);

        // Decrement available balance and increment payable balance
        const diff = input.finalAmount - settledTransaction.amount;
        const updatedBalance: Balance = await ctx.db.balance.update({
          where: {
            id: userId,
          },
          data: {
            availableBalance: {
              decrement: diff,
            },
            payableBalance: {
              increment: input.finalAmount,
            },
          },
        });

        return {
          pendingTransactions: updatedPendingTransactions,
          availableBalance: updatedBalance.availableBalance,
          payableBalance: updatedBalance.payableBalance,
        };
      });

      return {
        pendingTransactions: settled.pendingTransactions,
        availableBalance: settled.availableBalance,
        payableBalance: settled.payableBalance,
      };
    }),
  postPayment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Post payment and update balances sequentially
      const posted = await ctx.db.$transaction(async () => {
        // Change transaction status to settled and return amount
        const postedTransaction = await updateSettledTransaction(input.id);

        // Get updated pending transactions
        const updatedPendingTransactions: Transaction[] =
          await getPendingTransactions(userId);

        // Increment available balance through "decrement" (since pending payment amount internally is negative)
        const updatedBalance: Balance = await ctx.db.balance.update({
          where: {
            id: userId,
          },
          data: {
            availableBalance: {
              decrement: postedTransaction.amount,
            },
          },
        });

        return {
          pendingTransactions: updatedPendingTransactions,
          availableBalance: updatedBalance.availableBalance,
          payableBalance: updatedBalance.payableBalance,
        };
      });
      return {
        pendingTransactions: posted.pendingTransactions,
        availableBalance: posted.availableBalance,
        payableBalance: posted.payableBalance,
      };
    }),
});
