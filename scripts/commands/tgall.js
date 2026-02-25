module.exports.config = {
  name: "all",
  version: "1.0.0",
  permission: 0,
  credits: "Joy Ahmed",
  description: "সবার নাম ট্যাগ সহ মেসেজ পাঠাবে",
  prefix: true,
  category: "group",
  usages: "tag [your message]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const all = await api.getThreadInfo(event.threadID);
  const mention = [];
  const nameArray = [];

  for (const user of all.participantIDs) {
    if (user !== api.getCurrentUserID()) {
      const userInfo = all.userInfo.find(u => u.id === user);
      const name = userInfo ? userInfo.name : "Member";
      mention.push({ tag: name, id: user });
      nameArray.push(name);
    }
  }

  const message = args.join(" ") || "JOY AHMED";

  return api.sendMessage({
    body: message,
    mentions: mention
  }, event.threadID, event.messageID);
};
