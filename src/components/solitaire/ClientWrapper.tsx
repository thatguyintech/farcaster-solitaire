"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the game component with no SSR
const SolitaireGame = dynamic(() => import("./Game"), {
	ssr: false,
});

export default function SolitaireClientWrapper() {
	return <SolitaireGame />;
}
