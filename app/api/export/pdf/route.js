import PDFDocument from "pdfkit";

export async function POST(request) {
  const { idea, topic, platform, brand } = await request.json();
  if (!idea) return Response.json({ error: "No idea to export" }, { status: 400 });

  const vd = idea.visual_direction || {};
  const refs = vd.references || vd.reference_accounts || [];

  const PINK = [192, 122, 142];
  const DARK = [28, 25, 23];
  const MID = [68, 64, 60];
  const LIGHT = [163, 152, 136];
  const LINE = [232, 226, 217];

  const doc = new PDFDocument({ size: "LETTER", margins: { top: 60, bottom: 60, left: 60, right: 60 } });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const pageWidth = doc.page.width - 120;

  const hr = () => {
    doc.moveDown(0.5);
    doc.strokeColor(...LINE).lineWidth(1).moveTo(60, doc.y).lineTo(60 + pageWidth, doc.y).stroke();
    doc.moveDown(0.5);
  };

  const checkPage = (needed = 80) => {
    if (doc.y + needed > doc.page.height - 60) doc.addPage();
  };

  const sectionHeader = (text) => {
    checkPage(60);
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor(...PINK).font("Helvetica-Bold").text(text.toUpperCase(), { characterSpacing: 1.5 });
    doc.moveDown(0.4);
  };

  const bulletPoint = (text) => {
    checkPage(30);
    const x = doc.x;
    doc.fontSize(9).fillColor(...PINK).text("•", x, doc.y, { continued: false });
    doc.fontSize(9.5).fillColor(...MID).font("Helvetica").text(text.trim(), x + 14, doc.y - doc.currentLineHeight(), { width: pageWidth - 14 });
    doc.moveDown(0.2);
  };

  // ── Header ──
  doc.fontSize(8).fillColor(...PINK).font("Helvetica-Bold").text("BENTO", { characterSpacing: 2 });
  doc.moveDown(0.2);
  doc.fontSize(9).fillColor(...LIGHT).font("Helvetica").text(`${platform}  ·  ${topic}${brand ? `  ·  ${brand}` : ""}`);
  hr();

  // ── Angle & Format ──
  doc.fontSize(8).fillColor(...PINK).font("Helvetica-Bold").text((idea.format || "").toUpperCase(), { characterSpacing: 1 });
  doc.moveDown(0.3);
  doc.fontSize(18).fillColor(...DARK).font("Helvetica-Bold").text(idea.angle || "", { lineGap: 3 });
  doc.moveDown(0.8);

  // ── Research ──
  sectionHeader("🔬  Research");
  (idea.research || []).forEach(r => {
    checkPage(50);
    const point = (r.point || "").replace(/<\/?key>/g, "");
    doc.fontSize(9.5).fillColor(...MID).font("Helvetica").text(point, { width: pageWidth, lineGap: 2 });
    doc.fontSize(8).fillColor(...LIGHT).font("Helvetica-Oblique").text(r.source || "", { width: pageWidth });
    doc.moveDown(0.5);
  });
  hr();

  // ── Content Brief ──
  sectionHeader("📋  Content Brief");
  (idea.brief || []).forEach(b => {
    checkPage(60);
    // Step label
    doc.fontSize(8.5).fillColor(...PINK).font("Helvetica-Bold").text(b.step || "");
    doc.moveDown(0.2);

    // Parse content
    const lines = (b.content || "").split(/(?=(?:Headline|Body|Visual|Caption|Voiceover|On-screen text|Hook|CTA|Timing|H2|Key points|Takeaway):)/gi);
    lines.forEach(line => {
      const m = line.match(/^(Headline|Body|Visual|Caption|Voiceover|On-screen text|Hook|CTA|Timing|H2|Key points|Takeaway):\s*(.*)/is);
      if (m) {
        checkPage(30);
        doc.fontSize(9).fillColor(...DARK).font("Helvetica-Bold").text(`${m[1]}: `, { continued: true });
        doc.font("Helvetica").fillColor(...MID).text(m[2].trim(), { lineGap: 2 });
      } else if (line.trim()) {
        doc.fontSize(9).fillColor(...MID).font("Helvetica").text(line.trim(), { lineGap: 2 });
      }
    });
    doc.moveDown(0.5);
  });
  hr();

  // ── Visual Direction ──
  sectionHeader("🎨  Visual Direction");

  if (vd.mood) {
    doc.fontSize(8.5).fillColor(...DARK).font("Helvetica-Bold").text("Mood: ", { continued: true });
    doc.fontSize(11).text(vd.mood);
    doc.moveDown(0.4);
  }

  if (vd.layout) {
    doc.fontSize(8.5).fillColor(...DARK).font("Helvetica-Bold").text("Layout");
    doc.moveDown(0.2);
    vd.layout.split("•").filter(Boolean).forEach(b => bulletPoint(b));
    doc.moveDown(0.3);
  }

  if (vd.creative_concept || vd.imagery_and_icons) {
    const cc = vd.creative_concept || vd.imagery_and_icons;
    checkPage(40);
    doc.fontSize(8.5).fillColor(...DARK).font("Helvetica-Bold").text("Creative Concept");
    doc.moveDown(0.2);
    cc.split("•").filter(Boolean).forEach(b => bulletPoint(b));
    doc.moveDown(0.3);
  }

  if (refs.length > 0) {
    checkPage(40);
    doc.fontSize(8.5).fillColor(...DARK).font("Helvetica-Bold").text(refs.some(r => r.handle?.includes("http")) ? "Reference Articles" : "Study These Accounts");
    doc.moveDown(0.2);
    refs.forEach(r => {
      checkPage(30);
      doc.fontSize(9).fillColor(...PINK).font("Helvetica-Bold").text(r.handle || "");
      doc.fontSize(8.5).fillColor(...LIGHT).font("Helvetica-Oblique").text(r.note || "");
      doc.moveDown(0.3);
    });
  }
  hr();

  // ── Why This Works ──
  sectionHeader("✨  Why This Works");
  doc.fontSize(9.5).fillColor(...MID).font("Helvetica").text(idea.why || "", { width: pageWidth, lineGap: 2 });

  // Finalize
  doc.end();

  const buffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const filename = `bento-${topic.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 30)}.pdf`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
