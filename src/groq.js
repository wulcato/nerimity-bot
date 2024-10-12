import Groq from "groq-sdk";
import config from "./config.js";

const groq = config.groqApiKey ? new Groq({ apiKey: config.groqApiKey }) : {};

export async function getGroqChatCompletion(message) {
  const res = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Try to respond shorter than 800 letters.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama3-70b-8192",
  });

  return res.choices[0]?.message?.content || "";
}
