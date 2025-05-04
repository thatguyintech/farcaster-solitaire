import type { Metadata } from "next";
import Link from "next/link";

const appUrl = process.env.NEXT_PUBLIC_URL;

// frame preview metadata
const appName = process.env.NEXT_PUBLIC_FRAME_NAME;
const splashImageUrl = `${appUrl}/splash.png`;
const iconUrl = `${appUrl}/icon.png`;

const framePreviewMetadata = {
	version: "next",
	imageUrl: `${appUrl}/opengraph-image`,
	button: {
		title: process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT,
		action: {
			type: "launch_frame",
			name: appName,
			url: appUrl,
			splashImageUrl,
			iconUrl,
			splashBackgroundColor: "#f7f7f7",
		},
	},
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: appName,
		openGraph: {
			title: appName,
			description: process.env.NEXT_PUBLIC_FRAME_DESCRIPTION,
		},
		other: {
			"fc:frame": JSON.stringify(framePreviewMetadata),
		},
	};
}

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
			<main className="max-w-4xl w-full bg-white rounded-lg shadow-md p-8">
				<h1 className="text-3xl font-bold mb-6 text-center">
					Farcaster Mini Apps
				</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Link
						href="/solitaire"
						className="block p-6 bg-green-800 text-white rounded-lg shadow hover:shadow-lg transition-shadow"
					>
						<h2 className="text-xl font-bold mb-2">Solitaire</h2>
						<p>
							Play classic Klondike Solitaire directly in your Farcaster client!
						</p>
					</Link>

					<Link
						href="/share"
						className="block p-6 bg-blue-500 text-white rounded-lg shadow hover:shadow-lg transition-shadow"
					>
						<h2 className="text-xl font-bold mb-2">Share Solitaire</h2>
						<p>Share the Solitaire Mini App with your friends on Farcaster!</p>
					</Link>
				</div>
			</main>
		</div>
	);
}
