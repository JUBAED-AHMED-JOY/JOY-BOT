module.exports.config = {
  name: "sendnoti",
  version: "1.1.0",
  hasPermssion: 2,
  credits: "Yan Maglinte", //modifying by jonell Magallanes
  description: "Sends a message to all groups and can only be done by the admin.",
  prefix: true,
  category: "message",
  usages: "[Text]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const threadList = await api.getThreadList(25, null, ['INBOX']);
  let sentCount = 0;
  let notSentCount = 0;
  const custom = args.join(' ');

  if (!custom) {
      return api.sendMessage("Please provide a notification message.", event.threadID);
  }
   const haha = await api.sendMessage("Sending......", event.threadID, event.messageID);
  const senderID = event.senderID;
  const senderProfile = await api.getUserInfo(senderID);
  const senderName = senderProfile[senderID].name;

  async function sendMessage(thread) {
      try {
          await api.sendMessage(
              `𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻 𝗳𝗿𝗼𝗺 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 𝗕𝗼𝘁\n━━━━━━━━━━━━━━━━━━\n${custom}\n\nDeveloper: ${senderName}`,
              thread.threadID
          );
          sentCount++;
      } catch (error) {
          console.error("Error sending a message:", error);
          notSentCount++;
      }
  }

  for (const thread of threadList) {
      if (sentCount >= 20) {
          break;
      }
      if (thread.isGroup && thread.name != thread.threadID && thread.threadID != event.threadID) {
          await sendMessage(thread);
      }
  }

  let summaryMessage = `› Sent the notification successfully to ${sentCount} Threads\n`;
  if (notSentCount > 0) {
      summaryMessage += `› Failed to send to ${notSentCount} Threads`;
  }

  api.editMessage(summaryMessage, haha.messageID, event.threadID, event.messageID);
};
