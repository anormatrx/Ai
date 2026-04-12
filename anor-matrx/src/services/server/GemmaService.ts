export class GemmaService {
  /**
   * Executes a prompt using local Gemma 3 4B via Ollama
   */
  public async execute(prompt: string): Promise<string> {
    try {
      const response = await fetch("http://localhost:11435/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma3:latest",
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = (await response.json()) as { response: string };
      return `[EXECUTION BY GEMMA (Local)]\n\n${data.response}`;
    } catch (error: any) {
      console.error("Gemma execution failed:", error);
      
      // Fallback message with instructions for the user to make it "real"
      return `[OLLAMA OFFLINE] ⚠️\nلم يتم العثور على محرك Gemma محلياً. لجعل هذا "حقيقياً"، يرجى التأكد من تشغيل Ollama على المنفذ 11435 وتحميل موديل gemma3:latest.\n\nخطأ: ${error.message}`;
    }
  }
}
