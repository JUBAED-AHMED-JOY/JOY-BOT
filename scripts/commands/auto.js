const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("joy-video-downloader");

module.exports.config = {
  name: "auto",
  version: "0.0.3",
  permission: 0,
  prefix: false, // auto trigger, prefix lagbena
  credits: "Joy",
  description: "Auto video download from any link",
  category: "user",
  cooldowns: 3,
};

// ei function ta auto run hoy jokhon kono message ashe
module.exports.handleEvent = async function ({ api, event }) {
  try {
    const content = event.body || "";
    if (!content.startsWith("https://")) return; // link chara kichu hole return

    // cache folder ensure
    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, "auto.mp4");

    api.setMessageReaction("⏳", event.messageID, (err) => {}, true); // loading reaction

    const data = await downloadVideo(content, filePath);

    if (!data || !data.title) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      return api.sendMessage("❌ Video link download kora jacche na!", event.threadID, event.messageID);
    }

    const { title, filePath: savedPath } = data;

    api.setMessageReaction("✅", event.messageID, (err) => {}, true); // success reaction

    // send video and auto delete after sending
    return api.sendMessage(
      {
        body: `🎬 TITLE: ${title}`,
        attachment: fs.createReadStream(savedPath),
      },
      event.threadID,
      () => fs.unlinkSync(savedPath),
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Video download e problem hocche!", event.threadID, event.messageID);
  }
};

// manual run lagbe na
module.exports.run = async function () {};
