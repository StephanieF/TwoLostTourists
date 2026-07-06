import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Two Lost Tourists",
	description: "Restoration logs and road trip notes for a 1999 Country Coach diesel pusher.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
				{/* Future SEO/ADA/analytics audit slot: no tracking script added yet, add here. */}
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<header className="border-b border-foreground/10">
					<div className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-4 text-sm">
						<Link href="/" className="font-semibold">
							Two Lost Tourists
						</Link>
						<nav className="flex gap-4">
							<Link href="/blog" className="hover:underline">
								Blog
							</Link>
							<Link href="/blog/tag/restoration" className="hover:underline">
								Restoration
							</Link>
							<Link href="/blog/tag/road-trip" className="hover:underline">
								Road Trips
							</Link>
							<Link href="/blog/search" className="hover:underline">
								Search
							</Link>
						</nav>
					</div>
				</header>
				{children}
				<footer className="border-t border-foreground/10">
					<div className="mx-auto max-w-3xl px-4 py-6 text-sm text-foreground/60">
						Two Lost Tourists — keeping an orphaned diesel pusher on the road.
					</div>
				</footer>
			</body>
		</html>
	);
}
