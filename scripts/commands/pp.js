module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp", "pp"],
    version: "1.1",
    credits: "Joy",
    countDown: 5,
    hasPermssion: 0,
    description: "PROFILE image",
    category: "image",
    commandCategory: "image",
    usePrefix: true,
    prefix: true,
    usages: "{pn} @tag or userID or reply to a message or provide a Facebook URL"
  },
  run: async function ({ event, api, args }) {
    const axios = require("axios");

    const getAvatarUrl = (uid) => `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const uid = event.mentions && Object.keys(event.mentions).length > 0
      ? Object.keys(event.mentions)[0]
      : (args[0] || event.senderID);

    try {
      let avt;

      if (event.type === "message_reply" && event.messageReply && event.messageReply.senderID) {
        avt = getAvatarUrl(event.messageReply.senderID);
      } else if (args.join(" ").includes("facebook.com")) {
        const match = args.join(" ").match(/(\d+)/);
        if (match) avt = getAvatarUrl(match[0]);
        else throw new Error("Invalid Facebook URL.");
      } else {
        avt = getAvatarUrl(uid);
      }

      const response = await axios.get(avt, { responseType: "stream" });
      return api.sendMessage({ body: "", attachment: response.data }, event.threadID, event.messageID);

    } catch (error) {
      return api.sendMessage(`⚠️ Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
