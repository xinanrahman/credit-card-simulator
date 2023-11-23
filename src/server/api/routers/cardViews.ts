import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const cardViewsRouter = createTRPCRouter({
  getBalances: protectedProcedure.query(({ ctx }) => {
    // TODO: get available balance and payable balance from database using Prisma
  }),
  getTransactions: protectedProcedure.query(({ ctx }) => {
    // TODO: get pending and settled transactions from database using Prisma
  }),
});
