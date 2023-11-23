import { UserButton } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.cardActions?.hello.useQuery({ text: "from tRPC" });
  const { data, isLoading, error } = api.cardViews.getBalances.useQuery();

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
          {data?.availableBalance
            ? data.availableBalance
            : "Loading available balance..."}
        </p>
        <p className="text-2xl text-foreground">
          Payable Balance:{" "}
          {data?.payableBalance
            ? data.availableBalance
            : "Loading payable balance..."}
        </p>
      </div>
    </>
  );
}
