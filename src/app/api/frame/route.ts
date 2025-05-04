import { FrameRequest, getFrameMessage } from "@farcaster/frame-node";
import { type NextRequest, NextResponse } from "next/server";

// Define the base URL for our app
const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		// Validate the frame signature
		const body = await req.json();
		const frameMessage = await getFrameMessage(body);

		if (!frameMessage) {
			return NextResponse.json(
				{ error: "Invalid frame request" },
				{ status: 400 },
			);
		}

		// Redirect users to the main game URL
		return NextResponse.json({
			action: "navigate",
			target: {
				url: `${baseUrl}/solitaire`,
			},
		});
	} catch (error) {
		console.error("Error processing frame request:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
