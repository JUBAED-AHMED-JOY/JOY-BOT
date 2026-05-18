module.exports.config = {
  name: "approve",
  version: "3.0.0",
  permission: 0,
  credits: "Joy",
  description: "approve thread using thread id + on/off system",
  prefix: false,
  category: "admin",
  premium: false,
  usages: "approve [on/off/list/box/remove] [threadid]",
  cooldowns: 5,
};

module.exports.languages = {
  "en": {
    "notHavePermssion": 'you have no permission to use "%1"',
    "addedNewAdmin": 'approved %1 box :\n\n%2',
    "removedAdmin": 'removed %1 box from approve list :\n\n%2'
  }
};

function isOwner(senderID) {
  const path = require("path");
  const fs = require("fs");
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../Joy.json"), "utf8")
    );
    const owners = [...(config.OWNER || []), ...(config.ADMINBOT || []), ...(config.OPERATOR || [])];
    return owners.map(String).includes(String(senderID));
  } catch {
    return false;
  }
}

module.exports.run = async function ({ api, event, args, Threads, Users, permssion, getText }) {
  const content = args.slice(1, args.length);
  const { threadID, messageID, mentions, senderID } = event;
  const { approvedListsPath } = global.client;
  const { APPROVED } = global.approved;
  const { writeFileSync } = global.nodemodule["fs-extra"];
  const mention = Object.keys(mentions);
  delete require.cache[require.resolve(approvedListsPath)];
  var config = require(approvedListsPath);

  switch (args[0]) {

    case "on": {
      if (!isOwner(senderID)) return api.sendMessage(getText("notHavePermssion", "on"), threadID, messageID);
      global.approved.status = true;
      if (config.STATUS !== undefined) {
        config.STATUS = true;
        writeFileSync(approvedListsPath, JSON.stringify(config, null, 2), "utf8");
      }
      return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   ✅ APPROVE SYSTEM   ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

🟢 Approve System চালু করা হয়েছে।

এখন থেকে শুধুমাত্র approved group/user বট ব্যবহার করতে পারবে।`, threadID, messageID);
    }

    case "off": {
      if (!isOwner(senderID)) return api.sendMessage(getText("notHavePermssion", "off"), threadID, messageID);
      global.approved.status = false;
      if (config.STATUS !== undefined) {
        config.STATUS = false;
        writeFileSync(approvedListsPath, JSON.stringify(config, null, 2), "utf8");
      }
      return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   ❌ APPROVE SYSTEM   ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

🔴 Approve System বন্ধ করা হয়েছে।

এখন সবাই বট ব্যবহার করতে পারবে।`, threadID, messageID);
    }

    case "status": {
      const status = global.approved.status ? "🟢 চালু (ON)" : "🔴 বন্ধ (OFF)";
      return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   ⚙️ APPROVE STATUS   ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

📌 বর্তমান অবস্থা : ${status}
👥 Approved সংখ্যা : ${APPROVED.length}`, threadID, messageID);
    }

    case "list":
    case "all":
    case "-a": {
      const listAdmin = APPROVED || config.APPROVED || [];
      var msg = [];

      for (const idAdmin of listAdmin) {
        if (parseInt(idAdmin)) {
          let boxname;
          try {
            const groupName = await global.data.threadInfo.get(idAdmin).threadName || "name does not exist";
            boxname = `📦 ${groupName}\n    ID: ${idAdmin}`;
          } catch (error) {
            const userName = await Users.getNameUser(idAdmin);
            boxname = `👤 ${userName}\n    ID: ${idAdmin}`;
          }
          msg.push(boxname);
        }
      }

      return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   📋 APPROVED LIST    ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

${msg.length > 0 ? msg.join("\n\n") : "❌ কোনো approved group/user নেই।"}`, threadID, messageID);
    }

    case "box": {
      if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "box"), threadID, messageID);

      if (mention.length != 0 && isNaN(content[0])) {
        var listAdd = [];
        for (const id of mention) {
          APPROVED.push(id);
          config.APPROVED.push(id);
          listAdd.push(`${event.mentions[id].replace(/\@/g, "")} (${id})`);
        }
        writeFileSync(approvedListsPath, JSON.stringify(config, null, 2), "utf8");
        return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n")), threadID, messageID);
      }
      else if (content.length != 0 && !isNaN(content[0])) {
        APPROVED.push(content[0]);
        config.APPROVED.push(content[0]);

        let boxname;
        try {
          const groupname = await global.data.threadInfo.get(content[0]).threadName || "name does not exist";
          boxname = `group name : ${groupname}\ngroup id : ${content[0]}`;
        } catch (error) {
          const username = await Users.getNameUser(content[0]);
          boxname = `user name : ${username}\nuser id : ${content[0]}`;
        }
        writeFileSync(approvedListsPath, JSON.stringify(config, null, 2), "utf8");
        return api.sendMessage("✅ এই box টি approved হয়েছে।", content[0], () => {
          return api.sendMessage(getText("addedNewAdmin", 1, boxname), threadID, messageID);
        });
      }
      else return global.utils.throwError(this.config.name, threadID, messageID);
    }

    case "remove":
    case "rm":
    case "delete": {
      if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);

      if (mention.length != 0 && isNaN(content[0])) {
        var listAdd = [];
        for (const id of mention) {
          const index = config.APPROVED.findIndex(item => item == id);
          APPROVED.splice(index, 1);
          config.APPROVED.splice(index, 1);
          listAdd.push(`${event.mentions[id].replace(/\@/g, "")} (${id})`);
        }
        writeFileSync(approvedListsPath, JSON.stringify(config, null, 2), "utf8");
        return api.sendMessage(getText("removedAdmin", mention.length, listAdd.join("\n")), threadID, messageID);
      }
      else if (content.length != 0 && !isNaN(content[0])) {
        const index = config.APPROVED.findIndex(item => item.toString() == content[0]);
        APPROVED.splice(index, 1);
        config.APPROVED.splice(index, 1);

        let boxname;
        try {
          const groupname = await global.data.threadInfo.get(content[0]).threadName || "name does not exist";
          boxname = `group name : ${groupname}\ngroup id : ${content[0]}`;
        } catch (error) {
          const username = await Users.getNameUser(content[0]);
          boxname = `user name : ${username}\nuser id : ${content[0]}`;
        }
        writeFileSync(approvedListsPath, JSON.stringify(config, null, 2), "utf8");
        return api.sendMessage("❌ এই box টি approved list থেকে সরানো হয়েছে।", content[0], () => {
          return api.sendMessage(getText("removedAdmin", 1, boxname), threadID, messageID);
        });
      }
      else global.utils.throwError(this.config.name, threadID, messageID);
    }

    default: {
      return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   📖 APPROVE HELP     ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

approve on       → approve system চালু
approve off      → approve system বন্ধ
approve status   → বর্তমান অবস্থা দেখো
approve list     → সব approved দেখো
approve box [id] → group/user approve করো
approve remove [id] → approve সরাও`, threadID, messageID);
    }
  }
};
