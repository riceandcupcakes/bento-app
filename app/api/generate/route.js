export async function POST(request) {
  const { topic, platform, brandDescription } = await request.json();

  if (!topic || !platform || !brandDescription) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prompt = generatePrompt(topic, platform, brandDescription);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return Response.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (err) {
    console.error("Generate error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function generatePrompt(topic, platform, brandDescription) {
  const platformFormats = {
    Instagram:
      "- Static single image post\n- Carousel (multi-slide)\n- Reel / short video\n- Infographic\n- Story series\nPick 3 DIFFERENT formats from above.",
    TikTok:
      "- Talking head / educational\n- Trending sound + overlay text\n- Stitch / duet style\n- Before & after\n- Day-in-the-life / routine\nPick 3 DIFFERENT formats from above.",
    LinkedIn:
      "- Text-only thought leadership post\n- Carousel / document slides\n- Personal story post\n- Poll + commentary\n- Article / long-form\nPick 3 DIFFERENT formats from above.",
    Blog:
      "- How-to / tutorial\n- Listicle\n- Deep-dive explainer\n- Myth-busting / debunking\n- Comparison / vs article\nPick 3 DIFFERENT formats from above.",
    Twitter:
      "- Thread (multi-tweet)\n- Single tweet with image\n- Poll + thread\n- Hot take + evidence thread\n- Storytelling thread\nPick 3 DIFFERENT formats from above.",
  };

  return `You are Bento, a content ideation assistant for content marketers.

The user wants content ideas about: "${topic}"
Platform: ${platform}
Brand/Audience context: ${brandDescription}

Generate exactly 3 unique and creative content ideas. IMPORTANT: Each idea MUST use a DIFFERENT content format. For ${platform}, vary between these formats:
${platformFormats[platform] || "Pick 3 different and appropriate content formats."}

For each idea, provide:

1. **Idea/Angle**: A compelling hook or headline
2. **Format**: The specific content format (e.g., "Carousel", "Reel", "Thread", etc.)
3. **Research Summary**: Exactly 4 detailed research points relevant to this topic. Each point must be 2-3 sentences with real, substantive findings. Within each point, wrap the single most important phrase or finding in <key> tags so it can be highlighted. Cite real, verifiable sources (journals, publications, reputable sites with URLs where possible).
4. **Content Brief**: A specific structural outline tailored for the chosen format on ${platform}. Be detailed and specific to the format chosen — a carousel brief should have slide-by-slide breakdown, a reel should have a second-by-second script, a thread should have tweet-by-tweet content, etc.
5. **Why This Works**: 1-2 sentences on why this angle AND this format are effective for ${platform}

Respond ONLY in valid JSON with this exact structure, no markdown fences:
{
  "ideas": [
    {
      "angle": "string",
      "format": "string",
      "research": [
        {"point": "string (include <key>highlighted phrase</key> tags around the most important finding)", "source": "string (publication name + URL if available)"}
      ],
      "brief": [
        {"step": "string (e.g. 'Slide 1' or 'Tweet 1' or 'Section 1')", "content": "string"}
      ],
      "why": "string"
    }
  ]
}`;
}
