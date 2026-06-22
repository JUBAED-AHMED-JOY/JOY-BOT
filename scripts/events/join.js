module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "2.1.0",
  credits: "Joy Ahmed",
  description: "GROUP JOIN NOTIFICATION WITH ADDER AND JOINER IMAGES"
};

const fs = require("fs-extra");
const { loadImage, createCanvas, registerFont } = require("canvas");
const axios = require("axios");
const jimp = require("jimp");
const moment = require("moment-timezone");

const FONT_URL = "https://drive.google.com/u/0/uc?id=10XFWm9F6u2RKnuVIfwoEdlav2HhkAUIB&export=download";
const FONT_DIR = __dirname + "/JOY/font/";
const FONT_PATH = FONT_DIR + "Semi.ttf";
const JOIN_DIR = __dirname + "/JOY/join/";

// ───────────── CIRCLE AVATAR ─────────────
async function circle(image) {
  const img = await jimp.read(image);
  img.circle();
  return await img.getBufferAsync("image/png");
}

// ───────────── MAIN EVENT ─────────────
module.exports.run = async function ({ api, event }) {
  try {
    if (!event.logMessageData?.addedParticipants) return;

    fs.ensureDirSync(JOIN_DIR);
    fs.ensureDirSync(FONT_DIR);

    // ───── TIME INFO ─────
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss - DD/MM/YYYY");
    const day = moment.tz("Asia/Dhaka").format("dddd");

    const threadID = event.threadID;
    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName || "This Group";
    const memberCount = threadInfo.participantIDs.length;

    // ───── BOT JOINED ─────
    if (event.logMessageData.addedParticipants.some(u => u.userFbId == api.getCurrentUserID())) {
      await api.changeNickname(
        `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "Bot"}`,
        threadID,
        api.getCurrentUserID()
      );

      return api.sendMessage(
        `✅ BOT CONNECTED SUCCESSFULLY!\n\nType ${global.config.PREFIX}help to see commands`,
        threadID
      );
    }

    // ───── LOAD FONT (ONCE) ─────
    if (!fs.existsSync(FONT_PATH)) {
      const fontData = await axios.get(FONT_URL, { responseType: "arraybuffer" });
      fs.writeFileSync(FONT_PATH, Buffer.from(fontData.data));
    }

    if (!global.FONT_LOADED) {
      registerFont(FONT_PATH, { family: "Semi" });
      global.FONT_LOADED = true;
    }

    // ───── ADDER INFO ─────
    const authorID = event.author;
    let adderName = "Someone";
    if (authorID) {
      const userInfx = await api.getUserInfo(authorID);
      if (userInfx[authorID]) adderName = userInfx[authorID].name;
    }

    const attachments = [];
    const mentions = [];
    const names = [];

    // ───── LOOP NEW MEMBERS ─────
    for (let i = 0; i < event.logMessageData.addedParticipants.length; i++) {
      const user = event.logMessageData.addedParticipants[i];
      const name = user.fullName || "New Member";

      names.push(name);
      mentions.push({ tag: name, id: user.userFbId });

      // 1. ADDER AVATAR
      let adderCircle;
      try {
        const adderURL = `https://graph.facebook.com/${authorID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const adderData = await axios.get(adderURL, { responseType: "arraybuffer" });
        const adderPath = `${JOIN_DIR}adder_${i}.png`;
        fs.writeFileSync(adderPath, Buffer.from(adderData.data));
        adderCircle = await circle(adderPath);
      } catch (e) {
        // Fallback default avatar background if failed
        adderCircle = "https://i.ibb.co/rfzmSjQm/image.jpg"; 
      }

      // 2. JOINER AVATAR
      const avatarURL = `https://graph.facebook.com/${user.userFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatarPath = `${JOIN_DIR}avt_${i}.png`;
      fs.writeFileSync(avatarPath, Buffer.from(avatarData.data));
      const avatarCircle = await circle(avatarPath);

      // 3. BACKGROUND
      const bgList = [
        "https://i.ibb.co/rfzmSjQm/image.jpg",
        "https://i.ibb.co/gZNk2NqS/image.jpg",
        "https://i.ibb.co/4ZGxZ5mD/image.jpg"
      ];
      const bgURL = bgList[Math.floor(Math.random() * bgList.length)];
      const bgData = await axios.get(bgURL, { responseType: "arraybuffer" });
      const bgPath = `${JOIN_DIR}bg_${i}.png`;
      fs.writeFileSync(bgPath, Buffer.from(bgData.data));

      // ───── CANVAS DRAWING ─────
      const canvas = createCanvas(1900, 1080);
      const ctx = canvas.getContext("2d");

      const bg = await loadImage(bgPath);
      const avaAdder = await loadImage(adderCircle);
      const avaJoiner = await loadImage(avatarCircle);

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // দুইজনের প্রোফাইল পিকচার পাশাপাশি পজিশন করা (Adder left, Joiner right)
      ctx.drawImage(avaAdder, canvas.width / 2 - 380, 180, 320, 320);
      ctx.drawImage(avaJoiner, canvas.width / 2 + 60, 180, 320, 320);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";

      // Text 1: Action (Adder added Joiner)
      ctx.font = "80px Semi";
      ctx.fillText(`${adderName} added ${name}`, canvas.width / 2, 600);

      // Text 2: Group Info
      ctx.font = "65px Semi";
      ctx.fillText(`Welcome to ${threadName}`, canvas.width / 2, 710);
      ctx.fillText(`Member Position: ${memberCount}`, canvas.width / 2, 800);

      // Text 3: Powered By Credit
      ctx.fillStyle = "#FFD700"; // Gold Color for highlight
      ctx.font = "bold 50px Semi";
      ctx.fillText(`POWERED BY JOY AHMED`, canvas.width / 2, 930);

      const finalPath = `${JOIN_DIR}final_${i}.png`;
      fs.writeFileSync(finalPath, canvas.toBuffer());

      attachments.push(fs.createReadStream(finalPath));
    }

    // ───── SEND MESSAGE ─────
    api.sendMessage(
      {
        body: `🎉 Welcome ${names.join(", ")}\n📌 Added by: ${adderName}\n🏢 Group: ${threadName}\n👥 Total Members: ${memberCount}\n🕒 ${time} (${day})`,
        attachment: attachments,
        mentions
      },
      threadID,
      () => {
        // CLEAN UP
        for (let i = 0; i < attachments.length; i++) {
          ["avt_", "bg_", "final_", "adder_"].forEach(p => {
            const file = `${JOIN_DIR}${p}${i}.png`;
            if (fs.existsSync(file)) fs.unlinkSync(file);
          });
        }
      }
    );
  } catch (err) {
    console.log("JOIN ERROR:", err);
  }
};
