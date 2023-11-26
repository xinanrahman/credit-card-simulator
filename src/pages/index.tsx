import { UserButton } from "@clerk/nextjs";
import Head from "next/head";
import { Button } from "@nextui-org/react";

import { api } from "~/utils/api";
import AvailableBalance from "~/components/AvailableBalance";
import PayableBalance from "~/components/PayableBalance";
import PendingTransactions from "~/components/PendingTransactions";
import SettledTransactions from "~/components/SettledTransactions";
import NavBar from "~/components/ui/NavBar";

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
      <div className="flex min-h-screen flex-col bg-gray-100">
        <NavBar></NavBar>
        <div className="flex flex-wrap justify-center gap-4 p-4">
          <div className="flex-1">
            <AvailableBalance />
          </div>
          <div className="flex-1">
            <PayableBalance />
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 p-4">
          <div className="flex-1">
            <PendingTransactions />
          </div>
          <div className="flex-1">
            <SettledTransactions />
          </div>
        </div>
      </div>
    </>
  );
}
