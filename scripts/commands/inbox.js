module.exports.config = {
    name: "inbox",
    version: "1.0.1",
    permission: 0,
    credits: "Joy Ahmed",
    prefix: true,
    description: "Send an automated inbox message to the user who used the command!",
    category: "utility",
    usages: "",
    cooldowns: 5,
    dependencies: {}
};

module.exports.run = async ({ api, event, args }) => {
    const userID = event.senderID;

    // Message that will be sent to the user's inbox
    const inboxMessage = 
        `─── 📩 𝗜𝗡𝗕𝗢𝗫 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 ───\n` +
        `👋 Hello! You requested this message via command.\n` +
        `📌 How can I help you today?\n` +
        `─────────────────\n` +
        `💻 Joy Ahmed`;

    // Sending the message directly to the user's inbox
    api.sendMessage(inboxMessage, userID, (err) => {
        if (err) {
            return api.sendMessage("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐢𝐧𝐛𝐨𝐱 𝐦𝐞𝐬𝐬𝐚𝐠𝐞! 𝐏𝐥𝐞𝐚𝐬𝐞 𝐮𝐧𝐛𝐥𝐨𝐜𝐤 𝐭𝐡𝐞 𝐛𝐨𝐭 𝐟𝐢𝐫𝐬𝐭.", event.threadID, event.messageID);
        }
        
        // Confirmation message in the group chat
        const successMessage = 
            `─── ✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦 ───\n` +
            `📨 Check your inbox! I've sent you a message.\n` +
            `─────────────────\n` +
            `💻 Joy Ahmed`;

        api.sendMessage(successMessage, event.threadID, event.messageID);
    });
};
