import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ondankamap.vercel.app'),
  title: {
    default: '東京温暖化グラフ | 1880-2024年の気温データ可視化',
    template: '%s | 東京温暖化グラフ'
  },
  description: '東京の145年間（1880-2024年）の気温データを可視化。猛暑日・真夏日・熱帯夜の年次推移、年別気温比較、現在の天気予報と過去データの比較など、地球温暖化の実態をグラフで直感的に理解できます。',
  keywords: [
    '東京', '温暖化', '気温', 'グラフ', '気象データ', '猛暑日', '真夏日', '熱帯夜',
    '年次推移', '気候変動', '地球温暖化', '天気予報', '統計', 'データ可視化',
    '明治', '大正', '昭和', '平成', '令和', '気象庁', '1880年', '2024年'
  ],
  authors: [{ name: 'ondankamap' }],
  creator: 'ondankamap',
  publisher: 'ondankamap',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://ondankamap.vercel.app',
    title: '東京温暖化グラフ | 145年間の気温データ可視化',
    description: '東京の145年間（1880-2024年）の気温データを可視化。猛暑日・真夏日・熱帯夜の年次推移、年別気温比較など、地球温暖化の実態をグラフで直感的に理解。',
    siteName: '東京温暖化グラフ',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '東京温暖化グラフ - 145年間の気温データ可視化',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '東京温暖化グラフ | 145年間の気温データ可視化',
    description: '東京の145年間（1880-2024年）の気温データを可視化。猛暑日・真夏日・熱帯夜の年次推移、年別気温比較など、地球温暖化の実態をグラフで直感的に理解。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
    yandex: '',
    yahoo: '',
  },
  alternates: {
    canonical: 'https://ondankamap.vercel.app',
  },
  category: '環境・気象・データ可視化',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#f87171" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* 構造化データ - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "東京温暖化グラフ",
              "url": "https://ondankamap.vercel.app",
              "description": "東京の145年間（1880-2024年）の気温データを可視化。猛暑日・真夏日・熱帯夜の年次推移、年別気温比較など、地球温暖化の実態をグラフで直感的に理解できます。",
              "inLanguage": "ja-JP",
              "author": {
                "@type": "Organization",
                "name": "ondankamap"
              },
              "publisher": {
                "@type": "Organization",
                "name": "ondankamap"
              }
            })
          }}
        />
        
        {/* 構造化データ - Dataset */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dataset",
              "name": "東京気温データ（1880-2024年）",
              "description": "東京の145年間の日別最高・最低気温データ。気象庁データを元に温暖化傾向を分析。",
              "url": "https://ondankamap.vercel.app",
              "keywords": ["東京", "気温", "温暖化", "気象データ", "猛暑日", "真夏日", "熱帯夜"],
              "creator": {
                "@type": "Organization",
                "name": "ondankamap"
              },
              "publisher": {
                "@type": "Organization",
                "name": "ondankamap"
              },
              "temporalCoverage": "1880-01-01/2024-12-31",
              "spatialCoverage": {
                "@type": "Place",
                "name": "東京",
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 35.681236,
                  "longitude": 139.767125
                }
              },
              "variableMeasured": [
                {
                  "@type": "PropertyValue",
                  "name": "日最高気温",
                  "unitText": "摂氏度"
                },
                {
                  "@type": "PropertyValue", 
                  "name": "日最低気温",
                  "unitText": "摂氏度"
                }
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${notoSansJP.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
