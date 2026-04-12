# OpenClaw Chat Interface - مواصفات التطوير

## نظرة عامة

**الهدف:** ترقية واجهة الدردشة الحالية لتصبح واجهة احترافية شبيهة ChatGPT/Perplexity

**نطاق العمل:** Frontend فقط (بدون تعديل backend في المرحلة الأولى)

---

## 1. هيكل البيانات

### 1.1 ChatMessage
```typescript
type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  isStreaming?: boolean;
};
```

### 1.2 ChatConversation
```typescript
type ChatConversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  selectedModel: string;
  messages: ChatMessage[];
};
```

### 1.3 ChatSettings
```typescript
type ChatSettings = {
  theme: "light" | "dark" | "system";
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  pageBg: string;
  chatBg: string;
  assistantBubbleBg: string;
  userBubbleBg: string;
  assistantTextColor: string;
  userTextColor: string;
  borderColor: string;
  typingSpeed: number;
  typingMode: "character" | "word";
  showCursor: boolean;
  autoScroll: boolean;
  directionMode: "auto" | "rtl" | "ltr";
  sidebarOpen: boolean;
};
```

---

## 2. مفاتيح التخزين في localStorage

```
chat:conversations     → ChatConversation[]
chat:activeConversationId → string
chat:settings        → ChatSettings
chat:sidebarOpen    → boolean
```

---

## 3. المكوّنات Components

### 3.1 قائمة المكوّنات
```
ChatPage/
├── ChatLayout
│   ├── ChatSidebar
│   │   └── ConversationItem
│   ├── ChatHeader
│   ├── ChatMain
│   │   ├── ChatMessages
│   │   │   └── ChatMessageBubble
│   │   │       └── StreamingMarkdownMessage
│   │   └── ChatInput
│   └── ChatSettingsDrawer
```

### 3.2 الهيكل العام
```tsx
<ChatPage>
  <ChatSidebar />        // الشريط الجانبي
  <ChatMain>
    <ChatHeader />
    <ChatMessages>
      {messages.map(msg => (
        <ChatMessageBubble 
          role={msg.role}
          content={msg.content}
          isStreaming={msg.isStreaming}
        />
      ))}
    </ChatMessages>
    <ChatInput />
  </ChatMain>
  <ChatSettingsDrawer />
</ChatPage>
```

---

## 4. المتغيرات CSS Variables

```css
:root {
  --chat-font-family: 'Cairo', sans-serif;
  --chat-font-size: 16px;
  --chat-font-weight: 500;
  --chat-text-color: #e5e7eb;
  --chat-page-bg: #0b0f19;
  --chat-bg: #111827;
  --chat-assistant-bg: #1f2937;
  --chat-user-bg: #2563eb;
  --chat-assistant-text: #f9fafb;
  --chat-user-text: #ffffff;
  --chat-border: #374151;
}
```

**التطبيق على العناصر:**
```css
.chat-page { background: var(--chat-page-bg); }
.chat-messages { background: var(--chat-bg); }
.message-user { 
  background: var(--chat-user-bg);
  color: var(--chat-user-text);
}
.message-assistant { 
  background: var(--chat-assistant-bg);
  color: var(--chat-assistant-text);
}
.chat-text {
  font-family: var(--chat-font-family);
  font-size: var(--chat-font-size);
  font-weight: var(--chat-font-weight);
  color: var(--chat-text-color);
}
```

---

## 5. أسلوب الرد التدريجي

### 5.1 pseudo-streaming

**التنفيذ:**
```typescript
// hook: useStreamingText
function useStreamingText(text: string, speed: number, mode: "character" | "word") {
  const [displayedText, setDisplayedText] = useState("");
  
  const stream = async () => {
    const chars = mode === "character" ? text.split("") : text.split(" ");
    
    for (const item of chars) {
      setDisplayedText(prev => prev + item);
      await new Promise(r => setTimeout(r, speed));
    }
  };
  
  return { displayedText, stream };
}
```

### 5.2 RTL للعربية

**القواعد:**
```css
.arabic-text {
  direction: rtl;
  text-align: right;
  unicode-bidi: bidi-override;
  white-space: pre-wrap;
  word-break: break-word;
}
```

**التنفيذ مع RTL:**
```typescript
function getDirection(text: string, mode: "auto" | "rtl" | "ltr"): string {
  if (mode === "rtl") return "rtl";
  if (mode === "ltr") return "ltr";
  
  // auto: الكشف التلقائي
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text) ? "rtl" : "ltr";
}
```

### 5.3 Markdown الحي

**التنفيذ:**
```tsx
function StreamingMarkdownMessage({ 
  text, 
  isStreaming,
  direction 
}: Props) {
  return (
    <div dir={direction}>
      <ReactMarkdown>{text}</ReactMarkdown>
      {isStreaming && <Cursor />}
    </div>
  );
}
```

### 5.4 auto-scroll الذكي

```typescript
function useAutoScroll(ref: Ref, messages: Message[]) {
  const scrollContainer = ref.current;
  
  useEffect(() => {
    if (!scrollContainer) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // إذا كان ضمن 100px من الأسفل، فعل auto-scroll
    if (distanceFromBottom < 100) {
      scrollContainer.scrollTop = scrollHeight;
    }
  }, [messages]);
}
```

---

## 6. hooks

### 6.1 useChatStorage

```typescript
function useChatStorage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  
  // التحميل الأولي
  useEffect(() => {
    const saved = localStorage.getItem("chat:conversations");
    const activeSaved = localStorage.getItem("chat:activeConversationId");
    
    if (saved) setConversations(JSON.parse(saved));
    if (activeSaved) setActiveId(activeSaved);
    else createNewConversation(); // محادثة جديدة إذا لا توجد
  }, []);
  
  // حفظ تلقائي
  useEffect(() => {
    localStorage.setItem("chat:conversations", JSON.stringify(conversations));
    localStorage.setItem("chat:activeConversationId", activeId);
  }, [conversations, activeId]);
  
  const createNewConversation = () => {
    const newConv: ChatConversation = {
      id: crypto.randomUUID(),
      title: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      selectedModel: "auto",
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
  };
  
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setActiveId(conversations[0]?.id || "");
  };
  
  const renameConversation = (id: string, title: string) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, title, updatedAt: Date.now() } : c
    ));
  };
  
  const addMessage = (message: ChatMessage) => {
    setConversations(prev => prev.map(c => 
      c.id === activeId 
        ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
        : c
    ));
  };
  
  const getActiveConversation = () => 
    conversations.find(c => c.id === activeId);
  
  return {
    conversations,
    activeId,
    setActiveId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    addMessage,
    getActiveConversation,
  };
}
```

### 6.2 useChatSettings

```typescript
function useChatSettings() {
  const DEFAULT_SETTINGS: ChatSettings = {
    theme: "dark",
    fontFamily: "Cairo, sans-serif",
    fontSize: 16,
    fontWeight: 500,
    textColor: "#e5e7eb",
    pageBg: "#0b0f19",
    chatBg: "#111827",
    assistantBubbleBg: "#1f2937",
    userBubbleBg: "#2563eb",
    assistantTextColor: "#f9fafb",
    userTextColor: "#ffffff",
    borderColor: "#374151",
    typingSpeed: 12,
    typingMode: "character",
    showCursor: true,
    autoScroll: true,
    directionMode: "auto",
    sidebarOpen: true,
  };
  
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  
  // التحميل
  useEffect(() => {
    const saved = localStorage.getItem("chat:settings");
    if (saved) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    }
    applyCSSVariables(DEFAULT_SETTINGS);
  }, []);
  
  // حفظ وتطبيق
  const updateSettings = (updates: Partial<ChatSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem("chat:settings", JSON.stringify(newSettings));
      applyCSSVariables(newSettings);
      return newSettings;
    });
  };
  
  const applyCSSVariables = (s: ChatSettings) => {
    const root = document.documentElement;
    root.style.setProperty("--chat-font-family", s.fontFamily);
    root.style.setProperty("--chat-font-size", `${s.fontSize}px`);
    root.style.setProperty("--chat-font-weight", `${s.fontWeight}`);
    root.style.setProperty("--chat-text-color", s.textColor);
    root.style.setProperty("--chat-page-bg", s.pageBg);
    root.style.setProperty("--chat-bg", s.chatBg);
    root.style.setProperty("--chat-assistant-bg", s.assistantBubbleBg);
    root.style.setProperty("--chat-user-bg", s.userBubbleBg);
    root.style.setProperty("--chat-assistant-text", s.assistantTextColor);
    root.style.setProperty("--chat-user-text", s.userTextColor);
    root.style.setProperty("--chat-border", s.borderColor);
  };
  
  return { settings, updateSettings, resetSettings: () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem("chat:settings", JSON.stringify(DEFAULT_SETTINGS));
    applyCSSVariables(DEFAULT_SETTINGS);
  }};
}
```

---

## 7. ChatSettingsDrawer

### 7.1 خيارات الإعدادات

| الفئة | الخيار | القيم |
|------|-------|------|
| **المظهر** | theme | light, dark, system |
| **الخط** | fontFamily | Inter, Cairo, Tajawal, IBM Plex Sans Arabic, Noto Sans Arabic, system-ui |
| | fontSize | 14, 16, 18, 20, 22 |
| | fontWeight | 400, 500, 600, 700 |
| **الألوان** | textColor | color picker |
| | pageBg | color picker |
| | chatBg | color picker |
| | assistantBubbleBg | color picker |
| | userBubbleBg | color picker |
| | borderColor | color picker |
| **السلوك** | typingSpeed | 8-50 (ms) |
| | typingMode | character, word |
| | showCursor | boolean |
| | autoScroll | boolean |
| | directionMode | auto, rtl, ltr |

---

## 8. الشريط الجانبي ChatSidebar

### 8.1 العناصر

```tsx
<ChatSidebar>
  <SidebarHeader>
    <Button onClick={createNewConversation}>+ محادثة جديدة</Button>
  </SidebarHeader>
  
  <ConversationList>
    {conversations.map(conv => (
      <ConversationItem
        id={conv.id}
        title={conv.title || "محادثة جديدة"}
        preview={conv.messages[0]?.content.slice(0, 50)}
        updatedAt={conv.updatedAt}
        isActive={conv.id === activeId}
        onSelect={() => setActiveId(conv.id)}
        onRename={(title) => renameConversation(conv.id, title)}
        onDelete={() => deleteConversation(conv.id)}
      />
    ))}
  </ConversationList>
</ChatSidebar>
```

### 8.2 auto-title

```typescript
function generateTitle(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find(m => m.role === "user");
  if (!firstUserMessage) return "محادثة جديدة";
  
  const content = firstUserMessage.content;
  return content.length > 40 
    ? content.slice(0, 40) + "..." 
    : content;
}
```

---

## 9. أولويات التنفيذ

### المرحلة الأولى (الأولوية القصوى)
- [x] pseudo-streaming مع cursor
- [x] RTL صحيح للعربية
- [x] Markdown bubble
- [x] حفظ المحادثة الحالية
- [x] إعدادات الخط والثيم الأساسية

### المرحلة الثانية
- [ ] sidebar للمحادثات
- [ ] تعدد المحادثات
- [ ] rename/delete/new chat
- [ ] حفظ كامل للإعدادات

### المرحلة الثالثة
- [ ] تحسين الأداء
- [ ] streaming حقيقي من backend
- [ ] مزامنة مستقبلية

---

## 10. معايير القبول

### الرد
- [ ] عند إرسال رسالة، يظهر رد assistant تدريجيًا داخل نفس bubble
- [ ] لا يظهر دفعة واحدة
- [ ] يوجد cursor أثناء التوليد

### العربية
- [ ] النص العربي يظهر من اليمين أثناء التدرج
- [ ] النص المختلط عربي/إنجليزي لا يخترب

### Markdown
- [ ] الـ Markdown يترندر أثناء التدرج
- [ ] لا تظهر الصياغات الخام مثل **bold** بعد اكتمال الرسالة

### الإعدادات
- [ ] يمكن تغيير الخط، الحجم، الألوان، الخلفية، والثيم من الواجهة
- [ ] التغييرات تُطبّق فورًا
- [ ] التغييرات تبقى محفوظة بعد refresh

### المحادثات
- [ ] يمكن إنشاء محادثة ��ديدة
- [ ] يمكن الرجوع لأي محادثة محفوظة
- [ ] يمكن إعادة تسمية محادثة
- [ ] يمكن حذف محادثة
- [ ] المحادثة النشطة لا تضيع عند refresh

### الشريط الجانبي
- [ ] يعرض قائمة المحادثات السابقة
- [ ] يمكن فتحه وإغلاقه
- [ ] حالته محفوظة

---

## 11. الملفات المطلوب إنشاؤها

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatPage.tsx
│   │   ├── ChatLayout.tsx
│   │   ├── ChatSidebar.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── ChatMain.tsx
│   │   ├── ChatMessages.tsx
│   │   ├── ChatMessageBubble.tsx
│   │   ├── StreamingMarkdownMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatSettingsDrawer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Select.tsx
│       ├── Slider.tsx
│       └── ColorPicker.tsx
├── hooks/
│   ├── useChatStorage.ts
│   ├── useChatSettings.ts
│   ├── useStreamingText.ts
│   └── useAutoScroll.ts
├── types/
│   └── chat.ts
└── styles/
    └── chat-theme.css
```

---

## 12. ملاحظات

- **عدم تعديل الـ backend:** في هذه المرحلة، نستخدم endpoint `/api/chat/complete` الحالي
- **البنية modular:** كل مكون منفصل وقابل للاختبار
- **TypeScript:** جميع الأنواع明確 ومحددة
- **localStorage:** كل البيانات تصبح persistent