import { runtime, getResolvedAgentModel } from "../../config/runtime";
import { resolveModelForTask } from "../agent-routing";

export class GemmaService {
  /**
   * Executes a prompt using local Gemma via Ollama
   * Uses unified runtime configuration
   */
  public async execute(prompt: string): Promise<string> {
    const model = resolveModelForTask("general-chat");
    
    try {
      const response = await fetch(`${runtime.ollama.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = (await response.json()) as { response: string };
      return `[EXECUTION BY GEMMA (Local)]\n\nModel: ${model}\n\n${data.response}`;
    } catch (error: any) {
      console.error("Gemma execution failed:", error);
      
      return `[OLLAMA OFFLINE] ⚠️\nلم يتم العثور على محرك Gemma محلياً.\n\nالمنفذ: ${runtime.ollama.baseUrl}\nالموديل المطلوب: ${model}\n\nخطأ: ${error.message}`;
    }
  }
}

export default new GemmaService();