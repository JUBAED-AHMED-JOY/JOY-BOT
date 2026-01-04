const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "hot",
  version: "1.1.0",
  permission: 0,
  credits: "Joy",
  prefix: true,
  description: "Get random 18+ hot video",
  category: "media",
  usages: ".hot",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  const cachePath = path.join(__dirname, "cache");
  const videoPath = path.join(cachePath, "hot.mp4");

  if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

  const title = [
    "╔══❖•𝐉𝐎𝐘-𝐁𝐎𝐓•❖══╗\n\n【• 𝐇𝐎𝐓-𝐕𝐈𝐃𝐄𝐎 •】\n\n╚══❖•𝐉𝐎𝐘-𝐁𝐎𝐓•❖══╝"
  ];

  const links = [
      "https://drive.google.com/uc?id=10r9JSdTGf1JKrdQG7vxXlH0GqM-hgWHi",
"https://drive.google.com/uc?id=10hEt13pTM_0Og-DjlTE65FkzvJJk-cEp",
"https://drive.google.com/uc?id=111exlB5om3SqlAqaaI-hGJ0iY6_enxlW",
"https://drive.google.com/uc?id=10xNg0Cyo3jOY1XZOUOBvc6EUwZexY98k",
"https://drive.google.com/uc?id=10eFm6s4v93laHKfGCAF2Gi83onHaNkfH",
"https://drive.google.com/uc?id=10zESTM0ZPzaLjkBKqx1xTAYkjBujM11Z",
"https://drive.google.com/uc?id=10yrc2V8wsarQoeetdbHhVpIh1UBZsRMf",
"https://drive.google.com/uc?id=116RRysbUPupsaqcKaLDF8s4w_3dnyoLP",
"https://drive.google.com/uc?id=10lsWH5OU92Ic58T5mhWcYlXaXriYqTgl",
"https://drive.google.com/uc?id=1zNjTv0vEW8wQ8W9VWqA7kOlQby6HuGwW",
"https://drive.google.com/uc?id=1zbh0feeFRrYu7o0HIP-Cqaj0uGktyl5C",
"https://drive.google.com/uc?id=1zhwIPt-MkC39egPxq35CmYrSR7MwteDC",
"https://drive.google.com/uc?id=1znDXaoXG-L2aA-ex4ubuI_hT-MKGhFhV",
"https://drive.google.com/uc?id=1zXMpg1kra62dcfjw7KSR9OY_plECySwI",
"https://drive.google.com/uc?id=1znQfHdxzmTl1y-bHZGgjf30loyuZ2P26",
"https://drive.google.com/uc?id=1zVxKJPB8HbB3JIdTqPhl_oeFVN9Z8R6k",
"https://drive.google.com/uc?id=1zPikuNIik8TzXvNPJFZ9xC1v_37auDcl",
"https://drive.google.com/uc?id=1zNJMEqBOFceTbukwJCiukZgm_gFLAyQV",
"https://drive.google.com/uc?id=1zhwIPt-MkC39egPxq35CmYrSR7MwteDC",

  ];

  const randomTitle = title[Math.floor(Math.random() * title.length)];
  const randomLink = links[Math.floor(Math.random() * links.length)];

  api.sendMessage("🔞 Video loading...", threadID, messageID);

  request(encodeURI(randomLink))
    .pipe(fs.createWriteStream(videoPath))
    .on("close", () => {
      api.sendMessage(
        {
          body: randomTitle,
          attachment: fs.createReadStream(videoPath)
        },
        threadID,
        () => fs.unlinkSync(videoPath)
      );
    })
    .on("error", () => {
      api.sendMessage("❌ Video load করতে সমস্যা হয়েছে!", threadID);
    });
};