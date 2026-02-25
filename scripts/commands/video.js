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
  name: "video",
  version: "2.0.0",
  credits: "Joy",
  permission: 0,
  description: "Download YouTube Video",
  prefix: true,
  category: "media",
  usages: "video <name / youtube link>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {

  if (!args.length)
    return api.sendMessage("⚠️ Video name or link dao.", event.threadID, event.messageID);

  const apis = await getAPI();
  if (!apis || !apis.Yt)
    return api.sendMessage("❌ API load korte parlam na.", event.threadID, event.messageID);

  let query = args.join(" ");
  let ytLink = query;

  try {

    // 🔎 Search if not link
    if (!query.includes("youtu")) {
      const search = await yts(query);
      if (!search.videos.length)
        return api.sendMessage("❌ Video khuje pai nai.", event.threadID, event.messageID);

      ytLink = search.videos[0].url;
    }

    const loading = await api.sendMessage("⏳ Downloading video...", event.threadID);

    // 🔥 IMPORTANT: তোমার API যদি mp4 endpoint আলাদা হয় সেটা ঠিক করো
    const apiURL = `${apis.Yt}/joy/mp4?url=${encodeURIComponent(ytLink)}`;

    const apiRes = await axios.get(apiURL);
    console.log("API Response:", apiRes.data);

    const data = apiRes.data?.data || apiRes.data;
    const title = data?.title || "YouTube Video";
    const dl = data?.url || data?.downloadUrl || data?.link;

    if (!dl) {
      api.unsendMessage(loading.messageID);
      return api.sendMessage("❌ Video download link pai nai.", event.threadID, event.messageID);
    }

    // 📦 Temp file path
    const filePath = path.join(__dirname, `video_${Date.now()}.mp4`);

    const videoBuffer = await axios.get(dl, { responseType: "arraybuffer" });

    fs.writeFileSync(filePath, videoBuffer.data);

    api.unsendMessage(loading.messageID);

    await api.sendMessage({
      body: `🎬 ${title}\n✅ Video Ready`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, event.messageID);

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Video Error:", err.message);
    return api.sendMessage("❌ MP4 Download Failed.", event.threadID, event.messageID);
  }
};