import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=================================================");
console.log("🧵  STARTING APPLE THREAD FULL-STACK APPLICATION");
console.log("=================================================");
console.log("📁 Backend Database: backend/data/apple_thread.db");
console.log("🚀 Starting Backend (Port 5000) & Frontend (Port 5173)...");
console.log("=================================================\n");

const isWin = process.platform === "win32";
const npmCommand = isWin
  ? [
      process.execPath,
      [
        process.env.npm_execpath ??
          path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
      ],
    ]
  : ["npm", []];

// 1. Start Backend with --no-warnings to cleanly suppress Node experimental warnings
const backend = spawn("node", ["--no-warnings", "server.js"], {
  cwd: path.join(__dirname, "backend"),
  stdio: ["inherit", "pipe", "pipe"],
  env: { ...process.env, PORT: "5000", NODE_NO_WARNINGS: "1" },
});

backend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});
backend.stderr.on("data", (data) => {
  const text = data.toString();
  // Filter out any leftover experimental warnings so they don't alarm user as critical errors
  if (text.includes("ExperimentalWarning") || text.includes("Use `node --trace-warnings")) {
    return;
  }
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// 2. Start Frontend
const frontend = spawn(
  npmCommand[0],
  [...npmCommand[1], "run", "dev"],
  {
  cwd: path.join(__dirname, "frontend"),
  stdio: ["inherit", "pipe", "pipe"],
  },
);

frontend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[32m[Frontend]\x1b[0m ${data}`);
});
frontend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[33m[Frontend Warn]\x1b[0m ${data}`);
});

function cleanup() {
  console.log("\n🛑 Stopping all services...");
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
