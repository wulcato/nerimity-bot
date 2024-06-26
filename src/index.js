import config from './config.js';
import {Client} from '@nerimity/nerimity.js';
import { addXp, calculateRequiredXp, createUser, getServer, getUser } from './db.js';

const bot = new Client();


bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.username}!`);
    bot.user.setActivity({
        action: "Playing",
        name: "Overwatch 2",
        startedAt: Date.now()
    })
})

const PREFIX = "!";
const cmd = (command) => PREFIX + command;


bot.on("messageCreate", async (message) => {
    if (message.user.bot) return;
    if (!message?.channel?.serverId) return;
    
    await addXp(message.user.id, message.channel.serverId, message.user.username);

    if (message?.content === cmd("ping")) {
        return message.reply("Pong!");
    }

    const args = message.content?.split?.(" ") || [];

    if (args[0] === cmd("profile")) {
        return profileCmd(message)
    }
})


/**
 * Handles the profile command by retrieving user information and responding with XP, level, and username.
 *
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message - The message object containing the user's command.
 */
const profileCmd = async (message) => {

    const args = message.content.split(" ");
    const userId = args[1] || message.user.id;

    let user = await getUser(userId);
    const server = await getServer(message.channel.serverId, userId)
    if (!user) {
        message.reply("User not found.");
        return;
    }

const serverProfile = server ? `**Server Profile**
XP: ${server.xp}/${calculateRequiredXp(server.level)}
Level: ${server.level}` : '';

message.channel.send(`${serverProfile}

**Global Profile**
XP: ${user.xp}/${calculateRequiredXp(user.level)}
Level: ${user.level}
`)


}


bot.login(config.token);