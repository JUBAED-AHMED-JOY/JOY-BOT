module.exports.config = {
  name: "goiadmin",
  version: "1.0.1",
  permission: 0,
  credits: "Joy Ahmed",
  description: "Don't mention admin without reason",
  prefix: true,
  category: "user",
  usages: "tag",
  cooldowns: 5,
};

const adminUIDs = [ 
  "100003661522127", 
  "100003661522127", 
];

module.exports.handleEvent = function({ api, event }) {
  const mentionIDs = Object.keys(event.mentions || {});
  const isMentioningAdmin = mentionIDs.some(id => adminUIDs.includes(id));
  
  if (!isMentioningAdmin || adminUIDs.includes(event.senderID)) return;

  const msgList = [
    "╭╼|━━━━━━━━━━━━━━|╾╮\n⛔ 𝙈𝙖𝙣𝙩𝙞𝙤𝙣 𝙙𝙞𝙨𝙤 𝙠𝙚𝙣 𝙗𝙖𝙟𝙖𝙧 𝙡𝙖𝙜𝙘𝙝𝙚 😡\n╰╼|━━━━━━━━━━━━━━|╾╯",
    "╭╼|━━━━━━━━━━━━━━|╾╮\n🥀 জয় বস এখন বিজি! পরে কথা বলো।\n╰╼|━━━━━━━━━━━━━━|╾╯",
    "╭╼|━━━━━━━━━━━━━━|╾╮\n😾 এত মেনশন না দিয়ে ইনবক্সে গিয়ে কনফেস করো! 💌\n╰╼|━━━━━━━━━━━━━━|╾╯",
    "╭╼|━━━━━━━━━━━━━━|╾╮\n🤐 মেনশন কইরা লাভ নাই, প্রেম পাইবা না 🙃\n╰╼|━━━━━━━━━━━━━━|╾╯",
    "╭╼|━━━━━━━━━━━━━━|╾╮\n💔 Joy এখন ভাঙা হৃদয়ে গান শুনতেছে, disturb কইরো না 😭\n╰╼|━━━━━━━━━━━━━━|╾╯",
    "╭╼|━━━━━━━━━━━━━━|╾╮\n💋 মেনশন দিলে চুম্মা দিমু—তয় virtual! 😽\n╰╼|━━━━━━━━━━━━━━|╾╯",
  ];

  const randomMsg = msgList[Math.floor(Math.random() * msgList.length)];
  return api.sendMessage(randomMsg, event.threadID, event.messageID);
};

module.exports.run = function() {};
