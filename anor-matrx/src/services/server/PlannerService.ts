export class PlannerService {
  /**
   * Generates a plan using GPT-4 (or fallback to Gemini)
   */
  public async plan(task: string, openaiApiKey?: string, genAI?: any): Promise<any> {
    const prompt = `
      As a GPT-4 Planner, create a structured plan for the following task.
      Return ONLY a JSON object with a "steps" array.
      Task: "${task}"
    `;

    if (openaiApiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }]
          })
        });
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error("GPT-4 Planning failed, falling back:", error);
      }
    }

    // Fallback to Gemini for planning
    if (genAI) {
      try {
        const result = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        const fallbackResponse = result.text || "";
        const jsonStr = fallbackResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
      } catch (error) {
        console.error("Gemini Planning failed:", error);
      }
    }
    
    return { steps: ["analyze", "prepare", "execute"] };
  }
}
