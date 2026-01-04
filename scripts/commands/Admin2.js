const moment = require("moment-timezone");
const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports.config = {
  name: "admin",
  version: "1.0.1",
  credit: "Joy",
  permission: 0,
  description: "Shows admin personal information",
  category: "info",
  prefix: true,
  cooldown: 5
};

module.exports.run = async function ({ api, event }) {
  try {
    const currentTime = moment
      .tz("Asia/Dhaka")
      .format("DD MMM YYYY, hh:mm:ss A");

    const imageUrl =
      "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/joy404.png";

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "admin_avatar.png");

    // cache folder না থাকলে তৈরি করবে
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    const infoText = `
╭╼|━━━━━━━━━━━━━━|╾╮
👑 𝗔𝗱𝗺𝗶𝗻: 𝙈𝘿 𝙅𝙪𝙗𝙖𝙚𝙙 𝘼𝙝𝙢𝙚𝙙 𝙅𝙤𝙮
🌐 𝗡𝗮𝗺𝗲: 𝙅𝙤𝙮 𝘼𝙝𝙢𝙚𝙙
🕋 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻: Islam | 🚹 𝗚𝗲𝗻𝗱𝗲𝗿: Male
🎂 𝗔𝗴𝗲: 16+ | 🎓 𝗪𝗼𝗿𝗸: Student
🏠 𝗙𝗿𝗼𝗺: Jamalpur, Dhaka
📍 𝗖𝘂𝗿𝗿𝗲𝗻𝘁: Tarakandi, Jamalpur
💘 𝗦𝘁𝗮𝘁𝘂𝘀: Single
📧 𝗘𝗺𝗮𝗶𝗹: mdjubaedahmed124@gmail.com
📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽: +8801709045888
✈️ 𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺: t.me/JOY_AHMED_88
🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: fb.com/100000486903904
⏰ 𝗧𝗶𝗺𝗲: ${currentTime}
╰╼|━━━━━━━━━━━━━━|╾╯`;

    const sendMsg = () => {
      api.sendMessage(
        {
          body: infoText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      );
    };

    request(imageUrl)
      .pipe(fs.createWriteStream(imgPath))
      .on("close", sendMsg)
      .on("error", () => {
        api.sendMessage(infoText, event.threadID);
      });

  } catch (err) {
    api.sendMessage("❌ Admin command error!", event.threadID);
    console.error(err);
  }
};
