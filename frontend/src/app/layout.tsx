import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const baseUrl = "https://worldring.example";

export const metadata: Metadata = {
  title: {
    default: `${SITE.brandName} — ${SITE.hero.headline}`,
    template: `%s | ${SITE.brandName}`,
  },
  description: SITE.hero.lede,
  keywords: [
    "360° video",
    "3D reconstruction",
    "spatial computing",
    "physical AI",
    "street view",
    "neural radiance fields",
    "photogrammetry",
    "worldring",
  ],
  authors: [{ name: "Earthos Lab Team" }],
  creator: "Earthos Lab",
  publisher: "Earthos Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: `${SITE.brandName} — ${SITE.hero.headline}`,
    description: SITE.hero.lede,
    url: baseUrl,
    siteName: SITE.brandName,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Earthos Lab — Turn the real world into a world you can explore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.brandName} — ${SITE.hero.headline}`,
    description: SITE.hero.lede,
    images: [`${baseUrl}/og-image.png`],
    creator: "@earthoslab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: SITE.brandName,
  description: SITE.hero.lede,
  url: baseUrl,
  brand: {
    "@type": "Brand",
    name: SITE.brandName,
  },
  category: "Spatial Computing Software",
  operatingSystem: "Web",
  applicationCategory: "DeveloperApplication",
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/PreOrder",
    price: "0",
    priceCurrency: "USD",
    description: "Prototype access - early stage exploration",
  },
  mainEntity: {
    "@type": "SoftwareApplication",
    name: SITE.brandName,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
    },
    description: SITE.hero.lede,
    featureList: [
      "360° street video ingestion",
      "Visual-inertial SfM trajectory solving",
      "Neural point cloud + mesh reconstruction",
      "Semantic spatial layer classification",
      "Interactive route previews via WebGL",
      "REST + WebGL spatial APIs",
    ],
  },
  potentialAction: {
    "@type": "UseAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}#demo`,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    name: "Explore the demo",
  },
};

const jsFlag = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${plexMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
