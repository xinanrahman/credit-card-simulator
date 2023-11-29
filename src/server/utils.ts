import {
  TransactionStatus,
  type Balance,
  type Transaction,
  type TransactionType,
} from "@prisma/client";
import { db } from "./db";
import {
  ClientPendingTransaction,
  ClientSettledTransaction,
} from "~/utils/types";

// Utility function to get the balance for a user
// Creates a balance if it doesn't exist and a payment is not being attempted
export const getVerifiedBalance = async (
  userId: string,
  payment = false,
): Promise<Balance> => {
  let balance: Balance | null;
  try {
    balance = await db.balance.findUnique({
      where: {
        id: userId,
      },
    });
    if (!balance) {
      // Handle invalid payment attempts
      if (payment)
        throw new Error(
          "Cannot process payment: balance record does not exist",
        );
      // Create balance if it doesn't exist and payment is not being initiated
      balance = await db.balance.create({
        data: {
          id: userId,
        },
      });
    }
    if (payment && balance.payableBalance == 0)
      throw new Error("Cannot process payment: payable balance is zero");
  } catch (error) {
    // Throw expected errors from try block
    if (error instanceof Error) throw error;
    throw new Error("Error retrieving balance while interacting with database");
  }

  return balance;
};

// Utility function to create a transaction for either a payment or purchase (authorization)
export const createTransaction = async (
  userId: string,
  type: TransactionType,
  amount: number,
  name = "Untitled Transaction",
): Promise<Transaction> => {
  let transaction: Transaction;
  try {
    transaction = await db.transaction.create({
      data: {
        userId,
        name,
        amount,
        status: TransactionStatus.PENDING,
        type,
      },
    });
    if (!transaction) {
      throw new Error(`Error creating transaction: transaction not found`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Unexpected error creating transaction while interacting with database",
    );
  }
  return transaction;
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

export const deletePendingTransaction = async (transactionId: number) => {
  // Delete pending transaction and retrieve pending amount
  let pendingTransaction: Pick<Transaction, "amount">;
  try {
    pendingTransaction = await db.transaction.delete({
      where: {
        id: transactionId,
      },
      select: {
        amount: true,
      },
    });
  } catch (error) {
    throw new Error("Error retrieving and deleting pending transaction");
  }
  return pendingTransaction;
};

export const updateSettledTransaction = async (
  transactionId: number,
  finalAmount?: number,
) => {
  let settled: Pick<Transaction, "amount">;
  try {
    // Include final amount if passed in (for transaction settlements)
    const updateData: {
      status: TransactionStatus;
      amount?: number;
      settledAt: Date;
    } = {
      status: TransactionStatus.SETTLED,
      settledAt: new Date(),
    };
    if (finalAmount) {
      updateData.amount = finalAmount;
    }

    settled = await db.transaction.update({
      where: {
        id: transactionId,
        status: TransactionStatus.PENDING,
      },
      data: updateData,
      select: {
        amount: true,
      },
    });

    if (!settled) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error updating settled transaction in database");
  }
  return settled;
};

export class InsufficientBalanceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

export class ExcessPaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExcessPaymentError";
  }
}

export const sortDescendingByDate = (
  a: ClientPendingTransaction | ClientSettledTransaction,
  b: ClientPendingTransaction | ClientSettledTransaction,
): number => {
  const dateA = new Date(a.createdAt);
  const dateB = new Date(b.createdAt);
  return dateB.getTime() - dateA.getTime();
};
