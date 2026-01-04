const axios = require("axios");

module.exports.config = {
  name: "sms",
  version: "1.0.2",
  permission: 0,
  prefix: true,
  credits: "Joy Ahmed",
  description: "Send SMS using external API from GitHub JSON",
  category: "tools",
  usages: "sms [number] [amount]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const [number, amountStr] = args;
  const amount = parseInt(amountStr);

  if (!number || isNaN(amount) || amount <= 0)
    return api.sendMessage("❌ সঠিকভাবে ব্যবহার করুন:\nsms [number] [amount]", event.threadID, event.messageID);

  // Fetch API config from GitHub
  let smsApiUrl;
  try {
    const res = await axios.get("https://raw.githubusercontent.com/JUBAED-AHMED-JOY/Joy/main/api.json");
    smsApiUrl = res.data?.smsApi;

    if (!smsApiUrl) throw new Error("smsApi key not found");
  } catch (err) {
    return api.sendMessage("❌ API config লোড করতে ব্যর্থ। GitHub JSON ঠিক আছে কিনা চেক করুন।", event.threadID);
  }

  api.sendMessage(`⏳ ${number} নম্বরে ${amount}টি SMS পাঠানো হচ্ছে...`, event.threadID);

  let success = 0, failed = 0;

  for (let i = 0; i < amount; i++) {
    try {
      await axios.get(`${smsApiUrl}${number}`);
      success++;
    } catch (e) {
      failed++;
    }
    await new Promise(res => setTimeout(res, 1000));
  }

  api.sendMessage(`✅ SMS পাঠানো শেষ:\n• সফল: ${success}\n• ব্যর্থ: ${failed}`, event.threadID);
};
