import type { Balance } from "@prisma/client";

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
  getTransactions: protectedProcedure.query(({ ctx }) => {
    // TODO: get pending and settled transactions from database using Prisma
  }),
});
