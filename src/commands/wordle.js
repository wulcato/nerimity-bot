export const command = "Wordle";
export const description = "Multiplayer Wordle game!";
import fs from "fs/promises";
import { addXp } from "../db.js";
import { define } from "../dictionary.js";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const words4 = JSON.parse(
  await fs.readFile(__dirname + "/../4-letter-words.json", "utf-8")
);
const words5 = JSON.parse(
  await fs.readFile(__dirname + "/../5-letter-words.json", "utf-8")
);
const words6 = JSON.parse(
  await fs.readFile(__dirname + "/../6-letter-words.json", "utf-8")
);
const words7 = JSON.parse(
  await fs.readFile(__dirname + "/../7-letter-words.json", "utf-8")
);

const wordsObj = {
  4: words4,
  5: words5,
  6: words6,
  6: words7,
};

const randomWord = (words = words5) => {
  return words[Math.floor(Math.random() * words.length)];
};

const orangeHex = "[#FF9800]";
const greenHex = "[#4CAF50]";
const greyHex = "[#9E9E9E]";

const matchedWords = (word, guess) => {
  let str = "";
  let wordCharCount = {};

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    wordCharCount[char] = (wordCharCount[char] || 0) + 1;
  }
  const orangeCharCount = {};

  for (let i = 0; i < word.length; i++) {
    if (word[i] === guess[i]) {
      let totalChars = orangeCharCount[guess[i]] ?? wordCharCount[guess[i]];
      totalChars--;
      orangeCharCount[guess[i]] = totalChars;
    } else if (word.includes(guess[i])) {
      let totalChars = orangeCharCount[guess[i]] ?? wordCharCount[guess[i]];
      orangeCharCount[guess[i]] = totalChars;
    }
  }

  for (let i = 0; i < word.length; i++) {
    if (word[i] === guess[i]) {
      str += greenHex + word[i];
    } else if (word.includes(guess[i])) {
      const count = orangeCharCount[guess[i]];
      if (!count) {
        str += greyHex + guess[i];
        continue;
      }
      orangeCharCount[guess[i]]--;
      str += orangeHex + guess[i];
    } else {
      str += greyHex + guess[i];
    }
  }

  return str;
};

/**
 * @type {Record<string, {
 *   word: string
 *   length: number
 * }>}
 */
const lobbies = {};

/**
 * @param {import("@nerimity/nerimity.js/build/Client.js").Client} bot
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message
 */
export const run = async (bot, args, message) => {
  /**
   * @type {import("@nerimity/nerimity.js/build/Client.js").Server | undefined} server
   */
  const server = message.channel.server;
  if (!server) return;
  const subCommand = args[1];
  if (subCommand === "start") {
    return startCommand(bot, args, message);
  }
};

/**
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message
 */
export const onMessage = async (bot, message) => {
  if (message.user.bot) return;
  const lobby = lobbies[message.channel.serverId];
  if (!lobby) return;
  const channel = message.channel;
  if (!channel.name.toLowerCase().includes("wordle")) {
    return;
  }
  const isLengthWord = message.content.length === lobby.length;
  if (!isLengthWord) {
    return;
  }
  const letterWord = message.content.toLowerCase();
  const isValidWord = wordsObj[lobby.length].includes(letterWord);
  if (!isValidWord) return;
  const res = await message.delete().catch(() => {
    console.log("Missing permission: Delete message.");
    return false;
  });
  if (res === false) return;

  let msg = await channel.send("# " + matchedWords(lobby.word, letterWord), {
    silent: true,
  });
  if (letterWord === lobby.word) {
    delete lobbies[message.channel.serverId];
    msg = await msg.edit(msg.content + `\n${message.user} won! (+50xp)`);
    await addXp(
      message.user.id,
      message.channel.serverId,
      message.user.username,
      50
    );
    const definition = await define(letterWord);
    if (definition) {
      await msg.edit(msg.content + `\n\n${letterWord}: ` + definition);
    }
  }
};

/**
 * @param {import("@nerimity/nerimity.js/build/Client.js").Client} bot
 * @param {import("@nerimity/nerimiwwwty.js/build/Client.js").Message} message
 */
const startCommand = async (bot, args, message) => {
  const channel = message.channel;
  if (!channel.name.toLowerCase().includes("wordle")) {
    return channel.send(
      "This command can only be used in a channel named 'Wordle'"
    );
  }
  const isAlreadyStarted = lobbies[channel.serverId];
  if (isAlreadyStarted) {
    return channel.send("There is already a game in progress.");
  }
  const letterWords = parseInt(args[2]) || 5;

  const word = randomWord(wordsObj[letterWords]);
  if (!word) {
    const maxNum = Object.keys(wordsObj).sort((a, b) => b - a)[0];
    const minNum = Object.keys(wordsObj).sort((a, b) => a - b)[0];
    return channel.send(
      "Invalid. Please enter a number between " + minNum + " and " + maxNum
    );
  }
  lobbies[channel.serverId] = {
    word,
    length: letterWords,
  };
  channel.send("Game Started! (" + letterWords + " letters)");
};
