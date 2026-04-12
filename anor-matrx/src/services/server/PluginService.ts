import fs from "fs";

export class PluginService {
  private skills: Record<string, (args: any) => string> = {
    "calculate": (args: string) => {
      try {
        // Simple safe evaluation (only numbers and basic operators)
        if (/[^0-9+\-*/().\s]/.test(args)) throw new Error("Invalid symbols");
        return `النتيجة: ${eval(args)}`;
      } catch (e) {
        return `خطأ في العملية الحسابية: ${args}`;
      }
    },
    "format-json": (args: string) => {
      try {
        const parsed = JSON.parse(args);
        return JSON.stringify(parsed, null, 4);
      } catch (e) {
        return "JSON غير صالح للتنسيق.";
      }
    },
    "extract-emails": (args: string) => {
      const emails = args.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      return emails ? emails.join(", ") : "لم يتم العثور على عناوين بريد إلكتروني.";
    },
    "generate-password": (length: number = 10) => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
      let retVal = "";
      for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    }
  };

  constructor() {
    // Register default plugins
    this.register("web-page", async (data: any) => {
      const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Site</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white flex items-center justify-center min-h-screen">
    <div class="text-center p-8 border border-cyan-500/30 rounded-3xl bg-white/5 backdrop-blur-xl">
        <h1 class="text-4xl font-bold mb-4 text-cyan-400">${data}</h1>
        <p class="text-white/60">تم إنشاء هذا الموقع تلقائياً بواسطة نظام AI 3D Nexus</p>
    </div>
</body>
</html>`;
      fs.writeFileSync("index.html", html, "utf-8");
      return "تم إنشاء الموقع بنجاح وحفظه في index.html";
    });
  }

  private plugins: Record<string, (data: any) => Promise<string>> = {};

  public register(name: string, func: (data: any) => Promise<string>) {
    this.plugins[name] = func;
  }

  public async run(name: string, data: any): Promise<string> {
    if (this.plugins[name]) {
      return await this.plugins[name](data);
    }
    if (this.skills[name]) {
      return this.skills[name](data);
    }
    return "Plugin or Skill not found";
  }

  public hasPlugin(name: string): boolean {
    return !!this.plugins[name] || !!this.skills[name];
  }

  public getAvailableSkills(): string[] {
    return Object.keys(this.skills);
  }
}

export const pluginService = new PluginService();
