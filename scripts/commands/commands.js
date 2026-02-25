module.exports.config = {
  name: "cmd",
  version: "1.0.0",
  permission: 2,
  credits: "ryuko",
  description: "Manage and control all bot modules",
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

const loadCommand = function ({ moduleList, threadID, messageID }) {
  const { execSync } = global.nodemodule["child_process"];
  const { writeFileSync, unlinkSync, readFileSync } = global.nodemodule["fs-extra"];
  const { join } = global.nodemodule["path"];
  const { configPath, mainPath, api } = global.client;
  const logger = require(mainPath + "/Joyc.js");

  let errorList = [];
  delete require.cache[require.resolve(configPath)];
  let configValue = require(configPath);
  writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), "utf8");

  for (const nameModule of moduleList) {
    try {
      const dirModule = join(__dirname, `${nameModule}.js`);
      delete require.cache[require.resolve(dirModule)];
      const command = require(dirModule);

      if (!command.config || !command.config.name) {
        throw new Error("Module is malformed!");
      }

      global.client.commands.delete(nameModule);
      global.client.eventRegistered = global.client.eventRegistered.filter((item) => item !== command.config.name);

      if (command.config.dependencies && typeof command.config.dependencies === "object") {
        const listPackage = JSON.parse(readFileSync("./package.json")).dependencies;
        const listbuiltinModules = require("module").builtinModules;

        for (const packageName in command.config.dependencies) {
          try {
            if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) {
              global.nodemodule[packageName] = require(packageName);
            } else {
              execSync(
                `npm install ${packageName}@${command.config.dependencies[packageName] || "latest"}`,
                { stdio: "inherit", env: process.env }
              );
              global.nodemodule[packageName] = require(packageName);
            }
          } catch (error) {
            throw new Error(`Unable to install or load dependency '${packageName}'`);
          }
        }
      }

      global.client.commands.set(command.config.name, command);
      if (command.handleEvent) global.client.eventRegistered.push(command.config.name);

      if (global.config.commandDisabled.includes(`${nameModule}.js`)) {
        global.config.commandDisabled.splice(global.config.commandDisabled.indexOf(`${nameModule}.js`), 1);
        configValue.commandDisabled.splice(configValue.commandDisabled.indexOf(`${nameModule}.js`), 1);
      }

      logger.loader(`Loaded command ${command.config.name}`);
    } catch (error) {
      errorList.push(`${nameModule}: ${error.message}`);
    }
  }

  writeFileSync(configPath, JSON.stringify(configValue, null, 4), "utf8");
  unlinkSync(configPath + ".temp");

  return api.sendMessage(
    `Loaded ${moduleList.length - errorList.length} modules.\n${errorList.length > 0 ? "Errors:\n" + errorList.join("\n") : ""}`,
    threadID,
    messageID
  );
};

const unloadCommand = function ({ moduleList, threadID, messageID }) {
  const { writeFileSync, unlinkSync } = global.nodemodule["fs-extra"];
  const { configPath, api } = global.client;

  delete require.cache[require.resolve(configPath)];
  let configValue = require(configPath);
  writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), "utf8");

  for (const nameModule of moduleList) {
    global.client.commands.delete(nameModule);
    global.client.eventRegistered = global.client.eventRegistered.filter((item) => item !== nameModule);
    configValue.commandDisabled.push(`${nameModule}.js`);
    global.config.commandDisabled.push(`${nameModule}.js`);
  }

  writeFileSync(configPath, JSON.stringify(configValue, null, 4), "utf8");
  unlinkSync(configPath + ".temp");

  return api.sendMessage(`Unloaded ${moduleList.length} modules.`, threadID, messageID);
};

module.exports.run = function ({ event, args, api }) {
  const { readdirSync } = global.nodemodule["fs-extra"];
  const { threadID, messageID } = event;

  let moduleList = args.splice(1);

  switch (args[0]) {
    case "load":
      if (moduleList.length === 0) {
        return api.sendMessage("Module name cannot be empty.", threadID, messageID);
      }
      return loadCommand({ moduleList, threadID, messageID });

    case "unload":
      if (moduleList.length === 0) {
        return api.sendMessage("Module name cannot be empty.", threadID, messageID);
      }
      return unloadCommand({ moduleList, threadID, messageID });

    case "loadAll":
      moduleList = readdirSync(__dirname)
        .filter((file) => file.endsWith(".js") && !file.includes("example"))
        .map((file) => file.replace(/\.js$/, ""));
      return loadCommand({ moduleList, threadID, messageID });

    case "unloadAll":
      moduleList = readdirSync(__dirname)
        .filter((file) => file.endsWith(".js") && !file.includes("example") && !file.includes("cmd"))
        .map((file) => file.replace(/\.js$/, ""));
      return unloadCommand({ moduleList, threadID, messageID });

    case "info":
      const command = global.client.commands.get(moduleList[0] || "");
      if (!command) {
        return api.sendMessage("The module you entered does not exist.", threadID, messageID);
      }
      return api.sendMessage(
        `${command.config.name.toUpperCase()}\nCoded by: ${command.config.credits}\nVersion: ${command.config.version}\nPermission: ${
          command.config.permission === 0 ? "User" : command.config.permission === 1 ? "Admin" : "Bot Operator"
        }\nCooldown: ${command.config.cooldowns}s\nDependencies: ${Object.keys(command.config.dependencies || {}).join(", ") || "None"}`,
        threadID,
        messageID
      );

    default:
      return api.sendMessage("Invalid command. Use load, unload, loadAll, unloadAll, or info.", threadID, messageID);
  }
};
