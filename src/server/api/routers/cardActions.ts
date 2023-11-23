import { InitiateTransactionInput } from "prisma/zodSchemas/schemas";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const cardActionsRouter = createTRPCRouter({
  hello: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(({ ctx, input }) => {
      return {
        greeting: `Hello ${input.text}, ${ctx.auth?.userId}`,
      };
    }),
  initiateTransaction: protectedProcedure
    .input(InitiateTransactionInput)
    .mutation(async ({ ctx, input }) => {
      // TODO create pending transaction in database using Prisma
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
