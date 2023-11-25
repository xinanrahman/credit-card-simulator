import { Button } from "@/components/Button";
import { UserButton } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.cardActions?.hello.useQuery({ text: "from tRPC" });
  const { data: balanceData } = api.cardViews.getBalances.useQuery();
  const { data: transactionsData } = api.cardViews.getTransactions.useQuery();
  const { mutateAsync: initiateTransaction } =
    api.cardActions.authorizeTransaction.useMutation();
  const { mutateAsync: clearTransaction } =
    api.cardActions.clearTransaction.useMutation();
  const { mutateAsync: settleTransaction } =
    api.cardActions.settleTransaction.useMutation();

  // small suite of janky backend route tests
  const handleAuthorize = async (): Promise<void> => {
    try {
      const res = await initiateTransaction({ amount: 100, name: "4 vapes" });
      console.log(res);
      alert("Success!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Transaction authorization failed! ${error.message}`);
      } else {
        alert(`Transaction authorization failed! Unknown error :(`);
      }
    }
  };

  const handleCancel = async (): Promise<void> => {
    try {
      const res = await clearTransaction({ id: 5 });
      console.log(res);
      alert("Success!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Transaction cancellation failed! ${error.message}`);
      } else {
        alert(`Transaction cancellation failed! Unknown error :(`);
      }
    }
  };

  const handleSettle = async (): Promise<void> => {
    try {
      const res = await settleTransaction({ id: 6, finalAmount: 200 });
      console.log(res);
      alert("Success!");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Transaction cancellation failed! ${error.message}`);
      } else {
        alert(`Transaction cancellation failed! Unknown error :(`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Credit Card Simulator</title>
        <meta name="description" content="Credit card simulator app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserButton afterSignOutUrl="/"></UserButton>
      <div className="flex min-h-screen flex-col items-center justify-center bg-primary-foreground">
        <p className="text-2xl text-foreground">
          {hello.data ? hello.data.greeting : "Loading tRPC query..."}
        </p>
        <p className="text-2xl text-foreground">
          Available Balance:{" "}
          {balanceData?.availableBalance !== undefined
            ? balanceData.availableBalance
            : "Loading available balance..."}
        </p>
        <p className="text-2xl text-foreground">
          Payable Balance:{" "}
          {balanceData?.payableBalance !== undefined
            ? balanceData.payableBalance
            : "Loading payable balance..."}
        </p>
        <Button variant="outline" onClick={handleAuthorize}>
          Authorize Transaction
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel Transaction
        </Button>
        <Button variant="outline" onClick={handleSettle}>
          Settle Transaction
        </Button>
        <div>
          Transactions Data:{" "}
          {transactionsData !== undefined ? (
            <pre>{JSON.stringify(transactionsData)}</pre>
          ) : (
            "Loading available balance..."
          )}
        </div>
      </div>
    </>
  );
}
