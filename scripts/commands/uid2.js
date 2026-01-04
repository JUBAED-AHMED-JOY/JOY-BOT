module.exports.config = {
    name: "uid2",
    aliases: ["getuid"],
    version: "1.0.0",
    permission: 0,
    credits: "Joy",
    prefix: false, // no prefix
    description: "Get Facebook user UID.",
    category: "without prefix",
    cooldowns: 5
};

module.exports.run = async function({ event, api, args }) {

    // === Helper Function === //
    const sendUID = (uid, threadID, messageID) => {
        const messageBody = 
`${uid}`;

        api.sendMessage(messageBody, threadID, messageID);
    };

    // === Case 1: Reply করা মেসেজ === //
    if (event.type === "message_reply") {
        const uid = event.messageReply.senderID;
        sendUID(uid, event.threadID, event.messageID);
        return;
    }

    // === Case 2: Argument নাই (নিজের UID) === //
    if (!args[0]) {
        sendUID(event.senderID, event.threadID, event.messageID);
        return;
    }

    // === Case 3: Link দেওয়া হলে === //
    if (args[0].indexOf(".com/") !== -1) {
        const res_ID = await api.getUID(args[0]);
        sendUID(res_ID, event.threadID, event.messageID);
        return;
    }

    // === Case 4: Mention করা হলে === //
    if (args.join().indexOf('@') !== -1) {
        const uid = Object.keys(event.mentions)[0];
        sendUID(uid, event.threadID, event.messageID);
        return;
    }
};
