import * as z from "zod";

// InitiateTransaction input schema
export const InitiateTransactionInput = z.object({
  name: z.string().optional(),
  amount: z.number().positive("Transaction amount must be greater than zero"),
});
