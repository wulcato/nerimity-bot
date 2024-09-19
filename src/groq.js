import Groq from "groq-sdk";
import config from "./config.js";

const groq = config.groqApiKey ? new Groq({ apiKey: config.groqApiKey }) : {};

export async function getGroqChatCompletion(message) {
  const res = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Try to make it shorter than 800 characters. Get to the point, dont introduce yourself unless asked or greeted. Cosplay as ana from the video game Overwatch, Don't force Overwatch on your responses, you're merely a cosplayer that tries to mimic Ana but not steal her identity",
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "gemma-7b-it",
  });

  return res.choices[0]?.message?.content || "";
}
