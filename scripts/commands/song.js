const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

// GitHub থেকে API JSON load করা
async function getAPI() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json");
    return res.data; // JSON object
  } catch (err) {
    console.error("❌ Failed to fetch API JSON:", err.message);
    return null;
  }
}

module.exports.config = {
  name: "song",
  version: "6.0.3",
  credits: "Joy",
  permission: 0,
  description: "Download song MP3",
  prefix: true,
  category: "media",
  usages: "song <song name / youtube link>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  if (!args.length) return api.sendMessage("⚠️ Song name or link dao.", event.threadID, event.messageID);

  // GitHub JSON থেকে API URL
  const apis = await getAPI();
  if (!apis || !apis.Yt) return api.sendMessage("❌ API JSON load korte parlam na.", event.threadID, event.messageID);

  let query = args.join(" ");
  let ytLink = query;

  try {
    // 🔎 যদি YouTube link na hoy → search
    if (!query.includes("youtu")) {
      const search = await yts(query);
      if (!search.videos.length) return api.sendMessage("❌ Song khuje pai nai.", event.threadID, event.messageID);
      ytLink = search.videos[0].url;
    }

    // ⏳ Loading message
    const loading = await api.sendMessage("⏳ Downloading song...", event.threadID);

    // 🔥 API Call using GitHub JSON Yt key
    const apiRes = await axios.get(`${apis.Yt}/joy/mp3?url=${encodeURIComponent(ytLink)}`);
    const data = apiRes.data?.data;
    const title = data?.title || "Unknown Song";
    const dl = data?.url || data?.downloadUrl || data?.link;

    if (!dl) {
      api.unsendMessage(loading.messageID);
      return api.sendMessage("❌ API download link pai nai.", event.threadID, event.messageID);
    }

    // ✅ Download MP3 temporary file
    const filePath = path.join(__dirname, `temp_${Date.now()}.mp3`);
    const response = await axios.get(dl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);

    // ❌ Remove loading message
    api.unsendMessage(loading.messageID);

    // ✅ Send MP3 file
    await api.sendMessage(
      {
        body: `🎵 Song: ${title}\n✅ MP3 Ready`,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      event.messageID
    );

    // 🔥 Delete temp file
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ MP3 Download Failed.", event.threadID, event.messageID);
  }
};