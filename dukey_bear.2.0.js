let WS = require("nodejs-websocket")
let FS = require("fs")
let REQUEST = require("request")
let GM = require("gm").subClass({ imageMagick: true })
let QRCODE = require("qrcode-reader")
let JIMP = require("jimp")
let CHEERIO = require("cheerio")

let WSAPI = require("./bear_ws_api")            // ws api
let DATA = require("./bear_config")             // 配置文件
let FUNCTION_SYS = require("./bear_functions")  // 所有函数

let REPLY = ""                                  // 自定义问答
let LIST = ""                                   // 权限节点
let KEY = ""                                    // sessionkey

FS.readFile("./bear_reply.json", (err, data) => {
    REPLY = JSON.parse(data.toString())
})
FS.readFile("./bear_list.json", (err, data) => {
    LIST = JSON.parse(data.toString())
})

let bear_hear = WS.connect(DATA.basic_info.local_address + "/all?verifyKey=" + DATA.basic_info.authkey + "&qq=" + DATA.basic_info.qq)

// 错误侦听
bear_hear.on("error", err => console.log("HEAR", err))
bear_hear.on("text", str => {
    main(str)
})


let main = function (str) {

    let body = JSON.parse(str).data
    // console.log("BBODY,", body)

    if (KEY == "") {
        KEY = body.session
        console.log("KKK,", KEY)
    }

    let chain = body.messageChain
    let sender = body.sender

    let Message = {}

    Message.type = body.type                                                        // 消息类型
    Message.message_id = chain ? chain[0].id : undefined                            // 消息id，唯一识别

    if (sender === undefined) {
        Message.group_id = undefined
    } else {
        Message.group_id = sender.group ? sender.group.id : undefined               // 群号
    }

    Message.user_id = sender ? sender.id : undefined                                // 用户QQ号
    Message.message = chain ? FUNCTION_SYS.Tools.http_Msg_Parse(chain) : undefined  // 发言内容
    Message.name = sender ? sender.memberName : undefined                           // 名字
    Message.role = sender ? sender.permission : undefined                           // 群权力
    // Message.comment = body.comment                                  // 加群信息
    // Message.flag = body.flag                                        // 加群识别码

    if (JSON.stringify(Message) !== "{}") {
        console.log("MSG:", JSON.stringify(Message))
    }
    /**
     * 群组消息
     */
    if (Message.type === DATA.post_type.MSG_GROUP) {

        // 预处理
        if (REPLY["GROUP"][Message.group_id] === undefined) {
            REPLY["GROUP"][Message.group_id] = JSON.parse(JSON.stringify(REPLY["GROUP"].common))
            FS.writeFile("./bear_reply.json", JSON.stringify(REPLY), err => {
                if (err) { console.log("err", err) }
            })
        }
        if (LIST["GROUP"][Message.group_id] === undefined) {
            LIST["GROUP"][Message.group_id] = { "help": true }
            FS.writeFile("./bear_list.json", JSON.stringify(LIST), err => {
                if (err) { console.log("err", err) }
            })
        }

        // GM

        // 禁言

        // 二维码

        // 黑名单

        // 复读机

        /**
         * 普通处理消息流程
         */
        // 消息流程 - 命中函数，以函数形式处理
        if (DATA.fun_info.funStartWith.indexOf(Message.message[0]) !== -1) {
            let order_array = Message.message.substr(1).split(" ").filter(FUNCTION_SYS.Tools.filterEmpty)
            let order_cmd = order_array.splice(0, 1)[0]
            // 查找管理员函数并执行
            if (DATA.gm.admin.indexOf(Message.user_id) !== -1) {
                if (FUNCTION_SYS.Fun_GM[order_cmd] !== undefined) {
                    FUNCTION_SYS.Fun_GM[order_cmd](order_cmd, order_array, Message, LIST).then(ret => {
                        WSAPI.send_group_msg_h(KEY, Message.group_id, FUNCTION_SYS.Tools.convert(ret, Message.user_id))
                        // WSAPI.send_group_msg(bear_speak, Message.group_id, FUNCTION_SYS.Tools.convert(ret, Message.user_id))
                    })
                    return  // 命中bot管理员函数
                }
            }
            // 查找群管理函数并执行
            console.log(Message)
            if (Message.role === DATA.group_role.ROLE_OWNER ||
                Message.role === DATA.group_role.ROLE_ADMIN) {
                if (LIST["GROUP"][Message.group_id][order_cmd] === true &&
                    FUNCTION_SYS.Fun_admin[order_cmd] !== undefined) {
                    FUNCTION_SYS.Fun_admin[order_cmd](order_cmd, order_array, Message, REPLY).then(ret => {
                        WSAPI.send_group_msg_h(KEY, Message.group_id, FUNCTION_SYS.Tools.convert(ret, Message.user_id))
                        // WSAPI.send_group_msg(bear_speak, Message.group_id, FUNCTION_SYS.Tools.convert(ret, Message.user_id))
                    })
                    return  // 命中群管理员函数
                }
            }
            // 查找群成员函数并执行
            if (LIST["GROUP"][Message.group_id][order_cmd] === true &&
                FUNCTION_SYS.Fun[order_cmd] !== undefined) {
                FUNCTION_SYS.Fun[order_cmd](order_cmd, order_array, Message).then(ret => {
                    WSAPI.send_group_msg_h(KEY, Message.group_id, FUNCTION_SYS.Tools.convert(ret, Message.user_id))
                    // WSAPI.send_group_msg(bear_speak, Message.group_id, FUNCTION_SYS.Tools.convert(ret, Message.user_id))
                })
                return      // 命中普通函数
            }
        }
        // 消息流程 - 精准命中库中词汇，处理输出
        let reply_origin = REPLY["GROUP"][Message.group_id]["WORD-REPLY"][Message.message]
        if (reply_origin !== undefined) {
            WSAPI.send_group_msg_h(KEY, Message.group_id, FUNCTION_SYS.Tools.convert(FUNCTION_SYS.Tools.randomDeal(reply_origin), Message.user_id))
            // WSAPI.send_group_msg(bear_speak, Message.group_id, FUNCTION_SYS.Tools.convert(FUNCTION_SYS.Tools.randomDeal(reply_origin), Message.user_id))
            return          // 命中精确就返回
        }
        // 消息流程 - 模糊命中库中词汇
        let keys = Object.keys(REPLY["GROUP"][Message.group_id]["WORD-VAGUE"])
        for (let i = keys.length - 1; i >= 0; i--) {
            if (Message.message.indexOf(keys[i]) !== -1) {
                WSAPI.send_group_msg_h(KEY, Message.group_id, FUNCTION_SYS.Tools.convert(FUNCTION_SYS.Tools.randomDeal(REPLY["GROUP"][Message.group_id]["WORD-VAGUE"][keys[i]]), Message.user_id))
                // WSAPI.send_group_msg(bear_speak, Message.group_id, FUNCTION_SYS.Tools.convert(FUNCTION_SYS.Tools.randomDeal(REPLY["GROUP"][Message.group_id]["WORD-VAGUE"][keys[i]]), Message.user_id))
                return      // 命中模糊就返回
            }
        }
    }
    /**
     * 私聊消息
     */
    else if (Message.type === DATA.post_type.MSG_PRIVATE) {
        // WSAPI.send_private_msg(bear_speak, 785536588, '[CQ:rich,data={"app":"com.tencent.structmsg","config":{"autosize":true,"ctime":1602225509,"forward":true,"token":"62172a0445ee7fde2a4c808dbdaa1c12","type":"normal"},"desc":"音乐","extra":{"app_type":1,"appid":100495085,"msg_seq":6881506158205001525,"uin":785536588},"meta":{"music":{"action":"","android_pkg_name":"","app_type":1,"appid":100495085,"desc":"洛天依/ilem","jumpUrl":"https://y.music.163.com/m/song/1345872140/?userid=270312246&amp;app_version=7.3.20","musicUrl":"http://music.163.com/song/media/outer/url?id=1345872140&amp;userid=270312246","preview":"http://p3.music.126.net/eMyCr0gv0kPGlew9XTNjyA==/109951163944178164.jpg","sourceMsgId":"0","source_icon":"","source_url":"","tag":"网易云音乐","title":"勾指起誓"}},"prompt":"[分享]勾指起誓","ver":"0.0.0.1","view":"music"}][分享]勾指起誓\n洛天依/ilem\nhttps://y.music.163.com/m/song/1345872140/?userid=270312246&amp;app_version=7.3.20\n来自: 网易云音乐')
        // 重载指令只能外部执行
        if (DATA.gm.admin.indexOf(Message.user_id) !== -1) {
            switch (Message.message) {
                case "!reload":
                    delete require.cache[require.resolve("./bear_functions")]
                    FUNCTION_SYS = require("./bear_functions")
                    delete require.cache[require.resolve("./bear_config")]
                    DATA = require("./bear_config")
                    console.log("done")
                    // WSAPI.send_private_msg_h(Message.user_id, "完成")
                    // WSAPI.send_private_msg(bear_speak, Message.user_id, "完成")
                    return
                default:
                    break
            }
        }
        // 用户指令 管理员 和 普通好友
    }
    /**
     * 加群消息
     */
    else if (Message.type === DATA.post_type.MSG_ADD) {
        // let agree = 0
        // let refuseindex = 0
        // let answer = Message.comment.toLowerCase()
        // let key = REPLY["GROUP"][Message.group_id]["REFUSE_KEY"]
        // // 先遍历拒绝，再遍历同意，这样使得同意可以覆盖拒绝，优先级更高
        // for (refuseindex = key.length - 1; refuseindex >= 0; refuseindex--) {
        //     console.log("answer", answer, key[refuseindex], answer.indexOf(key[refuseindex]))
        //     if (answer.indexOf(key[refuseindex]) !== -1) {
        //         agree = -1
        //         break
        //     }
        // }
        // key = REPLY["GROUP"][Message.group_id]["AGREE_KEY"]
        // for (let i = key.length - 1; i >= 0; i--) {
        //     console.log("answer", answer, key[i], answer.indexOf(key[i]))
        //     if (answer.indexOf(key[i]) !== -1) {
        //         agree = 1
        //         break
        //     }
        // }
        // console.log("comment", answer)
        // console.log("agree", agree)
        // if (agree === 1) {
        //     WSAPI.set_group_add_request(bear_speak, Message.flag, true, "")
        // } else if (agree === -1) {
        //     WSAPI.set_group_add_request(bear_speak, Message.flag, false, REPLY["GROUP"][Message.group_id]["REFUSE_REASON"][refuseindex])
        // }
    }
    /**
     * 成员减少
     */
    else if (Message.type === DATA.post_type.MSG_LEAVE) {

    } else {

    }
}

/**
 * num1.num2.num3
 * num1: 大版本
 * num2: 功能改进
 * num3: 小修小补
 */
console.log(FUNCTION_SYS.Tools.rand(10000000) + " bear js ver x.x.x")