export const command = "ping";
export const description = "Responds with Pong and the time it took.";

/**
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message
 */
export const run = async (bot, args, message) => {
  const t0 = Date.now();
  return message
    .reply("Pong!")
    .then((m) => m.edit(`${m.content} (${Date.now() - t0}ms)`));
};
