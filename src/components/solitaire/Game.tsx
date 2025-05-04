import { sdk } from "@farcaster/frame-sdk";
import type React from "react";
import { useEffect, useState } from "react";
import Card from "./Card";
import {
	type GameState,
	canMoveToFoundation,
	canMoveToTableau,
	checkWinCondition,
	drawCard,
	findCardById,
	initializeGame,
} from "./GameLogic";

const SolitaireGame: React.FC = () => {
	const [gameState, setGameState] = useState<GameState>(initializeGame());
	const [selectedCardInfo, setSelectedCardInfo] = useState<{
		cardId: string;
		location: "waste" | "tableau" | "foundation";
		pileIndex: number | string | null;
	} | null>(null);

	// Initialize the app
	useEffect(() => {
		const initApp = async () => {
			await sdk.actions.ready();
		};

		initApp();
	}, []);

	// Check win condition
	useEffect(() => {
		if (checkWinCondition(gameState)) {
			setGameState((prev) => ({ ...prev, gameWon: true }));
			// Celebrate win
			setTimeout(async () => {
				try {
					await sdk.actions.addFrame();
				} catch (error) {
					console.error("Error adding frame:", error);
				}
			}, 1500);
		}
	}, [gameState]);

	// Draw a card from the deck
	const handleDrawCard = () => {
		setSelectedCardInfo(null);
		setGameState(drawCard);
	};

	// Select a card
	const handleSelectCard = (
		cardId: string,
		location: "waste" | "tableau" | "foundation",
		pileIndex: number | string | null,
	) => {
		const cardInfo = findCardById(gameState, cardId);

		if (!cardInfo.card?.faceUp) {
			return;
		}

		// If clicking on tableau and it's the last card in a stack, flip it
		if (location === "tableau" && typeof pileIndex === "number") {
			const tableau = gameState.tableau[pileIndex];
			const cardIndex = tableau.findIndex((card) => card.id === cardId);

			if (cardIndex === tableau.length - 1 && !tableau[cardIndex].faceUp) {
				const newState = { ...gameState };
				newState.tableau[pileIndex][cardIndex].faceUp = true;
				setGameState(newState);
				return;
			}
		}

		// If we already have a card selected, try to move it
		if (selectedCardInfo) {
			// Trying to move cards
			tryMoveCard(selectedCardInfo, { cardId, location, pileIndex });
		} else {
			// Just selecting a card
			setSelectedCardInfo({ cardId, location, pileIndex });
		}
	};

	// Try to move a card from one place to another
	const tryMoveCard = (
		from: {
			cardId: string;
			location: "waste" | "tableau" | "foundation";
			pileIndex: number | string | null;
		},
		to: {
			cardId: string;
			location: "waste" | "tableau" | "foundation";
			pileIndex: number | string | null;
		},
	) => {
		// Don't try to move to the same place
		if (from.cardId === to.cardId) {
			setSelectedCardInfo(null);
			return;
		}

		const sourceCardInfo = findCardById(gameState, from.cardId);
		const targetCardInfo = findCardById(gameState, to.cardId);

		if (!sourceCardInfo.card) {
			setSelectedCardInfo(null);
			return;
		}

		const newState = { ...gameState };

		// Moving to foundation pile
		if (to.location === "foundation" && typeof to.pileIndex === "string") {
			const foundation =
				newState.foundation[to.pileIndex as keyof typeof newState.foundation];

			if (canMoveToFoundation(sourceCardInfo.card, foundation)) {
				// Remove card from source
				if (sourceCardInfo.location === "waste") {
					newState.waste = newState.waste.filter(
						(card) => card.id !== from.cardId,
					);
				} else if (
					sourceCardInfo.location === "tableau" &&
					typeof sourceCardInfo.pileIndex === "number"
				) {
					newState.tableau[sourceCardInfo.pileIndex] = newState.tableau[
						sourceCardInfo.pileIndex
					].filter((card) => card.id !== from.cardId);
				}

				// Add to foundation
				foundation.push(sourceCardInfo.card);

				// Increment score
				newState.score += 10;
				newState.moves += 1;

				setGameState(newState);
			}
		}
		// Moving to tableau pile
		else if (to.location === "tableau" && typeof to.pileIndex === "number") {
			const tableau = newState.tableau[to.pileIndex];

			if (canMoveToTableau(sourceCardInfo.card, tableau)) {
				// Remove card from source
				if (sourceCardInfo.location === "waste") {
					newState.waste = newState.waste.filter(
						(card) => card.id !== from.cardId,
					);
				} else if (
					sourceCardInfo.location === "tableau" &&
					typeof sourceCardInfo.pileIndex === "number"
				) {
					const sourceTableau = newState.tableau[sourceCardInfo.pileIndex];
					const sourceCardIndex = sourceTableau.findIndex(
						(card) => card.id === from.cardId,
					);

					// Get the card and any cards on top of it
					const cardsToMove = sourceTableau.slice(sourceCardIndex);

					// Remove from source pile
					newState.tableau[sourceCardInfo.pileIndex] = sourceTableau.slice(
						0,
						sourceCardIndex,
					);

					// Add to target pile
					newState.tableau[to.pileIndex] = [...tableau, ...cardsToMove];
				}

				newState.moves += 1;
				setGameState(newState);
			}
		}

		setSelectedCardInfo(null);
	};

	// Directly move a card to a foundation if possible
	const tryAutoMoveToFoundation = (cardId: string) => {
		const cardInfo = findCardById(gameState, cardId);
		if (!cardInfo.card || !cardInfo.card.faceUp) return;

		const newState = { ...gameState };

		// Try to move to any foundation
		for (const suit of Object.keys(newState.foundation)) {
			const foundation =
				newState.foundation[suit as keyof typeof newState.foundation];

			if (canMoveToFoundation(cardInfo.card, foundation)) {
				// Remove from source
				if (cardInfo.location === "waste") {
					newState.waste = newState.waste.filter((card) => card.id !== cardId);
				} else if (
					cardInfo.location === "tableau" &&
					typeof cardInfo.pileIndex === "number"
				) {
					newState.tableau[cardInfo.pileIndex] = newState.tableau[
						cardInfo.pileIndex
					].filter((card) => card.id !== cardId);
				}

				// Add to foundation
				foundation.push(cardInfo.card);

				// Increment score and moves
				newState.score += 10;
				newState.moves += 1;

				setGameState(newState);
				return true;
			}
		}

		return false;
	};

	// Double-click handler for auto-moving to foundation
	const handleDoubleClick = (cardId: string) => {
		tryAutoMoveToFoundation(cardId);
	};

	// Restart the game
	const handleRestartGame = () => {
		setSelectedCardInfo(null);
		setGameState(initializeGame());
	};

	// Share the game
	const handleShareGame = async () => {
		try {
			await sdk.actions.openUrl("https://your-app-url.com/share");
		} catch (error) {
			console.error("Error sharing game:", error);
		}
	};

	return (
		<div className="relative p-4 bg-green-800 min-h-screen text-white">
			{gameState.gameWon && (
				<div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
					<div className="bg-white text-black p-6 rounded-lg text-center">
						<h2 className="text-2xl font-bold mb-4">You Won!</h2>
						<p className="mb-4">
							Moves: {gameState.moves} | Score: {gameState.score}
						</p>
						<div className="flex space-x-4 justify-center">
							<button
								onClick={handleRestartGame}
								className="bg-blue-500 text-white px-4 py-2 rounded"
							>
								Play Again
							</button>
							<button
								onClick={handleShareGame}
								className="bg-green-500 text-white px-4 py-2 rounded"
							>
								Share
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="mb-6 flex justify-between items-center">
				<h1 className="text-2xl font-bold">Solitaire</h1>
				<div className="text-sm">
					<div>Moves: {gameState.moves}</div>
					<div>Score: {gameState.score}</div>
				</div>
			</div>

			{/* Stock and Waste Piles */}
			<div className="flex space-x-6 mb-6">
				{/* Stock Pile */}
				<div
					onClick={handleDrawCard}
					className="h-24 w-16 bg-blue-900 rounded-md border-2 border-white flex items-center justify-center cursor-pointer"
					role="button"
					tabIndex={0}
					onKeyDown={(e) => e.key === "Enter" && handleDrawCard()}
				>
					{gameState.deck.length > 0 ? (
						<span className="text-white font-bold">
							{gameState.deck.length}
						</span>
					) : (
						<span className="text-white opacity-50">↻</span>
					)}
				</div>

				{/* Waste Pile */}
				<div className="relative h-24 w-16">
					{gameState.waste.length > 0 && (
						<div
							className={`absolute top-0 left-0 ${selectedCardInfo?.cardId === gameState.waste[gameState.waste.length - 1].id ? "ring-2 ring-yellow-400" : ""}`}
							onClick={() =>
								handleSelectCard(
									gameState.waste[gameState.waste.length - 1].id,
									"waste",
									null,
								)
							}
							onDoubleClick={() =>
								handleDoubleClick(
									gameState.waste[gameState.waste.length - 1].id,
								)
							}
						>
							<Card
								suit={gameState.waste[gameState.waste.length - 1].suit}
								value={gameState.waste[gameState.waste.length - 1].value}
								faceUp={true}
							/>
						</div>
					)}
				</div>

				{/* Foundation Piles */}
				<div className="flex space-x-2 ml-auto">
					{Object.entries(gameState.foundation).map(([suit, cards]) => (
						<div
							key={suit}
							className="h-24 w-16 bg-green-700 rounded-md border-2 border-white border-dashed"
							onClick={() =>
								cards.length === 0 &&
								selectedCardInfo &&
								handleSelectCard(selectedCardInfo.cardId, "foundation", suit)
							}
						>
							{cards.length > 0 && (
								<div
									onClick={() =>
										handleSelectCard(
											cards[cards.length - 1].id,
											"foundation",
											suit,
										)
									}
								>
									<Card
										suit={cards[cards.length - 1].suit}
										value={cards[cards.length - 1].value}
										faceUp={true}
									/>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Tableau */}
			<div className="flex space-x-2">
				{gameState.tableau.map((pile, pileIndex) => (
					<div key={pileIndex} className="relative min-h-24 w-16">
						{pile.length === 0 ? (
							<div
								className="h-24 w-16 bg-green-700 rounded-md border-2 border-white border-dashed"
								onClick={() =>
									selectedCardInfo &&
									handleSelectCard(
										selectedCardInfo.cardId,
										"tableau",
										pileIndex,
									)
								}
							/>
						) : (
							pile.map((card, cardIndex) => (
								<div
									key={card.id}
									className={`absolute top-0 left-0 transform translate-y-${cardIndex * 5} 
                    ${selectedCardInfo?.cardId === card.id ? "ring-2 ring-yellow-400" : ""}`}
									style={{ top: `${cardIndex * 20}px` }}
									onClick={() =>
										handleSelectCard(card.id, "tableau", pileIndex)
									}
									onDoubleClick={() =>
										card.faceUp && handleDoubleClick(card.id)
									}
								>
									<Card
										suit={card.suit}
										value={card.value}
										faceUp={card.faceUp}
									/>
								</div>
							))
						)}
					</div>
				))}
			</div>

			{/* Controls */}
			<div className="mt-8 flex justify-center space-x-4">
				<button
					onClick={handleRestartGame}
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					New Game
				</button>
				<button
					onClick={handleShareGame}
					className="bg-green-500 text-white px-4 py-2 rounded"
				>
					Share
				</button>
			</div>
		</div>
	);
};

export default SolitaireGame;
