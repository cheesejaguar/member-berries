import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

import {
  bootstrapMemoryProject,
  buildInjectedMemory,
  formatSearchResults,
  getMemoryStatus,
  refreshCurrentTimestamp,
  searchMemory,
  writeCheckpoint,
} from "./memory-core.mjs";

const WIDGET_ID = "member-berries";

function showLines(pi: ExtensionAPI, title: string, lines: string[]) {
  pi.sendMessage(
    {
      customType: "member-berries",
      content: `${title}\n\n${lines.join("\n")}`,
      display: true,
    },
    { triggerTurn: false },
  );
}

export default function memberBerries(pi: ExtensionAPI) {
  async function checkpointLifecycle(ctx: { cwd: string; sessionManager: any; ui: any }, trigger: string) {
    const status = await getMemoryStatus(ctx.cwd);
    if (!status.exists) return null;

    const checkpoint = await writeCheckpoint(ctx.cwd, {
      trigger,
      objective: status.currentObjective,
      currentState: `${trigger} checkpoint from member-berries. Current objective: ${status.currentObjective}`,
      nextSteps: ["Review current.md and continue from the active plan."],
      session: ctx.sessionManager.getSessionName?.() ?? "member-berries",
    });
    await refreshCurrentTimestamp(ctx.cwd);
    ctx.ui.setStatus(WIDGET_ID, `memory: ${status.counts.checkpoints + 1} checkpoints`);
    return checkpoint;
  }

  pi.on("session_start", async (_event, ctx) => {
    const status = await getMemoryStatus(ctx.cwd);
    if (status.exists) {
      ctx.ui.setStatus(WIDGET_ID, `memory: ${status.counts.checkpoints} checkpoints`);
    } else {
      ctx.ui.setStatus(WIDGET_ID, "memory: not bootstrapped");
    }
  });

  pi.on("session_before_compact", async (_event, ctx) => {
    await checkpointLifecycle(ctx, "pre-compact");
    return undefined;
  });

  pi.on("session_shutdown", async (_event, ctx) => {
    await checkpointLifecycle(ctx, "shutdown");
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const injected = await buildInjectedMemory(ctx.cwd, event.prompt);
    if (!injected) return undefined;

    return {
      message: {
        customType: "member-berries-memory",
        content: injected,
        display: false,
      },
    };
  });

  pi.registerCommand("memory-bootstrap", {
    description: "Create the default local .pi memory structure in the current project",
    handler: async (_args, ctx) => {
      const result = await bootstrapMemoryProject(ctx.cwd);
      const lines = [
        `Created memory structure: ${result.created ? "yes" : "already existed"}`,
        `.pi/PROJECT.md`,
        `.pi/memory/current.md`,
        `.pi/memory/decisions.md`,
        `.pi/memory/gotchas.md`,
        `.pi/memory/commands.md`,
        `.pi/memory/checkpoints/`,
      ];
      showLines(pi, "member-berries bootstrap", lines);
      ctx.ui.notify("member-berries memory scaffold ready", "success");
    },
  });

  pi.registerCommand("memory-status", {
    description: "Show project memory status for the current repository",
    handler: async (_args, ctx) => {
      const status = await getMemoryStatus(ctx.cwd);
      const lines = [
        `Current objective: ${status.currentObjective}`,
        `Decisions: ${status.counts.decisions}`,
        `Gotchas: ${status.counts.gotchas}`,
        `Commands sections: ${status.counts.commands}`,
        `Checkpoints: ${status.counts.checkpoints}`,
        `Last checkpoint: ${status.lastCheckpoint ?? "none"}`,
      ];
      showLines(pi, "member-berries status", lines);
      ctx.ui.notify("member-berries status ready", "info");
    },
  });

  pi.registerCommand("memory-search", {
    description: "Search local project memory files",
    handler: async (args, ctx) => {
      const query = args.trim();
      if (!query) {
        ctx.ui.notify("Usage: /memory-search <query>", "warning");
        return;
      }
      const results = await searchMemory(ctx.cwd, query, "all", 6);
      showLines(pi, `member-berries search: ${query}`, formatSearchResults(results));
      ctx.ui.notify(`member-berries search complete (${results.length} results)`, "info");
    },
  });

  pi.registerCommand("memory-prime", {
    description: "Preview the memory block that member-berries would inject",
    handler: async (args, ctx) => {
      const prompt = args.trim() || "current project status";
      const injected = await buildInjectedMemory(ctx.cwd, prompt);
      showLines(pi, `member-berries prime: ${prompt}`, [injected ?? "No local .pi memory found."]);
      ctx.ui.notify("member-berries prime ready", "info");
    },
  });

  pi.registerCommand("memory-sync", {
    description: "Create a checkpoint and refresh the current-state timestamp",
    handler: async (_args, ctx) => {
      const status = await getMemoryStatus(ctx.cwd);
      if (!status.exists) {
        ctx.ui.notify("No .pi memory found. Run /memory-bootstrap first.", "warning");
        return;
      }

      const checkpoint = await writeCheckpoint(ctx.cwd, {
        trigger: "manual",
        objective: status.currentObjective,
        currentState: `Manual sync from member-berries. Current objective: ${status.currentObjective}`,
        nextSteps: ["Review current.md and continue the active plan."],
        session: ctx.sessionManager.getSessionName?.() ?? "member-berries",
      });
      await refreshCurrentTimestamp(ctx.cwd);
      ctx.ui.setStatus(WIDGET_ID, `memory: ${status.counts.checkpoints + 1} checkpoints`);
      showLines(pi, "member-berries sync", [`Checkpoint written: ${checkpoint}`]);
      ctx.ui.notify("member-berries checkpoint created", "success");
    },
  });

  pi.registerTool({
    name: "memory_search",
    label: "Memory Search",
    description: "Search local member-berries project memory files for relevant context",
    promptSnippet: "Search project memory files for decisions, gotchas, commands, current state, or checkpoints",
    promptGuidelines: [
      "Use this tool when project-local memory may contain prior decisions, gotchas, commands, or recent checkpoints relevant to the user's request.",
    ],
    parameters: Type.Object({
      query: Type.String({ description: "Natural-language search query" }),
      scope: Type.Optional(
        Type.String({
          description: "Optional search scope: all, project, current, decisions, gotchas, commands, or checkpoints",
        }),
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const results = await searchMemory(ctx.cwd, params.query, params.scope ?? "all", 6);
      const text = formatSearchResults(results).join("\n");
      return {
        content: [{ type: "text", text }],
        details: { results },
      };
    },
  });
}
