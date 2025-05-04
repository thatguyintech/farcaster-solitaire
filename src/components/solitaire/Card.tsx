import type React from "react";

type Suit = "hearts" | "diamonds" | "clubs" | "spades";
type Value =
	| "A"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "10"
	| "J"
	| "Q"
	| "K";

export interface CardProps {
	suit: Suit;
	value: Value;
	faceUp: boolean;
	onClick?: () => void;
	draggable?: boolean;
}

const suitColors: Record<Suit, string> = {
	hearts: "text-red-600",
	diamonds: "text-red-600",
	clubs: "text-black",
	spades: "text-black",
};

const suitSymbols: Record<Suit, string> = {
	hearts: "♥",
	diamonds: "♦",
	clubs: "♣",
	spades: "♠",
};

export const Card: React.FC<CardProps> = ({
	suit,
	value,
	faceUp,
	onClick,
	draggable = false,
}) => {
	if (!faceUp) {
		return (
			<div
				onClick={onClick}
				className="h-24 w-16 bg-blue-800 rounded-md shadow-md border-2 border-white cursor-pointer"
			/>
		);
	}

	const color = suitColors[suit];
	const symbol = suitSymbols[suit];

	return (
		<div
			onClick={onClick}
			draggable={draggable}
			className={`h-24 w-16 bg-white rounded-md shadow-md border-2 border-gray-300 flex flex-col p-1 cursor-pointer ${draggable ? "cursor-grab" : ""}`}
		>
			<div className={`flex justify-between items-center ${color}`}>
				<span className="text-sm font-bold">{value}</span>
				<span className="text-sm">{symbol}</span>
			</div>
			<div className={`flex-grow flex justify-center items-center ${color}`}>
				<span className="text-xl">{symbol}</span>
			</div>
			<div
				className={`flex justify-between items-center ${color} self-end transform rotate-180`}
			>
				<span className="text-sm font-bold">{value}</span>
				<span className="text-sm">{symbol}</span>
			</div>
		</div>
	);
};

export default Card;
