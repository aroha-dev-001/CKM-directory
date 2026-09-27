"use client";

import { useEffect } from "react";
import { CKM } from "@/lib/data";
import { useLang } from "@/lib/lang";
import { placeMatchesQuery } from "@/lib/search";

interface ModelContext {
  registerTool(tool: {
    name: string;
    description: string;
    inputSchema: object;
    execute(input: { query?: string }): Promise<{ content: { type: "text"; text: string }[] }>;
  }): void;
}

/** Document-level side effects: <html lang> and the WebMCP page tool. */
export function SiteEffects() {
  const lang = useLang();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const ctx =
      (document as Document & { modelContext?: ModelContext }).modelContext ||
      (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (!ctx || typeof ctx.registerTool !== "function") return;
    ctx.registerTool({
      name: "search_destinations",
      description: "Search Chikkamagaluru reference destinations by name, taluk, Kannada name or category.",
      inputSchema: {
        type: "object",
        properties: { query: { type: "string", description: "Search text" } },
        required: ["query"],
      },
      execute: async ({ query }) => {
        const hits = CKM.destinations.filter((p) => placeMatchesQuery(p, String(query || "").toLowerCase()));
        const text = JSON.stringify(
          hits.map((p) => ({ id: p.id, name: p.name, taluk: p.taluk, category: p.category })),
          null,
          2
        );
        return { content: [{ type: "text", text }] };
      },
    });
  }, []);

  return null;
}
