import "./globals.css";

export const metadata = {
  title: "Bento — Content ideas, neatly packed.",
  description:
    "A content ideation tool for content marketers. Generate research-backed content ideas tailored to your brand and platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
