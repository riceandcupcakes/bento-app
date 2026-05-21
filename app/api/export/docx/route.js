import { Document, Packer, Paragraph, TextRun, BorderStyle, ShadingType, PageBreak } from "docx";

export async function POST(request) {
  const { ideas, folderName, brand } = await request.json();
  if (!ideas || ideas.length === 0) return Response.json({ error: "No ideas to export" }, { status: 400 });

  const PINK = "C07A8E";
  const DARK = "1C1917";
  const MID = "44403C";
  const LIGHT = "A39888";

  const hr = () => new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E8E2D9", space: 8 } }, spacing: { after: 200 } });
  const sectionHeader = (emoji, title) => new Paragraph({
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text: `${emoji}  ${title}`, bold: true, size: 22, font: "Arial", color: PINK, allCaps: true })],
  });

  const buildIdeaSection = (item, isLast) => {
    const idea = item.idea;
    const vd = idea.visual_direction || {};
    const refs = vd.references || vd.reference_accounts || [];
    const children = [];

    // Header
    children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "BENTO", bold: true, size: 18, font: "Arial", color: PINK, allCaps: true })] }));
    children.push(new Paragraph({ spacing: { after: 60 }, children: [
      new TextRun({ text: `${item.platform}  ·  `, size: 20, font: "Arial", color: LIGHT }),
      new TextRun({ text: item.topic, size: 20, font: "Arial", color: LIGHT, italics: true }),
      ...(brand ? [new TextRun({ text: `  ·  ${brand}`, size: 20, font: "Arial", color: LIGHT })] : []),
    ] }));
    children.push(hr());

    // Angle
    children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: (idea.format || "").toUpperCase(), bold: true, size: 18, font: "Arial", color: PINK })] }));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: idea.angle || "", bold: true, size: 32, font: "Arial", color: DARK })] }));

    // Research
    children.push(sectionHeader("🔬", "RESEARCH"));
    (idea.research || []).forEach(r => {
      const point = (r.point || "").replace(/<\/?key>/g, "");
      children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: point, size: 21, font: "Arial", color: MID })] }));
      children.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: r.source || "", size: 18, font: "Arial", color: LIGHT, italics: true })] }));
    });
    children.push(hr());

    // Brief
    children.push(sectionHeader("📋", "CONTENT BRIEF"));
    (idea.brief || []).forEach(b => {
      children.push(new Paragraph({
        spacing: { before: 120, after: 80 },
        shading: { fill: "FFF4F2", type: ShadingType.CLEAR },
        children: [new TextRun({ text: `  ${b.step}`, bold: true, size: 20, font: "Arial", color: PINK })],
      }));
      const lines = (b.content || "").split(/(?=(?:Headline|Body|Visual|Caption|Voiceover|On-screen text|Hook|CTA|Timing|H2|Key points|Takeaway):)/gi);
      lines.forEach(line => {
        const m = line.match(/^(Headline|Body|Visual|Caption|Voiceover|On-screen text|Hook|CTA|Timing|H2|Key points|Takeaway):\s*(.*)/is);
        if (m) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `${m[1]}: `, bold: true, size: 21, font: "Arial", color: DARK }), new TextRun({ text: m[2].trim(), size: 21, font: "Arial", color: MID })] }));
        else if (line.trim()) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: line.trim(), size: 21, font: "Arial", color: MID })] }));
      });
    });
    children.push(hr());

    // Visual Direction
    children.push(sectionHeader("🎨", "VISUAL DIRECTION"));
    if (vd.mood) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Mood: ", bold: true, size: 21, font: "Arial", color: DARK }), new TextRun({ text: vd.mood, size: 24, font: "Arial", color: DARK, bold: true })] }));
    if (vd.layout) {
      children.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Layout", bold: true, size: 21, font: "Arial", color: DARK })] }));
      vd.layout.split("•").filter(Boolean).forEach(b => children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [new TextRun({ text: `•  ${b.trim()}`, size: 21, font: "Arial", color: MID })] })));
    }
    if (vd.creative_concept || vd.imagery_and_icons) {
      const cc = vd.creative_concept || vd.imagery_and_icons;
      children.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Creative Concept", bold: true, size: 21, font: "Arial", color: DARK })] }));
      cc.split("•").filter(Boolean).forEach(b => children.push(new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [new TextRun({ text: `•  ${b.trim()}`, size: 21, font: "Arial", color: MID })] })));
    }
    if (refs.length > 0) {
      children.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: refs.some(r => r.handle?.includes("http")) ? "Reference Articles" : "Study These Accounts", bold: true, size: 21, font: "Arial", color: DARK })] }));
      refs.forEach(r => {
        children.push(new Paragraph({ spacing: { after: 20 }, indent: { left: 360 }, children: [new TextRun({ text: r.handle || "", bold: true, size: 21, font: "Arial", color: PINK })] }));
        children.push(new Paragraph({ spacing: { after: 80 }, indent: { left: 360 }, children: [new TextRun({ text: r.note || "", size: 20, font: "Arial", color: LIGHT, italics: true })] }));
      });
    }
    children.push(hr());

    // Why
    children.push(sectionHeader("✨", "WHY THIS WORKS"));
    children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: idea.why || "", size: 21, font: "Arial", color: MID })] }));

    // Page break between ideas (not after last)
    if (!isLast) children.push(new Paragraph({ children: [new PageBreak()] }));

    return children;
  };

  const allChildren = ideas.flatMap((item, i) => buildIdeaSection(item, i === ideas.length - 1));

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 24 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: allChildren,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `${(folderName || "bento-export").replace(/[^a-zA-Z0-9]/g, "-")}.docx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
