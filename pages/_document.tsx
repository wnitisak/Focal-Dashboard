import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
    return (
        <Html>
            <Head>
                <Script src="https://kit.fontawesome.com/c405aac917.js" strategy='beforeInteractive' crossOrigin="anonymous" />
                <meta name="viewport" content="width=device-width ,initial-scale=1,minimum-scale=1 ,maximum-scale=1,user-scalable=no" />
                <link rel="icon" href="/logo.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}