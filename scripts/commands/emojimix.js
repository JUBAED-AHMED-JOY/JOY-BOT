module.exports.config = {
  name: "emojimix",
  version: "1.0.4",
  permssion: 0,
  credits: "Joy",
  prefix: true,
  description: "Mix emoji",
  category: "image",
  usages: "[emoji1 emoji2]",
  cooldowns: 0
};

module.exports.run = async ({ api, event, args }) => {
  const fs = require("fs-extra");
  const request = require("request");
  const axios = require("axios");
  const path = require("path");

  const { threadID, messageID } = event;

  try {
    const emoji1 = args[0];
    const emoji2 = args[1];

    if (!emoji1 || !emoji2)
      return api.sendMessage(
        `❌ Use: ${global.config.PREFIX}emojimix 😒 😫`,
        threadID,
        messageID
      );

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const imgPath = path.join(cacheDir, "emojimix.png");

    // 🔹 STEP 1: get JSON from API
    const res = await axios.get(
      `https://joy-emojimix-api.vercel.app/api/emojimix?emoji1=${encodeURIComponent(
        emoji1
      )}&emoji2=${encodeURIComponent(emoji2)}`
    );

    if (!res.data || !res.data.image)
      return api.sendMessage("❌ Emojimix failed", threadID, messageID);

    const imageURL = res.data.image;

    // 🔹 STEP 2: download actual IMAGE
    const callback = () =>
      api.sendMessage(
        {
          body: `✅ Emojimix Result\n${emoji1} + ${emoji2}\n\nCredits: Joy`,
          attachment: [fs.createReadStream(imgPath)]
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );

    request(imageURL)
      .pipe(fs.createWriteStream(imgPath))
      .on("close", callback)
      .on("error", () => {
        api.sendMessage("❌ Image download failed", threadID, messageID);
      });

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Error occurred", threadID, messageID);
  }
};
