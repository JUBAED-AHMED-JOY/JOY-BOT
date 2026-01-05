const axios = require("axios");
const fs = require("fs");
const path = require("path");

const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

module.exports.config = {
 name: "rndm",
 version: "1.1.0",
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

 // Get random video info
 const res = await axios.get(
 `https://new-random-1.onrender.com/random?name=${encodeURIComponent(name)}`,
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

 // Temp file path
 const tempPath = path.join(__dirname, `rndm_${Date.now()}.mp4`);
 const writer = fs.createWriteStream(tempPath);

 // Download video (no HEAD request)
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

 // If video size > 25MB → send link only
 if (tooLarge) {
 if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
 return api.sendMessage(
 `🎬 ${video.name}\n📦 Size: >25MB\n🔗 ${videoUrl}`,
 event.threadID
 );
 }

 // Send video attachment
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
