/**
 * Starts memi-backend (Spring) in a separate console, waits briefly, then `npm run dev`.
 *
 * Set MEMI_BACKEND_DIR to an absolute path if the repo is not next to memiLife:
 *   MEMI_BACKEND_DIR=C:\path\to\memi-backend npm run local
 */

const { spawn } = require("node:child_process")
const path = require("node:path")
const fs = require("node:fs")

const root = path.join(__dirname, "..")
const backend = process.env.MEMI_BACKEND_DIR
  ? path.resolve(process.env.MEMI_BACKEND_DIR)
  : path.join(path.dirname(root), "memi-backend")

const isWin = process.platform === "win32"
const mvnw = isWin
  ? path.join(backend, "mvnw.cmd")
  : path.join(backend, "mvnw")

if (!fs.existsSync(mvnw)) {
  console.error(
    "[local] memi-backend not found. Expected mvnw at:\n  " + mvnw + "\n" +
    "  Set MEMI_BACKEND_DIR to your clone, or place memi-backend next to memiLife (e.g. C:\\memi-backend).",
  )
  process.exit(1)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function startBackendDetached() {
  if (isWin) {
    const mvnwPath = path.join(backend, "mvnw.cmd")
    const q = (s) => `'${String(s).replace(/'/g, "''")}'`
    const ps = [
      "Start-Process",
      "-LiteralPath",
      q(mvnwPath),
      "-ArgumentList",
      "'spring-boot:run'",
      "-WorkingDirectory",
      q(backend),
      "-WindowStyle",
      "Normal",
    ].join(" ")
    const child = spawn("powershell.exe", ["-NoProfile", "-Command", ps], {
      cwd: root,
      stdio: "ignore",
      detached: true,
      windowsHide: false,
    })
    child.unref()
  } else {
    const child = spawn(mvnw, ["spring-boot:run"], {
      cwd: backend,
      detached: true,
      stdio: "ignore",
    })
    child.unref()
  }
}

async function main() {
  console.log("[local] Backend dir: " + backend)
  console.log("[local] Starting Spring in a new window (or background)…")
  startBackendDetached()
  console.log("[local] Waiting 5s for the API (http://127.0.0.1:8080)…")
  await sleep(5000)
  console.log("[local] Starting Next.js…\n")
  const npmCmd = isWin ? "npm.cmd" : "npm"
  const next = spawn(npmCmd, ["run", "dev"], {
    cwd: root,
    stdio: "inherit",
    shell: isWin,
  })
  next.on("exit", (code) => process.exit(code == null ? 0 : code))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
