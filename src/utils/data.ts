import { TransactionType } from "@prisma/client";

const pendingColumns = [
  { name: "AMOUNT", uid: "amount" },
  { name: "NAME", uid: "name" },
  { name: "CREATED AT", uid: "createdAt" },
  { name: "STATUS", uid: "status" },
  { name: "TYPE", uid: "type" },
  { name: "ACTIONS", uid: "actions" },
];

const settledColumns = [
  { name: "AMOUNT", uid: "amount" },
  { name: "NAME", uid: "name" },
  { name: "CREATED AT", uid: "createdAt" },
  { name: "SETTLED AT", uid: "settledAt" },
  { name: "STATUS", uid: "status" },
  { name: "TYPE", uid: "type" },
];

const INITIAL_VISIBLE_COLUMNS_PENDING = [
  "amount",
  "name",
  "createdAt",
  "status",
  "type",
  "actions",
];

const INITIAL_VISIBLE_COLUMNS_SETTLED = [
  "amount",
  "name",
  "createdAt",
  "settledAt",
  "status",
  "type",
];

const typeOptions = [
  { name: TransactionType.PAYMENT, uid: "payment" },
  { name: TransactionType.PURCHASE, uid: "purchase" },
];

export {
  pendingColumns,
  settledColumns,
  typeOptions,
  INITIAL_VISIBLE_COLUMNS_PENDING,
  INITIAL_VISIBLE_COLUMNS_SETTLED,
};
