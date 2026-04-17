import app from './app';

// استخدم متغير البيئة أو القيمة الافتراضية 8001
const port = process.env.BACKEND_PORT || 8001;

app.listen(port, () => {
  console.log(`🧠 OpenClaw Clean Brain running on http://localhost:${port}`);
});
