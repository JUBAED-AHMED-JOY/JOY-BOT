module.exports.config = {
  name: "spam",
  version: "1.0",
  permssion: 2,
  credits: "Joy",
  description: "Spam message",
  category: "spam",
  usages: "[msg] [amount]",
  prefix: true,
  cooldowns: 5,
  dependencies: "",
};

module.exports.run = function ({ api, event, args }) {

  if (args.length < 2) {
    return api.sendMessage(
      `Usage: ${global.config.PREFIX}spam [msg] [amount]`,
      event.threadID,
      event.messageID
    );
  }

  const { threadID } = event;
  const msg = args[0];
  const count = parseInt(args[1]);

  if (isNaN(count) || count <= 0) {
    return api.sendMessage("Amount must be a valid number", threadID);
  }

  for (let i = 0; i < count; i++) {
    api.sendMessage(msg, threadID);
  }
};