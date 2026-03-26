export const maxDuration = 60;

export async function POST(request) {
  const { topic, platform, brand, audience, tone, brandStyle, competitors } = await request.json();

  if (!topic || !platform || !brand) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const prompt = generatePrompt(topic, platform, brand, audience || "", tone || "", brandStyle || "", competitors || []);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 6000,
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

    const jsonMatch = text.match(/\{[\s\S]*"idea"[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text.substring(0, 500));
      return Response.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const clean = jsonMatch[0].replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    const idea = parsed.idea || (parsed.ideas && parsed.ideas[0]);

    if (!idea) {
      return Response.json({ error: "No idea generated" }, { status: 500 });
    }

    // Return idea + usage stats
    const usage = data.usage || {};
    return Response.json({
      idea,
      usage: {
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0,
        cost: ((usage.input_tokens || 0) / 1000000 * 0.80 + (usage.output_tokens || 0) / 1000000 * 4.00).toFixed(4),
      },
    });
  } catch (err) {
    console.error("Generate error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function generatePrompt(topic, platform, brand, audience, tone, brandStyle, competitors) {
  const platformFormats = {
    Instagram: "- Static single image post\n- Carousel (multi-slide)\n- Reel / short video\n- Infographic\n- Story series\nPick the best format for this topic.",
    TikTok: "- Talking head / educational\n- Trending sound + overlay text\n- Stitch / duet style\n- Before & after\n- Day-in-the-life / routine\nPick the best format for this topic.",
    LinkedIn: "- Text-only thought leadership post\n- Carousel / document slides\n- Personal story post\n- Poll + commentary\n- Article / long-form\nPick the best format for this topic.",
    Blog: "- How-to / tutorial\n- Listicle\n- Deep-dive explainer\n- Myth-busting / debunking\n- Comparison / vs article\nPick the best format for this topic.",
    Twitter: "- Thread (multi-tweet)\n- Single tweet with image\n- Poll + thread\n- Hot take + evidence thread\n- Storytelling thread\nPick the best format for this topic.",
  };

  const platformBestPractices = {
    Instagram: "PLATFORM RULES: Reels: 7-30s, hook in 1-2s. Carousels: 8-10 slides max. Authentic, NOT ad-like.",
    TikTok: "PLATFORM RULES: 7-30s, under 15s best. Hook in 1-2s. Raw and authentic, NOT polished ads.",
    LinkedIn: "PLATFORM RULES: Text: 1,200-1,500 chars, strong hook, line breaks. Carousels: 8-12 slides. Human tone.",
    Blog: "PLATFORM RULES: 1,500-2,500 words. H2/H3 every 200-300 words. Actionable takeaways.",
    Twitter: "PLATFORM RULES: Threads: 5-8 tweets. Killer hook first tweet. Clear CTA.",
  };

  const competitorList = (competitors || []).filter(c => c.trim());
  const competitorContext = competitorList.length > 0
    ? `\nCompetitors (differentiate from these): ${competitorList.join(", ")}`
    : "";

  const brandStyleContext = brandStyle
    ? `\nBrand visual style: ${brandStyle}`
    : "";

  const refInstruction = platform === "Blog"
    ? `2-3 real blog articles or publications related to this idea. Use web search to find real URLs. Format: "Article title — https://url"`
    : `2-3 social media accounts (NOT the user's brand or competitors) to study for visual execution. Format: "@handle or brand name"`;

  const refFormat = platform === "Blog" ? "Article title — https://real-url" : "@handle or brand name";

  return `You are Bento, a content ideation assistant. Generate 1 content idea.

Topic: "${topic}"
Platform: ${platform}
Brand: ${brand}
Target Audience: ${audience}
Tone: ${tone}${competitorContext}${brandStyleContext}

${platformBestPractices[platform] || ""}

Use web search to research "${topic}" — find real facts, studies, expert opinions about the topic itself. Do NOT search for the brand or competitors — you already have that context above.

Format options:
${platformFormats[platform] || ""}

Provide:
1. **angle**: Compelling hook/headline
2. **format**: Content format chosen
3. **research**: 4 points about the topic with <key>key finding</key> tags. Each source needs a real URL from your search.
4. **brief**: EVERY slide/scene/tweet individually:
   - Carousels: Slide 1, Slide 2... each with Headline: / Body: / Visual:
   - Reels/TikTok: Each scene with Timing: / On-screen text: / Voiceover: / Visual:
   - Text posts: Hook: / Body: / CTA:
   - Blog: Each H2: / Key points: / Takeaway:
   NEVER group slides.
5. **why**: 1-2 sentences
6. **visual_direction**: A creative director's brief for this specific content piece. Do NOT repeat brand guidelines back — the creator already knows their brand. Instead describe the CREATIVE CONCEPT:
   - **mood**: 2-3 words
   - **layout**: Specific layout concept using • bullets (e.g., "• Split layout: large photo left, stat right • Title bar across top with bold text • Bottom strip with subtle CTA")
   - **creative_concept**: Describe the visual idea, art direction, and feel. What should this look like? What's the vibe? Think like a creative director pitching a concept, not listing brand guidelines. Use • bullets.
   - **references**: ${refInstruction}

JSON only, no markdown fences:
{
  "idea": {
    "angle": "string",
    "format": "string",
    "research": [{"point": "string", "source": "string (Name — url)"}],
    "brief": [{"step": "string", "content": "string"}],
    "why": "string",
    "visual_direction": {
      "mood": "string",
      "layout": "string",
      "creative_concept": "string",
      "references": [{"handle": "string (${refFormat})", "note": "string"}]
    }
  }
}`;
}
