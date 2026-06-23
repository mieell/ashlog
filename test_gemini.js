const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat({
  history: [{ role: "model", parts: [{ text: "Hello" }] }]
});
chat.sendMessage("Hi").then(res => console.log(res)).catch(e => console.error(e.message));
