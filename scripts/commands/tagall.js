module.exports.config = {
  name: "tagall",
  version: "1.1.0",
  permission: 2, // 0 = everyone can use, 2 = only admin
  prefix: true,
  credits: "Joy Ahmed",
  description: "Tag everyone one by one in separate messages",
  category: "tools",
  usages: "tagall [optional message]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const threadID = event.threadID;
    const msg = args.length > 0 ? args.join(" ") : "📢 Attention!";

    api.getThreadInfo(threadID, async (err, info) => {
      if (err) return api.sendMessage("❌ Could not get thread info.", threadID);

      // group-er sobai ke niye mention pathano
      for (const user of info.userInfo) {
        // Sender ke chaile skip korte paren
        if (user.id === event.senderID) continue;

        const bodyText = `${msg}\n@${user.name}`;
        const mentions = [{ id: user.id, tag: user.name }];

        // ekek kore message pathano
        await new Promise((resolve) => {
          api.sendMessage({ body: bodyText, mentions }, threadID, () => resolve());
        });

        // little delay diye flood banano bondho korte
        await new Promise((r) => setTimeout(r, 1500));
      }
    });
  } catch (e) {
    console.error(e);
    api.sendMessage("Unexpected error occurred.", event.threadID);
  }
};
