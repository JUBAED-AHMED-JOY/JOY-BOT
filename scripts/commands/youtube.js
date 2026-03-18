const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("joy-video-downloader"); // আপনার প্যাকেজ রিকোয়ার করা হলো

module.exports.config = {
  name: "youtube",
  version: "10.0.0",
  credits: "Joy",
  permission: 0,
  description: "YouTube Audio/Video Downloader using joy-video-downloader",
  prefix: true,
  category: "media",
  usages: "youtube audio/video <name or link>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  // ইউজেস চেক
  if (args.length < 2) {
    return api.sendMessage("⚠️ ব্যবহারবিধি: .youtube audio <গানের নাম> অথবা .youtube video <ভিডিওর নাম>", threadID, messageID);
  }

  const type = args[0].toLowerCase(); // audio বা video
  const query = args.slice(1).join(" ");
  let ytLink = query;

  if (type !== "audio" && type !== "video") {
    return api.sendMessage("⚠️ প্রথম শব্দটি অবশ্যই 'audio' অথবা 'video' হতে হবে।", threadID, messageID);
  }

  try {
    // 🔎 ইউটিউব সার্চ লজিক
    if (!ytLink.includes("youtu")) {
      const search = await yts(query);
      if (!search || !search.videos.length) {
        return api.sendMessage("❌ ইউটিউবে কিছুই খুঁজে পাওয়া যায়নি।", threadID, messageID);
      }
      ytLink = search.videos[0].url;
    }

    // লোডিং রিঅ্যাকশন এবং মেসেজ
    api.setMessageReaction("⏳", messageID, (err) => {}, true);
    const loadingMsg = await api.sendMessage(`⏳ আপনার ${type} প্রসেসিং হচ্ছে, অপেক্ষা করুন...`, threadID);

    // ক্যাশ ডিরেক্টরি নিশ্চিত করা
    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    // ফাইলের এক্সটেনশন সেট করা
    const ext = type === "audio" ? "mp3" : "mp4";
    const filePath = path.join(cacheDir, `youtube_${Date.now()}.${ext}`);

    // আপনার প্যাকেজ ব্যবহার করে ডাউনলোড
    const data = await downloadVideo(ytLink, filePath);

    if (!data || !data.title) {
      api.unsendMessage(loadingMsg.messageID);
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      return api.sendMessage("❌ ডাউনলোড লিঙ্ক জেনারেট করা সম্ভব হয়নি।", threadID, messageID);
    }

    const { title, filePath: savedPath } = data;

    api.setMessageReaction("✅", messageID, (err) => {}, true);
    api.unsendMessage(loadingMsg.messageID);

    // ফাইল পাঠানো এবং ডিলিট করা
    return api.sendMessage(
      {
        body: `🎬 টাইটেল: ${title}\n✅ ${type.toUpperCase()} সম্পন্ন।`,
        attachment: fs.createReadStream(savedPath)
      },
      threadID,
      () => {
        if (fs.existsSync(savedPath)) fs.unlinkSync(savedPath);
      },
      messageID
    );

  } catch (error) {
    console.error(error);
    api.setMessageReaction("❌", messageID, (err) => {}, true);
    return api.sendMessage(`❌ এরর: ${error.message || "ডাউনলোড ব্যর্থ হয়েছে"}`, threadID, messageID);
  }
};
