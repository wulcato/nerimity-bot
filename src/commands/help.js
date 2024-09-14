import { commands } from "../commands.js";
import config from "../config.js";

export const command = "help";
export const description = "Shows the list of commands.";

/**

 *
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message
 */
export const run = async (bot, args, message) => {
  return;
  let content = "";
  commands.forEach((command) => {
    content += `\`${config.prefix}${command.command}\` - ${command.description}\n`;
  });

  message.channel.send(content);
};
