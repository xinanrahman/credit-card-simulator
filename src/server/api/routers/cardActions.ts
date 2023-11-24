import type { Balance, Transaction } from "@prisma/client";
import { InitiateTransactionInput } from "prisma/zodSchemas/schemas";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { InsufficientBalanceError, getVerifiedBalance } from "~/server/utils";

export const cardActionsRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(({ ctx, input }) => {
      return {
        greeting: `Hello ${input.text}, ${ctx.auth?.userId}`,
      };
    }),

  // Authorizes transaction and updates pending transactions and available credit
  // Returns updated pending transactions and availableCredit
  authorizeTransaction: protectedProcedure
    .input(InitiateTransactionInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      if (!userId) {
        throw new Error("User is not authenticated");
      }

      // Create pending transaction
      // Note: keep below structure in case we want to return transaction in the future
      let transaction: Transaction;
      try {
        transaction = await ctx.db.transaction.create({
          data: {
            userId: userId,
            name: input.name ?? "Untitled Transaction",
            amount: input.amount,
            status: "PENDING",
            type: "PURCHASE",
          },
        });
      } catch (error) {
        throw new Error(
          "Error creating transaction while interacting with database",
        );
      }

      // Get updated pending transactions
      let updatedPendingTransactions: Transaction[];
      try {
        updatedPendingTransactions = await ctx.db.transaction.findMany({
          where: {
            userId: userId,
            status: "PENDING",
          },
        });
      } catch (error) {
        throw new Error(
          "Error retrieving pending transactions while interacting with database",
        );
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

      // Update available balance
      let updatedBalance: Balance;
      try {
        updatedBalance = await ctx.db.balance.update({
          where: {
            id: userId,
          },
          data: {
            availableBalance: balance.availableBalance - input.amount,
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
  initiatePayment: protectedProcedure
    .input(InitiateTransactionInput)
    .mutation(async ({ ctx, input }) => {
      // TODO create pending payment in database using Prisma
    }),
  clearTransaction: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO cancel pending transaction in database using Prisma
    }),
  cancelPayment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO cancel pending payment in database using Prisma
    }),
  settleTransaction: protectedProcedure
    .input(z.object({ id: z.string(), finalAmount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // TODO settle pending transaction in database using Prisma
    }),
  postPayment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO post pending payment in database using Prisma
    }),
});
