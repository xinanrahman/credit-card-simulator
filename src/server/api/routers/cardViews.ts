import { TransactionStatus, type Balance } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getVerifiedBalance, sortDescendingByDate } from "~/server/utils";
import type {
  ClientPendingTransaction,
  ClientSettledTransaction,
  RelevantTransactionData,
} from "~/utils/types";

export const cardViewsRouter = createTRPCRouter({
  getBalances: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    const balance: Balance = await getVerifiedBalance(userId);

    return {
      availableBalance: balance.availableBalance,
      payableBalance: balance.payableBalance,
    };
  }),
  getTransactions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    // Get relevent transaction data
    let transactions: RelevantTransactionData[];
    try {
      transactions = await ctx.db.transaction.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          amount: true,
          name: true,
          createdAt: true,
          settledAt: true,
          status: true,
          type: true,
        },
      });
    } catch (error) {
      throw new Error("Error while retrieving transactions from database");
    }

    // Filter transactions by pending and settled
    const pendingTransactions: ClientPendingTransaction[] = transactions
      .filter((t) => t.status == TransactionStatus.PENDING)
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        name: t.name,
        createdAt: t.createdAt,
        status: t.status,
        type: t.type,
      }))
      .sort(sortDescendingByDate);

    const settledTransactions: ClientSettledTransaction[] = transactions
      .filter((t) => t.status == TransactionStatus.SETTLED)
      .sort(sortDescendingByDate);

    return { pendingTransactions, settledTransactions };
  }),
});
