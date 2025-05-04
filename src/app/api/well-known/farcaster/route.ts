import { type NextRequest, NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
	"Content-Type": "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: corsHeaders,
	});
}

export async function GET(req: NextRequest): Promise<NextResponse> {
	// Get the host from the request
	const host = req.headers.get("host") || "eleven-feet-ask.loca.lt";
	const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
	const baseUrl = `${protocol}://${host}`;

	// Create the Farcaster JSON manifest
	const farcasterJson = {
		name: "Solitaire",
		description:
			"Play classic Klondike Solitaire directly in your Farcaster client!",
		developers: [
			{
				name: "Your Name", // Replace with your actual name
				fid: 1234, // Replace with your actual Farcaster ID
				username: "yourname", // Replace with your actual Farcaster username
			},
		],
		categories: ["fun", "games"],
		icon_url: `${baseUrl}/api/preview-image`,
		domain: host,
		features: {
			mini_app: {
				home_url: `${baseUrl}/solitaire`,
			},
			notifications: true,
		},
	};

	// Set CORS headers to allow Warpcast to access your manifest
	return new NextResponse(JSON.stringify(farcasterJson), {
		status: 200,
		headers: corsHeaders,
	});
}
