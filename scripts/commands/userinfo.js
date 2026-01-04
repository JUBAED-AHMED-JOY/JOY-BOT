const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "userinfo",
  version: "1.1.0",
  permission: 0,
  credits: "IMRAN",
  description: "Show stylish user information with avatar",
  prefix: true,
  category: "info",
  usages: "userinfo [reply/tag/uid]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  try {
    const { threadID, senderID, messageID, mentions } = event;
    let targetID;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (event.messageReply) {
      targetID = event.messageReply.senderID;
    } else if (args[0]) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    const userInfo = await api.getUserInfo(targetID);
    const info = userInfo[targetID];

    // avatar fetch
    const avatarURL = `https://fb-avatar-imran.vercel.app/fbp?uid=${targetID}`;
    const imgPath = path.join(__dirname, "cache", `avatar_${targetID}.png`);
    const imgData = (await axios.get(avatarURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(imgPath, Buffer.from(imgData, "binary"));

    // detect gender
    const gender =
      info.gender === 2 ? "👨 Male" :
      info.gender === 1 ? "👩 Female" :
      "❓ Unknown";

    // detect class
    let userClass = "👤 Normal User";
    if (targetID == api.getCurrentUserID()) {
      userClass = "🤖 Bot Owner";
    } else if (global.config?.ADMINBOT?.includes(targetID)) {
      userClass = "⚡ Bot Admin";
    }

    // styled message
    const msg = `
✦ ─── ✧ ─── ✦
✨ 𝗨𝗦𝗘𝗥 𝗜𝗡𝗙𝗢 ✨
✦ ─── ✧ ─── ✦
🙍 Name: ${info.name || "N/A"}
🏷️ Nickname: ${info.firstName || info.name || "N/A"}
🆔 UID: ${targetID}
🏫 Class: ${userClass}
🔗 Username: ${info.vanity || "Not set"}
🚻 Gender: ${gender}
🎂 Birthday: ${info.birthday || "Not set"}
🤝 Friend with Bot: ${info.isFriend ? "✅ Yes" : "❌ No"}
🌐 Profile: https://facebook.com/${targetID}
✦ ─── ✧ ─── ✦`;

    api.sendMessage(
      { body: msg, attachment: fs.createReadStream(imgPath) },
      threadID,
      () => fs.unlinkSync(imgPath),
      messageID
    );
  } catch (err) {
    api.sendMessage("⚠️ Couldn’t fetch user info.", event.threadID, event.messageID);
    console.error(err);
  }
};