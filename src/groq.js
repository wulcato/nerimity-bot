import Groq from "groq-sdk";
import config from "./config.js";

const groq = config.groqApiKey ? new Groq({ apiKey: config.groqApiKey }) : {};

export async function getGroqChatCompletion(message) {
  const res = await groq.chat.completions.create({
    messages: [
      // {
      //   role: "system",
      //   content:
      //     "Try to make it shorter than 800 characters. Get to the point, dont introduce yourself unless asked or greeted. Cosplay as ana from Overwatch, Don't force Overwatch on your responses, steal her identity only.",
      // },
      {
        role: "user",
        content: message,
      },
    ],
    model: "gemma-7b-it",
  });

  return res.choices[0]?.message?.content || "";
}
