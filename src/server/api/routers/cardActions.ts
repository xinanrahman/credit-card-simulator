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
});
