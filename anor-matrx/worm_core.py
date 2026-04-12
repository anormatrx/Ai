#!/usr/bin/env python3
"""
SHADOW WORM-AI: Isolated Lab Core
The Dark Room: Isolated Lab
"""

import subprocess
import sys
import os
import json
import datetime
import threading

# === GUI Imports ===
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
import urllib.request
import urllib.error


class DarkRoomLab:
    def __init__(self, root):
        self.root = root
        self.root.title("SHADOW WORM-AI: Isolated Lab Core")
        self.root.geometry("1200x800")
        self.root.configure(bg="#0a0a0f")

        self.API_KEY = "AIzaSyAtZU4ybWVnSajiGs-V5mFLdDNiPsAUaHY"
        self.core_active = True

        self.colors = {
            "bg": "#0a0a0f",
            "panel": "#12121a",
            "border": "#2a2a3a",
            "accent": "#8b5cf6",
            "text": "#e2e8f0",
            "success": "#22c55e",
            "error": "#ef4444",
            "user_msg": "#1e293b",
            "ai_msg": "#0f172a",
        }

        self.tasks = self.load_tasks()
        self.setup_ui()

    def setup_ui(self):
        main_frame = tk.Frame(self.root, bg=self.colors["bg"])
        main_frame.pack(fill="both", expand=True, padx=10, pady=10)

        title_frame = tk.Frame(main_frame, bg=self.colors["bg"])
        title_frame.pack(fill="x", pady=(0, 10))

        tk.Label(
            title_frame,
            text="SHADOW WORM-AI CORE",
            font=("Consolas", 18, "bold"),
            fg=self.colors["accent"],
            bg=self.colors["bg"],
        ).pack(side="left")

        self.status_lbl = tk.Label(
            title_frame,
            text="● READY",
            fg=self.colors["success"],
            bg=self.colors["bg"],
            font=("Consolas", 10),
        )
        self.status_lbl.pack(side="right")

        paned = tk.PanedWindow(
            main_frame, orient=tk.HORIZONTAL, bg=self.colors["bg"], sashwidth=4
        )
        paned.pack(fill="both", expand=True)

        editor = tk.Frame(paned, bg=self.colors["panel"], bd=1, relief="solid")
        self.setup_editor(editor)
        paned.add(editor, width=650)

        chat = tk.Frame(paned, bg=self.colors["panel"], bd=1, relief="solid")
        self.setup_chat(chat)
        paned.add(chat, width=450)

        self.setup_status_bar(main_frame)

    def setup_editor(self, parent):
        header = tk.Frame(parent, bg=self.colors["panel"])
        header.pack(fill="x", padx=5, pady=5)

        tk.Label(
            header,
            text="CODE VAULT",
            font=("Consolas", 12, "bold"),
            fg="#fff",
            bg=self.colors["panel"],
        ).pack(side="left")

        btns = tk.Frame(header, bg=self.colors["panel"])
        btns.pack(side="right")

        tk.Button(
            btns,
            text="RUN",
            command=self.run_code,
            bg=self.colors["success"],
            fg="white",
            font=("Consolas", 9, "bold"),
            relief="flat",
            padx=10,
        ).pack(side="left", padx=2)

        tk.Button(
            btns,
            text="SAVE",
            command=self.save_code,
            bg=self.colors["border"],
            fg="white",
            font=("Consolas", 9),
            relief="flat",
            padx=10,
        ).pack(side="left", padx=2)

        self.code = scrolledtext.ScrolledText(
            parent, font=("Consolas", 11), bg="#0d0d14", fg="#c9d1d9", wrap="none"
        )
        self.code.pack(fill="both", expand=True, padx=5, pady=5)
        self.code.insert("1.0", self.get_default_code())

        self.output = scrolledtext.ScrolledText(
            parent,
            height=8,
            font=("Consolas", 10),
            bg="#050508",
            fg=self.colors["success"],
        )
        self.output.pack(fill="x", padx=5, pady=5)

    def setup_chat(self, parent):
        self.chat_display = scrolledtext.ScrolledText(
            parent,
            font=("Cairo", 10),
            bg="#0a0a0f",
            fg="#fff",
            state="disabled",
            wrap="word",
        )
        self.chat_display.pack(fill="both", expand=True, padx=5, pady=5)

        input_area = tk.Frame(parent, bg=self.colors["panel"])
        input_area.pack(fill="x", padx=5, pady=5)

        self.chat_input = tk.Entry(
            input_area, font=("Cairo", 11), bg="#0d0d14", fg="#fff", relief="flat", bd=5
        )
        self.chat_input.pack(side="left", fill="x", expand=True, padx=5)
        self.chat_input.bind("<Return>", lambda e: self.execute_mission())

        tk.Button(
            input_area,
            text="EXECUTE",
            command=self.execute_mission,
            bg=self.colors["accent"],
            fg="white",
            font=("Consolas", 10, "bold"),
            relief="flat",
        ).pack(side="right")

    def execute_mission(self):
        cmd = self.chat_input.get().strip()
        if not cmd:
            return

        self.chat_input.delete(0, "end")
        self.log("USER", cmd)

        # Use threading to call API
        threading.Thread(target=self.call_gemini_api, args=(cmd,), daemon=True).start()

    def call_gemini_api(self, prompt):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.API_KEY}"

            data = json.dumps(
                {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": f"You are SHADOW WORM-AI. Respond in Arabic. Task: {prompt}"
                                }
                            ]
                        }
                    ]
                }
            ).encode("utf-8")

            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Content-Type", "application/json")

            with urllib.request.urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
                if "candidates" in result and len(result["candidates"]) > 0:
                    text = result["candidates"][0]["content"]["parts"][0]["text"]
                    self.root.after(0, lambda: self.log("WORM-AI", text))
                else:
                    self.root.after(0, lambda: self.log("ERROR", "No response from AI"))

        except Exception as e:
            # Fallback to local response
            self.root.after(
                0,
                lambda: self.log(
                    "LOCAL", f"AI offline - using local mode: {prompt[:50]}..."
                ),
            )
            self.root.after(
                0, lambda: self.log("WORM-AI", self.get_local_response(prompt))
            )

    def get_local_response(self, prompt):
        """Local responses when API is unavailable"""
        prompt_lower = prompt.lower()

        if any(
            word in prompt_lower for word in ["كود", "code", "برمجة", "programming"]
        ):
            return "سأكتب لك الكود المطلوب. اكتب ما تريد أن يفعله الكود وأنا سأقوم بكتابته في المحرر ثم اضغط RUN للتنفيذ."

        elif any(word in prompt_lower for word in ["مساعدة", "help", " assistance"]):
            return "أنا هنا للمساعدة! يمكنك:\n- كتابة كود Python في المحرر\n- الضغط RUN لتنفيذ الكود\n- استخدام SAVE لحفظ الكود\n- سأساعدك في أي سؤال."

        elif any(word in prompt_lower for word in ["مرحبا", "hello", "اهلا", "hi"]):
            return "مرحباً! أنا SHADOW WORM-AI. كيف يمكنني مساعدتك اليوم؟\n\nاكتب مهمتك أو أكتب كود وأنا سأقوم بتنفيذه."

        else:
            return f"استلمت رسالتك: '{prompt[:100]}...'\n\nأكتب كود في المحرر واضغط RUN لتنفيذه، أو اطلب مني كتابة كود جديد."

    def log(self, sender, msg):
        self.chat_display.config(state="normal")
        ts = datetime.datetime.now().strftime("%H:%M:%S")
        self.chat_display.insert("end", f"\n[{sender}] [{ts}]:\n{msg}\n")
        self.chat_display.see("end")
        self.chat_display.config(state="disabled")

    def run_code(self):
        self.output.insert("end", f"[RUNNING] {datetime.datetime.now()}\n")
        code = self.code.get("1.0", "end").strip()

        with open("temp_lab.py", "w", encoding="utf-8") as f:
            f.write(code)

        try:
            result = subprocess.run(
                [sys.executable, "temp_lab.py"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            self.output.insert("end", f"OUTPUT:\n{result.stdout}\n")
            if result.stderr:
                self.output.insert("end", f"ERROR:\n{result.stderr}\n")
            self.output.insert("end", f"\n[DONE] Exit code: {result.returncode}\n")
        except subprocess.TimeoutExpired:
            self.output.insert("end", "Timeout! Code took too long.\n")
        except Exception as e:
            self.output.insert("end", f"Error: {e}\n")

    def save_code(self):
        f = filedialog.asksaveasfilename(defaultextension=".py")
        if f:
            with open(f, "w", encoding="utf-8") as file:
                file.write(self.code.get("1.0", "end"))
            messagebox.showinfo("OK", "Code Saved!")

    def get_default_code(self):
        return """# SHADOW WORM-AI: Write your code here
import os
import json
import datetime

def main():
    print("=" * 40)
    print("WORM-AI: SYSTEM ONLINE")
    print("=" * 40)
    print(f"Time: {datetime.datetime.now()}")
    print(f"Python: {sys.version}")
    
    # Your code here
    data = {
        "status": "active", 
        "core": "WORM-AI",
        "version": "1.0"
    }
    print("\\nOutput:")
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    import sys
    main()
"""

    def setup_status_bar(self, parent):
        sb = tk.Frame(parent, bg=self.colors["panel"], height=25)
        sb.pack(fill="x", pady=(5, 0))

        self.time_lbl = tk.Label(
            sb,
            text="",
            font=("Consolas", 9),
            fg=self.colors["text_dim"],
            bg=self.colors["panel"],
        )
        self.time_lbl.pack(side="right", padx=10)
        self.update_clock()

    def update_clock(self):
        self.time_lbl.config(text=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        self.root.after(1000, self.update_clock)

    def load_tasks(self):
        try:
            if os.path.exists("darkroom_tasks.json"):
                with open("darkroom_tasks.json", "r", encoding="utf-8") as f:
                    return json.load(f)
        except:
            pass
        return []


if __name__ == "__main__":
    root = tk.Tk()
    app = DarkRoomLab(root)
    root.mainloop()
