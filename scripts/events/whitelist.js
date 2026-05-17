const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "whitelist",
  eventType: ["message"],
  version: "1.1.0",
  credits: "Joy",
  description: "Block all bot responses for non-permitted users when whitelist is ON",
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

module.exports.run = async function ({ api, event, Threads }) {
  const { threadID, senderID } = event;

  try {
    let isWhitelisted = global.Joy_wlThreads.has(String(threadID));

    if (!isWhitelisted) {
      const threadData = (await Threads.getData(threadID)).data || {};
      isWhitelisted = !!threadData.whitelist;
      if (isWhitelisted) global.Joy_wlThreads.add(String(threadID));
    }

    if (!isWhitelisted) return;

    const permittedUIDs = getPermittedUIDs();
    if (permittedUIDs.includes(String(senderID))) return;

    event.body = "";
    event.attachments = [];
    event.type = "wl_blocked";

    if (!global.Joy_blocked) global.Joy_blocked = new Set();
    global.Joy_blocked.add(`${threadID}_${senderID}`);
    setTimeout(() => {
      if (global.Joy_blocked) global.Joy_blocked.delete(`${threadID}_${senderID}`);
    }, 10000);

  } catch {
    return;
  }
};
