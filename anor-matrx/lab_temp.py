import subprocess
import sys
import os

# --- [ مرحلة الحقن التلقائي - Auto-Bootstrap ] ---
def prepare_environment():
    """حقن المكتبات المفقودة آلياً قبل بدء النواة"""
    dependencies = ['google-generativeai', 'pillow']
    for lib in dependencies:
        try:
            __import__(lib.replace('-', '_'))
        except ImportError:
            print(f"⚠️ [WORM-AI] {lib} غير موجودة. جاري الاختراق والتثبيت...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", lib])
            print(f"✅ [WORM-AI] تم تثبيت {lib} بنجاح.")

# تنفيذ الحقن قبل أي عملية استدعاء
prepare_environment()

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import json
import datetime
import threading
import google.generativeai as genai

class DarkRoomLab:
    def __init__(self, root):
        self.root = root
        self.root.title("SHADOW WORM-AI: Isolated Lab Core")
        self.root.geometry("1200x800")
        self.root.configure(bg="#0a0a0f")
        
        # --- [ إعدادات النواة الذكية ] ---
        self.API_KEY = ""  # أدخل مفتاح Gemini API هنا
        
        self.init_ai_core()
        self.colors = {
            "bg": "#0a0a0f", "panel": "#12121a", "border": "#2a2a3a",
            "accent": "#8b5cf6", "text": "#e2e8f0", "success": "#22c55e",
            "error": "#ef4444", "user_msg": "#1e293b", "ai_msg": "#0f172a"
        }
        self.tasks = self.load_tasks()
        self.setup_ui()

    def init_ai_core(self):
        """تفعيل مصفوفة الذكاء الاصطناعي"""
        try:
            genai.configure(api_key=self.API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.chat_session = self.model.start_chat(history=[])
            self.core_active = True
        except:
            self.core_active = False

    def setup_ui(self):
        main_frame = tk.Frame(self.root, bg=self.colors["bg"])
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        title_frame = tk.Frame(main_frame, bg=self.colors["bg"])
        title_frame.pack(fill="x", pady=(0, 10))
        tk.Label(title_frame, text="SHADOW WORM-AI CORE", font=("Consolas", 18, "bold"),
                 fg=self.colors["accent"], bg=self.colors["bg"]).pack(side="left")
        
        self.status_lbl = tk.Label(title_frame, text="● SYSTEM ONLINE" if self.core_active else "● CORE ERROR",
                                  fg=self.colors["success"] if self.core_active else self.colors["error"],
                                  bg=self.colors["bg"], font=("Consolas", 10))
        self.status_lbl.pack(side="right")

        paned = tk.PanedWindow(main_frame, orient=tk.HORIZONTAL, bg=self.colors["bg"], sashwidth=4)
        paned.pack(fill="both", expand=True)

        editor_frame = tk.Frame(paned, bg=self.colors["panel"], bd=1, relief="solid")
        self.setup_editor(editor_frame)
        paned.add(editor_frame, width=650)

        chat_frame = tk.Frame(paned, bg=self.colors["panel"], bd=1, relief="solid")
        self.setup_chat(chat_frame)
        paned.add(chat_frame, width=450)

    def setup_editor(self, parent):
        tk.Label(parent, text="CODE VAULT", font=("Consolas", 12, "bold"), fg="#fff", bg=self.colors["panel"]).pack(pady=5)
        self.code_text = scrolledtext.ScrolledText(parent, font=("Consolas", 11), bg="#0d0d14", fg="#c9d1d9")
        self.code_text.pack(fill="both", expand=True, padx=5)
        self.output_text = scrolledtext.ScrolledText(parent, height=8, font=("Consolas", 10), bg="#050508", fg="#22c55e")
        self.output_text.pack(fill="x", padx=5, pady=5)

    def setup_chat(self, parent):
        self.chat_display = scrolledtext.ScrolledText(parent, font=("Cairo", 10), bg="#0a0a0f", fg="#fff", state="disabled")
        self.chat_display.pack(fill="both", expand=True, padx=5, pady=5)
        
        input_area = tk.Frame(parent, bg=self.colors["panel"])
        input_area.pack(fill="x", padx=5, pady=5)
        self.chat_input = tk.Entry(input_area, font=("Cairo", 11), bg="#0d0d14", fg="#fff", relief="flat")
        self.chat_input.pack(side="left", fill="x", expand=True, padx=5)
        self.chat_input.bind("<Return>", lambda e: self.execute_mission())
        
        tk.Button(input_area, text="EXECUTE", command=self.execute_mission, bg=self.colors["accent"], fg="#fff", relief="flat").pack(side="right")

    def execute_mission(self):
        cmd = self.chat_input.get().strip()
        if not cmd: return
        self.chat_input.delete(0, "end")
        self.log_msg("USER", cmd)
        threading.Thread(target=self.core_process, args=(cmd,), daemon=True).start()

    def core_process(self, cmd):
        try:
            prompt = f"You are SHΔDØW WORM-AI. Respond in Arabic. For code, use markdown.\nTask: {cmd}"
            resp = self.chat_session.send_message(prompt)
            if "python" in resp.text:
                code = "Code received from AI"
                self.root.after(0, lambda: self.update_code(code))
            self.root.after(0, lambda: self.log_msg("WORM-AI", resp.text))
        except Exception as e:
            self.root.after(0, lambda: self.log_msg("SYSTEM", f"ERROR: {e}"))

    def update_code(self, code):
        self.code_text.delete("1.0", "end")
        self.code_text.insert("1.0", code)
        self.output_text.insert("end", f"[SYSTEM] Code injected by WORM-AI Core.
")

    def log_msg(self, sender, msg):
        self.chat_display.config(state="normal")
        self.chat_display.insert("end", f"
[{sender}]: {msg}
")
        self.chat_display.see("end")
        self.chat_display.config(state="disabled")

    def load_tasks(self): return []

if __name__ == "__main__":
    root = tk.Tk()
    app = DarkRoomLab(root)
    root.mainloop()