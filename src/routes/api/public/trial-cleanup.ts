import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/trial-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["GENERATION_ADMIN_SECRET"] ?? "";
        const got = request.headers.get("x-cleanup-secret") ?? "";
        const a = Buffer.from(got);
        const b = Buffer.from(expected);
        if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { cleanupExpiredTrials } = await import("@/lib/trial.server");
        const result = await cleanupExpiredTrials();
        return Response.json(result);
      },
    },
  },
});
