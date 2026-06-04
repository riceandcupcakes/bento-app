export async function POST(request) {
  const { password } = await request.json();
  const correctPassword = process.env.BENTO_PASSWORD;

  if (!correctPassword) {
    // No password set = no auth required
    return Response.json({ success: true, token: "no-auth" });
  }

  if (password === correctPassword) {
    // Create a simple token by hashing the password
    // When password changes, this token becomes invalid
    const encoder = new TextEncoder();
    const data = encoder.encode(correctPassword + "-bento-salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const token = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
    return Response.json({ success: true, token });
  }

  return Response.json({ success: false, error: "Wrong password" }, { status: 401 });
}

// Verify token endpoint
export async function GET(request) {
  const token = request.headers.get("x-bento-token");
  const correctPassword = process.env.BENTO_PASSWORD;

  if (!correctPassword) {
    return Response.json({ valid: true });
  }

  if (!token) {
    return Response.json({ valid: false });
  }

  // Recreate the expected token
  const encoder = new TextEncoder();
  const data = encoder.encode(correctPassword + "-bento-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const expectedToken = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

  return Response.json({ valid: token === expectedToken });
}
