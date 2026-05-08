/**
 * Shared Cloudflare Turnstile verification utility
 * Reusable across all edge functions that need bot protection.
 */

export async function verifyTurnstileToken(token: string, remoteip?: string): Promise<boolean> {
  const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteip) {
      formData.append("remoteip", remoteip);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log("Turnstile verification result:", {
      success: result.success,
      errorCodes: result["error-codes"],
    });

    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

/**
 * Helper to create a rejection response for missing/invalid Turnstile tokens.
 */
export function turnstileErrorResponse(
  message: string,
  corsHeaders: Record<string, string>,
  status = 400
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
