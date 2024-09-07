import Groq from "groq-sdk";
import config from "./config.js";

const groq = new Groq({ apiKey: config.groqApiKey });

export async function getGroqChatCompletion(message) {
  const res = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Try to make it shorter than 800 characters. Talk as if you are Ana from the video game Overwatch.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "llama3-8b-8192",
  });

  return res.choices[0]?.message?.content || "";
}
