const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "userban",
  version: "1.0.0",
  permission: 2,
  credits: "Joy",
  description: "Group এ user ban করো — ban করা user এর message auto unsend হবে",
  category: "moderation",
  prefix: true,
  cooldowns: 3,
  usages: "userban [add/remove/list] [mention/reply/uid]"
};

if (!global.Joy_userBans) global.Joy_userBans = new Map();

function getPermittedUIDs() {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../Joy.json"), "utf8")
    );
    return [...new Set([
      ...(config.OWNER || []),
      ...(config.ADMINBOT || []),
      ...(config.OPERATOR || [])
    ])].map(String);
  } catch { return []; }
}

module.exports.run = async function ({ api, event, args, Threads, Users }) {
  const { threadID, messageID, mentions, senderID } = event;
  const sub = (args[0] || "").toLowerCase();

  if (!global.Joy_userBans.has(threadID)) {
    global.Joy_userBans.set(threadID, new Set());
    try {
      const data = (await Threads.getData(threadID)).data || {};
      if (Array.isArray(data.userBans)) {
        for (const uid of data.userBans) global.Joy_userBans.get(threadID).add(String(uid));
      }
    } catch {}
  }

  const banSet = global.Joy_userBans.get(threadID);

  async function saveToDB() {
    try {
      const data = (await Threads.getData(threadID)).data || {};
      data.userBans = [...banSet];
      await Threads.setData(threadID, { data });
    } catch {}
  }

  if (sub === "add" || sub === "ban") {
    let targetUID = null;
    let targetName = "Unknown";

    if (event.type === "message_reply") {
      targetUID = String(event.messageReply.senderID);
    } else if (Object.keys(mentions).length > 0) {
      targetUID = String(Object.keys(mentions)[0]);
    } else if (args[1] && !isNaN(args[1])) {
      targetUID = String(args[1]);
    }

    if (!targetUID) return api.sendMessage("❌ কাকে ban করবে? Mention করো বা reply দাও অথবা UID দাও।", threadID, messageID);

    const permitted = getPermittedUIDs();
    if (permitted.includes(targetUID)) return api.sendMessage("❌ Admin/Owner কে ban করা যাবে না।", threadID, messageID);
    if (targetUID === String(senderID)) return api.sendMessage("❌ নিজেকে ban করতে পারবে না।", threadID, messageID);

    try { targetName = await Users.getNameUser(targetUID); } catch {}

    banSet.add(targetUID);
    await saveToDB();

    return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   🔨 USER BANNED      ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

👤 নাম  : ${targetName}
🆔 UID  : ${targetUID}

⚠️ এই user এর সব message এখন থেকে auto unsend হবে।`, threadID, messageID);
  }

  if (sub === "remove" || sub === "unban") {
    let targetUID = null;
    let targetName = "Unknown";

    if (event.type === "message_reply") {
      targetUID = String(event.messageReply.senderID);
    } else if (Object.keys(mentions).length > 0) {
      targetUID = String(Object.keys(mentions)[0]);
    } else if (args[1] && !isNaN(args[1])) {
      targetUID = String(args[1]);
    }

    if (!targetUID) return api.sendMessage("❌ কাকে unban করবে? Mention করো বা reply দাও অথবা UID দাও।", threadID, messageID);
    if (!banSet.has(targetUID)) return api.sendMessage("❌ এই user ban তালিকায় নেই।", threadID, messageID);

    try { targetName = await Users.getNameUser(targetUID); } catch {}

    banSet.delete(targetUID);
    await saveToDB();

    return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   ✅ USER UNBANNED    ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

👤 নাম  : ${targetName}
🆔 UID  : ${targetUID}

✅ এই user এখন আবার message করতে পারবে।`, threadID, messageID);
  }

  if (sub === "list" || sub === "all") {
    if (banSet.size === 0) return api.sendMessage("📋 এই group এ কোনো banned user নেই।", threadID, messageID);

    const lines = [];
    for (const uid of banSet) {
      let name = uid;
      try { name = await Users.getNameUser(uid); } catch {}
      lines.push(`👤 ${name} (${uid})`);
    }

    return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   📋 BANNED USERS     ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

${lines.join("\n")}

মোট : ${banSet.size} জন`, threadID, messageID);
  }

  return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   📖 USERBAN HELP     ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

.userban add @mention    → user ban করো
.userban add [reply]     → reply করে ban
.userban add [UID]       → UID দিয়ে ban
.userban remove @mention → ban তুলে নাও
.userban list            → সব banned user দেখো`, threadID, messageID);
};
