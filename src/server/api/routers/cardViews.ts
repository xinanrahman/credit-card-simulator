import {
  TransactionStatus,
  type Balance,
  type Transaction,
} from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getVerifiedBalance } from "~/server/utils";

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

    // Get all transactions
    let transactions: Transaction[] | null;
    try {
      transactions = await ctx.db.transaction.findMany({
        where: {
          userId: userId,
        },
      });
    } catch (error) {
      throw new Error("Error while retrieving transactions from database");
    }

    // Filter transactions by pending and settled
    const pendingTransactions = transactions.filter(
      (t) => t.status == TransactionStatus.PENDING,
    );
    const settledTransactions = transactions.filter(
      (t) => t.status == TransactionStatus.SETTLED,
    );

    return { pendingTransactions, settledTransactions };
  }),
});
