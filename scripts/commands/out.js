module.exports.config = {
  name: "out",
  version: "1.0.0",
  permission: 2, // Only admin-level users
  prefix: true,
  credits: "Joy",
  description: "Bot leave the group",
  category: "system",
  usages: ".out",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  // Optional confirmation message
  api.sendMessage("👋 Bidding farewell... Joy Bot is leaving this group!", threadID, () => {
    api.removeUserFromGroup(api.getCurrentUserID(), threadID); // Remove bot
  });
};
