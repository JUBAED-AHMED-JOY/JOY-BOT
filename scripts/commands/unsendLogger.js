const path = require("path");
const fs = require("fs");

function getAdminUIDs() {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../Joy.json"), "utf8")
    );
    return config.ADMINBOT || [];
  } catch {
    return [];
  }
}

module.exports.config = {
  name: "resend",
  version: "2.7.0",
  permission: 2,
  credits: "Joy",
  description: "Auto forward unsent messages (text/photo/video) to all AdminBot UIDs",
  prefix: false,
  premium: false,
  category: "system",
  usages: "",
  cooldowns: 0,
  dependencies: {
    "request": "",
    "fs-extra": ""
  }
};

module.exports.handleEvent = async function ({ event, api, Users, Threads }) {
  const request = global.nodemodule["request"];
  const fsExtra = global.nodemodule["fs-extra"];

  const { messageID, senderID, body, attachments, type, threadID } = event;

  if (!global.logMessage) global.logMessage = new Map();
  if (!global.data.botID) global.data.botID = api.getCurrentUserID();
  if (senderID == global.data.botID) return;

  if (type !== "message_unsend") {
    global.logMessage.set(messageID, {
      body: body || "",
      attachments: attachments || []
    });
    return;
  }

  const oldMsg = global.logMessage.get(messageID);
  if (!oldMsg) return;

  const adminUIDs = getAdminUIDs();
  if (!adminUIDs.length) return;

  const userName = await Users.getNameUser(senderID);
  const threadInfo = await Threads.getInfo(threadID);
  const threadName = threadInfo.threadName || "Unknown Group";

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

  const header = `🚨 UNSENT MESSAGE\n👥 Group: ${threadName}\n👤 User: ${userName}\n⏰ Time: ${time}\n📅 Date: ${date}`;

  if (!oldMsg.attachments || oldMsg.attachments.length === 0) {
    const textMsg = `${header}\n💬 Message: ${oldMsg.body || "No text"}`;
    for (const uid of adminUIDs) {
      api.sendMessage(textMsg, uid);
    }
    return;
  }

  const cacheDir = __dirname + "/cache";
  if (!fsExtra.existsSync(cacheDir)) fsExtra.mkdirSync(cacheDir);

  const filePaths = [];
  let index = 0;
  for (const att of oldMsg.attachments) {
    index++;
    let ext = "dat";
    if (att.type === "photo") ext = "jpg";
    else if (att.type === "video") ext = "mp4";
    else if (att.type === "audio") ext = "mp3";
    else if (att.type === "file") ext = att.name ? att.name.split(".").pop() : "dat";

    const filePath = `${cacheDir}/${Date.now()}_${index}.${ext}`;
    await new Promise((resolve, reject) => {
      request(att.url)
        .pipe(fsExtra.createWriteStream(filePath))
        .on("finish", resolve)
        .on("error", reject);
    });
    filePaths.push(filePath);
  }

  const msgBody = `${header}\n📎 Attachments: ${oldMsg.attachments.length}${oldMsg.body ? `\n💬 Message: ${oldMsg.body}` : ""}`;

  for (const uid of adminUIDs) {
    api.sendMessage(
      {
        body: msgBody,
        attachment: filePaths.map(p => fsExtra.createReadStream(p))
      },
      uid,
      () => {
        filePaths.forEach(p => { try { fsExtra.unlinkSync(p); } catch {} });
      }
    );
  }
};

module.exports.run = async function () {};
