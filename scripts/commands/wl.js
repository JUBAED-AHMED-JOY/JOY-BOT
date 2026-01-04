const moment = require("moment-timezone");

module.exports.config = {
  name: "wl",
  version: "2.0.0",
  credits: "Joy",
  permission: 2, // admin only
  description: "Turn group on or off instantly (no reaction needed)",
  category: "system",
  usages: "[on/off] [ID] [reason]",
  prefix: true,
  premium: false,
  cooldown: 5,
  dependencies: {
    "moment-timezone": ""
  }
};

module.exports.run = async ({ event, api, args, Threads }) => {
  const { threadID, messageID } = event;
  let targetID = String(args[1]);
  let reason = args.slice(2).join(" ") || null;

  // যদি কোনো ID না দেয়, তাহলে current thread এ কাজ করবে
  if (!targetID || isNaN(targetID)) {
    targetID = String(event.threadID);
    reason = args.slice(1).join(" ") || null;
  }

  const time = moment.tz("Asia/Dhaka").format("HH:mm:ss L");

  switch (args[0]) {
    case "off": {
      if (!global.data.allThreadID.includes(targetID))
        return api.sendMessage(`[⚠️ Thread OFF] The ID you entered doesn't exist in the database.`, threadID, messageID);

      if (global.data.threadBanned.has(targetID))
        return api.sendMessage(`⚠️ Group is already turned off`, threadID, messageID);

      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.banned = true;
        data.reason = reason || null;
        data.dateAdded = time;
        await Threads.setData(targetID, { data });
        global.data.threadBanned.set(targetID, { reason: data.reason, dateAdded: data.dateAdded });

        return api.sendMessage(`[✅ Wl OFF]\nSuccessfully turned off group`, threadID, messageID);
      } catch {
        return api.sendMessage(`[❌ Error] Can't process your request for thread ID ${targetID}`, threadID, messageID);
      }
    }

    case "on": {
      if (!global.data.allThreadID.includes(targetID))
        return api.sendMessage(`[⚠️ Thread ON] The ID you entered doesn't exist in the database.`, threadID, messageID);

      if (!global.data.threadBanned.has(targetID))
        return api.sendMessage(`⚠️ The group ${targetID} is already active!`, threadID, messageID);

      try {
        let data = (await Threads.getData(targetID)).data || {};
        data.banned = false;
        data.reason = null;
        data.dateAdded = null;
        await Threads.setData(targetID, { data });
        global.data.threadBanned.delete(targetID);

        return api.sendMessage(`[✅ Wl ON]\nSuccessfully turned on group`, threadID, messageID);
      } catch {
        return api.sendMessage(`[❌ Error] Can't process your request for thread ID ${targetID}`, threadID, messageID);
      }
    }

    default:
      return api.sendMessage(`⚙️ Usage:\n- wl on [ID]\n- wl off [ID] [reason]`, threadID, messageID);
  }
};
