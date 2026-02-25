const axios = require("axios");

module.exports.config = {
  name: "add",
  version: "1.0.2",
  credits: "Joy",
  permission: 0,
  description: "Reply to video and add to API",
  category: "media",
  usages: "/add <name> (reply to video)",
  prefix: true
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (!args[0]) {
      return api.sendMessage(
        "❌ Usage: Reply to a video and type /add <name>",
        event.threadID
      );
    }

    if (!event.messageReply) {
      return api.sendMessage(
        "❌ You must reply to a video.",
        event.threadID
      );
    }

    const reply = event.messageReply;
    const videoAttachment = reply.attachments.find(a => a.type === "video");

    if (!videoAttachment || !videoAttachment.url) {
      return api.sendMessage(
        "❌ No video found in replied message.",
        event.threadID
      );
    }

    /* 🔹 STEP 1: Load API base URL from GitHub */
    const apiJson = await axios.get(
      "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json"
    );

    const BASE_URL = apiJson.data.add;
    if (!BASE_URL) {
      return api.sendMessage(
        "❌ rndm API not found in api.json",
        event.threadID
      );
    }

    const name = args[0].toLowerCase();
    const videoUrl = videoAttachment.url;

    api.sendMessage("⏳ Sending video to API...", event.threadID);

    /* 🔹 STEP 2: Add endpoint inside command */
    const apiRes = await axios.post(
      `${BASE_URL}/add`,
      { name, videoUrl },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 300000
      }
    );

    if (!apiRes.data.success) {
      return api.sendMessage(
        `❌ API Error: ${apiRes.data.msg}`,
        event.threadID
      );
    }

    const data = apiRes.data.data;

    api.sendMessage(
      `✅ Video Added Successfully!
📛 Name: ${data.name}
🔢 Serial: ${data.serial}
🔗 Link: ${data.url}
📦 Source: ${data.source}`,
      event.threadID
    );

  } catch (err) {
    api.sendMessage(
      `❌ Error:\n${err.response?.data?.msg || err.message}`,
      event.threadID
    );
  }
};
