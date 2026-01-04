const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

module.exports.config = {
 name: "rr",
 version: "5.0.0",
 credits: "gok",
 permission: 1,
 description: "Send random video (auto size detect)",
 category: "media",
 usages: "/rndm <name>",
 prefix: true
};

module.exports.run = async function ({ api, event, args }) {
 try {
 if (!args[0]) {
 return api.sendMessage("❌ Usage: /rndm <name>", event.threadID);
 }

 const name = args[0].toLowerCase();

 // 1️⃣ Get random video from API
 const apiRes = await axios.get(
 `https://rndm-joy-api.onrender.com/random?name=${encodeURIComponent(name)}`,
 { timeout: 60000 }
 );

 if (!apiRes.data.success) {
 return api.sendMessage("❌ No video found", event.threadID);
 }

 const video = apiRes.data.data;
 const url = video.url;

 // 2️⃣ Check video size (HEAD request)
 const head = await axios.head(url, { timeout: 30000 });
 const size = parseInt(head.headers["content-length"] || "0");

 // 3️⃣ If video is too large → send link
 if (!size || size > MAX_SIZE) {
 return api.sendMessage(
 `🎬 ${video.name}\n📦 Size: ${(size / 1024 / 1024).toFixed(1)} MB\n🔗 ${url}`,
 event.threadID
 );
 }

 // 4️⃣ Download small video
 const tempPath = path.join(__dirname, `rndm_${Date.now()}.mp4`);
 const file = fs.createWriteStream(tempPath);

 await new Promise((resolve, reject) => {
 https.get(url, (res) => {
 res.pipe(file);
 file.on("finish", () => file.close(resolve));
 }).on("error", reject);
 });

 // 5️⃣ Send as attachment
 api.sendMessage(
 {
 body: `🎬 ${video.name}`,
 attachment: fs.createReadStream(tempPath)
 },
 event.threadID,
 () => fs.unlinkSync(tempPath)
 );

 } catch (err) {
 api.sendMessage(`❌ Error:\n${err.message}`, event.threadID);
 }
};