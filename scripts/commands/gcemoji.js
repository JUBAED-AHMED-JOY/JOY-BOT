module.exports.config = {
    name: "gcemoji",
    version: "1.0.0",
    permission: 1,
    credits: "Joy Ahmed",
    prefix: true,
    description: "Change the group chat emoji stylishly!",
    category: "admin",
    usages: "[emoji]",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async ({ api, event, args }) => {
    const newEmoji = args[0];
    
    if (!newEmoji) {
        return api.sendMessage("⚠️ 𝗣𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚𝐧 𝐞𝐦𝐨𝐣𝐢 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩! 🚀", event.threadID, event.messageID);
    }

    api.changeGroupEmoji(newEmoji, event.threadID, (err) => {
        if (err) {
            return api.sendMessage("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐜𝐡𝐚𝐧𝐠𝐞 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐞𝐦𝐨𝐣𝐢! 𝐌𝐚𝐤𝐞 𝐬𝐮𝐫𝐞 𝐈 𝐚𝐦 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧.", event.threadID, event.messageID);
        }
        
        const successMessage = 
            `─── 🛠️ 𝐆𝐂 𝐄𝐌𝐎𝐉𝐈 ───\n` +
            `✅ Successfully changed to:\n` +
            `📌 ${newEmoji}\n` +
            `─────────────────\n` +
            `💻 Joy Ahmed`;

        api.sendMessage(successMessage, event.threadID, event.messageID);
    });
};
