import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
} from "@nextui-org/react";
import { VerticalDotsIcon } from "./icons/VerticalDotsIcon";
import { SearchIcon } from "./icons/SearchIcon";
import {
  INITIAL_VISIBLE_COLUMNS_PENDING,
  pendingColumns,
  typeOptions,
} from "~/utils/data";
import { capitalize } from "~/utils/helpers";
import React, { Key, ReactNode, useMemo } from "react";
import { api } from "~/utils/api";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import type { ClientPendingTransaction } from "~/utils/types";
import { TransactionType } from "@prisma/client";

const PendingTransactions = () => {
  // Retrieve pending transactions to populate table
  const { data: transactionsData } = api.cardViews.getTransactions.useQuery();
  const pendingTransactions = transactionsData
    ? transactionsData.pendingTransactions
    : [];
  const ctx = api.useContext();
  // Retrieve mutation functions for clearing and settling transactions
  const { mutateAsync: clearTransaction } =
    api.cardActions.clearTransaction.useMutation({
      onSuccess: () => {
        void ctx.cardViews.getBalances.invalidate();
        void ctx.cardViews.getTransactions.invalidate();
      },
    });
  const { mutateAsync: settleTransaction } =
    api.cardActions.settleTransaction.useMutation({
      onSuccess: () => {
        void ctx.cardViews.getBalances.invalidate();
        void ctx.cardViews.getTransactions.invalidate();
      },
    });

  const { mutateAsync: cancelPayment } =
    api.cardActions.cancelPayment.useMutation({
      onSuccess: () => {
        void ctx.cardViews.getBalances.invalidate();
        void ctx.cardViews.getTransactions.invalidate();
      },
    });
  const { mutateAsync: postPayment } = api.cardActions.postPayment.useMutation({
    onSuccess: () => {
      void ctx.cardViews.getBalances.invalidate();
      void ctx.cardViews.getTransactions.invalidate();
    },
  });

  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS_PENDING),
  );
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const handleCancel = async (
    txnId: number,
    type: TransactionType,
  ): Promise<void> => {
    try {
      if (type == TransactionType.PURCHASE)
        await clearTransaction({ id: txnId });
      else await cancelPayment({ id: txnId });
      alert("Successfully cancelled transaction!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Transaction cancellation failed! ${error.message}`);
      } else {
        alert(`Transaction cancellation failed! Unknown error :(`);
      }
    }
  };

  const handleSettle = async (
    txnId: number,
    amount: number,
    type: TransactionType,
  ): Promise<void> => {
    try {
      if (type == TransactionType.PURCHASE)
        await settleTransaction({ id: txnId, finalAmount: amount });
      else await postPayment({ id: txnId });
      alert("Successfully settled transaction!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Transaction settlement failed! ${error.message}`);
      } else {
        alert(`Transaction settlement failed! Unknown error :(`);
      }
    }
  };

  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return pendingColumns;

    return pendingColumns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredTransactions = [...pendingTransactions];

    if (hasSearchFilter) {
      filteredTransactions = filteredTransactions.filter((t) =>
        t.name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== typeOptions.length
    ) {
      filteredTransactions = filteredTransactions.filter((txn) =>
        Array.from(statusFilter).includes(txn.type.toLowerCase()),
      );
    }

    return filteredTransactions;
  }, [pendingTransactions, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const renderCell = React.useCallback(
    (txn: ClientPendingTransaction, columnKey: Key) => {
      let cellVal: string | number | Date;
      let displayVal: ReactNode;
      if (columnKey != "actions") {
        cellVal = txn[columnKey as keyof ClientPendingTransaction];
        if (cellVal instanceof Date)
          cellVal = `${cellVal.toLocaleDateString()} at ${cellVal.toLocaleTimeString()}`;
        displayVal = cellVal;
      }

      switch (columnKey) {
        case "amount":
          return (
            // need to support other currencies though :(
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">${displayVal}</p>
            </div>
          );
        case "name":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{displayVal}</p>
            </div>
          );
        case "createdAt":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small">{displayVal}</p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={"danger"}
              size="sm"
              variant="flat"
            >
              {displayVal}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex items-center justify-end gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon className="text-default-300" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onPress={() => handleCancel(txn.id, txn.type)}>
                    Cancel
                  </DropdownItem>
                  <DropdownItem
                    onPress={() => handleSettle(txn.id, txn.amount, txn.type)}
                  >
                    Settle
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return displayVal;
      }
    },
    [],
  );

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Type
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {typeOptions.map((type) => (
                  <DropdownItem key={type.uid} className="capitalize">
                    {capitalize(type.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {pendingColumns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-default-400">
            Total {pendingTransactions.length} pending transactions
          </span>
          <label className="flex items-center text-small text-default-400">
            Rows per page:
            <select
              className="bg-transparent text-small text-default-400 outline-none"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    pendingTransactions.length,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden w-[30%] justify-end gap-2 sm:flex">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, pages, hasSearchFilter]);

  return (
    <Table
      aria-label="Example table with custom cells, pagination and sorting"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      topContent={topContent}
      topContentPlacement="outside"
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"No pending transactions found"} items={items}>
        {(item) => (
          <TableRow key={item.createdAt.toISOString()}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PendingTransactions;
