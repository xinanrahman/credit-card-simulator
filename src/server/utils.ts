import type { Balance, Transaction } from "@prisma/client";
import { db } from "./db";

// Utility function to get the balance for a user
// If the balance does not exist, create one
export const getVerifiedBalance = async (userId: string): Promise<Balance> => {
  let balance: Balance | null;
  try {
    balance = await db.balance.findUnique({
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
  } catch (error) {
    throw new Error("Error retrieving balance while interacting with database");
  }

  return balance;
};

export const getPendingTransactions = async (
  userId: string,
): Promise<Transaction[]> => {
  // Get updated pending transactions
  let updatedPendingTransactions: Transaction[];
  try {
    updatedPendingTransactions = await db.transaction.findMany({
      where: {
        userId: userId,
        status: "PENDING",
      },
    });
  } catch (error) {
    throw new Error("Error retrieving updated pending transactions");
  }

  return updatedPendingTransactions;
};

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}
