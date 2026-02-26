const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

async function getAPI() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json");
    return res.data;
  } catch (err) {
    console.error("API JSON Error:", err.message);
    return null;
  }
}

module.exports.config = {
  name: "youtube",
  version: "9.0.0",
  credits: "Joy",
  permission: 0,
  description: "YouTube Audio / Video Downloader",
  prefix: true,
  category: "media",
  usages: ".youtube audio/video <name or link>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {

  if (args.length < 2)
    return api.sendMessage("⚠️ Use: .youtube audio/video song name", event.threadID, event.messageID);

  const apis = await getAPI();
  if (!apis || !apis.Yt)
    return api.sendMessage("❌ API load fail.", event.threadID, event.messageID);

  const type = args[0].toLowerCase(); // audio or video
  args.shift();

  if (type !== "audio" && type !== "video")
    return api.sendMessage("⚠️ First word must be audio or video.", event.threadID, event.messageID);

  let query = args.join(" ");
  let ytLink = query;

  try {

    // 🔎 Search if not link
    if (!query.includes("youtu")) {
      const search = await yts(query);
      if (!search.videos.length)
        return api.sendMessage("❌ Song not found.", event.threadID, event.messageID);

      ytLink = search.videos[0].url;
    }

    const loading = await api.sendMessage("⏳ Downloading...", event.threadID);

    const endpoint = type === "audio" ? "mp3" : "mp4";

    const apiRes = await axios.get(
      `${apis.Yt}/joy/${endpoint}?url=${encodeURIComponent(ytLink)}`
    );

    const data = apiRes.data?.data;
    const title = data?.title || "Unknown Title";
    const dl = data?.url || data?.downloadUrl;

    if (!dl) {
      api.unsendMessage(loading.messageID);
      return api.sendMessage("❌ Download link not found.", event.threadID, event.messageID);
    }

    const ext = type === "audio" ? "mp3" : "mp4";
    const filePath = path.join(__dirname, `temp_${Date.now()}.${ext}`);

    const file = await axios.get(dl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, file.data);

    api.unsendMessage(loading.messageID);

    await api.sendMessage(
      {
        body: `🎬 Title: ${title}\n✅ ${type.toUpperCase()} Ready`,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      event.messageID
    );

    setTimeout(() => fs.unlinkSync(filePath), 10000);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Download Failed.", event.threadID, event.messageID);
  }
};
