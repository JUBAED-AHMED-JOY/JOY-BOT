const axios = require("axios");

module.exports.config = {
  name: "add",
  version: "1.0.0",
  credits: "Joy",
  permission: 0, // everyone can use
  description: "Reply to video and add to API",
  category: "media",
  usages: "/add <name> (reply to video)",
  prefix: true
};

module.exports.run = async function({ api, event, args }) {
  try {
    if (!args[0]) return api.sendMessage("❌ Usage: Reply to a video and type /add <name>", event.threadID);
    if (!event.messageReply) return api.sendMessage("❌ You must reply to a video.", event.threadID);

    const reply = event.messageReply;
    const videoAttachment = reply.attachments.find(a => a.type === "video");

    if (!videoAttachment || !videoAttachment.url) {
      return api.sendMessage("❌ No video found in replied message.", event.threadID);
    }

    const name = args[0].toLowerCase();
    const videoUrl = videoAttachment.url;

    api.sendMessage("⏳ Sending video to API...", event.threadID);

    const apiRes = await axios.post(
      "https://new-random-1.onrender.com/add",
      { name, videoUrl },
      { headers: { "Content-Type": "application/json" }, timeout: 300000 }
    );

    if (!apiRes.data.success) {
      return api.sendMessage(`❌ API Error: ${apiRes.data.msg}`, event.threadID);
    }

    const data = apiRes.data.data;
    api.sendMessage(
      `✅ Video Added Successfully!\n📛 Name: ${data.name}\n🔢 Serial: ${data.serial}\n🔗 Link: ${data.url}\n📦 Source: ${data.source}`,
      event.threadID
    );

  } catch (err) {
    api.sendMessage(`❌ Error:\n${err.response?.data?.msg || err.message}`, event.threadID);
  }
};
