// Message.type = body.ClassType                                   // 消息类型
// Message.message_id = body.message_id                            // 消息id，唯一识别
// Message.group_id = body.group_id                                // 群号
// Message.user_id = body.user_id                                  // 用户QQ号
// Message.message = body.message                                  // 发言内容
// Message.name = body.sender ? body.sender.nickname : undefined   // 名字
// Message.role = body.sender ? body.sender.role : undefined       // 群权力
// Message.comment = body.comment                                  // 加群信息
// Message.flag = body.flag                                        // 加群识别码

let DATA = require("./bear_config")
let REQUEST = require("request")
let FS = require("fs")

var QUEST = (Url, Meth, Body) => {
    REQUEST({
        url: Url,
        method: Meth,
        json: true,
        headers: { "content-type": "application/json" },
        body: Body
    }, function (error, response, body) {
        if (error) console.log("error", error)
    })
}

var Format = {
    Public: (S, t, v) => {
        let chain = []
        let s = ""
        let regres = {}
        for (let i = 0; i < v.length;) {
            // 图片格式
            regres = DATA.reg.cq_image.exec(v.substr(i))
            if (regres !== null && regres.index === 0) {
                if (s !== "") {
                    chain.push({ "type": "Plain", "text": s })
                    s = ""
                }
                if (regres[1] === "url") {
                    chain.push({ "type": "Image", "url": regres[3] })
                } else if (regres[2] === "file") {
                    chain.push({ "type": "Image", "path": DATA.basic_info.path + "/" + regres[3] })
                }
                i += regres[0].length
                continue
            }
            // at格式
            regres = DATA.reg.cq_at.exec(v.substr(i))
            if (regres !== null && regres.index === 0) {
                chain.push({ "type": "At", "target": regres[1] })
                i += regres[0].length
                continue
            }
            // 无匹配格式，作为普通字符
            s += v[i]
            i++

        }
        if (s !== "") { // end handle
            chain.push({ "type": "Plain", "text": s })
        }

        let re = {
            "sessionKey": S,
            "target": t,
            "messageChain": chain
        }
        return re
    },
    Private: (t, v) => {
        let re = {
            "sessionKey": S,
            "target": t,
            "messageChain": [
                { "type": "Plain", "text": v }
            ]
        }
        return re
    }
}

var ws_function = {

    ////////////////////////////////////////////////////////////
    //                    CQ 函数
    ////////////////////////////////////////////////////////////

    /**
    * @method send_private_msg 发送私聊消息
    * @param {number} user_id QQ号
    * @param {string} speak 要发送的内容
    * @param {boolean} cq 消息内容是否作为纯文本发送（即不解析 CQ 码）
    */
    send_private_msg: function (bear, user_id, speak, cq) {
        if (cq === undefined) cq = "false"
        let body = {
            "action": "send_private_msg",
            "params": {
                "user_id": user_id,
                "message": speak,
                "auto_escape": cq
            }
        }
        bear.sendText(JSON.stringify(body))
    },

    /**
    * @method send_group_msg 主动发送群组消息
    * @param {number} group_id 群号
    * @param {string} speak 要发送的内容
    * @param {boolean} cq 消息内容是否作为纯文本发送（即不解析 CQ 码）
    */
    send_group_msg: function (bear, group_id, speak, cq) {
        if (cq === undefined) cq = "false"
        let body = {
            "action": "send_group_msg",
            "params": {
                "group_id": group_id,
                "message": speak,
                "auto_escape": cq
            }
        }
        bear.sendText(JSON.stringify(body))
    },

    /**
    * @method 撤回消息
    */
    delete_msg: function (bear, message_id) {
        let body = {
            "action": "delete_msg",
            "params": {
                "message_id": message_id
            }
        }
        bear.sendText(JSON.stringify(body))
    },

    /**
    * @method 撤回消息 处理加群请求
    * @param {string} flag 加群标识
    * @param {boolean} approve 是否同意
    * @param {string} reason 拒绝时的原因
    */
    set_group_add_request: function (bear, flag, approve, reason) {
        let body = {
            "action": "set_group_add_request",
            "params": {
                "flag": flag,
                "sub_type": "add",
                "approve": approve,
                "reason": reason
            }
        }
        bear.sendText(JSON.stringify(body))
    },

    /**
    * @method set_group_ban 设置单人禁言
    * @param {number} timeseconds 禁言时长-秒 
    */
    set_group_ban: function (bear, group_id, userid, timeseconds) {
        let body = {
            "action": "set_group_ban",
            "params": {
                "group_id": group_id,
                "user_id": userid,
                "duration": timeseconds
            }
        }
        bear.sendText(JSON.stringify(body))
    },

    /**
     * @method get_group_info 获取群信息
     */
    get_group_info: function (bear, group_id) {
        let body = {
            "action": "get_group_info",
            "params": {
                "group_id": group_id,
            }
        }
        bear.sendText(JSON.stringify(body))
    },

    ////////////////////////////////////////////////////////////
    //                    HTTP 函数
    ////////////////////////////////////////////////////////////

    send_private_msg_h: (qq, value) => {
        QUEST(DATA.basic_info.server_address_h + "/sendFriendMessage", "POST", Format.Private(qq, value))
    },

    send_group_msg_h: (session, qq, value) => {
        // console.log("SEND-", Format.Public(qq, value))
        QUEST(DATA.basic_info.server_address_h + "/sendGroupMessage", "POST", Format.Public(session, qq, value))
    },
    // TODO
    delete_msg_h: () => {

    },

    set_group_add_request_h: () => {

    },

    set_group_ban_h: () => {

    }
}


module.exports = ws_function