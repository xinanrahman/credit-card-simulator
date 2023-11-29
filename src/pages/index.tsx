import Head from "next/head";
import AvailableBalance from "~/components/AvailableBalance";
import PayableBalance from "~/components/PayableBalance";
import PendingTransactions from "~/components/PendingTransactions";
import SettledTransactions from "~/components/SettledTransactions";
import NavBar from "~/components/ui/NavBar";

export default function Home() {
  return (
    <>
      <Head>
        <title>Credit Card Simulator</title>
        <meta name="description" content="Credit card simulator app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-gray-100">
        <NavBar></NavBar>
        <div
          className="mx-auto mt-10 flex items-start justify-between p-4"
          style={{ maxWidth: "1024px" }}
        >
          {/* Right-justified card with a minimum width */}
          <div className="mr-2 min-w-[300px] flex-1">
            <AvailableBalance />
          </div>
          {/* Left-justified card with a minimum width */}
          <div className="ml-2 min-w-[300px] flex-1">
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
