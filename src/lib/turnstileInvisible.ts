/**
 * Invisible Turnstile execution — generates a token programmatically
 * without rendering any visible widget. Loads the Turnstile script lazily.
 */

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

// Local type augmentation: the global declaration in TurnstileWidget.tsx
// does not include `execute`, but the Cloudflare API exposes it. Cast at
// the call site rather than mutating the shared global declaration.
type TurnstileWithExecute = NonNullable<Window["turnstile"]> & {
  execute: (
    container: string | HTMLElement | string,
    options?: { action?: string },
  ) => void;
};

// Global onload callback registered before the Cloudflare api.js script is
// injected. Cloudflare invokes it once the API is fully bootstrapped — this
// is the single source of truth for "Turnstile is ready to use".
declare global {
  interface Window {
    __kbkTurnstileOnLoad?: () => void;
  }
}

/**
 * Typed error so callers can distinguish loading/readiness failures from
 * actual token-acquisition failures (render/error-callback/timeout).
 */
export type TurnstileErrorPhase =
  | "script_load"
  | "not_ready"
  | "render"
  | "timeout"
  | "error_callback"
  | "expired";

export class TurnstileError extends Error {
  phase: TurnstileErrorPhase;
  constructor(phase: TurnstileErrorPhase, message: string) {
    super(message);
    this.name = "TurnstileError";
    this.phase = phase;
  }
}

let scriptLoadPromise: Promise<void> | null = null;
let readyPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    // If the API is already present (e.g. previously loaded in this tab),
    // resolve immediately — onload won't fire a second time.
    if (window.turnstile) {
      resolve();
      return;
    }

    // Register the official onload callback BEFORE injecting the script so
    // Cloudflare can call it once the API is fully initialized. This is
    // the single readiness signal — no polling, no turnstile.ready().
    window.__kbkTurnstileOnLoad = () => {
      console.log("[Turnstile] onload fired");
      resolve();
    };

    // If a Turnstile script tag already exists (e.g. injected by a previous
    // mount before window.turnstile was attached), do not inject another.
    // Our onload callback will still fire when that script finishes.
    const existing = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__kbkTurnstileOnLoad";
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      scriptLoadPromise = null; // allow retry on next call
      reject(
        new TurnstileError("script_load", "Failed to load Turnstile script"),
      );
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Resolves once the Turnstile API has fired its official onload callback.
 * Safe to call repeatedly — subsequent calls share the same promise.
 */
export function ensureTurnstileReady(): Promise<void> {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    if (!TURNSTILE_SITE_KEY) {
      console.warn(
        "[Turnstile] No site key configured — skipping verification",
      );
      return;
    }

    await loadTurnstileScript();
  })();

  return readyPromise;
}

/** Synchronous best-effort check (true once ensureTurnstileReady has resolved). */
export function isTurnstileReady(): boolean {
  return Boolean(window.turnstile && readyPromise);
}

/**
 * Execute Turnstile invisibly and return a token.
 * Creates a hidden container, renders the widget, resolves on callback, then cleans up.
 *
 * Caller MUST await ensureTurnstileReady() before calling this.
 */
export async function getInvisibleTurnstileToken(
  timeoutMs = 15000,
): Promise<string> {
  if (!TURNSTILE_SITE_KEY) {
    console.warn("[Turnstile] No site key configured, skipping verification");
    return "";
  }

  await ensureTurnstileReady();

  return new Promise<string>((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.visibility = "hidden";
    container.style.width = "0px";
    container.style.height = "0px";
    document.body.appendChild(container);

    let widgetId: string | null = null;
    let settled = false;

    const cleanup = () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {}
      }
      try {
        container.remove();
      } catch {}
    };

    const timeoutHandle = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(
        new TurnstileError(
          "timeout",
          "Bot verification timed out. Please refresh and try again.",
        ),
      );
    }, timeoutMs);

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutHandle);
      cleanup();
      fn();
    };

    try {
      const api = window.turnstile as unknown as TurnstileWithExecute;
      if (!api || typeof api.render !== "function") {
        finish(() =>
          reject(new TurnstileError("render", "Turnstile API not available")),
        );
        return;
      }

      widgetId = api.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          if (!token || token.trim() === "") {
            console.warn("[Turnstile] Empty token received");
            finish(() =>
              reject(
                new TurnstileError("render", "Turnstile returned empty token"),
              ),
            );
            return;
          }
          console.log("[Turnstile] token received", {
            tokenLength: token.length,
          });
          finish(() => resolve(token));
        },
        "error-callback": () => {
          console.warn("[Turnstile] error-callback fired");
          finish(() =>
            reject(
              new TurnstileError(
                "error_callback",
                "Turnstile verification failed",
              ),
            ),
          );
        },
        "expired-callback": () => {
          console.warn("[Turnstile] expired-callback fired");
          finish(() =>
            reject(
              new TurnstileError(
                "expired",
                "Turnstile token expired during verification",
              ),
            ),
          );
        },
        theme: "auto",
        // Invisible mode: widget renders no UI; a token is only produced when
        // execute() is called explicitly below.
        size: "invisible",
      } as unknown as Parameters<
        NonNullable<Window["turnstile"]>["render"]
      >[1]);
      console.log("[Turnstile] widget rendered (invisible)", { widgetId });

      // Invisible widgets do NOT auto-challenge — must call execute().
      if (typeof api.execute === "function") {
        try {
          api.execute(widgetId as unknown as string);
          console.log("[Turnstile] execute() called successfully");
        } catch (execErr) {
          console.error("[Turnstile] execute() error:", execErr);
          finish(() =>
            reject(new TurnstileError("render", "Turnstile execute() failed")),
          );
        }
      } else {
        console.error("[Turnstile] execute() method not available");
        finish(() =>
          reject(
            new TurnstileError("render", "Turnstile execute() not available"),
          ),
        );
      }
    } catch (err) {
      console.error("[Turnstile] render error:", err);
      finish(() =>
        reject(new TurnstileError("render", "Turnstile render failed")),
      );
    }
  });
}
