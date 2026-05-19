const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

module.exports.config = {
  name: "shell",
  version: "2.0.0",
  permission: 3,
  credits: "Joy",
  description: "Server এ shell command চালাও (Owner only)",
  category: "admin",
  prefix: true,
  cooldowns: 3,
  usages: "shell [command]"
};

function getOwnerUIDs() {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../Joy.json"), "utf8")
    );
    return [...new Set([
      ...(config.OWNER || []),
      ...(config.ADMINBOT || [])
    ])].map(String);
  } catch { return []; }
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  const owners = getOwnerUIDs();
  if (!owners.includes(String(senderID))) {
    return api.sendMessage("❌ শুধুমাত্র Owner এই command ব্যবহার করতে পারবে।", threadID, messageID);
  }

  const command = args.join(" ").trim();
  if (!command) {
    return api.sendMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   💻 SHELL COMMAND    ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

📌 ব্যবহার: .shell [command]

উদাহরণ:
  .shell ls
  .shell node -v
  .shell cat Joy.json
  .shell pm2 list`, threadID, messageID);
  }

  const processing = await api.sendMessage(`⏳ চালু হচ্ছে...\n$ ${command}`, threadID, messageID);

  exec(command, { timeout: 30000, maxBuffer: 1024 * 512 }, (err, stdout, stderr) => {
    const output = (stdout || "") + (stderr || "");
    const trimmed = output.trim();

    let result = trimmed.length > 1800
      ? trimmed.substring(0, 1800) + "\n\n... [output কেটে দেওয়া হয়েছে]"
      : trimmed || "(কোনো output নেই)";

    const status = err && !stdout ? `❌ Error (code: ${err.code || "unknown"})` : "✅ সম্পন্ন";

    api.editMessage(
`┏━━━━━━━━━━━━━━━━━━━━━┓
┃   💻 SHELL OUTPUT     ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

$ ${command}
━━━━━━━━━━━━━━━━━━━━━━━
${result}
━━━━━━━━━━━━━━━━━━━━━━━
${status}`, processing.messageID, threadID);
  });
};
