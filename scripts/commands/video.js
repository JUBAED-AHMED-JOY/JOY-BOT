const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "video",
  version: "2.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Get YouTube video by name",
  prefix: true,
  category: "media",
  usages: "/video <name>",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const query = args.join(' ');
  if (!query) return api.sendMessage("⚠️ Please provide a search query!\n\nUsage: /video <name>", event.threadID, event.messageID);

  let loadingMsgID = null;

  try {
    // Step 1: Send loading message
    const loading = await api.sendMessage(`🔎 Searching for "${query}"...\n⏳ Please wait...`, event.threadID);
    loadingMsgID = loading.messageID;

    // Step 2: Get video search result
    const searchRes = await axios.get(`https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`);
    const video = searchRes.data[0];

    if (!video || !video.url) throw new Error("No video found.");

    // Step 3: Update loading message
    await api.unsendMessage(loadingMsgID);
    const downloading = await api.sendMessage(`🎬 Found: ${video.title}\n⬇️ Downloading now...`, event.threadID);
    loadingMsgID = downloading.messageID;

    // Step 4: Get downloadable URL 
    const dlRes = await axios.get(`https://yt-api-imran.vercel.app/api?url=${video.url}`);
    const downloadUrl = dlRes.data.downloadUrl;
    if (!downloadUrl) throw new Error("No download link received.");

    // Step 5: Prepare file
    const videoBuffer = (await axios.get(downloadUrl, { responseType: 'arraybuffer' })).data;
    const cachePath = path.join(__dirname, "cache");
    await fs.ensureDir(cachePath);
    const filePath = path.join(cachePath, `video_${Date.now()}.mp4`);
    await fs.writeFile(filePath, videoBuffer);

    // Step 6: Send video
    const finalMessage = {
      body: `━━━━━━━━━━━━━━━━━━\n🎬 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${video.time}\n━━━━━━━━━━━━━━━━━━\n\n✅ Your video is ready. Enjoy!`,
      attachment: fs.createReadStream(filePath)
    };

    await api.sendMessage(finalMessage, event.threadID, async () => {
      await fs.unlink(filePath); // delete after sent
    }, event.messageID);

    if (loadingMsgID) await api.unsendMessage(loadingMsgID);

  } catch (err) {
    console.error("Video command error:", err.message || err);

    if (loadingMsgID) {
      try { await api.unsendMessage(loadingMsgID); } catch (e) {}
    }

    api.sendMessage("❌ Couldn't fetch video. Try another name or try again later!", event.threadID, event.messageID);
  }
};