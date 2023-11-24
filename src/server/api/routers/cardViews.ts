import { Balance } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getVerifiedBalance } from "~/server/utils";

export const cardViewsRouter = createTRPCRouter({
  getBalances: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    let balance: Balance;
    try {
      balance = await getVerifiedBalance(userId);
    } catch (error) {
      throw new Error(
        "Error retrieving balance while interacting with database",
      );
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
