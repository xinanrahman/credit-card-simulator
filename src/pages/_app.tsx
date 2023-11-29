import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { NextUIProvider } from "@nextui-org/react";
import { ChakraBaseProvider } from "@chakra-ui/react";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <NextUIProvider>
        <ChakraBaseProvider>
          <Component {...pageProps} />;
        </ChakraBaseProvider>
      </NextUIProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
