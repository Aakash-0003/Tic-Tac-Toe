// ─── Server bundle builder ────────────────────────────────────────────────────
// Uses TypeScript's transpileModule API (not esbuild) so it never optimises
// { state: state } into shorthand { state }, which panics Nakama's goja AST
// inspector inside registerMatch.

const ts = require("typescript");
const fs = require("fs");

const files = [
  "server/config/constants.ts",
  "server/config/types.ts",
  "server/logic/game.ts",
  "server/services/broadcast.ts",
  "server/services/leaderboard.ts",
  "server/match/handlers.ts",
  "server/matchmaker.ts",
  "server/rpcs/createMatch.ts",
  "server/rpcs/getLeaderboard.ts",
  "server/main.ts",
];

// Concatenate all source files into one TypeScript blob
const combined = files
  .map((f) => `// ── ${f}\n${fs.readFileSync(f, "utf8")}`)
  .join("\n\n");

// Transpile: strips types, keeps ES6 syntax, no module wrapper
const result = ts.transpileModule(combined, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2015, // goja supports ES6+
    module: ts.ModuleKind.CommonJS, // no imports in source → no wrapper emitted
    strict: false,
    skipLibCheck: true,
  },
  reportDiagnostics: true,
});

if (result.diagnostics && result.diagnostics.length > 0) {
  for (const d of result.diagnostics) {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
    console.error(`TypeScript error: ${msg}`);
  }
  process.exit(1);
}

fs.mkdirSync("build", { recursive: true });
fs.writeFileSync("build/index.js", result.outputText);
console.log("Build successful → build/index.js");
