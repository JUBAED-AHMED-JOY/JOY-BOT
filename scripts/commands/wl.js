const moment = require("moment-timezone");
const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "wl",
  version: "2.3.0",
  credits: "Joy",
  permission: 2,
  description: "Whitelist mode: on = only permitted UIDs get response, off = all users get response",
  category: "system",
  usages: "[on/off] [ID]",
  prefix: true,
  premium: false,
  cooldown: 5,
  dependencies: {
    "moment-timezone": ""
  }
};

function getPermittedUIDs() {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../Joy.json"), "utf8")
    );
    return [...new Set([
      ...(config.OWNER || []),
      ...(config.ADMINBOT || []),
      ...(config.OPERATOR || [])
    ])];
  } catch {
    return [];
  }
}

if (!global.Joy_wlThreads) global.Joy_wlThreads = new Set();

module.exports.run = async ({ event, api, args, Threads }) => {
  const { threadID, messageID, senderID } = event;

  const permittedUIDs = getPermittedUIDs();

  if (!permittedUIDs.includes(String(senderID))) {
    return api.sendMessage(
      "╭╼|━━━━━━━━━━━━━━|╾╮\n⛔ তোমার এই command ব্যবহারের permission নেই!\n╰╼|━━━━━━━━━━━━━━|╾╯",
      threadID,
      messageID
    );
  }

  let targetID = String(args[1]);
  if (!targetID || isNaN(targetID)) targetID = String(threadID);

  const time = moment.tz("Asia/Dhaka").format("HH:mm:ss L");

  switch (args[0]) {
    case "on": {
      if (!global.data.allThreadID.includes(targetID))
        return api.sendMessage(`[⚠️] ID টি database এ নেই।`, threadID, messageID);

      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.whitelist = true;
        data.whitelistDate = time;
        await Threads.setData(targetID, { data });
        global.Joy_wlThreads.add(targetID);

        return api.sendMessage(
          `╭╼|━━━━━━━━━━━━━━|╾╮\n✅ [Whitelist ON]\nGroup: ${targetID}\nএখন শুধু Owner/AdminBot/Operator রা response পাবে।\n🕐 ${time}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
          threadID,
          messageID
        );
      } catch {
        return api.sendMessage(`[❌ Error] Thread ID ${targetID} এর জন্য কাজ করা যাচ্ছে না।`, threadID, messageID);
      }
    }

    case "off": {
      if (!global.data.allThreadID.includes(targetID))
        return api.sendMessage(`[⚠️] ID টি database এ নেই।`, threadID, messageID);

      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.whitelist = false;
        data.whitelistDate = null;
        await Threads.setData(targetID, { data });
        global.Joy_wlThreads.delete(targetID);

        return api.sendMessage(
          `╭╼|━━━━━━━━━━━━━━|╾╮\n✅ [Whitelist OFF]\nGroup: ${targetID}\nএখন সবাই response পাবে।\n🕐 ${time}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
          threadID,
          messageID
        );
      } catch {
        return api.sendMessage(`[❌ Error] Thread ID ${targetID} এর জন্য কাজ করা যাচ্ছে না।`, threadID, messageID);
      }
    }

    default:
      return api.sendMessage(
        `⚙️ Usage:\n- wl on [ID] → শুধু permitted UIDs response পাবে\n- wl off [ID] → সবাই response পাবে`,
        threadID,
        messageID
      );
  }
};
