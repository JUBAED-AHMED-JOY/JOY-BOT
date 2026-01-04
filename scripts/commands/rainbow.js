module.exports.config = {
  name: "rainbow",
  version: "1.0.1",
  permission: 2,
  credits: "Joy Ahmed",
  description: "Don't mention admin without reason",
  prefix: true,
  category: "group",
  usages: "rainbow [change]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const count = parseInt(args[0]);
  if (isNaN(count)) {
    return api.sendMessage("❌ দয়া করে একটি সংখ্যা দিন। যেমন: `rainbow 10`", event.threadID, event.messageID);
  }

  if (count > 10000) {
    return api.sendMessage("⚠️ সংখ্যাটি ১০০০০ এর কম হতে হবে!", event.threadID, event.messageID);
  }

  const colors = [
    '196241301102133',    // Red
    '169463077092846',    // Blue
    '2442142322678320',   // Green
    '234137870477637',    // Orange
    '980963458735625',    // Pink
    '175615189761153',    // Purple
    '2136751179887052',   // Cyan
    '2058653964378557',   // Lime
    '2129984390566328',   // Teal
    '174636906462322',    // Magenta
    '1928399724138152',   // Yellow
    '417639218648241',    // Indigo
    '930060997172551',    // Gray
    '164535220883264',    // Navy
    '370940413392601',    // Black
    '205488546921017',    // Sky Blue
    '809305022860427'     // Brown
  ];

  api.sendMessage(`🌈 শুরু হচ্ছে Rainbow মুড! মোট ${count} বার রঙ পরিবর্তন হবে...`, event.threadID);

  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    api.changeThreadColor(color, event.threadID);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  }

  return api.sendMessage(`✅ Rainbow মুড শেষ!`, event.threadID);
};
