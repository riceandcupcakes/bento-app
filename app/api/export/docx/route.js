import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, LevelFormat, ShadingType } from "docx";

export async function POST(request) {
  const { idea, topic, platform, brand } = await request.json();
  if (!idea) return Response.json({ error: "No idea to export" }, { status: 400 });

  const vd = idea.visual_direction || {};
  const refs = vd.references || vd.reference_accounts || [];

  // Color constants
  const PINK = "C07A8E";
  const DARK = "1C1917";
  const MID = "44403C";
  const LIGHT = "A39888";
  const BG = "FAF8F5";

  const hr = () => new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "E8E2D9", space: 8 } }, spacing: { after: 200 } });

  const sectionHeader = (emoji, title) => new Paragraph({
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text: `${emoji}  ${title}`, bold: true, size: 22, font: "Arial", color: PINK, allCaps: true })],
  });

  // Build research section
  const researchParas = (idea.research || []).flatMap(r => {
    const point = (r.point || "").replace(/<\/?key>/g, "");
    return [
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: point, size: 21, font: "Arial", color: MID })] }),
      new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: r.source || "", size: 18, font: "Arial", color: LIGHT, italics: true })] }),
    ];
  });

  // Build brief section
  const briefParas = (idea.brief || []).flatMap(b => {
    const content = (b.content || "").split(/(?=(?:Headline|Body|Visual|Caption|Voiceover|On-screen text|Hook|CTA|Timing|H2|Key points|Takeaway):)/gi);
    const lines = content.map(line => {
      const m = line.match(/^(Headline|Body|Visual|Caption|Voiceover|On-screen text|Hook|CTA|Timing|H2|Key points|Takeaway):\s*(.*)/is);
      if (m) return new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `${m[1]}: `, bold: true, size: 21, font: "Arial", color: DARK }), new TextRun({ text: m[2].trim(), size: 21, font: "Arial", color: MID })] });
      return new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: line.trim(), size: 21, font: "Arial", color: MID })] });
    });
    return [
      new Paragraph({
        spacing: { before: 120, after: 80 },
        shading: { fill: "FFF4F2", type: ShadingType.CLEAR },
        children: [new TextRun({ text: `  ${b.step}`, bold: true, size: 20, font: "Arial", color: PINK })],
      }),
      ...lines,
    ];
  });

  // Build visual direction
  const vdParas = [];
  if (vd.mood) vdParas.push(
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Mood: ", bold: true, size: 21, font: "Arial", color: DARK }), new TextRun({ text: vd.mood, size: 24, font: "Arial", color: DARK, bold: true })] })
  );
  if (vd.layout) {
    vdParas.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Layout", bold: true, size: 21, font: "Arial", color: DARK })] }));
    vd.layout.split("•").filter(Boolean).forEach(b => vdParas.push(
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [new TextRun({ text: `•  ${b.trim()}`, size: 21, font: "Arial", color: MID })] })
    ));
  }
  if (vd.creative_concept || vd.imagery_and_icons) {
    const cc = vd.creative_concept || vd.imagery_and_icons;
    vdParas.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Creative Concept", bold: true, size: 21, font: "Arial", color: DARK })] }));
    cc.split("•").filter(Boolean).forEach(b => vdParas.push(
      new Paragraph({ spacing: { after: 40 }, indent: { left: 360 }, children: [new TextRun({ text: `•  ${b.trim()}`, size: 21, font: "Arial", color: MID })] })
    ));
  }
  if (refs.length > 0) {
    vdParas.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: refs.some(r => r.handle?.includes("http")) ? "Reference Articles" : "Study These Accounts", bold: true, size: 21, font: "Arial", color: DARK })] }));
    refs.forEach(r => vdParas.push(
      new Paragraph({ spacing: { after: 20 }, indent: { left: 360 }, children: [new TextRun({ text: r.handle || "", bold: true, size: 21, font: "Arial", color: PINK })] }),
      new Paragraph({ spacing: { after: 80 }, indent: { left: 360 }, children: [new TextRun({ text: r.note || "", size: 20, font: "Arial", color: LIGHT, italics: true })] }),
    ));
  }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 24 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        // Header
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "BENTO", bold: true, size: 18, font: "Arial", color: PINK, allCaps: true })] }),
        new Paragraph({ spacing: { after: 60 }, children: [
          new TextRun({ text: `${platform}  ·  `, size: 20, font: "Arial", color: LIGHT }),
          new TextRun({ text: topic, size: 20, font: "Arial", color: LIGHT, italics: true }),
          ...(brand ? [new TextRun({ text: `  ·  ${brand}`, size: 20, font: "Arial", color: LIGHT })] : []),
        ] }),
        hr(),

        // Angle & Format
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: idea.format?.toUpperCase() || "", bold: true, size: 18, font: "Arial", color: PINK })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: idea.angle || "", bold: true, size: 32, font: "Arial", color: DARK })] }),

        // Research
        sectionHeader("🔬", "RESEARCH"),
        ...researchParas,
        hr(),

        // Content Brief
        sectionHeader("📋", "CONTENT BRIEF"),
        ...briefParas,
        hr(),

        // Visual Direction
        sectionHeader("🎨", "VISUAL DIRECTION"),
        ...vdParas,
        hr(),

        // Why This Works
        sectionHeader("✨", "WHY THIS WORKS"),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: idea.why || "", size: 21, font: "Arial", color: MID })] }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const filename = `bento-${topic.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 30)}.docx`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
