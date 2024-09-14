export const command = "buttonTest";
export const description = "Show a test button.";

/**
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message
 */
export const run = async (bot, args, message) => {
  return message.reply("Click on the button below.", {
    buttons: [{ id: "clickMeButton", label: "Click Me", style: "primary" }],
  });
};
