/* eslint-disable no-redeclare */
"use strict";
var utils = require("../utils");
var log = require("npmlog");
var mqtt = require('mqtt');
var websocket = require('websocket-stream');
var HttpsProxyAgent = require('https-proxy-agent');
var globalCallback, getSeqID, stopListen, form;
var topics = [
  "/legacy_web",
  "/webrtc",
  "/rtc_multi",
  "/onevc",
  "/br_sr", //Notification
  //Need to publish /br_sr right after this
  "/sr_res",
  "/t_ms",
  "/thread_typing",
  "/orca_typing_notifications",
  "/notify_disconnect",
  //Need to publish /messenger_sync_create_queue right after this
  "/orca_presence",
  //Will receive /sr_res right here.
  "/inbox",
  "/mercury",
  "/messaging_events",
  "/orca_message_notifications",
  "/pp",
  "/webrtc_response"
];

function markDelivery(ctx, api, threadID, messageID) {
  if (threadID && messageID && !ctx.stopListen) {
    api.markAsDelivered(threadID, messageID)
      .then(function () {
        return !ctx.globalOptions.autoMarkRead && ctx.stopListen ? null : api.markAsRead(threadID);
      })
      .catch(_ => {});
  }
}

function parseDelta(http, api, ctx, v) {
  if (v.delta.class == 'NewMessage') {
    if (ctx.globalOptions.pageID != v.queue) return;

    (function resolveAttachmentUrl(i) {
      if (v.delta.attachments && i == v.delta.attachments.length) {
        var fmtMsg;
        try {
          fmtMsg = utils.formatDeltaMessage(v);
        } catch (err) {
          return globalCallback({
            error: "Problem parsing message object. Please open an issue at https://github.com/KhangGia1810/fb-chat-support/issues.",
            detail: err,
            res: v,
            type: "parse_error"
          });
        }
        if (fmtMsg && ctx.globalOptions.autoMarkDelivery)
          markDelivery(ctx, api, fmtMsg.threadID, fmtMsg.messageID);
        
        !ctx.globalOptions.selfListen && fmtMsg.senderID == ctx.userID ? null : globalCallback(null, fmtMsg);
      } else {
        if (v.delta.attachments && v.delta.attachments[i].mercury.attach_type == "photo") {
          api.resolvePhotoUrl(v.delta.attachments[i].fbid)
            .then(url => {
              v.delta.attachments[i].mercury.metadata.url = url;
              resolveAttachmentUrl(i + 1);
            })
            .catch(_ => resolveAttachmentUrl(i + 1));
        } else resolveAttachmentUrl(i + 1);
      }
    })(0);
  }

  if (v.delta.class == 'ClientPayload') {
    var clientPayload = utils.decodeClientPayload(v.delta.payload);
    if (clientPayload && clientPayload.deltas) {
      clientPayload.deltas.map(function (delta) {
        if (delta.deltaMessageReaction && ctx.globalOptions.listenEvents) {
          globalCallback(null, {
            type: "message_reaction",
            threadID: (delta.deltaMessageReaction.threadKey.threadFbId ? delta.deltaMessageReaction.threadKey.threadFbId : delta.deltaMessageReaction.threadKey.otherUserFbId).toString(),
            messageID: delta.deltaMessageReaction.messageId,
            reaction: delta.deltaMessageReaction.reaction,
            senderID: delta.deltaMessageReaction.senderId.toString(),
            userID: delta.deltaMessageReaction.userId.toString()
          });
        } else if (delta.deltaRecallMessageData && ctx.globalOptions.listenEvents) {
          globalCallback(null, {
            type: "message_unsend",
            threadID: (delta.deltaRecallMessageData.threadKey.threadFbId ? delta.deltaRecallMessageData.threadKey.threadFbId : delta.deltaRecallMessageData.threadKey.otherUserFbId).toString(),
            messageID: delta.deltaRecallMessageData.messageID,
            senderID: delta.deltaRecallMessageData.senderID.toString(),
            deletionTimestamp: delta.deltaRecallMessageData.deletionTimestamp,
            timestamp: delta.deltaRecallMessageData.deletionTimestamp
          });
        } else if (delta.deltaMessageReply) {
           var mdata =
             delta.deltaMessageReply.message == undefined ? [] :
             delta.deltaMessageReply.message.data == undefined ? [] :
             delta.deltaMessageReply.message.data.prng == undefined ? [] :
             JSON.parse(delta.deltaMessageReply.message.data.prng);
          var m_id = mdata.map(u => u.i);
          var m_offset = mdata.map(u => u.o);
          var m_length = mdata.map(u => u.l);
          var mentions = {}

          for (var i = 0; i < m_id.length; i++) 
            mentions[m_id[i]] = (delta.deltaMessageReply.message.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);

          var callbackToReturn = {
            type: "message_reply",
            threadID: (delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId ? delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId : delta.deltaMessageReply.message.messageMetadata.threadKey.otherUserFbId).toString(),
            messageID: delta.deltaMessageReply.message.messageMetadata.messageId,
            senderID: delta.deltaMessageReply.message.messageMetadata.actorFbId.toString(),
            attachments: delta.deltaMessageReply.message.attachments.map(function (att) {
              var mercury = JSON.parse(att.mercuryJSON);
              Object.assign(att, mercury);
              return att;
            }).map(att => {
              var x;
              try {
                x = utils._formatAttachment(att);
              } catch (ex) {
                x = att;
                x.error = ex;
                x.type = "unknown";
              }
              return x;
            }),
            args: (delta.deltaMessageReply.message.body || "").trim().split(/\s+/),
            body: (delta.deltaMessageReply.message.body || ""),
            isGroup: !!delta.deltaMessageReply.message.messageMetadata.threadKey.threadFbId,
            mentions: mentions,
            timestamp: delta.deltaMessageReply.message.messageMetadata.timestamp,
            participantIDs: (delta.deltaMessageReply.message.participants || []).map(e => e.toString())
          }

          if (delta.deltaMessageReply.repliedToMessage) {
            mdata =
              delta.deltaMessageReply.repliedToMessage == undefined ? [] :
              delta.deltaMessageReply.repliedToMessage.data == undefined ? [] :
              delta.deltaMessageReply.repliedToMessage.data.prng == undefined ? [] :
              JSON.parse(delta.deltaMessageReply.repliedToMessage.data.prng);
            m_id = mdata.map(u => u.i);
            m_offset = mdata.map(u => u.o);
            m_length = mdata.map(u => u.l);
            var rmentions = {}

            for (var i = 0; i < m_id.length; i++) 
              rmentions[m_id[i]] = (delta.deltaMessageReply.repliedToMessage.body || "").substring(m_offset[i], m_offset[i] + m_length[i]);

            callbackToReturn.messageReply = {
              threadID: (delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId ? delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId : delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.otherUserFbId).toString(),
              messageID: delta.deltaMessageReply.repliedToMessage.messageMetadata.messageId,
              senderID: delta.deltaMessageReply.repliedToMessage.messageMetadata.actorFbId.toString(),
              attachments: delta.deltaMessageReply.repliedToMessage.attachments.map(function (att) {
                var mercury = JSON.parse(att.mercuryJSON);
                Object.assign(att, mercury);
                return att;
              }).map(att => {
                var x;
                try {
                  x = utils._formatAttachment(att);
                } catch (ex) {
                  x = att;
                  x.error = ex;
                  x.type = "unknown";
                }
                return x;
              }),
              args: (delta.deltaMessageReply.repliedToMessage.body || "").trim().split(/\s+/),
              body: delta.deltaMessageReply.repliedToMessage.body || "",
              isGroup: !!delta.deltaMessageReply.repliedToMessage.messageMetadata.threadKey.threadFbId,
              mentions: rmentions,
              timestamp: delta.deltaMessageReply.repliedToMessage.messageMetadata.timestamp,
              participantIDs: (delta.deltaMessageReply.repliedToMessage.participants || []).map(e => e.toString())
            }
          } else if (delta.deltaMessageReply.replyToMessageId) {
            http
              .post('https://www.facebook.com/api/graphqlbatch/', ctx.jar, {
                av: ctx.globalOptions.pageID,
                queries: JSON.stringify({
                  o0: {
                    //Using the same doc_id as forcedFetch
                    doc_id: "2848441488556444",
                    query_params: {
                      thread_and_message_id: {
                        thread_id: callbackToReturn.threadID,
                        message_id: delta.deltaMessageReply.replyToMessageId.id
                      }
                    }
                  }
                })
              })
              .then(utils.parseAndCheckLogin(ctx, http))
              .then(function (res) {
                if (res[res.length - 1].error_results > 0) 
                  throw res[0].o0.errors;
                if (res[res.length - 1].successful_results === 0) 
                  throw { error: "forcedFetch: there was no successful_results", res };
                var fetchData = res[0].o0.data.message;
                var mobj = {};

                for (var n in fetchData.message.ranges) 
                  mobj[fetchData.message.ranges[n].entity.id] = (fetchData.message.text || "").substr(fetchData.message.ranges[n].offset, fetchData.message.ranges[n].length);

                callbackToReturn.messageReply = {
                  threadID: callbackToReturn.threadID,
                  messageID: fetchData.message_id,
                  senderID: fetchData.message_sender.id.toString(),
                  attachments: fetchData.message.blob_attachment.map(att => {
                    var x;
                    try {
                      x = utils._formatAttachment({ blob_attachment: att });
                    } catch (ex) {
                      x = att;
                      x.error = ex;
                      x.type = "unknown";
                    }
                    return x;
                  }),
                  args: (fetchData.message.text || "").trim().split(/\s+/) || [],
                  body: fetchData.message.text || "",
                  isGroup: callbackToReturn.isGroup,
                  mentions: mobj,
                  timestamp: parseInt(fetchData.timestamp_precise)
                }
              })
              .catch(err => log.error('forcedFetch', err))
              .finally(function () {
                if (ctx.globalOptions.autoMarkDelivery) 
                  markDelivery(ctx, api, callbackToReturn.threadID, callbackToReturn.messageID);
                !ctx.globalOptions.selfListen && callbackToReturn.senderID === ctx.userID ? null : globalCallback(null, callbackToReturn);
              });
          } else {
            callbackToReturn.delta = delta;
            if (ctx.globalOptions.autoMarkDelivery) 
              markDelivery(ctx, api, callbackToReturn.threadID, callbackToReturn.messageID);
          }
          !ctx.globalOptions.selfListen && callbackToReturn.senderID == ctx.userID ? null : globalCallback(null, callbackToReturn);
        }
      });
      return;
    }
  }

  if (!ctx.globalOptions.listenEvents) return;
  switch (v.delta.class) {
    case 'ReadReceipt':
      try {
        globalCallback(null, utils.formatDeltaReadReceipt(v.delta));
      } catch (e) {
        globalCallback({
          error: "Problem parsing message object. Please open an issue at https://github.com/KhangGia1810/fb-chat-support/issues.",
          detail: e,
          res: v.delta,
          type: "parse_error"
        });
      }
      break;
    case 'ForcedFetch':
      if (!v.delta.threadKey) break;
      var mid = v.delta.messageId;
      var tid = v.delta.threadKey.threadFbId;
      if (!mid && !tid) break;
      form = {
        av: ctx.globalOptions.pageID,
        queries: JSON.stringify({
          o0: {
            //This doc_id is valid as of March 25, 2020
            doc_id: "2848441488556444",
            query_params: {
              thread_and_message_id: {
                thread_id: tid.toString(),
                message_id: mid,
              }
            }
          }
        })
      }
      http
        .post('https://www.facebook.com/api/graphqlbatch/', ctx.ja, form)
        .then(utils.parseAndCheckLogin(ctx, http))
        .then(function (res) {
          if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
          if (res[res.length - 1].successful_results === 0) throw { error: "forcedFetch: there was no successful_results", res };
          var fetchData = res[0].o0.data.message;
          if (utils.getType(fetchData) != 'Object')
            throw { type: 'unknown', res: fetchData }

          switch (fetchData.__typename) {
            case 'ThreadImageMessage':
              if ((!ctx.globalOptions.selfListen && fetchData.message_sender.id.toString() == ctx.userID) || !ctx.loggedIn) break;
              globalCallback(null, {
                type: "change_thread_image",
                threadID: utils.formatID(tid.toString()),
                snippet: fetchData.snippet,
                timestamp: fetchData.timestamp_precise,
                author: fetchData.message_sender.id,
                image: {
                  attachmentID: fetchData.image_with_metadata && fetchData.image_with_metadata.legacy_attachment_id,
                  width: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.x,
                  height: fetchData.image_with_metadata && fetchData.image_with_metadata.original_dimensions.y,
                  url: fetchData.image_with_metadata && fetchData.image_with_metadata.preview.uri
                }
              });
              break;
            case 'UserMessage':
              globalCallback(null, {
                type: "message",
                senderID: utils.formatID(fetchData.message_sender.id),
                args: (fetchData.message.text || "").trim().split(/\s+/),
                body: fetchData.message.text || "",
                threadID: utils.formatID(tid.toString()),
                messageID: fetchData.message_id,
                attachments: [{
                  type: "share",
                  ID: fetchData.extensible_attachment.legacy_attachment_id,
                  url: fetchData.extensible_attachment.story_attachment.url,
                  title: fetchData.extensible_attachment.story_attachment.title_with_entities.text,
                  description: fetchData.extensible_attachment.story_attachment.description.text,
                  source: fetchData.extensible_attachment.story_attachment.source,
                  image: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).uri,
                  width: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).width,
                  height: ((fetchData.extensible_attachment.story_attachment.media || {}).image || {}).height,
                  playable: (fetchData.extensible_attachment.story_attachment.media || {}).is_playable || false,
                  duration: (fetchData.extensible_attachment.story_attachment.media || {}).playable_duration_in_ms || 0,
                  subattachments: fetchData.extensible_attachment.subattachments,
                  properties: fetchData.extensible_attachment.story_attachment.properties,
                }],
                mentions: {},
                timestamp: parseInt(fetchData.timestamp_precise),
                isGroup: (fetchData.message_sender.id != tid.toString())
              });
              break;
            default:
              break;
          }
        })
        .catch(err => log.error('forcedFetch', err))
        .finally(function () {
          if (ctx.globalOptions.autoMarkDelivery) 
            markDelivery(ctx, api, tid, mid);
        });
      break;
    case 'ThreadName':
    case 'ParticipantsAddedToGroupThread':
    case 'ParticipantLeftGroupThread':
      try {
        var formattedEvent = utils.formatDeltaEvent(v.delta);
        if ((!ctx.globalOptions.selfListen && formattedEvent.author.toString() === ctx.userID) || !ctx.loggedIn) break;
        globalCallback(null, formattedEvent);
      } catch (e) {
        globalCallback({
          error: "Problem parsing message object. Please open an issue at https://github.com/KhangGia1810/fb-chat-support/issues.",
          detail: e,
          res: v.delta,
          type: "parse_error"
        });
      }
      break;
    case 'AdminTextMessage':
      switch (v.delta.type) {
        case 'unpin_messages_v2':
        case 'pin_messages_v2':
        case 'change_thread_theme':
        case 'change_thread_icon':
        case 'change_thread_nickname':
        case 'change_thread_admins':
        case 'change_thread_approval_mode':
        case 'joinable_group_link_mode_change':
        case 'rtc_call_log':
        case 'group_poll':
        case 'update_vote':
        case 'magic_words':
        case 'messenger_call_log':
        case 'participant_joined_group_call':
          try {
            globalCallback(null, utils.formatDeltaEvent(v.delta));
          } catch (e) {
            globalCallback({
              error: "Problem parsing message object. Please open an issue at https://github.com/KhangGia1810/fb-chat-support/issues.",
              detail: e,
              res: v.delta,
              type: "parse_error"
            });
          }
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
  return;
}

function listenMqtt(http, api, ctx) {
  var rtListen = new Promise(function (resolve) {
    stopListen = function () {
      globalCallback = () => {}
      ctx.stopListen = true;
      ctx.mqttClient
        .unsubscribe('/webrtc')
        .unsubscribe('/rtc_multi')
        .unsubscribe('/onevc')
        .publish('/browser_close', '{}')
        .end();
      return resolve();
    }
  });

  var chatOn = ctx.globalOptions.online;
  var foreground = false;
  var sessionID = Math.floor(Math.random() * 9007199254740991) + 1;
  var username = {
    u: ctx.userID,
    s: sessionID,
    chat_on: chatOn,
    fg: foreground,
    d: utils.getGUID(),
    ct: "websocket",
    //App id from facebook
    aid: "219994525426954",
    mqtt_sid: "",
    cp: 3,
    ecp: 10,
    st: [],
    pm: [],
    dc: "",
    no_auto_fg: true,
    gas: null,
    pack: []
  }
  
  let host;
  if (ctx.mqttEndpoint) host = `${ctx.mqttEndpoint}&sid=` + sessionID;
  else if (ctx.region) host = `wss://edge-chat.facebook.com/chat?region=${ctx.region.toLocaleLowerCase()}&sid=` + sessionID;
  else host = `wss://edge-chat.facebook.com/chat?sid=` + sessionID;

  var options = {
    clientId: "mqttwsclient",
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    username: JSON.stringify(username),
    clean: true,
    wsOptions: {
      headers: {
        'Cookie': ctx.jar.getCookies("https://www.facebook.com").join("; "),
        'Origin': 'https://www.facebook.com',
        'User-Agent': ctx.globalOptions.userAgent,
        'Referer': 'https://www.facebook.com/',
        'Host': new URL(host).hostname
      },
      origin: 'https://www.facebook.com',
      protocolVersion: 13
    },
    keepalive: 10,
    reschedulePings: false
  }
  
  if (ctx.globalOptions.proxy) {
    var agent = new HttpsProxyAgent(ctx.globalOptions.proxy);
    options.wsOptions.agent = agent;
  }

  ctx.mqttClient = new mqtt.Client(_ => websocket(host, options.wsOptions), options);
  var mqttClient = ctx.mqttClient;

  mqttClient
    .on('error', function (err) {
      log.error('listenMqtt', err);
      if (!ctx.globalOptions.autoReconnect) {
        globalCallback({ 
          type: "stop_listen", 
          error: "Connection refused: Server unavailable" 
        });
        return stopListen();
      }
      mqttClient.end();
      return getSeqID();
    })
    .on('connect', function () {
      topics.forEach(topicsub => mqttClient.subscribe(topicsub));
      var topic;
      var queue = {
        sync_api_version: 10,
        max_deltas_able_to_process: 1000,
        delta_batch_size: 500,
        encoding: 'JSON',
        entity_fbid: ctx.userID,
      }

      if (ctx.syncToken) {
        topic = '/messenger_sync_get_diffs';
        queue.last_seq_id = ctx.lastSeqId;
        queue.sync_token = ctx.syncToken;
      } else {
        topic = '/messenger_sync_create_queue';
        queue.initial_titan_sequence_id = ctx.lastSeqId;
        queue.device_params = null;
      }

      mqttClient
        .publish(topic, JSON.stringify(queue), { qos: 1, retain: false })
        .publish('/foreground_state', JSON.stringify({ foreground: chatOn }), { qos: 1 });
    })
    .on('message', function (topic, message) {
      var Message = JSON.parse(message);

      if (topic === "/t_ms") {
        if (Message.firstDeltaSeqId && Message.syncToken) {
          ctx.lastSeqId = Message.firstDeltaSeqId;
          ctx.syncToken = Message.syncToken;
        }
        if (Message.lastIssuedSeqId) ctx.lastSeqId = parseInt(Message.lastIssuedSeqId);
        
        for (var i in Message.deltas) {
          var delta = Message.deltas[i];
          parseDelta(http, api, ctx, { delta });
        }
      } else if (topic == '/thread_typing' || topic == '/orca_typing_notifications') {
        var typ = {
          type: "typ",
          isTyping: !!Message.state,
          from: Message.sender_fbid.toString(),
          threadID: utils.formatID((Message.thread || Message.sender_fbid).toString())
        }
        globalCallback(null, typ);
      } else if (topic === "/orca_presence") {
        if (!ctx.globalOptions.updatePresence) {
          for (var i in Message.list) {
            var data = Message.list[i];
            var userID = data.u;
            var presence = {
              type: "presence",
              userID: userID.toString(),
              timestamp: data.l * 1000,
              statuses: data.p
            }
            globalCallback(null, presence);
          }
        }
      }
    });
  
  return rtListen;
}

module.exports = function (http, api, ctx) {
  getSeqID = function () {
    ctx.t_mqttCalled = false;
    http
      .post('https://www.facebook.com/api/graphqlbatch/', ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, http))
      .then(function (res) {
        if (!Array.isArray(res)) {
          ctx.loggedIn = false;
          throw { error: 'Not logged in.', res }
        }
        if (res[res.length - 1].error_results > 0) throw res[0].o0.errors;
        if (res[res.length - 1].successful_results === 0) throw { error: "getSeqID: there was no successful_results", res }
        if (res[0].o0.data.viewer.message_threads.sync_sequence_id) {
          ctx.lastSeqId = res[0].o0.data.viewer.message_threads.sync_sequence_id;
          ctx.stopListen = false;
          return listenMqtt(http, api, ctx);
        } 
        throw { error: "getSeqID: no sync_sequence_id found.", res }
      })
      .catch(function (err) {
        log.error("getSeqID", err);
        return globalCallback(err);
      });
  }
  
  return function startListen(callback) {
    if (typeof callback == 'function') globalCallback = callback;
    else globalCallback = () => {}
    if (!ctx.firstListen) ctx.lastSeqId = null;
    delete ctx.syncToken;

    form = {
      av: ctx.globalOptions.pageID,
      queries: JSON.stringify({
        o0: {
          doc_id: "3336396659757871",
          query_params: {
            limit: 1,
            before: null,
            tags: ["INBOX"],
            includeDeliveryReceipts: false,
            includeSeqID: true
          }
        }
      })
    }

    getSeqID();
    ctx.firstListen = false;

    return function Disconnect() {
      return stopListen();
    }
  }
}