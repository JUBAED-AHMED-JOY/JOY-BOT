/**
 * @author D-Jukie
 * @warn Do not edit code or edit credits
 * @src Disme Project
 * @bug fixed by @YanMaglinte
 */
module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../catalogs/Joyc.js");
    return async function ({ event }) {
        const { threadID, logMessageType, logMessageData } = event;
        const { setData, getData, delData, createData } = Threads;
        try {
            let dataThread = (await getData(threadID)).threadInfo;
            switch (logMessageType) {
                case "log:thread-admins": {
                    if (logMessageData.ADMIN_EVENT == "add_admin") {
                        dataThread.adminIDs.push({
                            id: logMessageData.TARGET_ID
                        })
                    } else if (logMessageData.ADMIN_EVENT == "remove_admin") {
                        dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.TARGET_ID);
                    }
                    logger('group data has been successfully updated' + threadID, 'database')
                    await setData(threadID, { threadInfo: dataThread });
                    break;
                }
                case "log:thread-name": {
                    logger('group data uccessfully updated the name in group ' + threadID, 'database')
                    dataThread.threadName = event.logMessageData.name
                    await setData(threadID, { threadInfo: dataThread });
                    break;
                }
                case "log:subscribe": {
                    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) return
                    for(let i of event.logMessageData.addedParticipants) {
                        dataThread.participantIDs.push(i.userFbId)
                    }
                    var data = await Threads.setData(event.threadID, {threadInfo: dataThread})
                    logger('added more participant in group data ' + threadID, 'database')
                    break;
                }
                case 'log:unsubscribe': {
                    if (logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
                        logger('deleted group data ' + threadID, 'database')
                        const index = global.data.allThreadID.findIndex(item => item == threadID);
                        global.data.allThreadID.splice(index, 1);
                        await delData(threadID);
                        return
                    } else {
                        const index = dataThread.participantIDs.findIndex(item => item == logMessageData.leftParticipantFbId);
                        dataThread.participantIDs.splice(index, 1);
                        if (dataThread.adminIDs.find(i => i.id == logMessageData.leftParticipantFbId)) {
                            dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id != logMessageData.leftParticipantFbId);
                        }
                        logger('deleted user data ' + logMessageData.leftParticipantFbId, 'database')
                        await setData(threadID, { threadInfo: dataThread });
                    }
                    break;
                }
            }
        } catch (e) {
            console.log('there was an error updating data: ' + e)
        }
        return;
    };
}