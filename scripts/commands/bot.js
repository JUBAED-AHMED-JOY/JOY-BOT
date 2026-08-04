const axios = require("axios");

// =========================
// LOAD BASE API URL
// =========================
async function getApiUrl() {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json", {
      headers: { "Cache-Control": "no-cache" }
    });
    return `${base.data.api}/baby`;
  } catch (err) {
    console.error("❌ Base API Load Error:", err.message);
    return null;
  }
}

const randomResponses = ["কোন একটি সমস্যা হইচে, একটু পর আবার চেষ্টা করুন 🥲"];

function getRandomResponse() {
  return randomResponses[Math.floor(Math.random() * randomResponses.length)];
}

module.exports.config = {
  name: "btt",
  version: "5.0.0",
  permission: 0,
  credits: "JOY",
  description: "AI reply system using dynamic API from GitHub JSON",
  prefix: false,
  category: "chat",
  usages: "[bot/bট/bby or question]",
  cooldowns: 2,
};

// =========================
// SEND ANSWER FUNCTION
// =========================
async function sendAnswer(api, threadID, messageID, question, senderID) {
  const apiUrl = await getApiUrl();
  if (!apiUrl) {
    return api.sendMessage(getRandomResponse(), threadID, messageID);
  }

  try {
    const res = await axios.get(`${apiUrl}?text=${encodeURIComponent(question)}&senderID=${senderID}&font=1`);
    const msg = res.data?.reply || getRandomResponse();

    return new Promise(resolve => {
      api.sendMessage(msg, threadID, (err, info) => {
        if (err) return;
        global.client.handleReply.push({
          name: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: threadID
        });
        resolve(info);
      }, messageID);
    });
  } catch (err) {
    console.error("❌ API Error:", err.message);
    return api.sendMessage(getRandomResponse(), threadID, messageID);
  }
}

// =========================
// COMMAND HANDLER
// =========================
module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ").trim();
  if (!input) return;

  const [cmd, ...rest] = args;
  const content = rest.join(" ").trim();

  // ---------- TEACH ----------
  if (cmd === "teach") {
    const [ask, ans] = content.split(" - ");
    if (!ask || !ans)
      return api.sendMessage("❌ Format: .bot teach প্রশ্ন - উত্তর", threadID, messageID);

    const apiUrl = await getApiUrl();
    if (!apiUrl) return api.sendMessage("❌ API URL Load Error!", threadID, messageID);

    try {
      const re = await axios.get(`${apiUrl}?teach=${encodeURIComponent(ask)}&reply=${encodeURIComponent(ans)}&senderID=${senderID}`);
      return api.sendMessage(`✅ Teach Added!\n💬 ASK: ${ask}\n💬 ANS: ${ans}\n${re.data.message || ""}`, threadID, messageID);
    } catch {
      return api.sendMessage("⚠️ Teach পাঠানো যায়নি, পরে চেষ্টা করুন", threadID, messageID);
    }
  }

  // ---------- KEYINFO / MSG ----------
  if (cmd === "keyinfo") {
    if (!content)
      return api.sendMessage("❌ Format: .bot keyinfo ask", threadID, messageID);

    const apiUrl = await getApiUrl();
    if (!apiUrl) return api.sendMessage("❌ API URL Load Error!", threadID, messageID);

    try {
      const res = await axios.get(`${apiUrl}?list=${encodeURIComponent(content)}`);
      const data = res.data?.data;

      if (!data) return api.sendMessage(`❌ No data found for "${content}"`, threadID, messageID);

      return api.sendMessage(`📚 Message for "${content}":\n${data}`, threadID, messageID);
    } catch {
      return api.sendMessage("⚠️ Keyinfo আনতে সমস্যা হয়েছে", threadID, messageID);
    }
  }

  // ---------- HELP ----------
  if (cmd === "help") {
    const msg = `BOT COMMAND HELP  

•—» .bot teach ask - answer  
•—» .bot keyinfo ask  

💬 শুধু 'bot' বা 'বট' লিখে যেকোন প্রশ্ন করো!`;
    return api.sendMessage(msg, threadID, messageID);
  }

  // ---------- NORMAL CHAT ----------
  await sendAnswer(api, threadID, messageID, input, senderID);
};

// =========================
// REPLY HANDLER
// =========================
module.exports.handleReply = async function({ api, event, handleReply }) {
  if (handleReply.author !== event.threadID) return;
  const question = event.body;
  await sendAnswer(api, event.threadID, event.messageID, question, event.senderID);
};

// =========================
// EVENT HANDLER
// =========================
module.exports.handleEvent = async function({ api, event, Users }) {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    const prefixes = ["বাবু", "bot", "bby", "বট"];
    const matchedPrefix = prefixes.find(p => body.startsWith(p));

    if (matchedPrefix) {
      const name = await Users.getNameUser(event.senderID);
      const contentAfterPrefix = body.replace(new RegExp(`^${matchedPrefix}\\s*`), "").trim();

      if (!contentAfterPrefix) {
        const ran = [
          "আমি এখন জয় বস এর সাথে বিজি আছি 😴",
          "কি বললে? শুনতে পেলাম না 😅",
          "I love you baby 😘",
          "Love you 3000-😍💋💝",
          "আমাকে না ডেকে আমার বস জয়কে ডাকো! 💪 link: https://www.facebook.com/100001435123762",
          "তুমি কি আমাকে ডাকলে বন্ধু 🤖?",
          "ভালোবাসি তোমাকে 😍",
          "হুম জান বলো, কি খবর?",
          "Hi 😄 আমি আছি, বলো কি জানতে চাও?"
        ];
        const msg = ran[Math.floor(Math.random() * ran.length)];

        return api.sendMessage({
          body: `${name}\n\n${msg}`,
          mentions: [{ tag: name, id: event.senderID }]
        }, event.threadID, (err, info) => {
          global.client.handleReply.push({
            name: module.exports.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.threadID
          });
        }, event.messageID);
      }

      // যদি প্রশ্ন থাকে → API দিয়ে উত্তর পাঠাও
      await sendAnswer(api, event.threadID, event.messageID, contentAfterPrefix, event.senderID);
    }
  } catch (err) {
    console.error("HandleEvent Error:", err);
    api.sendMessage("⚠️ কিছু একটা সমস্যা হইছে!", event.threadID, event.messageID);
  }
};
