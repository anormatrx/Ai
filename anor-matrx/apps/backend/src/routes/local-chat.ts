import { Router } from "express";
import { getModelForPrompt } from "../config/agent-models";

const router = Router();

router.post("/api/local-chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const lastUserMessage =
      [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    const routed = getModelForPrompt(lastUserMessage);
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11435";

    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: routed.model,
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        ok: false,
        error: text || "Local chat failed"
      });
    }

    const data = await response.json();

    return res.json({
      ok: true,
      task: routed.task,
      model: routed.model,
      reply: data?.message?.content || "",
      raw: data
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Local chat route failed"
    });
  }
});

export default router;