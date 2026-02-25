module.exports.config = {
  name: "autorep",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "CThanh",
  description: "create autorep for 1 message",
  prefix: true,
  category: "For Group Chat",
  usages: "[autorep] => [text need autorep]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": ""
  }
}

module.exports.onLoad = () => {
  const { existsSync, writeFileSync } = global.nodemodule["fs-extra"];
  if (!existsSync(__dirname + "/noprefix/autorep.json")) writeFileSync(__dirname + "/noprefix/autorep.json", JSON.stringify([]), 'utf-8');
  return;
}

module.exports.handleEvent = function({ api, event }) {
  const { readFileSync } = global.nodemodule["fs-extra"]; 
  if (event.type !== "message_unsend" && event.body.length !== -1) {
    const shortcut = JSON.parse(readFileSync(__dirname + "/noprefix/autorep.json"));
    if (shortcut.some(item => item.id == event.threadID)) {
      const getThread = shortcut.find(item => item.id == event.threadID).shorts;
      if (getThread.some(item => item.in == event.body)) {
        const shortOut = getThread.find(item => item.in == event.body).out;
        if (shortOut.indexOf(" | ") !== -1) {
          const arrayOut = shortOut.split(" | ");
          return api.sendMessage(`${arrayOut[Math.floor(Math.random() * arrayOut.length)]}`, event.threadID, event.messageID);
        }
        else return api.sendMessage(`${shortOut}`, event.threadID, event.messageID);
      }
    }
  }
}

module.exports.run = function({ api, event, args }) {
  const { readFile, writeFile } = global.nodemodule["fs-extra"];
  var { threadID, messageID } = event;
  var content = args.join(" ");
  if (!content) return api.sendMessage("Sai rồi", threadID, messageID);
  if (content.indexOf(`del`) == 0) {
    let delThis = content.slice(4, content.length);
    if (!delThis) return api.sendMessage("The autorep you need to delete was not found", threadID, messageID);
    return readFile(__dirname + "/noprefix/autorep.json", "utf-8", (err, data) => {
      if (err) throw err;
      var oldData = JSON.parse(data);
      var getThread = oldData.find(item => item.id == threadID).shorts;
      if (!getThread.some(item => item.in == delThis)) return api.sendMessage("The autorep you need to delete was not found", threadID, messageID);
      getThread.splice(getThread.findIndex(item => item.in === delThis), 1);
      writeFile(__dirname + "/noprefix/autorep.json", JSON.stringify(oldData), "utf-8", (err) => (err) ? console.error(err) : api.sendMessage("Deleted autorep successfully!", threadID, messageID));
    });
  }
  else if (content.indexOf(`all`) == 0)
    return readFile(__dirname + "/noprefix/autorep.json", "utf-8", (err, data) => {
      if (err) throw err;
      let allData = JSON.parse(data);
      let msg = '';
      if (!allData.some(item => item.id == threadID)) return api.sendMessage("There is no autorep at the moment", threadID, messageID);
      if (allData.some(item => item.id == threadID)) {
        let getThread = allData.find(item => item.id == threadID).shorts;
        getThread.forEach(item => msg = '\n' + msg + item.in + ' -> ' + item.out);
      }
      if (!msg) return api.sendMessage("There is no autorep at the moment 🦄💜", threadID, messageID);
      api.sendMessage("Here is the autorep included in the group: " + msg, threadID, messageID +"🦄💜");
    });
  else {
    let narrow = content.indexOf(" => ");
    if (narrow == -1) return api.sendMessage("You are using it wrong 🦄💜", threadID, messageID);
    let shortin = content.slice(0, narrow);
    let shortout = content.slice(narrow + 4, content.length);
    if (shortin == shortout) return api.sendMessage("2 different inputs and outputs 🦄💜", threadID, messageID);
    if (!shortin) return api.sendMessage("Lack of input", threadID, messageID);
    if (!shortout) return api.sendMessage("Lack of output", threadID, messageID);
    return readFile(__dirname + "/noprefix/autorep.json", "utf-8", (err, data) => {
      if (err) throw err;
      var oldData = JSON.parse(data);
      if (!oldData.some(item => item.id == threadID)) {
        let addThis = {
          id: threadID,
          shorts: []
        }
        addThis.shorts.push({ in: shortin, out: shortout });
        oldData.push(addThis);
        return writeFile(__dirname + "/noprefix/autorep.json", JSON.stringify(oldData), "utf-8", (err) => (err) ? console.error(err) : api.sendMessage("Create autorep successfully", threadID, messageID));
      }
      else {
        let getShort = oldData.find(item => item.id == threadID);
        if (getShort.shorts.some(item => item.in == shortin)) {
          let index = getShort.shorts.indexOf(getShort.shorts.find(item => item.in == shortin));
          let output = getShort.shorts.find(item => item.in == shortin).out;
          getShort.shorts[index].out = output + " | " + shortout;
          api.sendMessage("Autorep already exists in this group", threadID, messageID);
          return writeFile(__dirname + "/noprefix/autorep.json", JSON.stringify(oldData), "utf-8");
        }
        getShort.shorts.push({ in: shortin, out: shortout });
        return writeFile(__dirname + "/noprefix/autorep.json", JSON.stringify(oldData), "utf-8", (err) => (err) ? console.error(err) : api.sendMessage("Create autorep successfully", threadID, messageID));
      }
    });
  }
    }