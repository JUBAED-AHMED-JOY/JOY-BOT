module.exports.config = {
  name: "join",
  eventType: ["log:subscribe"],
  version: "2.0.1",
  credits: "Mirai-Team",
  description: "GROUP JOIN NOTIFICATION WITH IMAGE"
};

const fs = require("fs-extra");
const { loadImage, createCanvas, registerFont } = require("canvas");
const axios = require("axios");
const jimp = require("jimp");
const moment = require("moment-timezone");

const FONT_URL =
  "https://drive.google.com/u/0/uc?id=10XFWm9F6u2RKnuVIfwoEdlav2HhkAUIB&export=download";

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
    if (
      event.logMessageData.addedParticipants.some(
        (u) => u.userFbId == api.getCurrentUserID()
      )
    ) {
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
      const fontData = await axios.get(FONT_URL, {
        responseType: "arraybuffer"
      });
      fs.writeFileSync(FONT_PATH, Buffer.from(fontData.data));
    }

    if (!global.FONT_LOADED) {
      registerFont(FONT_PATH, { family: "Semi" });
      global.FONT_LOADED = true;
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

      // ───── AVATAR ─────
      const avatarURL = `https://graph.facebook.com/${user.userFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });

      const avatarPath = `${JOIN_DIR}avt_${i}.png`;
      fs.writeFileSync(avatarPath, Buffer.from(avatarData.data));
      const avatarCircle = await circle(avatarPath);

      // ───── BACKGROUND ─────
      const bgList = [
        "https://i.ibb.co/rfzmSjQm/image.jpg",
        "https://i.ibb.co/gZNk2NqS/image.jpg",
        "https://i.ibb.co/4ZGxZ5mD/image.jpg"
      ];

      const bgURL = bgList[Math.floor(Math.random() * bgList.length)];
      const bgData = await axios.get(bgURL, { responseType: "arraybuffer" });

      const bgPath = `${JOIN_DIR}bg_${i}.png`;
      fs.writeFileSync(bgPath, Buffer.from(bgData.data));

      // ───── CANVAS ─────
      const canvas = createCanvas(1900, 1080);
      const ctx = canvas.getContext("2d");

      const bg = await loadImage(bgPath);
      const ava = await loadImage(avatarCircle);

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(ava, canvas.width / 2 - 175, 180, 350, 350);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";

      ctx.font = "120px Semi";
      ctx.fillText(name, canvas.width / 2, 620);

      ctx.font = "70px Semi";
      ctx.fillText(`Welcome to ${threadName}`, canvas.width / 2, 720);
      ctx.fillText(`Member: ${memberCount}`, canvas.width / 2, 820);

      const finalPath = `${JOIN_DIR}final_${i}.png`;
      fs.writeFileSync(finalPath, canvas.toBuffer());

      attachments.push(fs.createReadStream(finalPath));
    }

    // ───── SEND MESSAGE ─────
    api.sendMessage(
      {
        body: `🎉 Welcome ${names.join(", ")}\n📌 Group: ${threadName}\n👥 Total Members: ${memberCount}\n🕒 ${time} (${day})`,
        attachment: attachments,
        mentions
      },
      threadID,
      () => {
        // ───── CLEAN UP AFTER SEND ─────
        for (let i = 0; i < attachments.length; i++) {
          ["avt_", "bg_", "final_"].forEach((p) => {
            const file = `${JOIN_DIR}${p}${i}.png`;
            if (fs.existsSync(file)) fs.unlinkSync(file);
          });
        }
      }
    );
  } catch (err) {
    console.log("JOIN ERROR:", err);
  }
}
