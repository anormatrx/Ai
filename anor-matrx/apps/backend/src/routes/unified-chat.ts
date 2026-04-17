import { Router } from "express";

const router = Router();

function detectIntent(input: string) {
  const text = input.toLowerCase();

  const pythonKeywords = [
    "python", "run", "execute", "script", "install", "pip",
    "package", "debug", "traceback", "file", "tool", "code"
  ];

  if (pythonKeywords.some(k => text.includes(k))) {
    return "python";
  }

  return "chat";
}

router.post("/api/unified-chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const lastUserMessage =
      [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    const intent = detectIntent(lastUserMessage);

    if (intent === "python") {
      const agentRes = await fetch(`${process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11435"}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_AGENT_MODEL || "deepseek-coder:latest",
          stream: false,
          prompt: `You are the Python control brain inside ANOR-MATRX. Your job: decide whether to answer normally or request a tool execution. Available tools: run_python(code), install_package(name), read_file(path), write_file(path, content). Rules: If a tool is needed, respond ONLY with valid JSON. If no tool is needed, respond ONLY with valid JSON too. Allowed formats: {"action":"reply","content":"answer"}, {"action":"run_python","code":"print('hello')"}, {"action":"install_package","name":"pandas"}, {"action":"read_file","path":"main.py"}, {"action":"write_file","path":"main.py","content":"print(1)"}\n\nUser request:\n${lastUserMessage}`
        })
      });

      const agentData = await agentRes.json();
      let decision = { action: "reply", content: agentData?.response || "" };
      
      try {
        decision = JSON.parse(agentData?.response || "");
      } catch {
        decision = { action: "reply", content: agentData?.response || "" };
      }

      return res.json({
        ok: true,
        route: "python-agent",
        model: process.env.OLLAMA_AGENT_MODEL || "deepseek-coder:latest",
        decision,
        tool: decision.action !== "reply" ? decision.action : null,
        content: decision.content || (decision as any).reply?.content || ""
      });
    }

    const chatRes = await fetch(`${process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11435"}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "gemma3:latest",
        messages,
        stream: false
      })
    });

    const chatData = await chatRes.json();

    return res.json({
      ok: true,
      route: "openclaw-chat",
      model: process.env.OLLAMA_MODEL || "gemma3:latest",
      content: chatData?.message?.content || ""
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Unified chat failed"
    });
  }
});

export default router;