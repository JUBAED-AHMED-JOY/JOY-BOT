module.exports.config = {
  name: "settings",
  version: "1.0.0",
  permission: 2,
  credits: "Joy",
  description: "Bot settings menu",
  prefix: true,
  category: "admin",
  usages: "",
  cooldowns: 10,
};

const fs = require("fs-extra");
const path = require("path");
const totalPath = __dirname + "/cache/totalChat.json";
const _24hours = 86400000;

/* ================== UTILS ================== */
function handleOS(ping) {
  return `📌 Ping: ${Date.now() - ping}ms\n`;
}

/* ================== ON LOAD ================== */
module.exports.onLoad = function () {
  const dataPath = path.join(__dirname, "cache", "data.json");
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ adminbox: {} }, null, 2));
  }
};

/* ================== RUN ================== */
module.exports.run = async function ({ api, event }) {
  return api.sendMessage(
`======== SETTINGS ========
[1] Reboot bot
[2] Reload config
[3] Update box data
[4] Update user data
[5] Logout Facebook
========
[6] Toggle admin-only mode
[7] Toggle anti-join
[8] Toggle anti-robbery
[9] Toggle anti-out
[10] Kick Facebook users
========
[11] Bot info
[12] Box info
[13] Group admin list
[14] Admin bot list
[15] Group list
--------------------------
👉 Reply with a number`,
    event.threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        type: "choose"
      });
    }
  );
};

/* ================== HANDLE REPLY ================== */
module.exports.handleReply = async function ({
  api, event, Users, Threads, handleReply
}) {
  const { threadID } = event;

  if (event.senderID !== handleReply.author) return;

  switch (event.body) {

    /* ===== REBOOT ===== */
    case "1":
      api.sendMessage("Restarting bot...", threadID, () => process.exit(1));
      break;

    /* ===== RELOAD CONFIG ===== */
    case "2":
      delete require.cache[require.resolve(global.client.configPath)];
      global.config = require(global.client.configPath);
      api.sendMessage("Reloaded config.json successfully", threadID);
      break;

    /* ===== UPDATE BOX DATA ===== */
    case "3": {
      const inbox = await api.getThreadList(100, null, ["INBOX"]);
      const groups = inbox.filter(t => t.isGroup && t.isSubscribed);
      for (const g of groups) {
        const info = await api.getThreadInfo(g.threadID);
        await Threads.setData(g.threadID, { threadInfo: info });
      }
      api.sendMessage(`Updated ${groups.length} groups`, threadID);
      break;
    }

    /* ===== UPDATE USER DATA ===== */
    case "4": {
      const inbox = await api.getThreadList(100, null, ["INBOX"]);
      const groups = inbox.filter(t => t.isGroup && t.isSubscribed);
      for (const g of groups) {
        const info = await api.getThreadInfo(g.threadID);
        for (const id of info.participantIDs) {
          const u = await api.getUserInfo(id);
          await Users.setData(id, { name: u[id].name, data: {} });
        }
      }
      api.sendMessage("Updated all user data", threadID);
      break;
    }

    /* ===== LOGOUT ===== */
    case "5":
      api.sendMessage("Logging out...", threadID);
      api.logout();
      break;

    /* ===== ADMIN ONLY MODE ===== */
    case "6": {
      const dataPath = path.join(__dirname, "cache", "data.json");
      const db = require(dataPath);
      db.adminbox[threadID] = !db.adminbox[threadID];
      fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));
      api.sendMessage(
        db.adminbox[threadID]
          ? "Admin-only mode enabled 🔒"
          : "Admin-only mode disabled 🔓",
        threadID
      );
      break;
    }

    /* ===== ANTI JOIN ===== */
    case "7": {
      const data = (await Threads.getData(threadID)).data || {};
      data.newMember = !data.newMember;
      await Threads.setData(threadID, { data });
      api.sendMessage(
        `Anti-join ${data.newMember ? "enabled" : "disabled"}`,
        threadID
      );
      break;
    }

    /* ===== ANTI ROBBERY ===== */
    case "8": {
      const data = (await Threads.getData(threadID)).data || {};
      data.guard = !data.guard;
      await Threads.setData(threadID, { data });
      api.sendMessage(
        `Anti-robbery ${data.guard ? "enabled" : "disabled"}`,
        threadID
      );
      break;
    }

    /* ===== ANTI OUT ===== */
    case "9": {
      const data = (await Threads.getData(threadID)).data || {};
      data.antiout = !data.antiout;
      await Threads.setData(threadID, { data });
      api.sendMessage(
        `Anti-out ${data.antiout ? "enabled" : "disabled"}`,
        threadID
      );
      break;
    }

    /* ===== BOT INFO ===== */
    case "11": {
      const ping = Date.now();
      const uptime = process.uptime();
      api.sendMessage(
`🤖 Bot: ${global.config.BOTNAME}
⏱ Uptime: ${Math.floor(uptime / 60)} minutes
👥 Users: ${global.data.allUserID.length}
👨‍👩‍👧 Groups: ${global.data.allThreadID.length}
${handleOS(ping)}`,
        threadID
      );
      break;
    }

    /* ===== ADMIN BOT LIST ===== */
    case "14": {
      const admins = global.config.ADMINBOT || [];
      let msg = admins.map(id => `• fb.me/${id}`).join("\n");
      api.sendMessage(`👑 Admin Bots:\n${msg}`, threadID);
      break;
    }

    /* ===== GROUP LIST ===== */
    case "15": {
      const inbox = await api.getThreadList(200, null, ["INBOX"]);
      const groups = inbox.filter(t => t.isGroup);
      let txt = "📋 Group List\n";
      groups.forEach((g, i) => {
        txt += `${i + 1}. ${g.name}\nID: ${g.threadID}\n`;
      });
      api.sendMessage(txt, threadID);
      break;
    }
  }
};

/* ================== HANDLE EVENT ================== */
module.exports.handleEvent = async ({ api, event }) => {
  if (!fs.existsSync(totalPath)) fs.writeFileSync(totalPath, JSON.stringify({}));
};