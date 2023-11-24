import type { Balance } from "@prisma/client";
import { db } from "./db";

// Utility function to get the balance for a user
// If the balance does not exist, create one
export const getVerifiedBalance = async (userId: string): Promise<Balance> => {
  let balance = await db.balance.findUnique({
    where: {
      id: userId,
    },
  });
  if (!balance) {
    balance = await db.balance.create({
      data: {
        id: userId,
      },
    });
  }
  return balance;
};

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}
