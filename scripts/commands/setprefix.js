const fs = require("fs");
const { join } = require("path");

module.exports.config = {
    name: "setprefix",
    version: "1.0.1",
    permission: 1, // Admin only
    credits: "Joy Ahmed",
    prefix: true,
    description: "Change the bot prefix in Joy.json stylishly!",
    category: "admin",
    usages: "[new prefix] or 'reset'",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async ({ api, event, args }) => {
    const newPrefix = args[0];
    
    if (!newPrefix) {
        return api.sendMessage("⚠️ 𝗣𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐧𝐞𝐰 𝐩𝐫𝐞𝐟𝐢𝐱 𝐨𝐫 𝐭𝐲𝐩𝐞 '𝐫𝐞𝐬𝐞𝐭'! 🚀", event.threadID, event.messageID);
    }

    // Path to Joy.json
    const configPath = join(__dirname, "../../Joy.json");

    try {
        if (!fs.existsSync(configPath)) {
            return api.sendMessage("❌ 𝐉𝐨𝐲.𝐣𝐬𝐨𝐧 𝐟𝐢𝐥𝐞 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝!", event.threadID, event.messageID);
        }

        const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

        if (newPrefix.toLowerCase() === "reset") {
            configData.PREFIX = "!"; // Default fallback prefix, change if needed
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 4), "utf8");
            
            const resetMessage = 
                `─── ⚙️ 𝐏𝐑𝐄𝐅𝐈𝐗 ───\n` +
                `✅ Prefix has been reset to default in Joy.json!\n` +
                `📌 Default Prefix: ${configData.PREFIX}\n` +
                `─────────────────\n` +
                `💻 Joy Ahmed`;
            
            return api.sendMessage(resetMessage, event.threadID, event.messageID);
        }

        configData.PREFIX = newPrefix;
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 4), "utf8");

        const successMessage = 
            `─── ⚙️ 𝐏𝐑𝐄𝐅𝐈𝐗 ───\n` +
            `✅ Successfully changed prefix in Joy.json to:\n` +
            `📌 ${newPrefix}\n` +
            `─────────────────\n` +
            `💻 Joy Ahmed`;

        api.sendMessage(successMessage, event.threadID, event.messageID);
    } catch (error) {
        api.sendMessage("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐮𝐩𝐝𝐚𝐭𝐞 𝐭𝐡𝐞 𝐩𝐫𝐞𝐟𝐢𝐱 𝐢𝐧 𝐉𝐨𝐲.𝐣𝐬𝐨𝐧!", event.threadID, event.messageID);
    }
};
