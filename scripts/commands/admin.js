module.exports.config = {
  name: "admin2",
  version: "2.0.2",
  permission: 2, // এখন global permission irrelevant, ADMINBOT চেক হবে
  credits: "Joy",
  description: "Control bot admin list",
  prefix: false,
  category: "admin",
  usages: "admin2 [list/add/remove] [uid/@mention]",
  cooldowns: 5,
};

module.exports.languages = {
  vi: {
    listAdmin: 'Danh sách toàn bộ người điều hành bot:\n\n%1',
    notHavePermssion: 'Bạn không đủ quyền để dùng chức năng "%1"',
    addedNewAdmin: 'Đã thêm %1 admin:\n\n%2',
    removedAdmin: 'Đã gỡ %1 admin:\n\n%2',
    help: '📌 Cách dùng:\n.admin2 list\n.admin2 add <uid/@mention>\n.admin2 remove <uid/@mention>'
  },
  en: {
    listAdmin: 'Admin list:\n\n%1',
    notHavePermssion: 'You do not have permission to use "%1"',
    addedNewAdmin: 'Added %1 admin(s):\n\n%2',
    removedAdmin: 'Removed %1 admin(s):\n\n%2',
    help: '📌 Usage:\n.admin2 list\n.admin2 add <uid/@mention>\n.admin2 remove <uid/@mention>'
  }
};

module.exports.run = async function ({
  api, event, args, Users, getText
}) {
  const { threadID, messageID, mentions, senderID } = event;
  const content = args.slice(1);
  const mentionIDs = Object.keys(mentions);

  const { configPath } = global.client;
  const { writeFileSync } = global.nodemodule["fs-extra"];

  // Reload config
  delete require.cache[require.resolve(configPath)];
  let config = require(configPath);
  let ADMINBOT = config.ADMINBOT || [];

  // ✅ Make permission automatic based on ADMINBOT membership
  let permission = 0;
  if (ADMINBOT.includes(senderID)) permission = 2;

  // Show help
  if (!args[0] || args[0].toLowerCase() === "help") {
    return api.sendMessage(getText("help"), threadID, messageID);
  }

  switch (args[0].toLowerCase()) {

    /* ===== LIST ADMIN ===== */
    case "list":
    case "all":
    case "-a": {
      const msg = [];
      for (const id of ADMINBOT) {
        if (!isNaN(id)) {
          const name = await Users.getNameUser(id);
          msg.push(`Name: ${name}\nUID: ${id}`);
        }
      }
      return api.sendMessage(getText("listAdmin", msg.join("\n\n")), threadID, messageID);
    }

    /* ===== ADD ADMIN ===== */
    case "add": {
      if (!ADMINBOT.includes(senderID))
        return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);

      let added = [];

      if (mentionIDs.length > 0) {
        for (const id of mentionIDs) {
          if (!ADMINBOT.includes(id)) {
            ADMINBOT.push(id);
            added.push(`${id} - ${mentions[id]}`);
          }
        }
      } else if (content[0] && !isNaN(content[0])) {
        if (!ADMINBOT.includes(content[0])) {
          ADMINBOT.push(content[0]);
          const name = await Users.getNameUser(content[0]);
          added.push(`Name: ${name}\nUID: ${content[0]}`);
        }
      } else {
        return api.sendMessage(getText("help"), threadID, messageID);
      }

      config.ADMINBOT = ADMINBOT;
      writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

      return api.sendMessage(
        getText("addedNewAdmin", added.length, added.join("\n").replace(/@/g, "")),
        threadID,
        messageID
      );
    }

    /* ===== REMOVE ADMIN ===== */
    case "remove":
    case "rm":
    case "delete": {
      if (!ADMINBOT.includes(senderID))
        return api.sendMessage(getText("notHavePermssion", "remove"), threadID, messageID);

      let removed = [];

      if (mentionIDs.length > 0) {
        for (const id of mentionIDs) {
          const index = ADMINBOT.indexOf(id);
          if (index !== -1) {
            ADMINBOT.splice(index, 1);
            removed.push(`${id} - ${mentions[id]}`);
          }
        }
      } else if (content[0] && !isNaN(content[0])) {
        const index = ADMINBOT.indexOf(content[0]);
        if (index !== -1) {
          ADMINBOT.splice(index, 1);
          const name = await Users.getNameUser(content[0]);
          removed.push(`Name: ${name}\nUID: ${content[0]}`);
        }
      } else {
        return api.sendMessage(getText("help"), threadID, messageID);
      }

      config.ADMINBOT = ADMINBOT;
      writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

      return api.sendMessage(
        getText("removedAdmin", removed.length, removed.join("\n").replace(/@/g, "")),
        threadID,
        messageID
      );
    }

    default:
      return api.sendMessage(getText("help"), threadID, messageID);
  }
};