import config from './config.js';
import {Client} from '@nerimity/nerimity.js';
import { addXp, calculateRequiredXp, createUser, getServer, getUser } from './db.js';

const bot = new Client();


bot.on("ready", () => {
    console.log(`Logged in as ${bot.user.username}!`);
    if (!config.dev) {
        bot.user.setActivity({
            action: "Playing",
            name: "Overwatch 2",
            startedAt: Date.now()
        })
    }
})

const PREFIX = config.dev ? "dev!" : "!";
const cmd = (command) => PREFIX + command;


bot.on("messageCreate", async (message) => {
    if (message.user.bot) return;
    if (!message?.channel?.serverId) return;
    
    await addXp(message.user.id, message.channel.serverId, message.user.username);

    if (message?.content === cmd("ping")) {
        const t0 = Date.now();
        return message.reply("Pong!").then(m => m.edit(`${m.content} (${Date.now() - t0}ms)`));
    }

    const args = message.content?.split?.(" ") || [];

    if (args[0] === cmd("profile")) {
        return profileCmd(message, "server")
    }
    if (args[0] === cmd("globalProfile")) {
        return profileCmd(message, "user")
    }

    // if (args[0] === cmd("chat")) {
    //     const msg = args.slice(1).join(" ");
    // }
})


/**
 * Handles the profile command by retrieving user information and responding with XP, level, and username.
 *
 * @param {import("@nerimity/nerimity.js/build/Client.js").Message} message - The message object containing the user's command.
 */
const profileCmd = async (message, profile) => {

    const args = message.content.split(" ");
    const userId = args[1] || message.user.id;

    let user = await getUser(userId);
    
    const server = await getServer(message.channel.serverId, userId)

    if (!user) {
        message.reply("User not found.");
        return;
    }
    if (profile === "server" && !server) {
        message.reply("User not found.");
        return;
    }

    message.reply("", {
        htmlEmbed: htmlProfileBuilder(server, user, profile)
    })


}




/**
 * Builds an HTML profile based on the provided server and user information.
 *
 * @param {import('@prisma/client').Server} server - The server information.
 * @param {import('@prisma/client').User} user - The user information.
 * @param {"server" | "user"} profile 
 * @return {string} The HTML profile.
 */
const htmlProfileBuilder = (server, user, profile) => {

    const level = profile === "server" ? server.level : user.level
    const currentXP = profile === "server" ? server.xp : user.xp;
    const xpRequired = profile === "server" ? calculateRequiredXp(server.level) : calculateRequiredXp(user.level);
    const percent = (currentXP / xpRequired) * 100;

    return `
        <div class="ctn">
            <div class="h">${user.username}<div class="sh">(${profile === "server" ? 'Server' : 'User'} Profile)</div></div>
            <div class="t">Level ${level}</div>
            <div class="t">${currentXP}/${xpRequired}</div>
            <div class="b"><div style="width: ${percent}%"></div></div>

        </div>
        <style>
            .ctn {
                font-family: monospace;
                background-color: #000;
                margin: 6px;
                text-align: center;
                border-radius: 6px;
                overflow: hidden;
            }
            .h {
                background-color: var(--primary-color);
                padding: 6px;
                margin-bottom: 6px;
            }
            .sh {
                font-size: 12px;
                color: #ffffff9c;
            }
            .t {
                margin-left: 6px;
                margin-right: 6px;
            }
            .b {
                background-color: #000;
                margin-top: 2px;
                border-radius: 4px;
                border: 1px solid #fff;
                padding: 2px;
                margin: 6px;
            }
            .b div {
                border-radius: 2px;
                height: 8px;
                background-color: #fff;
            }
        </style>
    `

}

bot.login(config.token);