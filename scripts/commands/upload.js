const axios = require("axios");
const FormData = require("form-data");

module.exports.config = {
  name: "upload",
  version: "1.0.1",
  credits: "Joy",
  permission: 0,
  description: "ছবি বা ভিডিও আপলোড করে শর্ট লিংক তৈরি করার কমান্ড",
  category: "utility",
  usages: "[ছবি বা ভিডিওতে রিপ্লাই দিয়ে কমান্ড লিখুন]",
  prefix: true,
  premium: false,
  cooldown: 5,
  dependencies: {
    "axios": "",
    "form-data": ""
  }
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, type, messageReply } = event;

  // ১. ইউজার রিপ্লাই দিয়েছে কিনা চেক করা
  if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
    return api.sendMessage("⚠️ অনুগ্রহ করে কোনো ছবি বা ভিডিওতে রিপ্লাই দিয়ে কমান্ডটি ব্যবহার করুন!", threadID, messageID);
  }

  const attachment = messageReply.attachments[0];

  // ২. ফাইল টাইপ ফটো বা ভিডিও কিনা তা চেক
  if (attachment.type !== "photo" && attachment.type !== "video") {
    return api.sendMessage("❌ কেবল মাত্র ছবি (Photo) অথবা ভিডিও (Video) আপলোড করা যাবে!", threadID, messageID);
  }

  const waitingMsg = await api.sendMessage("⏳ আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", threadID);

  try {
    const fileUrl = attachment.url;
    const extension = attachment.type === "video" ? "mp4" : "jpg";

    // ৩. ফাইল বাফার হিসেবে ডাউনলোড করা (Redirect Safe)
    const fileResponse = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const fileBuffer = Buffer.from(fileResponse.data);

    // ৪. FormData তৈরি
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: `media.${extension}`,
      contentType: attachment.type === "video" ? "video/mp4" : "image/jpeg"
    });

    // ৫. API তে পাঠানো (/api/upload এন্ডপয়েন্ট ফিক্সড)
    const response = await axios.post("https://joy-upload-api.vercel.app/api/upload", formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    // ৬. রেসপন্স হ্যান্ডলিং
    if (response.data && (response.data.status || response.data.link || response.data.url)) {
      const generatedLink = response.data.link || response.data.url;

      if (waitingMsg && waitingMsg.messageID) {
        api.unsendMessage(waitingMsg.messageID).catch(() => {});
      }

      return api.sendMessage(
        `✅ *ফাইল সফলভাবে আপলোড হয়েছে!*\n\n🔗 *ভিউ লিংক:* ${generatedLink}`,
        threadID,
        messageID
      );
    } else {
      throw new Error((response.data && response.data.error) || "আপলোড প্রসেস ব্যর্থ হয়েছে।");
    }

  } catch (error) {
    if (waitingMsg && waitingMsg.messageID) {
      api.unsendMessage(waitingMsg.messageID).catch(() => {});
    }
    const errorMsg = error.response && error.response.data && error.response.data.error 
      ? error.response.data.error 
      : error.message;

    return api.sendMessage(`❌ এরর: ${errorMsg}`, threadID, messageID);
  }
};
