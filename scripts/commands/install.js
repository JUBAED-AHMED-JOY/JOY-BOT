const axios = require('axios');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports.config = {
  name: "install",
  version: "1.0.1",
  permssion: 2, // admin only
  credits: "Joy",
  prefix: true,
  description: "Create a new JS file with code from a link or provided code, with syntax checking.",
  usages: "[file name] [link/code]",
  category: "utility",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {

  try {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const fileName = args[0];
    const input = args.slice(1).join(' ');

    if (!fileName || !input) {
      return api.sendMessage("⚠️ দয়া করে একটি বৈধ ফাইল নাম এবং কোড বা লিংক দিন!", threadID, messageID);
    }

    // File name validation
    if (fileName.includes("..") || path.isAbsolute(fileName)) {
      return api.sendMessage("❌ অবৈধ ফাইল নাম!", threadID, messageID);
    }

    // Allow only .js files
    if (!fileName.endsWith(".js")) {
      return api.sendMessage("⚠️ শুধুমাত্র .js ফাইল অনুমোদিত!", threadID, messageID);
    }

    let code;
    const linkPattern = /^(http|https):\/\/[^ "]+$/;

    if (linkPattern.test(input)) {
      // Optional: trusted source check
      // if (!input.startsWith("https://trustedsource.com/")) return api.sendMessage("❌ অনুমোদিত উৎস ব্যতীত কোড ডাউনলোড করা যাবে না!", threadID, messageID);

      const response = await axios.get(input);
      code = response.data;
    } else {
      code = input;
    }

    // Syntax checking
    try {
      new vm.Script(code);
    } catch (syntaxError) {
      return api.sendMessage(`❌ কোডে সিনট্যাক্স ত্রুটি: ${syntaxError.message}`, threadID, messageID);
    }

    const filePath = path.join(__dirname, fileName);

    // Prevent file overwrite
    if (fs.existsSync(filePath)) {
      return api.sendMessage("⚠️ এই নামে ইতিমধ্যে একটি ফাইল রয়েছে। অন্য নাম দিন!", threadID, messageID);
    }

    fs.writeFileSync(filePath, code, 'utf-8');
    return api.sendMessage(`✅ সফলভাবে ফাইল তৈরি হয়েছে:\nscripts/commands/${fileName}`, threadID, messageID);

  } catch (error) {
    console.error("Error:", error);
    return api.sendMessage("❌ ফাইল তৈরি করতে একটি সমস্যা হয়েছে!", event.threadID, event.messageID);
  }
};