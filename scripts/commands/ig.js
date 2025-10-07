const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: `${global.config.PREFIX}`,
  version: "1.0.0", 
  permission: 0,
  credits: "Joy",
  description: "Random ইসলামী ছবি সহ প্রিফিক্স ইভেন্ট", 
  prefix: true,
  category: "user",
  usages: "",
  cooldowns: 5, 
  dependencies: {
	}
};

module.exports.run = async function ({ api, event }) {
  try {
    const textArray = [
      "•—»✨「𝗞𝗜𝗡𝗚_𝗝𝗨𝗕𝗔𝗘𝗗_𝗔𝗛𝗠𝗘𝗗_𝗝𝗢𝗬」✨«—•\n༆-✿Prifix Event ༊࿐\n╭•┄┅════❁🌺❁════┅┄•╮\n\n᭄࿐-ইচ্ছে!!!গুলো!!!যদি!!!পবিত্র!!হয়!✿᭄\n\n✿᭄তাহলে!!!স্বপ্ন!!!গুলো..🖤🥀\n\n✿᭄ ࿐- একদিন!!!পূরণ!!!হবেই!!! ✿᭄\n\n✿᭄࿐ইনশাআল্লাহ..🖤🥀\n\n╰•┄┅════❁🌺❁════┅┄•╯\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬",
      "•—»✨「𝗞𝗜𝗡𝗚_𝗝𝗨𝗕𝗔𝗘𝗗_𝗔𝗛𝗠𝗘𝗗_𝗝𝗢𝗬」✨«—•\n༆-✿Prifix Event ༊࿐\n╭•┄┅════❁🌺❁════┅┄•╮\n\n🦋 মক্কা তুমি ধন্য 🕋 যেখানে নবী (সাঃ) এর জন্ম 💛🙆\n\n╰•┄┅════❁🌺❁════┅┄•╯\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬",
      "•—»✨「𝗞𝗜𝗡𝗚_𝗝𝗨𝗕𝗔𝗘𝗗_𝗔𝗛𝗠𝗘𝗗_𝗝𝗢𝗬」✨«—•\n༆-✿Prifix Event ༊࿐\n╭•┄┅════❁🌺❁════┅┄•╮\n\n🖤 নামাজ ছাড়া মুসলিম মূল্যহীন!! ❥༅༎\n\n╰•┄┅════❁🌺❁════┅┄•╯\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬",
      "•—»✨「𝗞𝗜𝗡𝗚_𝗝𝗨𝗕𝗔𝗘𝗗_𝗔𝗛𝗠𝗘𝗗_𝗝𝗢𝗬」✨«—•\n༆-✿Prifix Event ༊࿐\n╭•┄┅════❁🌺❁════┅┄•╮\n\n🖤 প্রতিশোধ নয়, ক্ষমাই ইসলামের আদর্শ ❤️🥰\n\n╰•┄┅════❁🌺❁════┅┄•╯\n𝐂𝐫𝐞𝐚𝐭𝐨𝐫 : 𝗠𝗗 𝗝𝗨𝗕𝗔𝗘𝗗 𝗔𝗛𝗠𝗘𝗗 𝗝𝗢𝗬"
    ];

    const imageArray = [
      "https://i.postimg.cc/ZR0SLZyy/received-104854222681538.jpg",
      "https://i.postimg.cc/CM3RdrW4/received-1077131053254543.jpg",
      "https://i.postimg.cc/mhWWRHpQ/received-1202913210365646.jpg",
      "https://i.postimg.cc/yxZCwPj1/received-179416495132916.jpg",
      "https://i.postimg.cc/8kJFpgn5/received-201956602842877.jpg",
      "https://i.postimg.cc/8c2N53cf/received-2183981171798286.jpg",
      "https://i.postimg.cc/6QWwyCWc/received-259795433354586.jpg",
      "https://i.postimg.cc/JzWRC9S9/received-317063074088232.jpg",
      "https://i.postimg.cc/5tsJvjjV/received-583147497311518.jpg",
      "https://i.postimg.cc/7ZMwHKkb/received-598373762409967.jpg"
    ];

    const text = textArray[Math.floor(Math.random() * textArray.length)];
    const imageUrl = imageArray[Math.floor(Math.random() * imageArray.length)];
    const cachePath = __dirname + "/cache_ig.jpg";

    // ইমেজ ডাউনলোড করো
    request(imageUrl)
      .pipe(fs.createWriteStream(cachePath))
      .on("close", () => {
        api.sendMessage(
          {
            body: text,
            attachment: fs.createReadStream(cachePath)
          },
          event.threadID,
          () => fs.unlinkSync(cachePath)
        );
      });
  } catch (err) {
    console.log(err);
    api.sendMessage("⚠️ কিছু সমস্যা হয়েছে, আবার চেষ্টা করো!", event.threadID);
  }
};
