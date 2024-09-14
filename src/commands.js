import fs from "fs/promises";

const commandFiles = await fs.readdir("./src/commands");

/** @type {{command: string, description: string, run: (bot, args, message) => void, onMessage?: (bot, message) => void}[]} */
export let commands = [];

export const setupCommands = async () => {
  commands = await Promise.all(
    commandFiles.map((file) => import(`./commands/${file}`))
  );
};
