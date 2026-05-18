const moment = require("moment-timezone");
const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "autotime",
  version: "1.1.0",
  permission: 2,
  credits: "Joy",
  description: "Bot চালু হলেই প্রতি ঘন্টায় সব group এ stylish time send করে",
  prefix: true,
  category: "system",
  usages: "now",
  cooldowns: 5,
  dependencies: {
    "moment-timezone": ""
  }
};

function getAdminbotUID() {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../Joy.json"), "utf8")
    );
    return config.ADMINBOT?.[0] || null;
  } catch {
    return null;
  }
}

function buildMessage() {
  const now = moment.tz("Asia/Dhaka");
  const hour = now.format("hh");
  const minute = now.format("mm");
  const second = now.format("ss");
  const ampm = now.format("A");
  const day = now.format("dddd");
  const date = now.format("DD MMMM YYYY");

  const adminUID = getAdminbotUID();
  const fbLink = adminUID ? `https://facebook.com/${adminUID}` : "N/A";

  const hourNum = parseInt(now.format("H"));
  let greeting = "";
  if (hourNum >= 5 && hourNum < 12) greeting = "🌅 শুভ সকাল!";
  else if (hourNum >= 12 && hourNum < 15) greeting = "☀️ শুভ দুপুর!";
  else if (hourNum >= 15 && hourNum < 18) greeting = "🌤 শুভ বিকেল!";
  else if (hourNum >= 18 && hourNum < 21) greeting = "🌆 শুভ সন্ধ্যা!";
  else greeting = "🌙 শুভ রাত!";

  return (
`╔════════════════════╗
    🕐 𝗔𝗨𝗧𝗢 𝗧𝗜𝗠𝗘 𝗨𝗣𝗗𝗔𝗧𝗘
╚════════════════════╝

${greeting}

⏰ সময়  :  ${hour}:${minute}:${second} ${ampm}
📅 তারিখ :  ${date}
📆 দিন   :  ${day}

━━━━━━━━━━━━━━━━
🤖 𝗕𝗼𝘁 𝗔𝗱𝗺𝗶𝗻
🔗 ${fbLink}
━━━━━━━━━━━━━━━━`
  );
}

module.exports.onLoad = function ({ api }) {
  if (global.autoTimeInterval) clearInterval(global.autoTimeInterval);
  if (global.autoTimeTimeout) clearTimeout(global.autoTimeTimeout);

  function sendToAll() {
    const msg = buildMessage();
    const threads = global.data?.allThreadID || [];
    for (const tid of threads) {
      api.sendMessage(msg, tid);
    }
  }

  const now = moment.tz("Asia/Dhaka");
  const msUntilNextHour = (60 - now.minutes()) * 60 * 1000 - now.seconds() * 1000 - now.milliseconds();

  global.autoTimeTimeout = setTimeout(() => {
    sendToAll();
    global.autoTimeInterval = setInterval(sendToAll, 60 * 60 * 1000);
  }, msUntilNextHour);
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (args[0] === "now") {
    return api.sendMessage(buildMessage(), threadID, messageID);
  }

  return api.sendMessage(
    `⚙️ Usage:\n.autotime now → এখনই time দেখাবে\n\n✅ Auto Time সবসময় চালু থাকে — প্রতি ঘন্টায় সব group এ পাঠায়।`,
    threadID, messageID
  );
};
