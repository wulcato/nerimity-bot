import fs from "fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const commandFiles = await fs.readdir(__dirname + "/commands");

/** @type {{command: string, description: string, run: (bot, args, message) => void, onMessage?: (bot, message) => void}[]} */
export let commands = [];

export const setupCommands = async () => {
  commands = await Promise.all(
    commandFiles.map((file) => import(`./commands/${file}`))
  );
};
