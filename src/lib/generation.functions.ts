import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Admin/test-only generator entry points.
 *
 * These are NOT public endpoints: every call must carry the shared
 * GENERATION_ADMIN_SECRET, which only exists server-side. Customers never
 * trigger generation directly — the verified Midtrans webhook does.
 */
const schema = z.object({
  secret: z.string().min(8),
  orderNumber: z.string().trim().regex(/^AAE-\d{8}-\d{5}$/),
});

export type AdminGenerationResult =
  | {
      ok: true;
      status: string;
      reason?: string;
      files?: { path: string; product: string; cellValue: string | null; checks: string[] }[];
    }
  | { ok: false; error: string };

export const adminGenerateOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }): Promise<AdminGenerationResult> => {
    const secret = process.env["GENERATION_ADMIN_SECRET"];
    if (!secret) return { ok: false, error: "Generator admin secret is not configured." };
    if (data.secret !== secret) return { ok: false, error: "Unauthorized." };

    const { generateForOrderNumber } = await import("./generation.server");
    const result = await generateForOrderNumber(data.orderNumber);
    if (!result.ok) return { ok: false, error: result.reason ?? "Generation failed." };
    return { ok: true, status: result.status, reason: result.reason, files: result.files };
  });
