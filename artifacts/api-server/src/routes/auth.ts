import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/auth/instagram/token", async (req, res) => {
  const { code, redirect_uri } = req.body as {
    code: string;
    redirect_uri: string;
  };

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(503).json({
      error: "Instagram not configured",
      message:
        "INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET must be set on the server.",
    });
    return;
  }

  if (!code || !redirect_uri) {
    res.status(400).json({ error: "Missing code or redirect_uri" });
    return;
  }

  const formData = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri,
    code,
  });

  const tokenRes = await fetch(
    "https://api.instagram.com/oauth/access_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    }
  );

  const tokenData = (await tokenRes.json()) as Record<string, unknown>;

  if (!tokenData.access_token) {
    res.status(400).json({
      error: "Token exchange failed",
      details: tokenData,
    });
    return;
  }

  const userRes = await fetch(
    `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${tokenData.access_token}`
  );
  const userData = (await userRes.json()) as Record<string, string>;

  res.json({
    id: userData.id,
    username: userData.username,
    name: userData.name ?? userData.username,
    avatarUrl: userData.profile_picture_url ?? null,
  });
});

export default router;
