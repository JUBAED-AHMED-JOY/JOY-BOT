const axios = require("axios");
const fs = require("fs");
const path = require("path");

const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

module.exports.config = {
  name: "rndm",
  version: "1.1.1",
  credits: "Joy",
  permssion: 0,
  description: "Get random video by name",
  category: "media",
  usages: "/rndm <name>",
  prefix: true
};

module.exports.run = async function ({ api, event, args }) {
  try {
    if (!args[0]) {
      return api.sendMessage(
        "❌ Usage: /rndm <name>",
        event.threadID
      );
    }

    const name = args.join(" ").toLowerCase();

    /* 🔹 STEP 1: Load base API from GitHub */
    const apiJson = await axios.get(
      "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json"
    );

    const BASE_URL = apiJson.data.rndm;
    if (!BASE_URL) {
      return api.sendMessage(
        "❌ rndm API not found in api.json",
        event.threadID
      );
    }

    /* 🔹 STEP 2: Call random endpoint */
    const res = await axios.get(
      `${BASE_URL}/random?name=${encodeURIComponent(name)}`,
      { timeout: 120000 }
    );

    if (!res.data || !res.data.success || !res.data.data) {
      return api.sendMessage(
        `❌ No video found for "${name}"`,
        event.threadID
      );
    }

    const video = res.data.data;
    const videoUrl = video.url;

    /* 🔹 STEP 3: Download video */
    const tempPath = path.join(__dirname, `rndm_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tempPath);

    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
      timeout: 120000
    });

    let downloaded = 0;
    let tooLarge = false;

    response.data.on("data", (chunk) => {
      downloaded += chunk.length;
      if (downloaded > MAX_VIDEO_SIZE) {
        tooLarge = true;
        response.data.destroy();
      }
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    /* 🔹 STEP 4: Size check */
    if (tooLarge) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return api.sendMessage(
        `🎬 ${video.name}\n📦 Size: >25MB\n🔗 ${videoUrl}`,
        event.threadID
      );
    }

    /* 🔹 STEP 5: Send video */
    api.sendMessage(
      {
        body: `🎬 ${video.name}\n📦 ${(downloaded / 1024 / 1024).toFixed(2)} MB`,
        attachment: fs.createReadStream(tempPath)
      },
      event.threadID,
      () => {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    );

  } catch (err) {
    api.sendMessage(
      `❌ Error: ${err.response?.data?.msg || err.message}`,
      event.threadID
    );
  }
};
