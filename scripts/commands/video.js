const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("joy-video-downloader");

module.exports.config = {
  name: "video",
  version: "1.0.0",
  credits: "Joy",
  permission: 0,
  description: "Download Video from YouTube or Search",
  prefix: true,
  category: "media",
  usages: "video <video name / link>",
  cooldowns: 10
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  if (!args.length) return api.sendMessage("⚠️ ভিডিওর নাম অথবা লিঙ্ক দিন।", threadID, messageID);

  let query = args.join(" ");
  let videoLink = query;

  try {
    // ইউটিউব সার্চ লজিক
    if (!videoLink.includes("youtu")) {
      const search = await yts(query);
      if (!search || !search.videos.length) return api.sendMessage("❌ ভিডিওটি খুঁজে পাওয়া যায়নি।", threadID, messageID);
      videoLink = search.videos[0].url;
    }

    // লোডিং রিঅ্যাকশন এবং মেসেজ
    api.setMessageReaction("⏳", messageID, (err) => {}, true);
    const loadingMsg = await api.sendMessage("⏳ ভিডিওটি প্রসেসিং হচ্ছে, দয়া করে অপেক্ষা করুন...", threadID);

    // ক্যাশ ফোল্ডার নিশ্চিত করা
    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    // ভিডিও ফাইল পাথ (.mp4)
    const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

    // downloadVideo মেথড ব্যবহার করে ডাউনলোড
    const data = await downloadVideo(videoLink, filePath);

    if (!data || !data.title) {
      api.unsendMessage(loadingMsg.messageID);
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      return api.sendMessage("❌ ভিডিওটি ডাউনলোড করা সম্ভব হয়নি!", threadID, messageID);
    }

    const { title, filePath: savedPath } = data;

    api.setMessageReaction("✅", messageID, (err) => {}, true);
    api.unsendMessage(loadingMsg.messageID);

    // ভিডিও পাঠানো এবং পাঠানোর পর ফাইল ডিলিট করা
    return api.sendMessage(
      {
        body: `🎬 ভিডিও: ${title}\n✅ ডাউনলোড সম্পন্ন।`,
        attachment: fs.createReadStream(savedPath),
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
    return api.sendMessage("❌ ভিডিও ডাউনলোড করার সময় কোনো সমস্যা হয়েছে!", threadID, messageID);
  }
};
