const TARGET_THREAD_ID = "3000384260149757";

module.exports.config = {
  name: "resend",
  version: "2.5.0",
  permssion: 2,
  credits: "Joy",
  description: "Resend unsent messages with group name, date & time",
  prefix: true,
  premium: false,
  category: "system",
  usages: "/resend on | off",
  cooldowns: 0,
  dependencies: {
    "request": "",
    "fs-extra": ""
  }
};

// GLOBAL STATUS (default ON)
if (global.resendStatus === undefined) {
  global.resendStatus = true;
}

module.exports.handleEvent = async function ({ event, api, Users, Threads }) {
  const request = global.nodemodule["request"];
  const fs = global.nodemodule["fs-extra"];

  const { messageID, senderID, body, attachments, type, threadID } = event;

  if (!global.logMessage) global.logMessage = new Map();
  if (!global.data.botID) global.data.botID = api.getCurrentUserID();
  if (senderID == global.data.botID) return;

  // 🔴 CHECK GLOBAL RESEND STATUS
  if (!global.resendStatus) return;

  // SAVE NORMAL MESSAGE
  if (type !== "message_unsend") {
    global.logMessage.set(messageID, {
      body: body || "",
      attachments: attachments || []
    });
    return;
  }

  // GET OLD MESSAGE
  const oldMsg = global.logMessage.get(messageID);
  if (!oldMsg) return;

  // USER NAME
  const userName = await Users.getNameUser(senderID);

  // GROUP NAME
  const threadInfo = await Threads.getInfo(threadID);
  const threadName = threadInfo.threadName || "Unknown Group";

  // TIME & DATE (Asia/Dhaka) - English + AM/PM
  const now = new Date();

  const time = now.toLocaleTimeString("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const date = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Dhaka",
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });

  // TEXT ONLY
  if (!oldMsg.attachments || oldMsg.attachments.length === 0) {
    return api.sendMessage(
      `🚨 UNSENT MESSAGE
👥 Group: ${threadName}
👤 User: ${userName}
⏰ Time: ${time}
📅 Date: ${date}
💬 Message: ${oldMsg.body || "No text"}`,
      TARGET_THREAD_ID
    );
  }

  // ATTACHMENTS
  const cacheDir = __dirname + "/cache";
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  let msg = {
    body: `🚨 UNSENT MESSAGE
👥 Group: ${threadName}
👤 User: ${userName}
⏰ Time: ${time}
📅 Date: ${date}
📎 Attachments: ${oldMsg.attachments.length}
${oldMsg.body ? `💬 Message: ${oldMsg.body}` : ""}`,
    attachment: []
  };

  let index = 0;
  for (const att of oldMsg.attachments) {
    index++;

    let ext = "dat";
    if (att.type === "photo") ext = "jpg";
    else if (att.type === "video") ext = "mp4";
    else if (att.type === "audio") ext = "mp3";
    else if (att.type === "file") {
      ext = att.name ? att.name.split(".").pop() : "dat";
    }

    const filePath = `${cacheDir}/${Date.now()}_${index}.${ext}`;

    await new Promise((resolve, reject) => {
      request(att.url)
        .pipe(fs.createWriteStream(filePath))
        .on("finish", resolve)
        .on("error", reject);
    });

    msg.attachment.push(fs.createReadStream(filePath));
  }

  return api.sendMessage(msg, TARGET_THREAD_ID);
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const action = args[0];

  if (!["on", "off"].includes(action)) {
    return api.sendMessage(
      "❌ Usage:\n/resend on\n/resend off",
      threadID,
      messageID
    );
  }

  global.resendStatus = action === "on";

  return api.sendMessage(
    `✅ Resend is now ${action.toUpperCase()} (GLOBAL)`,
    threadID,
    messageID
  );
};