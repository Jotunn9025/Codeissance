import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getRepoRootDir() {
  return path.resolve(__dirname, "../../../");
}

function getPythonExe() {
  const venvPython = process.platform === "win32"
    ? path.join(getRepoRootDir(), "venv", "Scripts", "python.exe")
    : path.join(getRepoRootDir(), "venv", "bin", "python");
  return venvPython;
}

export const runTimeSeriesForecast = async (req, res) => {
  const symbol = String(req.query.symbol || req.params.symbol || "AAPL").toUpperCase();
  const start = String(req.query.start || "2023-01-01");
  const end = String(req.query.end || new Date().toISOString().slice(0, 10));
  const maxChange = String(req.query.max || "0.1");

  const repoRoot = getRepoRootDir();
  const scriptPath = path.join(repoRoot, "backend", "src", "python", "time_series_price_model.py");
  const pythonExe = getPythonExe();

  try {
    const args = [scriptPath, "--ticker", symbol, "--start", start, "--end", end, "--max", maxChange];
    const proc = spawn(pythonExe, args, {
      cwd: repoRoot,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = ""; let stderr = "";
    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ ok: false, error: `python_exit_${code}`, stderr });
      }
      try {
        const parsed = JSON.parse(stdout);
        return res.json(parsed);
      } catch (e) {
        return res.status(500).json({ ok: false, error: "parse_error", raw: stdout, stderr });
      }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};


