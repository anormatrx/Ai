async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/process-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "قم بالرد بكلمة 'متصل' فقط لتأكيد الاتصال.", selectedModel: "gemini-3-flash-preview", stream: false })
    });
    const data = await res.json();
    console.log("RESPONSE:", data);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
