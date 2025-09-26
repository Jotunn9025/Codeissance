import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getRepoRootDir() {
  return path.resolve(__dirname, "../../../");
}

function getPythonExe() {
  // Prefer venv python if available
  const venvPython = process.platform === "win32"
    ? path.join(getRepoRootDir(), "venv", "Scripts", "python.exe")
    : path.join(getRepoRootDir(), "venv", "bin", "python");
  return venvPython;
}

export const getForecast = async (req, res) => {
  const symbol = String(req.query.symbol || req.params.symbol || "AAPL").toUpperCase();
  const repoRoot = getRepoRootDir();
  const cliPath = path.join(repoRoot, "ML", "ml_cli.py");
  const pythonExe = getPythonExe();

  try {
    const proc = spawn(pythonExe, [cliPath, "--symbol", symbol], {
      cwd: repoRoot,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ ok: false, error: `ML process failed (${code})`, stderr });
      }
      try {
        const parsed = JSON.parse(stdout);
        return res.json(parsed);
      } catch (e) {
        return res.status(500).json({ ok: false, error: "Failed to parse ML JSON", raw: stdout, stderr });
      }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};


