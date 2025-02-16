import { ClerkProvider } from "@clerk/nextjs";
import LoadingPage from "Layout/LoadingPage";
import Head from "next/head";
import App from "provider/App";
import { useState } from "react";
import 'styles/globals.sass';
import { Layout } from '../Layout';

const MyApp = ({ Component, pageProps }) => {
    const pageLoading = useState<boolean>(true)

    return (
        <>
            <Head>
                <title>Focal Dashboard</title>
            </Head>
            <ClerkProvider>
                <div id='overlay' />
                <div id='loading' />
                <LoadingPage active={pageLoading[0]} />
                <App pageLoading={pageLoading}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </App>
            </ClerkProvider>
        </>
    )
}

export default MyApp