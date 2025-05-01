import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    try {
        const { prompt, weatherContext } = await req.json();
        if (!prompt) {
            return NextResponse.json({ error: "No prompt provided." }, { status: 400 });
        }

        // Compose the context + prompt as one conversation, both as 'user'
        const contentParts = [];
        if (weatherContext) {
            contentParts.push({ text: `Context: The current weather where the user is: ${weatherContext}. Use this info to help personalize your answer.` });
        }
        contentParts.push({ text: prompt });

        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const body = JSON.stringify({
            contents: [
                {
                    parts: contentParts // all 'user' parts
                }
            ]
        });

        const res = await fetch(apiURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Gemini API Error" }, { status: res.status });
        }
        const data = await res.json();
        const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini API.";

        return NextResponse.json({ text: geminiText });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Unexpected error." }, { status: 500 });
    }
}