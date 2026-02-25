module.exports.config = {
  name: "listbox",
  version: "1.1.1",
  permission: 2,
  prefix: true,
  credits: "Joy",
  description: "List groups and ban/out via reply",
  category: "admin",
  usages: "[page]",
  cooldowns: 5
};

const BOX_TOP = "╭╼|━━━━━━━━━━━━━━|╾╮";
const BOX_BOTTOM = "╰╼|━━━━━━━━━━━━━━|╾╯";
const PER_PAGE = 25;

function toBox(content) {
  return `${BOX_TOP}\n${content}\n${BOX_BOTTOM}`;
}

module.exports.handleReply = async function({ api, event, Threads, handleReply }) {
  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;
  const body = (event.body || "").trim().toLowerCase();
  const match = body.match(/^(ban|out)\s+(\d+)$/i);
  if (!match) return api.sendMessage(toBox("Use: ban <no> or out <no>"), event.threadID, event.messageID);

  const action = match[1];
  const index = parseInt(match[2], 10);
  const idgr = handleReply.groupid[index - 1];
  if (!idgr) return api.sendMessage(toBox("Invalid number!"), event.threadID, event.messageID);

  if (action === "ban") {
    const data = (await Threads.getData(idgr)).data || {};
    data.banned = 1;
    await Threads.setData(idgr, { data });
    global.data.threadBanned.set(parseInt(idgr), 1);
    return api.sendMessage(toBox(`Banned thread: [${idgr}]`), event.threadID, event.messageID);
  }

  if (action === "out") {
    api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
    return api.sendMessage(toBox(`Left thread: [${idgr}]`), event.threadID, event.messageID);
  }
};

module.exports.run = async function({ api, event, args }) {
  const page = parseInt(args[0]) || 1;
  const inbox = await api.getThreadList(100, null, ["INBOX"]);
  const list = inbox.filter(g => g.isSubscribed && g.isGroup);
  const listthread = [];

  for (const group of list) {
    const info = await api.getThreadInfo(group.threadID);
    listthread.push({ id: group.threadID, name: group.name, sotv: info.userInfo.length });
  }

  const sorted = listthread.sort((a, b) => b.sotv - a.sotv);
  const start = (page - 1) * PER_PAGE;
  const pageItems = sorted.slice(start, start + PER_PAGE);
  let msg = "";
  let i = start + 1;
  const groupid = [];

  for (const g of pageItems) {
    msg += `${i++}. ${g.name}\n🤡 TID: ${g.id}\n✅ Members: ${g.sotv}\n\n`;
    groupid.push(g.id);
  }

  msg += `Reply "ban <no>" or "out <no>"`;

  api.sendMessage(toBox(msg), event.threadID, (err, data) => {
    if (err) return;
    global.client.handleReply.push({
      name: this.config.name,
      author: event.senderID,
      messageID: data.messageID,
      groupid,
      type: "reply"
    });
  });
};
