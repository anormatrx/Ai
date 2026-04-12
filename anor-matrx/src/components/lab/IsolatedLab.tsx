"use client";

import * as React from "react";
import { PromptBox } from "@/components/chatgpt-prompt-input";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export default function Page() {
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", content: "أنا Agent حقيقي. أرسل مهمة بايثون وسأولد الكود وأنفذه فعلياً." },
  ]);
  const [execution, setExecution] = React.useState("لا يوجد تنفيذ بعد");
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    const message = textarea?.value;
    if (!message || typeof message !== "string" || !message.trim()) return;

    const userText = message.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);
    setExecution("Running...");
    setGeneratedCode("");

    try {
      const res = await fetch("/api/python-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });
      const data = await res.json();

      if (!data.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || "فشل التنفيذ" }]);
        setExecution(data.error || "Execution failed");
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.finalAnswer || "تم التنفيذ" }]);
        setGeneratedCode(data.generatedCode || "");
        setExecution([
          "=== STDOUT ===",
          data.execution?.stdout || "",
          "",
          "=== STDERR ===",
          data.execution?.stderr || "",
          "",
          `=== EXIT CODE === ${data.execution?.code ?? ""}`,
        ].join("\n"));
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "فشل الاتصال مع السيرفر" }]);
      setExecution("Connection failed");
    } finally {
      setLoading(false);
      if (textarea) textarea.value = "";
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#212121] text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#171717] px-3 py-2 md:px-4 md:py-3">
        <div>
          <h1 className="text-sm font-semibold md:text-base">Isolated Lab</h1>
          <p className="text-[10px] text-white/50 md:text-xs">Gemini + Python Executor</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${loading ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`}></span>
          <span className="text-[10px] text-white/50 md:text-xs">{loading ? "Running" : "Ready"}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Chat Panel - Left */}
        <aside className="flex flex-col border-b border-white/10 lg:border-b-0 lg:border-r lg:w-[280px] xl:w-[320px]">
          <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[95%] rounded-lg px-2 py-1.5 text-[11px] md:text-xs ${
                  msg.role === "user"
                    ? "ml-auto bg-[#2b2b2b]"
                    : "mr-auto border border-white/10 bg-[#0f0f0f]"
                }`}
              >
                <div className="mb-0.5 text-[8px] uppercase text-white/40">{msg.role === "user" ? "You" : "Agent"}</div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>
          <div className="shrink-0 border-t border-white/10 p-2 md:p-3">
            <PromptBox onSubmit={() => handleSubmit()} />
          </div>
        </aside>

        {/* Execution Panel - Right */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="grid flex-1 grid-rows-[1fr_1fr] md:grid-rows-[auto_1fr] gap-1 p-2 md:p-3 overflow-hidden">
            {/* Code Section */}
            <section className="rounded-md border border-white/10 bg-[#0f0f0f] p-1.5 md:p-2 overflow-hidden">
              <div className="mb-1 text-[8px] uppercase tracking-wide text-white/40">Python Code</div>
              <pre className="overflow-auto whitespace-pre-wrap text-[9px] leading-tight md:text-xs md:leading-4 text-[#c9d1d9] font-mono h-[60px] md:h-auto">
                {generatedCode || "أرسل أمراً لتوليد الكود..."}
              </pre>
            </section>

            {/* Output Section */}
            <section className="rounded-md border border-white/10 bg-[#0f0f0f] p-1.5 md:p-2 overflow-hidden">
              <div className="mb-1 text-[8px] uppercase tracking-wide text-white/40">Output</div>
              <pre className="overflow-auto whitespace-pre-wrap text-[9px] leading-tight md:text-xs md:leading-4 text-green-400 font-mono h-[60px] md:h-auto">
                {execution}
              </pre>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}