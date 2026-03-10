const axios = require("axios");

const githubApiUrl = "https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json";
const randomResponses = ["কোন একটি সমস্যা হইচে, একটু পর আবার চেষ্টা করুন 🥲"];

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
// LOAD API URL FROM GITHUB
// =========================
async function getApiUrl() {
  try {
    const res = await axios.get(githubApiUrl, { headers: { "Cache-Control": "no-cache" } });
    return res.data?.api || null;
  } catch (err) {
    console.error("❌ GitHub API Load Error:", err.message);
    return null;
  }
}

// =========================
// CALL API FUNCTION
// =========================
async function callApi(params = {}) {
  const apiUrl = await getApiUrl();
  if (!apiUrl) return null;

  try {
    const res = await axios.get(`${apiUrl}/sim`, { params });
    return res.data;
  } catch (err) {
    console.error("❌ API Error:", err.message);
    return null;
  }
}

function getRandomResponse() {
  return randomResponses[Math.floor(Math.random() * randomResponses.length)];
}

// =========================
// SEND ANSWER FUNCTION
// =========================
async function sendAnswer(api, threadID, messageID, question) {
  const res = await callApi({ text: question });
  const msg = res?.response || res?.answer || res?.data?.msg || getRandomResponse();

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
}

// =========================
// COMMAND HANDLER
// =========================
module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
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
    if (!apiUrl) return api.sendMessage("❌ API not found in GitHub JSON", threadID, messageID);

    try {
      await axios.get(`${apiUrl}/sim`, { params: { teach: `${ask}|${ans}` } });
      return api.sendMessage(`✅ Teach Added!\n💬 ASK: ${ask}\n💬 ANS: ${ans}`, threadID, messageID);
    } catch {
      return api.sendMessage("⚠️ Teach পাঠানো যায়নি, পরে চেষ্টা করুন", threadID, messageID);
    }
  }

  // ---------- KEYINFO ----------
  if (cmd === "keyinfo") {
    if (!content)
      return api.sendMessage("❌ Format: .bot keyinfo ask", threadID, messageID);

    const apiUrl = await getApiUrl();
    if (!apiUrl) return api.sendMessage("❌ API not found in GitHub JSON", threadID, messageID);

    try {
      const res = await axios.get(`${apiUrl}/sim`, { params: { list: "" } });
      const data = res.data;

      if (!Array.isArray(data))
        return api.sendMessage("❌ Couldn't get key list", threadID, messageID);

      const found = data.find(item => item.ask?.toLowerCase() === content.toLowerCase());
      if (!found)
        return api.sendMessage(`❌ No data found for "${content}"`, threadID, messageID);

      const list = found.answer?.map((a, i) => `${i + 1}. ${a}`).join("\n") || "❌ No answers found";
      return api.sendMessage(`📚 Answers for "${content}":\n${list}`, threadID, messageID);
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
  await sendAnswer(api, threadID, messageID, input);
};

// =========================
// REPLY HANDLER
// =========================
module.exports.handleReply = async function({ api, event, handleReply }) {
  if (handleReply.author !== event.threadID) return;
  const question = event.body;
  await sendAnswer(api, event.threadID, event.messageID, question);
};

// =========================
// EVENT HANDLER
// =========================
module.exports.handleEvent = async function({ api, event, Users }) {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    const prefixes = ["বাবু", "bot", "bot", "bot", "বট"];
    const matchedPrefix = prefixes.find(p => body.startsWith(p));

    if (matchedPrefix) {
      const name = await Users.getNameUser(event.senderID);
      const contentAfterPrefix = body.replace(new RegExp(`^${matchedPrefix}\\s*`), "");

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

      // যদি লেখা থাকে → GitHub থেকে API লিংক নিয়ে উত্তর দাও
      await sendAnswer(api, event.threadID, event.messageID, contentAfterPrefix);
    }
  } catch (err) {
    console.error("HandleEvent Error:", err);
    api.sendMessage("⚠️ কিছু একটা সমস্যা হইছে!", event.threadID, event.messageID);
  }
};
