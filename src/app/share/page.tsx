import type { Metadata } from "next";
import React from "react";

// Define the base URL for our app
const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
const previewImageUrl = `${baseUrl}/api/preview-image`;

export const metadata: Metadata = {
	title: "Farcaster Solitaire - Share",
	description: "Play Klondike Solitaire on Farcaster",
	openGraph: {
		title: "Farcaster Solitaire",
		description: "Play Klondike Solitaire on Farcaster",
		images: [previewImageUrl],
	},
	other: {
		"fc:frame": JSON.stringify({
			image: previewImageUrl,
			buttons: [
				{
					label: "Play Solitaire",
					action: "post",
				},
			],
			post_url: `${baseUrl}/api/frame`,
		}),
	},
};

export default function SharePage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-green-800 text-white">
			<h1 className="text-3xl font-bold mb-4">Farcaster Solitaire</h1>
			<p className="mb-8 text-center">
				Play classic Klondike Solitaire directly in your Farcaster client!
			</p>

			<div className="w-full max-w-md bg-white text-black p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-bold mb-4">How to Play:</h2>
				<ul className="list-disc list-inside space-y-2">
					<li>Build four foundation piles, one for each suit</li>
					<li>Start with Aces and build up in sequence</li>
					<li>Build tableau piles down in alternating colors</li>
					<li>Move single cards or stacks between piles</li>
					<li>Double-click cards to automatically move to foundation</li>
				</ul>
			</div>

			<div className="mt-8">
				<a
					href="/solitaire"
					className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
				>
					Play Now
				</a>
			</div>
		</div>
	);
}
