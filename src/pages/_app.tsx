import "~/styles/globals.css";
import type { AppProps } from "next/app";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "~/components/Header";
import Footer from "~/components/Footer";

const client = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={client}>
            <Header />
            <Component {...pageProps} />
            <Footer />
        </QueryClientProvider>
    );
}
