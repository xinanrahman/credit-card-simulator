import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const cardViewsRouter = createTRPCRouter({
  getBalances: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    let balance = await ctx.db.balance.findUnique({
      where: {
        id: userId,
      },
    });

    if (!balance) {
      balance = await ctx.db.balance.create({
        data: {
          id: userId,
        },
      });
    }
    return {
      availableBalance: balance.availableBalance,
      payableBalance: balance.payableBalance,
    };
  }),
  getTransactions: protectedProcedure.query(({ ctx }) => {
    // TODO: get pending and settled transactions from database using Prisma
  }),
});
