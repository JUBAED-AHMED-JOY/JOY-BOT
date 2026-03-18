const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { downloadVideo } = require("joy-video-downloader"); 

module.exports.config = {
  name: "song",
  version: "9.0.0",
  credits: "Joy",
  permission: 0,
  description: "Download MP3 using joy-video-downloader",
  prefix: true,
  category: "media",
  usages: "song <song name / youtube link>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  if (!args.length) return api.sendMessage("⚠️ গানের নাম অথবা ইউটিউব লিঙ্ক দাও।", threadID, messageID);

  let query = args.join(" ");
  let ytLink = query;

  try {
    // ইউটিউব সার্চ লজিক
    if (!ytLink.includes("youtu")) {
      const search = await yts(query);
      if (!search || !search.videos.length) return api.sendMessage("❌ গানটি খুঁজে পাওয়া যায়নি।", threadID, messageID);
      ytLink = search.videos[0].url;
    }

    // লোডিং রিঅ্যাকশন বা মেসেজ
    api.setMessageReaction("⏳", messageID, (err) => {}, true);
    const loadingMsg = await api.sendMessage("⏳ গানটি প্রসেসিং হচ্ছে...", threadID);

    // ফাইল পাথ সেট করা
    const cacheDir = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    
    // অডিওর জন্য .mp3 এক্সটেনশন ব্যবহার করা ভালো
    const filePath = path.join(cacheDir, `song_${Date.now()}.mp3`);

    // auto কমান্ডের মতো downloadVideo মেথড ব্যবহার
    const data = await downloadVideo(ytLink, filePath);

    if (!data || !data.title) {
      api.unsendMessage(loadingMsg.messageID);
      api.setMessageReaction("❌", messageID, (err) => {}, true);
      return api.sendMessage("❌ গানটি ডাউনলোড করা সম্ভব হয়নি!", threadID, messageID);
    }

    const { title, filePath: savedPath } = data;

    api.setMessageReaction("✅", messageID, (err) => {}, true);
    api.unsendMessage(loadingMsg.messageID);

    // গান পাঠানো এবং পাঠানোর পর ফাইল ডিলিট করা
    return api.sendMessage(
      {
        body: `🎵 গান: ${title}\n✅ ডাউনলোড সম্পন্ন।`,
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
    return api.sendMessage("❌ ডাউনলোড করার সময় কোনো সমস্যা হয়েছে!", threadID, messageID);
  }
};
