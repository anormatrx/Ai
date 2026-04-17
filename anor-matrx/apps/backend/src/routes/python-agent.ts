import { Router } from "express";
import { PYTHON_AGENT_SYSTEM_PROMPT } from "../services/python-agent-prompt";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "Prompt is required"
      });
    }

    const model = process.env.OLLAMA_AGENT_MODEL || "deepseek-coder:latest";
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11435";

    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        prompt: `${PYTHON_AGENT_SYSTEM_PROMPT}\n\nUser request:\n${prompt}`
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        ok: false,
        error: text || "DeepSeek request failed"
      });
    }

    const data = await response.json();
    const raw = data?.response || "";

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { action: "reply", content: raw };
    }

    return res.json({
      ok: true,
      model,
      decision: parsed,
      raw
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Python agent failed"
    });
  }
});

export default router;