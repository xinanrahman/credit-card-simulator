import { UserButton } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.cardActions?.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Credit Card Simulator</title>
        <meta name="description" content="Credit card simulator app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserButton afterSignOutUrl="/"></UserButton>
      <div className="bg-primary-foreground flex min-h-screen flex-col items-center justify-center">
        <p className="text-foreground text-2xl">
          {hello.data ? hello.data.greeting : "Loading tRPC query..."}
        </p>
      </div>
    </>
  );
}
