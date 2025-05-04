import type { CardProps } from "./Card";

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Value =
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

export interface CardState extends Omit<CardProps, "onClick" | "draggable"> {
	id: string;
}

export interface GameState {
	deck: CardState[];
	waste: CardState[];
	foundation: Record<Suit, CardState[]>;
	tableau: CardState[][];
	selectedCard: string | null;
	moves: number;
	score: number;
	gameStarted: boolean;
	gameWon: boolean;
}

const valueOrder: Value[] = [
	"A",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"J",
	"Q",
	"K",
];
const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

// Initialize a new deck of cards
export const createDeck = (): CardState[] => {
	const deck: CardState[] = [];

	suits.forEach((suit) => {
		valueOrder.forEach((value) => {
			deck.push({
				id: `${value}-${suit}`,
				suit,
				value,
				faceUp: false,
			});
		});
	});

	return shuffleDeck(deck);
};

// Shuffle the deck
export const shuffleDeck = (deck: CardState[]): CardState[] => {
	const shuffled = [...deck];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled;
};

// Initialize a new game
export const initializeGame = (): GameState => {
	const deck = createDeck();
	const tableau: CardState[][] = Array(7)
		.fill([])
		.map(() => []);

	// Deal cards to tableau
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j <= i; j++) {
			const card = deck.pop();
			if (card) {
				// Only the top card is face up
				card.faceUp = j === i;
				tableau[i].push(card);
			}
		}
	}

	return {
		deck,
		waste: [],
		foundation: {
			hearts: [],
			diamonds: [],
			clubs: [],
			spades: [],
		},
		tableau,
		selectedCard: null,
		moves: 0,
		score: 0,
		gameStarted: true,
		gameWon: false,
	};
};

// Get the card's value index
export const getCardValueIndex = (value: Value): number => {
	return valueOrder.indexOf(value);
};

// Check if a card can be moved to a foundation pile
export const canMoveToFoundation = (
	card: CardState,
	foundation: CardState[],
): boolean => {
	if (!card.faceUp) return false;

	// If foundation is empty, only Ace can be placed
	if (foundation.length === 0) {
		return card.value === "A";
	}

	const topCard = foundation[foundation.length - 1];

	// Card must be same suit and next value
	return (
		card.suit === topCard.suit &&
		getCardValueIndex(card.value) === getCardValueIndex(topCard.value) + 1
	);
};

// Check if a card can be moved to a tableau pile
export const canMoveToTableau = (
	card: CardState,
	tableau: CardState[],
): boolean => {
	if (!card.faceUp) return false;

	// If tableau is empty, only King can be placed
	if (tableau.length === 0) {
		return card.value === "K";
	}

	const topCard = tableau[tableau.length - 1];
	if (!topCard.faceUp) return false;

	// Card must be opposite color and one value lower
	const isRed = card.suit === "hearts" || card.suit === "diamonds";
	const topIsRed = topCard.suit === "hearts" || topCard.suit === "diamonds";

	return (
		isRed !== topIsRed &&
		getCardValueIndex(card.value) === getCardValueIndex(topCard.value) - 1
	);
};

// Check if the game is won
export const checkWinCondition = (gameState: GameState): boolean => {
	// Game is won when all foundation piles have 13 cards each
	return Object.values(gameState.foundation).every(
		(pile) => pile.length === 13,
	);
};

// Draw a card from the deck to the waste pile
export const drawCard = (gameState: GameState): GameState => {
	const newState = { ...gameState };

	if (newState.deck.length === 0) {
		// If deck is empty, flip waste pile to create new deck
		newState.deck = [...newState.waste].reverse().map((card) => ({
			...card,
			faceUp: false,
		}));
		newState.waste = [];
		return newState;
	}

	const card = newState.deck.pop();
	if (card) {
		card.faceUp = true;
		newState.waste.push(card);
	}

	newState.moves += 1;
	return newState;
};

// Find a card by ID in the game state
export const findCardById = (
	gameState: GameState,
	cardId: string,
): {
	card: CardState | null;
	location: "waste" | "tableau" | "foundation" | null;
	pileIndex: number | Suit | null;
	cardIndex: number | null;
} => {
	// Check waste pile
	const wasteIndex = gameState.waste.findIndex((card) => card.id === cardId);
	if (wasteIndex >= 0) {
		return {
			card: gameState.waste[wasteIndex],
			location: "waste",
			pileIndex: null,
			cardIndex: wasteIndex,
		};
	}

	// Check tableau piles
	for (let i = 0; i < gameState.tableau.length; i++) {
		const cardIndex = gameState.tableau[i].findIndex(
			(card) => card.id === cardId,
		);
		if (cardIndex >= 0) {
			return {
				card: gameState.tableau[i][cardIndex],
				location: "tableau",
				pileIndex: i,
				cardIndex,
			};
		}
	}

	// Check foundation piles
	for (const suit of suits) {
		const cardIndex = gameState.foundation[suit].findIndex(
			(card) => card.id === cardId,
		);
		if (cardIndex >= 0) {
			return {
				card: gameState.foundation[suit][cardIndex],
				location: "foundation",
				pileIndex: suit,
				cardIndex,
			};
		}
	}

	return { card: null, location: null, pileIndex: null, cardIndex: null };
};
