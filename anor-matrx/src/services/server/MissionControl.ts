import { KeyHunterAgent } from "./KeyHunterAgent";

export class MissionControl {
  private genAI: any;
  private planner: any;
  private gemma: any;
  private keyHunter: KeyHunterAgent;

  constructor(genAI: any, planner: any, gemma: any) {
    this.genAI = genAI;
    this.planner = planner;
    this.gemma = gemma;
    this.keyHunter = new KeyHunterAgent();
  }

  // 1. تفعيل العقل واختيار المسار
  public async executeMission(userPrompt: string, openaiApiKey?: string, desktopPath: string = "default"): Promise<string> {
    console.log("💀 Starting Integrated Sequence...");

    // الخطوة أ: استدعاء وكيل المفاتيح (Key-Hunter)
    const isActivated = this.keyHunter.fetchAndActivate(["gpt4", "gemini"]);
    
    if (!isActivated) {
      return "OFFLINE - Keys Missing. Please check your .env configuration.";
    }

    // الخطوة ب: تحديث الحالة إلى ONLINE في الواجهة (handled by frontend)
    console.log("✅ System ONLINE. Initiating Triple-Threat Cycle.");

    // الخطوة ج: دورة المعالجة الثلاثية (The Triple-Threat Cycle)
    return await this.executeAutonomousCycle(userPrompt, desktopPath, openaiApiKey);
  }

  // 2. دورة المعالجة (GPT4 -> Gemma -> Gemini)
  private async executeAutonomousCycle(prompt: string, path: string, openaiApiKey?: string): Promise<string> {
    console.log("🧠 Distributor (GPT-4): Generating plan...");
    // نرسل الإشارة للموزع (GPT-4) ليرسم الخطة
    const plan = await this.planner.plan(prompt, openaiApiKey, this.genAI);

    console.log("⚙️ Executor (Gemma-3-4b-it-abliterated): Executing raw tasks...");
    // نرسل الخطة للمنفذ المحلي (Gemma-3-4b-it-abliterated)
    const rawCode = await this.gemma.execute(JSON.stringify(plan));

    console.log("💀 Cleaner (Gemini): Repairing and linking...");
    // المرحلة النهائية: أنا (Gemini) أقوم بالإصلاح والتنظيف والربط
    const finalResult = await this.geminiRepair(rawCode, path);

    return finalResult;
  }

  private async geminiRepair(rawCode: string, path: string): Promise<string> {
    if (!this.genAI) return rawCode;

    try {
      const postCheckResult = await this.genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts: [{ text: `قم بمراجعة، تنظيف، وإصلاح هذا المخرج وربطه بالأشفات قبل العرض النهائي. أرجع النسخة النهائية الآمنة فقط للمسار ${path}:\n\n${rawCode}` }] }]
      });
      return postCheckResult.text || rawCode;
    } catch (error) {
      console.error("Gemini Repair failed:", error);
      return rawCode;
    }
  }
}
