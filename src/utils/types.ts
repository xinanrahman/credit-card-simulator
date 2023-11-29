import { SortDescriptor } from "@nextui-org/react";
import type { Transaction } from "@prisma/client";

export type RelevantTransactionData = Pick<
  Transaction,
  "id" | "amount" | "name" | "type" | "createdAt" | "settledAt" | "status"
>;

export type ClientPendingTransaction = Omit<
  RelevantTransactionData,
  "settledAt"
>;

// Can add more properties if necessary in the future with &
export type ClientSettledTransaction = RelevantTransactionData;

export type ExtendedColumnKey = keyof ClientPendingTransaction | "actions";

export type SettledTransactionsDescriptor = SortDescriptor & {
  column: keyof Omit<ClientSettledTransaction, "type" | "status">;
};

export type PendingTransactionsSortDescriptor = SortDescriptor & {
  column: keyof Omit<ClientPendingTransaction, "type" | "status" | "settledAt">;
};
