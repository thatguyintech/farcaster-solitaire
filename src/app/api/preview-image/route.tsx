import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
	try {
		return new ImageResponse(
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					backgroundColor: "#1e5631",
					color: "white",
					padding: "40px",
				}}
			>
				<div
					style={{
						display: "flex",
						fontSize: 60,
						fontWeight: "bold",
						marginBottom: "20px",
					}}
				>
					Farcaster Solitaire
				</div>

				<div
					style={{
						display: "flex",
						fontSize: 30,
						marginBottom: "40px",
						textAlign: "center",
					}}
				>
					Play classic Klondike Solitaire in your Farcaster client
				</div>

				<div
					style={{
						display: "flex",
						gap: "20px",
					}}
				>
					{/* Simple card illustrations */}
					{["♥", "♦", "♣", "♠"].map((symbol, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "120px",
								height: "180px",
								backgroundColor: "white",
								color: symbol === "♥" || symbol === "♦" ? "red" : "black",
								fontSize: 80,
								borderRadius: "10px",
								border: "5px solid #fff",
								boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
								transform: `rotate(${(i - 1.5) * 5}deg)`,
							}}
						>
							{symbol}
						</div>
					))}
				</div>

				<div
					style={{
						marginTop: "40px",
						display: "flex",
						padding: "16px 32px",
						backgroundColor: "#3b82f6",
						borderRadius: "8px",
						fontSize: 36,
						fontWeight: "bold",
					}}
				>
					Play Now
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
			},
		);
	} catch (e) {
		console.error(e);
		return new Response("Failed to generate image", { status: 500 });
	}
}
