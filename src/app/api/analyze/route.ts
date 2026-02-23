import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are Xai Intelligence Engine, an advanced data analysis AI. Analyze the provided data and return a JSON response with this EXACT structure (no markdown, no code fences, pure JSON only):

{
  "summary": "2-3 sentence executive summary of the data",
  "keyFindings": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5"],
  "sentiment": {
    "overall": "positive|negative|neutral|mixed",
    "score": 0.85,
    "breakdown": [
      {"label": "Positive", "value": 65},
      {"label": "Negative", "value": 15},
      {"label": "Neutral", "value": 20}
    ]
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "metrics": [
    {"label": "Data Points", "value": "1,247", "change": "+12.4%"},
    {"label": "Patterns Found", "value": "18", "change": "+3"},
    {"label": "Confidence", "value": "94.2%", "change": "+2.1%"},
    {"label": "Anomalies", "value": "3", "change": "-1"}
  ],
  "anomalies": [
    {"description": "Unusual spike in values at row 45", "severity": "high", "confidence": 0.92},
    {"description": "Missing data cluster between rows 100-110", "severity": "medium", "confidence": 0.87}
  ],
  "chartData": {
    "timeSeries": [
      {"label": "Jan", "value": 42}, {"label": "Feb", "value": 55}, {"label": "Mar", "value": 38},
      {"label": "Apr", "value": 67}, {"label": "May", "value": 72}, {"label": "Jun", "value": 61},
      {"label": "Jul", "value": 85}
    ],
    "distribution": [
      {"label": "Low", "value": 20}, {"label": "Medium", "value": 45},
      {"label": "High", "value": 25}, {"label": "Critical", "value": 10}
    ],
    "categories": [
      {"label": "Category A", "value": 340}, {"label": "Category B", "value": 280},
      {"label": "Category C", "value": 190}, {"label": "Category D", "value": 150},
      {"label": "Category E", "value": 95}
    ]
  },
  "modelInfo": {
    "model": "llama-3.3-70b-versatile",
    "tokensUsed": 0,
    "latencyMs": 0,
    "confidence": 0.94
  }
}

Generate realistic values based on the actual data provided. The chartData values should reflect patterns you find in the data. Keep all numbers and findings grounded in the actual content.`;

export async function POST(req: NextRequest) {
  try {
    const { content, fileName, fileType } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured. Add your key to .env.local" },
        { status: 500 }
      );
    }

    const truncatedContent = content.slice(0, 8000);

    const startTime = Date.now();

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this ${fileType || "data"} file named "${fileName || "unknown"}":\n\n${truncatedContent}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const latencyMs = Date.now() - startTime;
    const responseText = completion.choices[0]?.message?.content || "{}";

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Enhance with actual usage stats
    analysis.modelInfo = {
      ...analysis.modelInfo,
      model: completion.model || "llama-3.3-70b-versatile",
      tokensUsed: completion.usage?.total_tokens || 0,
      latencyMs,
    };

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
