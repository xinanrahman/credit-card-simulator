import { cardActionsRouter } from "~/server/api/routers/cardActions";
import { createTRPCRouter } from "~/server/api/trpc";
import { cardViewsRouter } from "./routers/cardViews";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  cardActions: cardActionsRouter,
  cardViews: cardViewsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
