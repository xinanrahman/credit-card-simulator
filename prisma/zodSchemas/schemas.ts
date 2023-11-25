import * as z from "zod";

// InitiateTransaction input schema
export const InitiateTransactionInput = z.object({
  name: z.string().optional(),
  amount: z.number(),
});
