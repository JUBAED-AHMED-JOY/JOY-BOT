const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "help",
  version: "2.1.1",
  permission: 0,
  credits: "Joy Ahmed",
  description: "সব কমান্ড এবং বট তথ্য দেখায়",
  prefix: true,
  category: "system",
  usages: "[command name]",
  cooldowns: 5
};

// ছোট বক্স স্টাইল ফাংশন
function smallBox(text) {
  return `╭╼|━━━━━━━━━━━━━━|╾╮\n${text}\n╰╼|━━━━━━━━━━━━━━|╾╯`;
}

module.exports.run = async function ({ api, event, args }) {
  const commandList = global.client.commands;
  const prefix = global.config.PREFIX || ".";
  let msg = "";

  // নির্দিষ্ট কমান্ড help
  if (args[0]) {
    const name = args[0].toLowerCase();
    const command = commandList.get(name);

    if (!command) {
      return api.sendMessage(
        smallBox("❌ এই নামে কোনো কমান্ড নেই!"),
        event.threadID,
        event.messageID
      );
    }

    msg += smallBox(`⌨️ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: ${name}`) + "\n\n";
    msg += `📄 𝐃𝐞𝐬𝐜: ${command.config.description || "নেই"}\n`;
    msg += `📂 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${command.config.category || "Unknown"}\n`;
    msg += `📌 𝐔𝐬𝐚𝐠𝐞: ${prefix}${command.config.name} ${command.config.usages || ""}\n`;
    msg += `⏱️ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧: ${command.config.cooldowns || 3}s\n`;
    msg += `👤 𝐏𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧: ${command.config.permission}\n`;

    return api.sendMessage(msg, event.threadID, event.messageID);
  }

  // সব কমান্ড ক্যাটাগরি অনুযায়ী সাজানো
  const categories = {};
  commandList.forEach(cmd => {
    const cat = cmd.config.category || "Unknown";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(cmd.config.name);
  });

  msg += smallBox(`🤖 𝐇𝐞𝐥𝐩 𝐌𝐞𝐧𝐮 — ${global.config.BOTNAME || "Merai Bot"}`) + "\n\n";

  for (const cat in categories) {
    msg += smallBox(`📁 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${cat.toUpperCase()}`);
    msg += `\n➤ ${categories[cat].sort().join(", ")}\n\n`;
  }

  msg += smallBox("👑 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧 𝐈𝐧𝐟𝐨") + "\n\n";
  msg += `👤 𝐎𝐰𝐧𝐞𝐫: Joy Ahmed\n`;
  msg += `📞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩: wa.me/8801709045888\n`;
  msg += `🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤: facebook.com/100000486903904\n`;
  msg += `⚙️ 𝐏𝐫𝐞𝐟𝐢𝐱: ${prefix}\n`;
  msg += `📦 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: 2.1.1\n`;
  msg += `📊 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬: ${commandList.size}\n`;

  // 📸 Google Drive Image
  const imageURL = "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/joy404.png";
  const imgPath = __dirname + "/cache/help.jpg";

  try {
    const res = await axios.get(imageURL, { responseType: "arraybuffer" });
    fs.writeFileSync(imgPath, res.data);

    return api.sendMessage(
      {
        body: msg,
        attachment: fs.createReadStream(imgPath)
      },
      event.threadID,
      () => fs.unlinkSync(imgPath),
      event.messageID
    );

  } catch (err) {
    console.error(err);
    return api.sendMessage(
      msg + "\n⚠️ ইমেজ লোড করা যায়নি।",
      event.threadID,
      event.messageID
    );
  }
};
