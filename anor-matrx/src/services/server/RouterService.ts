import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { MemoryService } from "./MemoryService";
import { PlannerService } from "./PlannerService";
import { GemmaService } from "./GemmaService";
import { PluginService } from "./PluginService";
import { WebAutomationService } from "./WebAutomationService";
import { GitHubService } from "./GitHubService";
import { DarkRoomAgent } from "../DarkRoomAgent";
import { MissionControl } from "./MissionControl";
import { AgentService } from "./AgentService";
import { SecurityService } from "./SecurityService";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);

export type TaskType = 
  | "chat" 
  | "plan" 
  | "maintenance" 
  | "web" 
  | "github" 
  | "terminal" 
  | "files" 
  | "python" 
  | "gpt4" 
  | "ollama";

export class RouterService {
  private genAI: any;
  private openai: OpenAI;
  private memory: MemoryService;
  private planner: PlannerService;
  private gemma: GemmaService;
  private plugins: PluginService;
  private web: WebAutomationService;
  private github: GitHubService;
  private agent: DarkRoomAgent;
  private missionControl: MissionControl;
  private agentService: AgentService;
  private security: SecurityService;

  constructor(
    genAI: any,
    openai: OpenAI,
    memory: MemoryService,
    planner: PlannerService,
    gemma: GemmaService,
    plugins: PluginService,
    web: WebAutomationService,
    github: GitHubService,
    agent: DarkRoomAgent,
    missionControl: MissionControl,
    agentService: AgentService,
    security: SecurityService
  ) {
    this.genAI = genAI;
    this.openai = openai;
    this.memory = memory;
    this.planner = planner;
    this.gemma = gemma;
    this.plugins = plugins;
    this.web = web;
    this.github = github;
    this.agent = agent;
    this.missionControl = missionControl;
    this.agentService = agentService;
    this.security = security;
  }

  public async route(prompt: string, selectedModel: string): Promise<TaskType | string> {
    const task = prompt.toLowerCase();
    
    // Check for custom agents first
    const customAgents = this.agentService.listAgents();
    for (const agent of customAgents) {
      if (agent.isActive && agent.whenToUse && task.includes(agent.whenToUse.toLowerCase())) {
        return `agent:${agent.identifier}`;
      }
    }
    
    if (task.includes("project") || task.includes("build") || task.includes("create") || task.includes("develop")) return "plan";
    if (task.includes("fix") || task.includes("repair") || task.includes("clean") || task.includes("ui")) return "maintenance";
    if (task.includes("web") || task.includes("site") || task.includes("scrape") || task.includes("fetch")) return "web";
    if (task.includes("git") || task.includes("github") || task.includes("commit") || task.includes("push")) return "github";
    if (task.includes("terminal") || task.includes("run command") || task.includes("shell")) return "terminal";
    if (task.includes("file") || task.includes("folder") || task.includes("directory")) return "files";
    if (task.includes("python") || task.includes("run code")) return "python";
    if (task.includes("gpt4") || selectedModel === "gpt-4") return "gpt4";
    if (task.includes("ollama") || selectedModel === "llama3" || selectedModel === "mistral" || selectedModel === "gemma-3-4b-it-abliterated") return "ollama";

    return "chat";
  }

  public async processTask(req: { prompt: string; selectedModel: string; projectPath?: string; stream?: boolean }, res: any): Promise<void> {
    const { prompt, selectedModel, projectPath, stream } = req;
    const taskType = await this.route(prompt, selectedModel);
    
    // Resolve model name
    let resolvedModel = selectedModel;
    if (selectedModel === "auto") {
      if (prompt.length < 20) resolvedModel = "gemini-3-flash-preview";
      else if (taskType === "gpt4") resolvedModel = "gpt-4";
      else resolvedModel = "gemini-3.1-pro-preview";
    }

    let reply = "";

    try {
      switch (taskType) {
        case "plan":
          reply = await this.missionControl.executeMission(prompt, process.env.OPENAI_API_KEY, projectPath);
          this.memory.addProject(prompt, reply);
          reply = `**[MISSION SECURED & OPTIMIZED BY GEMINI] 🛡️**\n\n${reply}`;
          break;

        case "web":
          if (prompt.includes("scrape") || prompt.includes("fetch")) {
            const url = prompt.match(/https?:\/\/[^\s]+/)?.[0];
            if (url) {
              const content = await this.web.fetchContent(url);
              reply = `**[WEB AUTOMATION]**\nContent from ${url}:\n\n${content}`;
            } else {
              reply = "يرجى تزويدي برابط (URL) صالح للقيام بعملية السحب.";
            }
          } else {
            reply = await this.web.search(prompt);
          }
          break;

        case "github":
          if (prompt.includes("status")) reply = `**[GITHUB]**\n${this.github.getStatus()}`;
          else if (prompt.includes("commit")) reply = `**[GITHUB]**\n${this.github.commit(prompt)}`;
          else if (prompt.includes("push")) reply = `**[GITHUB]**\n${this.github.push()}`;
          else if (prompt.includes("pull")) reply = `**[GITHUB]**\n${this.github.pull()}`;
          else reply = "أنا أدعم أوامر GitHub مثل: status, commit, push, pull.";
          break;

        case "terminal":
          const cmd = prompt.replace(/terminal|run command|shell/gi, "").trim();
          if (!this.security.isCommandWhitelisted(cmd)) {
            reply = `**[SECURITY ALERT]**\nCommand "${cmd.split(' ')[0]}" is not whitelisted.`;
            break;
          }
          try {
            const { stdout, stderr } = await execAsync(cmd);
            reply = `**[TERMINAL]**\n${stdout || stderr}`;
          } catch (e) {
            reply = `**[TERMINAL ERROR]**\n${String(e)}`;
          }
          break;

        case "files":
          if (prompt.includes("list")) {
            const files = fs.readdirSync(".").join(", ");
            reply = `**[FILE EXPLORER]**\nFiles in root: ${files}`;
          } else {
            reply = "أنا أدعم عمليات الملفات مثل القائمة (list). قريباً سأدعم القراءة والكتابة المباشرة.";
          }
          break;

        case "maintenance":
          reply = await (this as any).maintenance.run(prompt); // Assuming MaintenanceService has a run method
          break;

        case "python":
          reply = await this.agent.runPython(prompt);
          break;

        case "gpt4":
          if (process.env.OPENAI_API_KEY) {
            const response = await this.openai.chat.completions.create({
              model: "gpt-4",
              messages: [{ role: "user", content: prompt }],
            });
            reply = `[GPT-4] ${response.choices[0].message.content}`;
          } else {
            reply = "خطأ: مفتاح OPENAI_API_KEY غير موجود.";
          }
          break;

          reply = await this.gemma.execute(prompt);
          break;

        default:
          if (taskType.startsWith("agent:")) {
            const agentId = taskType.split(":")[1];
            const customAgent = this.agentService.getAgent(agentId);
            if (customAgent) {
              const result = await this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }).generateContent({
                systemInstruction: customAgent.systemPrompt,
                contents: [{ role: "user", parts: [{ text: prompt }] }]
              });
              const response = await result.response;
              reply = `**[CUSTOM AGENT: ${customAgent.name}]** 🤖\n\n${response.text()}`;
              break;
            }
          }
          
          const modelToUse = resolvedModel.startsWith("gemini") ? resolvedModel : "gemini-3-flash-preview";
          const result = await this.genAI.getGenerativeModel({ model: modelToUse }).generateContent(prompt);
          const response = await result.response;
          reply = selectedModel === "auto" 
            ? `[Auto-Routed to ${modelToUse}]\n\n${response.text()}`
            : `OpenClaw: ${response.text()}`;
      }

      res.json({ result: reply });
    } catch (error: any) {
      console.error(`[RouterService] Error processing task:`, error);
      res.status(500).json({ error: String(error.message || error) });
    }
  }
}
