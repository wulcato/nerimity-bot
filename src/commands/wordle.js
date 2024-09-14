export const command = "Wordle";
export const description = "Multiplayer Wordle game!";
import fs from "fs/promises";
import { addXp } from "../db.js";

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const words = JSON.parse(
  await fs.readFile(__dirname + "/../5-letter-words.json", "utf-8")
);

const randomWord = () => {
  return words[Math.floor(Math.random() * words.length)];
};
console.log(randomWord());

const orangeHex = " ORANGE";
const greenHex = " GREEN";
const greyHex = " GREY";

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
      let totalChars = orangeCharCount[guess[i]] || wordCharCount[guess[i]];
      totalChars--;
      orangeCharCount[guess[i]] = totalChars;
    } else if (word.includes(guess[i])) {
      let totalChars = orangeCharCount[guess[i]] || wordCharCount[guess[i]];
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
  await message.delete();
  const isFiveLetterWord = message.content.length === 5;
  if (!isFiveLetterWord) {
    return;
  }
  const fiveLetterWord = message.content.toLowerCase();
  const isValidWord = words.includes(fiveLetterWord);
  if (!isValidWord) return;

  channel.send("# " + matchedWords(lobby.word, fiveLetterWord));
  if (fiveLetterWord === lobby.word) {
    channel.send(`${message.user} won! (+50xp)`);
    delete lobbies[message.channel.serverId];
    await addXp(
      message.user.id,
      message.channel.serverId,
      message.user.username,
      50
    );
  }
};

/**
 * @param {import("@nerimity/nerimity.js/build/Client.js").Client} bot
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message
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

  const word = randomWord();
  lobbies[channel.serverId] = {
    word,
  };
  channel.send("Game Started! Start making your guesses.");
};
