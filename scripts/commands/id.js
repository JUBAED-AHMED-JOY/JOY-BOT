module.exports.config = {
  name: "tag",
  version: "1.1.0",
  permission: 0,
  credits: "Joy Ahmed",
  description: "Reply দিলে বা UID দিলে কাউকে ট্যাগ করবে",
  prefix: true,
  category: "utility",
  usages: "mentionid [uid] [optional message]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  let uid, name, message;

  // যদি reply করা হয়
  if (event.type === "message_reply") {
    uid = event.messageReply.senderID;
    const userInfo = await api.getUserInfo(uid);
    name = userInfo[uid]?.name || "ব্যবহারকারী";
    message = args.join(" ") || "JOY AHMED";
  }
  // না হলে args দিয়ে UID
  else {
    uid = args[0];
    if (!uid || isNaN(uid)) {
      return api.sendMessage("❌ অনুগ্রহ করে একটি বৈধ UID দিন বা কারো মেসেজে reply দিন।", event.threadID, event.messageID);
    }
    const userInfo = await api.getUserInfo(uid);
    name = userInfo[uid]?.name || "ব্যবহারকারী";
    message = args.slice(1).join(" ") || "তোমাকে মেনশন করা হয়েছে!";
  }

  // মেনশন মেসেজ সেন্ড
  return api.sendMessage({
    body: message,
    mentions: [{ tag: name, id: uid }]
  }, event.threadID, event.messageID);
};
