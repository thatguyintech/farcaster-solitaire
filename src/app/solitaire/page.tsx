import type { Metadata } from "next";
import React from "react";
import SolitaireClientWrapper from "../../components/solitaire/ClientWrapper";

export const metadata: Metadata = {
	title: "Farcaster Solitaire",
	description: "Play Klondike Solitaire on Farcaster",
};

export default function SolitairePage() {
	return (
		<div>
			<SolitaireClientWrapper />
		</div>
	);
}
