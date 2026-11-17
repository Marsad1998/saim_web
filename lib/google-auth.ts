import { getSystemSettings } from "./system-settings";

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function getGoogleConfig() {
  const settings = await getSystemSettings();
  const clientId = settings.google_client_id || process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = settings.google_client_secret || process.env.GOOGLE_CLIENT_SECRET || "";
  return { clientId, clientSecret };
}

/**
 * Generate Google OAuth 2.0 authorization URL
 */
export async function getGoogleAuthUrl(origin: string, redirectTarget: string = "/account/dashboard"): Promise<string | null> {
  const { clientId } = await getGoogleConfig();
  if (!clientId) {
    return null;
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = Buffer.from(JSON.stringify({ redirect: redirectTarget })).toString("base64");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange OAuth authorization code for Google user profile
 */
export async function exchangeGoogleCodeForUser(
  code: string,
  origin: string
): Promise<GoogleUserInfo | null> {
  const { clientId, clientSecret } = await getGoogleConfig();
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured in system settings.");
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  // 1. Exchange code for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Google token exchange failed:", errorText);
    return null;
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return null;
  }

  // 2. Fetch User Profile
  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    return null;
  }

  const profile: GoogleUserInfo = await profileResponse.json();
  return profile;
}
