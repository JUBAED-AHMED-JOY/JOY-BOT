module.exports.config = {
    name: "gcname",
    version: "1.0.0",
    permission: 1,
    credits: "Joy Ahmed",
    prefix: true,
    description: "Change the group chat name stylishly!",
    category: "admin",
    usages: "[new group name]",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async ({ api, event, args }) => {
    const newName = args.join(" ");
    
    if (!newName) {
        return api.sendMessage("⚠️ 𝗣𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐧𝐞𝐰 𝐧𝐚𝐦𝐞 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩! 🚀", event.threadID, event.messageID);
    }

    api.setTitle(newName, event.threadID, (err) => {
        if (err) {
            return api.sendMessage("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐜𝐡𝐚𝐧𝐠𝐞 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐧𝐚𝐦𝐞! 𝐌𝐚𝐤𝐞 𝐬𝐮𝐫𝐞 𝐈 𝐚𝐦 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧.", event.threadID, event.messageID);
        }
        
        const successMessage = 
            `─── 🛠️ 𝐆𝐂 𝐍𝐀𝐌𝐄 ───\n` +
            `✅ Successfully changed to:\n` +
            `📌 ${newName}\n` +
            `─────────────────\n` +
            `💻 Joy Ahmed`;

        api.sendMessage(successMessage, event.threadID, event.messageID);
    });
};
