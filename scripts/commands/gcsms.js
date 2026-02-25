module.exports.config = {
  name: "gcsms",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "Joy", 
  description: "Sends a message to all groups and can only be done by the admin.",
  prefix: true,
  category: "message",
  usages: "[Text]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  if (args.length < 2) {
    return api.sendMessage(
      "Usage: groupsms <threadID> <message>\nExample: groupsms 1234567890123456 Hello group!",
      event.threadID
    );
  }

  const targetThreadID = args[0];
  const message = args.slice(1).join(" ");

  try {
    await api.sendMessage(message, targetThreadID);
    return api.sendMessage(`✅ Message sent successfully to threadID: ${targetThreadID}`, event.threadID);
  } catch (error) {
    return api.sendMessage(`❌ Failed to send message: ${error.message}`, event.threadID);
  }
};
