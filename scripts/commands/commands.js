const { execSync } = require("child_process");
const { join } = require("path");
const fs = require("fs-extra");

module.exports.config = {
  name: "cmd",
  version: "2.0.0",
  permission: 2,
  credits: "Joy",
  description: "Manage and control all bot modules with react confirmation",
  prefix: true,
  premium: false,
  category: "operator",
  usages: "[load/unload/loadAll/unloadAll/info] [command name]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "child_process": "",
    "path": ""
  },
};

function doLoad(moduleList) {
  const { configPath, mainPath, api } = global.client;
  const logger = require(mainPath + "/Joyc.js");
  const listPackage = JSON.parse(fs.readFileSync("./package.json")).dependencies;
  const listbuiltinModules = require("module").builtinModules;

  let loaded = [], errors = [];

  delete require.cache[require.resolve(configPath)];
  let configValue = require(configPath);
  fs.writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), "utf8");

  for (const nameModule of moduleList) {
    try {
      const dirModule = join(__dirname, `${nameModule}.js`);
      delete require.cache[require.resolve(dirModule)];
      const command = require(dirModule);

      if (!command.config || !command.config.name) throw new Error("Module is malformed!");

      global.client.commands.delete(nameModule);
      global.client.eventRegistered = global.client.eventRegistered.filter(i => i !== command.config.name);

      if (command.config.dependencies && typeof command.config.dependencies === "object") {
        for (const pkg in command.config.dependencies) {
          if (!listPackage[pkg] && !listbuiltinModules.includes(pkg)) {
            execSync(`npm install ${pkg}@${command.config.dependencies[pkg] || "latest"}`, { stdio: "inherit", env: process.env });
          }
          global.nodemodule[pkg] = require(pkg);
        }
      }

      global.client.commands.set(command.config.name, command);
      if (command.handleEvent) global.client.eventRegistered.push(command.config.name);

      if (global.config.commandDisabled.includes(`${nameModule}.js`)) {
        global.config.commandDisabled.splice(global.config.commandDisabled.indexOf(`${nameModule}.js`), 1);
        configValue.commandDisabled.splice(configValue.commandDisabled.indexOf(`${nameModule}.js`), 1);
      }

      logger.loader(`Loaded command ${command.config.name}`);
      loaded.push(nameModule);
    } catch (err) {
      errors.push(`${nameModule}: ${err.message}`);
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(configValue, null, 4), "utf8");
  fs.unlinkSync(configPath + ".temp");

  return { loaded, errors };
}

function doUnload(moduleList) {
  const { configPath, api } = global.client;

  delete require.cache[require.resolve(configPath)];
  let configValue = require(configPath);
  fs.writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), "utf8");

  for (const nameModule of moduleList) {
    global.client.commands.delete(nameModule);
    global.client.eventRegistered = global.client.eventRegistered.filter(i => i !== nameModule);
    if (!configValue.commandDisabled.includes(`${nameModule}.js`)) {
      configValue.commandDisabled.push(`${nameModule}.js`);
      global.config.commandDisabled.push(`${nameModule}.js`);
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(configValue, null, 4), "utf8");
  fs.unlinkSync(configPath + ".temp");
}

module.exports.run = async function ({ event, args, api }) {
  const { threadID, messageID, senderID } = event;
  const action = args[0];
  let moduleList = args.slice(1);

  switch (action) {

    case "load": {
      if (!moduleList.length) return api.sendMessage("❌ Command name দাও।", threadID, messageID);

      const existing = moduleList.filter(n => global.client.commands.has(n));
      const fresh = moduleList.filter(n => !global.client.commands.has(n));

      if (fresh.length) {
        const { loaded, errors } = doLoad(fresh);
        api.sendMessage(
          `✅ Loaded: ${loaded.join(", ") || "none"}${errors.length ? `\n❌ Errors:\n${errors.join("\n")}` : ""}`,
          threadID, messageID
        );
      }

      if (existing.length) {
        return api.sendMessage(
          `╭╼|━━━━━━━━━━━━━━|╾╮\n⚠️ নিচের command গুলো আগে থেকেই আছে:\n📦 ${existing.join(", ")}\n\n👉 Overwrite করতে চাইলে এই message এ ✅ react দাও।\n╰╼|━━━━━━━━━━━━━━|╾╯`,
          threadID,
          (err, info) => {
            if (err) return;
            global.client.handleReact.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: senderID,
              type: "confirmLoad",
              moduleList: existing
            });
          }
        );
      }
      return;
    }

    case "unload": {
      if (!moduleList.length) return api.sendMessage("❌ Command name দাও।", threadID, messageID);

      const exists = moduleList.filter(n => global.client.commands.has(n));
      const notFound = moduleList.filter(n => !global.client.commands.has(n));

      if (notFound.length) api.sendMessage(`⚠️ পাওয়া যায়নি: ${notFound.join(", ")}`, threadID, messageID);
      if (!exists.length) return;

      return api.sendMessage(
        `╭╼|━━━━━━━━━━━━━━|╾╮\n⚠️ নিচের command গুলো unload করবে:\n📦 ${exists.join(", ")}\n\n👉 Confirm করতে এই message এ ✅ react দাও।\n╰╼|━━━━━━━━━━━━━━|╾╯`,
        threadID,
        (err, info) => {
          if (err) return;
          global.client.handleReact.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "confirmUnload",
            moduleList: exists
          });
        }
      );
    }

    case "loadAll": {
      const all = fs.readdirSync(__dirname)
        .filter(f => f.endsWith(".js") && !f.includes("example"))
        .map(f => f.replace(/\.js$/, ""));

      return api.sendMessage(
        `╭╼|━━━━━━━━━━━━━━|╾╮\n📦 মোট ${all.length} টি command load হবে।\n\n👉 Confirm করতে এই message এ ✅ react দাও।\n╰╼|━━━━━━━━━━━━━━|╾╯`,
        threadID,
        (err, info) => {
          if (err) return;
          global.client.handleReact.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "confirmLoad",
            moduleList: all
          });
        }
      );
    }

    case "unloadAll": {
      const all = fs.readdirSync(__dirname)
        .filter(f => f.endsWith(".js") && !f.includes("example") && !f.includes("cmd"))
        .map(f => f.replace(/\.js$/, ""));

      return api.sendMessage(
        `╭╼|━━━━━━━━━━━━━━|╾╮\n⚠️ মোট ${all.length} টি command unload হবে!\n\n👉 Confirm করতে এই message এ ✅ react দাও।\n╰╼|━━━━━━━━━━━━━━|╾╯`,
        threadID,
        (err, info) => {
          if (err) return;
          global.client.handleReact.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "confirmUnload",
            moduleList: all
          });
        }
      );
    }

    case "info": {
      const cmd = global.client.commands.get(moduleList[0] || "");
      if (!cmd) return api.sendMessage(`❌ "${moduleList[0]}" command পাওয়া যায়নি।`, threadID, messageID);
      const p = cmd.config.permission;
      return api.sendMessage(
        `╭╼|━━━━━━━━━━━━━━|╾╮\n📦 ${cmd.config.name.toUpperCase()}\n👤 Credits: ${cmd.config.credits || "N/A"}\n🔢 Version: ${cmd.config.version || "N/A"}\n🔐 Permission: ${p === 0 ? "User" : p === 1 ? "Admin" : "Operator"}\n⏱ Cooldown: ${cmd.config.cooldowns || 0}s\n📎 Dependencies: ${Object.keys(cmd.config.dependencies || {}).join(", ") || "None"}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
        threadID, messageID
      );
    }

    case "list": {
      const cmds = [...global.client.commands.keys()];
      return api.sendMessage(
        `╭╼|━━━━━━━━━━━━━━|╾╮\n📋 Loaded Commands (${cmds.length})\n\n${cmds.join(", ")}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
        threadID, messageID
      );
    }

    default:
      return api.sendMessage(
        `⚙️ Usage:\n.cmd load <name>\n.cmd unload <name>\n.cmd loadAll\n.cmd unloadAll\n.cmd info <name>\n.cmd list`,
        threadID, messageID
      );
  }
};

module.exports.handleReact = async function ({ api, event, handleReact }) {
  const { threadID, senderID, reaction } = event;

  if (senderID !== handleReact.author) return;
  if (reaction !== "✅" && reaction !== "👍") return;

  const { type, moduleList } = handleReact;

  if (type === "confirmLoad") {
    const { loaded, errors } = doLoad(moduleList);
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n✅ Load সফল: ${loaded.join(", ") || "none"}${errors.length ? `\n❌ Errors:\n${errors.join("\n")}` : ""}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID
    );
  }

  if (type === "confirmUnload") {
    doUnload(moduleList);
    return api.sendMessage(
      `╭╼|━━━━━━━━━━━━━━|╾╮\n✅ Unload সফল: ${moduleList.join(", ")}\n╰╼|━━━━━━━━━━━━━━|╾╯`,
      threadID
    );
  }
};
