export const maxDuration = 60;

export async function POST(request) {
  const { topic, platform, brand, audience, tone, competitors } = await request.json();

  if (!topic || !platform || !brand) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prompt = generatePrompt(topic, platform, brand, audience || "", tone || "", competitors || []);

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
        max_tokens: 16000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
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

    const jsonMatch = text.match(/\{[\s\S]*"ideas"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text.substring(0, 500));
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const clean = jsonMatch[0].replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (err) {
    console.error("Generate error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function generatePrompt(topic, platform, brand, audience, tone, competitors) {
  const platformFormats = {
    Instagram: "- Static single image post\n- Carousel (multi-slide)\n- Reel / short video\n- Infographic\n- Story series\nPick 3 DIFFERENT formats from above.",
    TikTok: "- Talking head / educational\n- Trending sound + overlay text\n- Stitch / duet style\n- Before & after\n- Day-in-the-life / routine\nPick 3 DIFFERENT formats from above.",
    LinkedIn: "- Text-only thought leadership post\n- Carousel / document slides\n- Personal story post\n- Poll + commentary\n- Article / long-form\nPick 3 DIFFERENT formats from above.",
    Blog: "- How-to / tutorial\n- Listicle\n- Deep-dive explainer\n- Myth-busting / debunking\n- Comparison / vs article\nPick 3 DIFFERENT formats from above.",
    Twitter: "- Thread (multi-tweet)\n- Single tweet with image\n- Poll + thread\n- Hot take + evidence thread\n- Storytelling thread\nPick 3 DIFFERENT formats from above.",
  };

  const platformBestPractices = {
    Instagram: "PLATFORM BEST PRACTICES (MUST follow):\n- Reels: 7-30 seconds. 7-15s gets highest completion. Hook in first 1-2 seconds.\n- Carousels: 8-10 slides (10 is the sweet spot). NEVER exceed 12. NEVER go below 8.\n- Content should feel native and authentic — NOT like an ad.",
    TikTok: "PLATFORM BEST PRACTICES (MUST follow):\n- Video length: 7-30 seconds. Under 15s performs best.\n- Hook in first 1-2 seconds. Authentic and native — NOT ad-like.",
    LinkedIn: "PLATFORM BEST PRACTICES (MUST follow):\n- Text posts: 1,200-1,500 characters. Strong hook. Line breaks.\n- Carousels: 8-12 slides. Professional but human.",
    Blog: "PLATFORM BEST PRACTICES (MUST follow):\n- 1,500-2,500 words. H2/H3 every 200-300 words. Actionable takeaways.",
    Twitter: "PLATFORM BEST PRACTICES (MUST follow):\n- Threads: 5-8 tweets. Killer hook first tweet. Clear CTA at end.",
  };

  const competitorList = (competitors || []).filter(c => c.trim());
  const competitorSection = competitorList.length > 0 ? `\nCompetitors: ${competitorList.map(c => `"${c}"`).join(", ")}. Study their content strategy and differentiate.` : "";
  const brandUrl = brand.match(/(https?:\/\/[^\s]+)/);
  const brandResearch = brandUrl ? `\nResearch the brand at ${brandUrl[1]} for visual identity, style, and branding.` : `\nResearch "${brand}" for visual identity, style, and branding.`;

  const refInstruction = platform === "Blog"
    ? `2-3 REAL blog articles, research papers, or written content related to this specific idea's angle and topic. Use web search to find real URLs. Each must include a clickable URL. Do NOT link to social media accounts.`
    : `2-3 social media accounts or creators (NOT the user's brand or competitors) known for executing this type of content well on ${platform}. Include their handle and what to study about their content.`;

  const refFormat = platform === "Blog" ? "Article title — https://real-url" : "@handle or brand name";

  return `You are Bento, a content ideation assistant.

Topic: "${topic}"
Platform: ${platform}
Brand: ${brand}
Target Audience: ${audience}
Tone of Voice: ${tone}${competitorSection}
${brandResearch}

${platformBestPractices[platform] || ""}

STEP 1: Research the brand's visual identity via web search. All visual direction must align with this brand.
STEP 2: Research the ACTUAL SUBJECT MATTER of "${topic}" — science, facts, expert opinions. NOT social media strategy.
STEP 3: Generate 3 ideas using DIFFERENT formats:
${platformFormats[platform] || ""}

For each idea:
1. **angle**: Hook or headline
2. **format**: Content format
3. **research**: 4 points about THE ACTUAL TOPIC with <key> tags. Real URLs for sources.
4. **brief**: EVERY slide/scene/tweet individual. Carousels: Slide 1-10 with Headline:/Body:/Visual:. Reels: scenes with Timing:/On-screen text:/Voiceover:/Visual:. Text: Hook:/Body:/CTA:. Blog: H2:/Key points:/Takeaway:. NEVER group.
5. **why**: 1-2 sentences
6. **visual_direction**: Consistent with brand identity:
   - **mood**: 2-3 words
   - **layout**: Use • bullets for each instruction
   - **imagery_and_icons**: Use • bullets. Must match brand's visual identity
   - **references**: ${refInstruction}

JSON only:
{
  "ideas": [
    {
      "angle": "string", "format": "string",
      "research": [{"point": "string (<key>...</key>)", "source": "string (Name — url)"}],
      "brief": [{"step": "string", "content": "string"}],
      "why": "string",
      "visual_direction": {
        "mood": "string",
        "layout": "string (• bullets)",
        "imagery_and_icons": "string (• bullets)",
        "references": [{"handle": "string (${refFormat})", "note": "string (what to study/take away)"}]
      }
    }
  ]
}`;
}
