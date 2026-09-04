// TEMPORARY test-only route — removed after Tahap 3 verification.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/__gen-test")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { orderNumber } = (await request.json()) as { orderNumber: string };
        const { generateForOrderNumber } = await import("@/lib/generation.server");
        const result = await generateForOrderNumber(orderNumber);
        return Response.json(result);
      },
    },
  },
});
