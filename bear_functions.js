let FS = require("fs")
let REQUEST = require("request")
let GM = require("gm").subClass({ imageMagick: true })
// let QRCODE = require("qrcode-reader")
let JIMP = require("jimp")
let CHEERIO = require("cheerio")

let DATA = require("./bear_config")
let BEAR_STATS = require("./bear_stats")

let FDATA = ""
let Linklist = ""   // 战绩绑定信息
let Statslist = ""  // 战绩存档信息
let IMAGE_PATH = "/.../bear/..."
let RealKeyList = []

FS.readFile("./bear_bindlist.json", (err, data) => {
    Linklist = JSON.parse(data.toString())
})
FS.readFile("./bear_stats_data.json", (err, data) => {
    Statslist = JSON.parse(data.toString())
})
FS.readFile("./bear_funs_data.json", (err, data) => {
    FDATA = JSON.parse(data.toString())
    setTimeout(() => {
        RealKeyList = FDATA.STATS_KEYS_TOTAL
        BEAR_STATS.Get_Playfab_Stats_Words_List().then(keyarr => {
            let send = ""
            keyarr.forEach(key => {
                if (RealKeyList.indexOf(key) === -1) {
                    RealKeyList.push(key)
                    send += key + "  "
                }
            })
            console.log(send === "" ? "nononononononew" : send)
        })
    }, 10000);

})

/**
 * 暂存变量
 */
let fox_array = []

/**
 * 系统函数 工具
 */
let tools = {

    msgFormat: function (body) {
        // let chain = body.messageChain
        // let sender = body.sender

        // let Message = {}

        // Message.type = body.type                                                        // 消息类型
        // Message.message_id = chain ? chain[0].id : undefined                            // 消息id，唯一识别

        // if (sender === undefined) {
        //     Message.group_id = undefined
        // } else {
        //     Message.group_id = sender.group ? sender.group.id : undefined                   // 群号

        // }

        // Message.user_id = sender ? sender.id : undefined                                // 用户QQ号
        // Message.message = chain ? FUNCTION_SYS.Tools.http_Msg_Parse(chain) : undefined  // 发言内容
        // Message.name = sender ? sender.memberName : undefined                           // 名字
        // Message.role = sender ? sender.permission : undefined                           // 群权力
        // // Message.comment = body.comment                                  // 加群信息
        // // Message.flag = body.flag                                        // 加群识别码
        // return Message
    },

    rnd: function (seed) {
        seed = (seed * 9301 + 49297) % 233280
        return seed / (233280.0)
    },
    rand: function (number) {
        if (number === undefined || typeof number !== "number") number = 1
        today = new Date()
        seed = today.getTime()
        return Math.ceil(tools.rnd(seed) * number)
    },
    /**
     * @method at 艾特某人的格式组装函数
     */
    at: function (user_id) {
        return "[CQ:at,qq=" + user_id + "]"
    },

    /**
     * @method filterEmpty 过滤含有空值的数组
     */
    filterEmpty: function (str) {
        return str !== ""
    },

    /**
    * @method convert 将文本转换成带CQ码的文本
    * @param {string} str 
    * @param {number} id 
    */
    convert: function (str, id) {
        str = str
            .replace(/\[艾特\]/g, "[CQ:at,qq=" + id + "]")
            .replace(/\[换行\]/g, `
`)
        return str
    },

    /**
     * @method randomDeal 处理分割随机字符串并随机选取
     * @param {string} str 
     */
    randomDeal: (str) => {
        let strarr = str.split("#").filter(tools.filterEmpty)
        for (let i = strarr.length - 1; i > 0; i--) {
            let end = strarr[i - 1].length - 1
            if (strarr[i - 1][end] === "/") {
                strarr[i - 1] = strarr[i - 1].slice(0, end - 1) + "#" + strarr[i]
                strarr.splice(i, 1)
            }
        }
        let rollnum = strarr.length
        return strarr[tools.rand(rollnum) - 1]
    },

    /**
     * @method judgeNumber 检验是否是纯数字串
     * @param {string} num_str 
     */
    judgeNumber: (num_str) => {
        if (num_str === undefined || num_str === null || num_str === "") return false
        let flag = true
        for (let i = num_str.length; i >= 0; i--) {
            if (num_str[i] < '0' || num_str[i] > '9') {
                flag = false
                break
            }
        }
        return flag
    },

    stats_Data_Convert: (arr, index) => {
        arr[0] = arr[0] + 1
        arr[1] = Math.floor(arr[1] / 3600)
        switch (index) {
            case 0:
                break
            case 1:
                break
            case 2:
                break
            case 3:
                break
            case 4:
                break
            case 5:
                arr[7] = arr[7] / 1000
                break
            case 6:
                break
            case 7:
                break
            case 8:
                break
            default:
                console.log("他喵的怎么可能这句话会被打印出来!")
                break
        }
        return arr
    },

    /**
     * @method Stats_Reply_Convert 战绩查询语言生成函数
     * @param {string} reply 回复模板
     * @param {string} name 名称
     * @param {array} arr 数据数组
     */
    stats_Reply_Convert: (reply, name, arr) => {
        let Reply = reply.replace("[名称]", name)
        arr.forEach((stat, index) => {
            Reply = Reply.replace("[变量]", stat)
        })
        return Reply
    },

    stats_Cal: (reply, arr, index) => {
        let kd, win, top, Reply
        Reply = reply
        switch (index) {
            case 0: // solo
                kd = (arr[2] / arr[3]).toFixed(2)
                win = (100 * arr[5] / arr[6]).toFixed(2)
                top = (100 * arr[7] / arr[6]).toFixed(2)
                Reply = Reply.replace("[计算]", kd).replace("[计算]", win).replace("[计算]", top)
                break
            case 1: // duos
                kd = (arr[2] / arr[3]).toFixed(2)
                win = (100 * arr[5] / arr[6]).toFixed(2)
                top = (100 * arr[7] / arr[6]).toFixed(2)
                Reply = Reply.replace("[计算]", kd).replace("[计算]", win).replace("[计算]", top)
                break
            case 2: // squads
                kd = (arr[2] / arr[3]).toFixed(2)
                win = (100 * arr[5] / arr[6]).toFixed(2)
                top = (100 * arr[7] / arr[6]).toFixed(2)
                Reply = Reply.replace("[计算]", kd).replace("[计算]", win).replace("[计算]", top)
                break
            case 3:
                break
            case 4:
                break
            case 5:
                break
            case 6:
                break
            case 7:
                kd = (arr[2] / arr[3]).toFixed(2)
                win = (100 * arr[5] / arr[6]).toFixed(2)
                top = (100 * arr[5] / arr[6]).toFixed(2)
                Reply = Reply.replace("[计算]", kd).replace("[计算]", win).replace("[计算]", top)
                break
            case 8:
                break
            case 9:
                kd = (arr[2] / arr[3]).toFixed(2)
                win = (100 * arr[5] / arr[6]).toFixed(2)
                top = (100 * arr[7] / arr[6]).toFixed(2)
                Reply = Reply.replace("[计算]", kd).replace("[计算]", win).replace("[计算]", top)
                break
            default:
                console.log("他喵的怎么可能这句话会在计算的时候被打印出来!")
                break
        }
        return Reply
    },

    http_Msg_Parse: (chain) => {
        let msgrow = ""
        for (let i = 0; i < chain.length; i++) {
            switch (chain[i].type) {
                case "Plain":
                    msgrow += chain[i].text
                    break
                case "At":
                    msgrow += ("[CQ:at,qq=" + chain[i].target + "]")
                    break
                case "Image":
                    msgrow += ("[CQ:image,url=" + chain[i].url + "]")
                    break
            }
        }
        return msgrow
    },

    QUEST: (Url, Meth, Body) => {
        return new Promise((resolve, reject) => {
            REQUEST({
                url: Url,
                method: Meth,
                json: true,
                headers: { "content-type": "application/json" },
                body: Body
            }, function (error, response, body) {
                if (error) {
                    console.log("error", error)
                    reject(-1)
                }
                resolve(body)
            })
        })
    }
}

/**
 * 函数 帮助说明
 * 添加函数时记得修改配置文件相应权限节点
 */
let help = {
    help: "hi，我是小熊熊。我可以做很多事情！[换行]关于 Super Animal Royale 的常规对话可以发送“帮助”来知晓。[换行]我可以执行命令，使用感叹号加命令的名称就可以运行。可执行的命令有：[换行]普通功能:[fun0][换行]群管理功能:[fun1][换行]管理员功能:[fun2]",
    test: "权力测试。999.1 998.1 997.1",
    roll: "使用 !roll 命令来从 1 到 6 产生随机数！[换行]你也可以自定义范围，如使用 !roll 64来产生从1到64的随机数~[换行]你也可以在后面跟多个自定义值（例如!roll 吃饭 睡觉）来从中随机抽取！自定义值之间用空格隔开。",
    pun: "使用 !pun 命令随机产生一条双关语。",
    bind: "使用 !bind 命令来绑定你的 Steam 账号。绑定之后你可以用 !stats 命令快速查询 SAR 战绩。[换行]使用格式为 “!bind steam个人主页链接” 或者 “!bind steam自定义主页链接的id”",
    vote: "使用 !vote 阵营名称 命令来选择你的阵营。查询战绩时，不同阵营的角色将被投递不同的档案袋！参数如下：[换行]normal - 普通小动物，saw - 超级动物世界，rebellion - 超级动物反抗军。",
    stats: "使用 !stats 参数 的指令来查询战绩。参数和查询内容对应如下：[换行]solo - 单排数据，duos - 双排数据，squads - 四排数据, combat - 战斗数据, events - 活动数据, other - 其他数据, other2 - 更多其他数据，ptr096 - 32v32，weapon - 武器击杀数据，mystery - 神秘模式数据[换行]首次使用 !stats 命令前请使用 !bind 您的Steam个人链接地址 来绑定您的账号",
    newstats: "使用 !newstats 命令来查询 clogg 填的新坑。",
    top: "根据战绩种类查询大佬有多牛逼",
    fun: "群功能管理。使用格式为：“!fun function_name value”",
    vip: "交易hehehe ~ ~  v_bear 。",
    reply: "自定义bear回复关键词和回复，请管理注意使用格式，不要不识抬举（doge[换行]对于关键词的检索有精准匹配和模糊匹配两种,精准匹配需要成员的发言与关键词完全匹配相等，模糊匹配为成员发言的发言包含关键词即可[换行]使用格式为：“!reply mode key <value>”。 mode: a - 精准匹配， b - 模糊匹配， c - 查询触发回复的词条[换行]添加一条模糊匹配的回复例子如下 “!reply b 篝火怎 篝火是balabala用的”。key的值中不可以含有空格，否则空格后的值会被识别成value的一部分。如果value的值为空则可移除改关键词的回复。[换行]支持随机回复，需要在每一项随机值前加上#符号，如果回复的内容要含有#而不作为随机分隔的话，请使用/#代替。如果是查询模式则返回所有关键词",
    setstats: "使用 !setstats 命令来将当前时间点设置为 “起点”，设置后在使用 !ckstats 命令时，可以查询从 “起点” 至今的战绩，而 “起点” 以前的战绩将会被忽略。",
    ckstats: "使用 !ckstats 命令来查询近期的战绩，用法与 !stats 命令相同。用该命令查询到的近期的游戏成绩，更能够反映您最近的真实状态，而不用受到以前的辣鸡战绩的影响。但是这个最近时间的 “起点” 值需要用 !setstats 命令来设置作为存档点。（贵族命令）",
    fox: "一张狐狸图片.jpg",
    sx: "能不能好好说话，只接受数字和字母",
    funother: "身在异乡心在里"
}

/**
 * bot管理员函数 实现
 */
let fun_gm = {
    test: function (cmd, array, Msg, list) {
        return new Promise((resolve, reject) => {
            resolve("你是999.1")
        })
    },
    newstats: function (cmd, array, Msg, list) {
        return new Promise((resolve, reject) => {
            if (array[0] === "help") {
                resolve(help[cmd])
            }
            BEAR_STATS.Get_Playfab_Stats_Words_List().then(keyarr => {
                let send = ""
                keyarr.forEach(key => {
                    if (FDATA.STATS_KEYS_TOTAL.indexOf(key) === -1) {
                        send += key + "  "
                    }
                })
                resolve(send.length === 0 ? "没有新增战绩类型" : ("新增了：" + send))
            })
        })
    },
    top: function (cmd, array, Msg, list) {
        return new Promise((resolve, reject) => {
            if (array[0] === undefined || array[0] === "help") {
                resolve(help[cmd])
            } else {
                BEAR_STATS.Get_Top_Stats_By_Key(array[0], parseInt(array[1]) - 1).then(v => {
                    resolve(array[0] + " 排名第 " + array[1] + " 的玩家值为：" + v)
                }).catch(e => {
                    resolve("获取失败")
                })
            }
        })
    },
    fun: function (cmd, array, Msg, list) {
        return new Promise((resolve, reject) => {
            if (array.length === 0 || (array[0] === "help" && array.length === 1)) {    // 返回帮助
                resolve(help[cmd])
            } else if (array.length !== 2) {                                            // 参数个数不正确
                resolve("参数个数不正确")
            } else {
                // 转换开启关闭格式
                if (array[1] === "true") {
                    array[1] = true
                } else if (array[1] === "false") {
                    array[1] = false
                } else {
                    resolve("没有改变配置")
                }
                // 查找配置
                let k_v = FDATA.KEYS_TO_FUNCTION[array[0]]
                if (k_v === undefined) {    // 未找到配置，查询函数
                    let flag = 0
                    if (fun_admin[array[0]] !== undefined) {
                        flag = 1
                        list["GROUP"][Msg.group_id][array[0]] = array[1]
                    }
                    if (fun_user[array[0]] !== undefined) {
                        flag = 1
                        list["GROUP"][Msg.group_id][array[0]] = array[1]
                    }
                    if (!flag) {
                        resolve("没有该项配置")
                    }
                } else {                    // 找到配置，导入配置中函数
                    k_v.forEach(v => {
                        list["GROUP"][Msg.group_id][v] = array[1]
                    })
                }

                FS.writeFile("./bear_list.json", JSON.stringify(list), err => {
                    if (err) { console.log(err) }
                    resolve("更改成功")
                })
            }
        })
    },
    vip: function (cmd, array, Msg, list) {
        return new Promise((resolve, reject) => {
            if (array[0] === undefined || array[0] === "help") {
                resolve(help[cmd])
            }
            let qq = DATA.reg.cq_at.exec(array[1])
            if (qq !== null) {
                qq = qq[1]
            } else {
                qq = array[1]
            }
            if (tools.judgeNumber(qq) === false) {
                resolve("失败")
            }
            switch (array[0]) {
                case "bear":
                    if (Linklist["vip"]["bear"].indexOf(qq) === -1) {
                        Linklist["vip"]["bear"].push(qq)
                        FS.writeFile("./bear_bindlist.json", JSON.stringify(Linklist), error => {
                            resolve("添加成功")
                        })
                    } else {
                        resolve("已经有了")
                    }
                    break
                case "fox":
                    if (Linklist["vip"]["fox"].indexOf(qq) === -1) {
                        Linklist["vip"]["fox"].push(qq)
                        FS.writeFile("./bear_bindlist.json", JSON.stringify(Linklist), error => {
                            resolve("添加成功")
                        })
                    } else {
                        resolve("已经有了")
                    }
                    break
                default:
                    resolve("还没出这个")
            }
        })
    },
    funother: function (cmd, array, Msg, list) {
        return new Promise((resolve, reject) => {
            if (array[0] === undefined || array[0] === "help") {
                resolve(help[cmd])
            } else if (array.length !== 3) {                                            // 参数个数不正确
                resolve("参数个数不正确")
            } else if (tools.judgeNumber(array[2]) !== true) {
                resolve("群号不是纯数字")
            } else {
                Msg.group_id = array[2]
                array.splice(2, 1)
                console.log(array)
                resolve(fun_gm.fun(cmd, array, Msg, list))
            }
        })
    }
}

/**
 * 群管理函数 实现
 */
let fun_admin = {
    test: function (cmd, array, Msg, reply) {
        return new Promise((resolve, reject) => {
            resolve("你是998.1")
        })
    },
    reply: function (cmd, array, Msg, reply) {
        // !reply b k v
        return new Promise((resolve, reject) => {
            if (array.length === 0 || array[0] === "help") {
                resolve(help[cmd])
            }
            let mode = ""
            switch (array[0]) {
                case "a":
                    mode = "WORD-REPLY"
                    break
                case "b":
                    mode = "WORD-VAGUE"
                    break
                case "list":
                    mode = "WORD-LIST"
                    break
                default:
                    resolve("模式参数不正确")
            }

            if (mode == "WORD-LIST") {
                // if (array[1] !== undefined) {
                // } else {
                resolve("精准触发的关键词有：[换行]" + Object.keys(reply["GROUP"][Msg.group_id]["WORD-REPLY"]) + "[换行]模糊触发的关键词有：[换行]" + Object.keys(reply["GROUP"][Msg.group_id]["WORD-VAGUE"]))
                // }
            }

            if (array[1] === undefined) {
                resolve("没有关键词信息")
            }
            if (array[2] !== undefined) {
                reply["GROUP"][Msg.group_id][mode][array[1]] = array.splice(2).join(" ")
            } else {
                delete reply["GROUP"][Msg.group_id][mode][array[1]]
            }
            FS.writeFile("./bear_reply.json", JSON.stringify(reply), error => {
                resolve("done")
            })
        })
    },
    sx: (cmd, array, Msg, reply) => {
        return new Promise((resolve, reject) => {
            if (array[0] == undefined || array[0] === "help") {
                resolve(help[cmd])
            }
            if (DATA.reg.brief.exec(array[0])[0].length !== array[0].length) {
                resolve("格式不对")
            }
            tools.QUEST(DATA.url.nbnhhsh, "POST", { text: array[0] }).then(body => {
                resolve(body[0]["trans"].join())
            })
        })
    }
}

/**
 * 自定义函数 实现
 */
let fun_user = {
    help: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            resolve(help[cmd]
                .replace("[fun0]", Object.keys(this))
                .replace("[fun1]", Object.keys(fun_admin))
                .replace("[fun2]", Object.keys(fun_gm)))
        })
    },
    test: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            resolve("你是997.1")
        })
    },
    roll: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            switch (array.length) {
                case 0:
                    resolve(String(tools.rand(6)) + " (1 - 6)")
                case 1:
                    if (array[0] === "help") {
                        resolve(help[cmd])
                    }
                    let radius = 6
                    if (tools.judgeNumber(array[0])) {
                        radius = parseInt(array[0])
                        if (radius < 1) {
                            radius = 1
                        }
                        if (radius > 99999) {
                            radius = 99999
                        }
                    }
                    resolve(String(tools.rand(radius)) + " (1 - " + radius + ")")
                default:
                    if (false) {

                    } else
                        resolve(array[tools.rand(array.length) - 1])
            }
        })
    },
    pun: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            let l = FDATA.pun_list.length
            resolve(FDATA.pun_list[tools.rand(l) - 1])
        })
    },
    bind: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            // 没有链接参数
            if (array.length === 0 || array[0] === "help") {
                resolve(help[cmd])
            }
            // 有链接参数
            else {
                // steamcommunity.com/profiles/xxxx/
                // steamcommunity.com/id/xxxx/
                let reg_prof = /\/profiles\/([\d]+)/    // 若识别出来，必为16位数字id
                let reg_id = /\/id\/([\w-]+)/           // 若识别出来，为id，如识别不出，则识别串可能本身为id
                let res_info = reg_prof.exec(array[0])
                let res_id = reg_id.exec(array[0])
                if (res_info !== null) {
                    res_info = res_info[1]
                }
                if (res_id === null) {
                    res_id = array[0]
                } else {
                    res_id = res_id[1]
                }
                let write16 = ""
                let writeid = ""
                // 根据 16 id 绑定
                if (tools.judgeNumber(res_info) && (res_info.length === 16 || res_info.length === 17)) {
                    BEAR_STATS.Get_Playfab_ID(res_info).then(p_id => {
                        if (p_id == undefined) {
                            resolve("未查到该账号的playfab id，可能为试玩玩家（无法查询），或者检查链接格式是否正确，或者先玩一下sar游戏再查。")
                        } else {
                            write16 = res_info
                            writeid = p_id
                            // 更新数据 - 重写文件
                            if (Linklist["bindlist"][Msg.user_id] !== undefined) {
                                Linklist["bindlist"][Msg.user_id]["id_16"] = write16
                                Linklist["bindlist"][Msg.user_id]["playfab"] = writeid
                            } else {
                                let temp = { "QQ": Msg.user_id, "id_16": write16, "playfab": writeid, "group": "" }
                                Linklist["bindlist"][Msg.user_id] = temp
                            }
                            FS.writeFile("./bear_bindlist.json", JSON.stringify(Linklist), error => {
                                if (error) {
                                    console.log(error)
                                    resolve("更新绑定列表出现了一个问题呢 ~")
                                } else {
                                    resolve("[艾特]绑定信息成功！")
                                }
                            })
                        }
                    }).catch(err => {
                        if (err == -1) {
                            resolve("绑定发生了一个意外！(到底是什么意外啊喂！")
                        }
                    })
                }
                // 联网查询id绑定
                else if (res_id !== null) {
                    REQUEST(FDATA.BIND_URL_ID + res_id, (err, res, body) => {
                        if (err) {
                            console.log(err)
                            resolve("绑定发生了一个意外！找狼问问呢")
                        } else {
                            let resopnse = JSON.parse(body).response
                            let numid = ""
                            if (resopnse !== undefined && resopnse.steamid !== undefined) {
                                numid = resopnse.steamid
                                BEAR_STATS.Get_Playfab_ID(numid).then(p_id => {
                                    if (p_id === undefined) {
                                        resolve("未查到该账号的playfab id，可能为试玩玩家（无法查询），或者检查链接格式是否正确，或者先玩一下sar游戏再查。")
                                    } else {
                                        write16 = numid
                                        writeid = p_id
                                        // 更新数据 - 重写文件
                                        if (Linklist["bindlist"][Msg.user_id] !== undefined) {
                                            Linklist["bindlist"][Msg.user_id]["id_16"] = write16
                                            Linklist["bindlist"][Msg.user_id]["playfab"] = writeid
                                        } else {
                                            let temp = { "QQ": Msg.user_id, "id_16": write16, "playfab": writeid, "group": "" }
                                            Linklist["bindlist"][Msg.user_id] = temp
                                        }
                                        FS.writeFile("./bear_bindlist.json", JSON.stringify(Linklist), error => {
                                            if (error) {
                                                console.log(error)
                                                resolve("更新绑定列表出现了一个问题呢 ~")
                                            } else {
                                                resolve("[艾特]绑定信息成功！")
                                            }
                                        })
                                    }
                                }).catch(err => {
                                    if (err == -1) {
                                        resolve("绑定发生了一个意外！(到底是什么意外啊喂！")
                                    }
                                })
                            } else {
                                resolve("未查到该用户，请检查一下id是否正确")
                            }
                        }
                    })
                } else {
                    resolve("[艾特]绑定失败，再检查一下链接格式吧！foxy~!")
                }
            }
        })
    },
    vote: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {

            array = array[0]
            if (array === undefined || array === "help") {
                resolve(help[cmd])
            } else {
                if (Linklist["bindlist"][Msg.user_id] === undefined) {
                    resolve("[艾特] 你还没有绑定玩家信息，先使用 !bind 你的 Steam 主页链接 绑定身份吧")
                }
                let replyvote = ""
                switch (array) {
                    case "rebellion":
                        Linklist["bindlist"][Msg.user_id].group = "rebellion"
                        replyvote = "[艾特] 同志，欢迎加入超级动物反抗军！*拍*"
                        break
                    case "saw":
                        Linklist["bindlist"][Msg.user_id].group = "saw"
                        replyvote = "[艾特] 员工，欢迎加入超级动物世界！*拍*"
                        break
                    case "normal":
                        Linklist["bindlist"][Msg.user_id].group = ""
                        replyvote = "[艾特] 你好，请到距离你最近的民政部门登记你的信息！*踢*"
                        break
                    case "SART":
                        if (Linklist["vip"]["bear"].indexOf(String(Msg.user_id)) !== -1) {
                            Linklist["bindlist"][Msg.user_id].group = "sart"
                            replyvote = "[艾特] 您好，欢迎加入贵宾俱乐部！在这个济济群英、鸾翔凤集的美丽动物世界，您将会成为其中最美丽而耀眼的一颗星 ~ 从现在开始，您可以探索其中的所有奥秘了！同时，您也将会拥有独一无二的信息体验，SART 团队竭诚为您服务 ~  *踹进*"
                        } else {
                            replyvote = "[艾特] 很抱歉，闲杂人员禁止入内，敬请谅解。*踹出*"
                        }
                        break
                    default:
                        replyvote = "[艾特] 有这个阵营？(歪头"
                        break
                }
                // 保存文件
                FS.writeFile("./bear_bindlist.json", JSON.stringify(Linklist), error => {
                    if (error) {
                        console.log(error)
                        resolve("系统出了一些故障，请您重新再进入一次吧！")
                    }
                    resolve(replyvote)
                })
            }
        })
    },
    // WARNING 多一个参数，请注意
    stats: function (cmd, array, Msg, minusobj) {
        console.log("stats")
        return new Promise((resolve, reject) => {
            array = array[0]
            if (array === undefined || array === "help") {
                resolve(help[cmd])
            }
            if (Linklist["bindlist"][Msg.user_id] === undefined) {
                resolve("你还没有绑定账号，请先使用 !bind 你的 Steam 主页链接 命令来绑定账号吧")
            }
            let ind = FDATA["STATS_COMMONDS"].indexOf(array)
            // 绑定 但 指令不合法
            if (ind === -1) {
                resolve("指令不合法，请检查一下")
            } else {
                // 开始处理
                let idontknowwhatnametotake = "p" + new Date().getTime() + tools.rand(9999)
                let group = Linklist["bindlist"][Msg.user_id]["group"]
                let playfabid = Linklist["bindlist"][Msg.user_id]["playfab"]
                let avatar = ""
                let name = ""
                let avater_null = false
                // 要查玩家名称
                console.log("go check stats num")
                REQUEST(FDATA.BIND_URL_INFO + Linklist["bindlist"][Msg.user_id]["id_16"], (err, res, body) => {
                    if (err) {
                        console.log(err)
                        resolve("查询用户信息发生了一个错误呢，请再查一次或者重新绑定一下账号吧")
                    } else if (JSON.parse(body).response.players[0] == undefined) {
                        resolve("没查到，重新绑定一下账号吧")
                    } else {
                        // 这个写法就看起来很傻逼，但是我也懒得优化了
                        avatar = JSON.parse(body).response.players[0].avatarmedium
                        name = JSON.parse(body).response.players[0].personaname
                        REQUEST({ url: avatar, encoding: "binary" }, (err, res, body) => {
                            if (err) {
                                console.log(err)
                                avater_null = true
                                // resolve("bear没找到你的头像所以罢工了，嘿嘿。")
                            }

                            // 同步写出头像文件
                            FS.writeFile(IMAGE_PATH + "/avatar" + idontknowwhatnametotake + ".jpg", body, "binary", err => {
                                setTimeout(() => {
                                    FS.unlink(IMAGE_PATH + "/avatar" + idontknowwhatnametotake + ".jpg", err => { })
                                }, 60000)
                                BEAR_STATS.Read_Playfab_Stats_By_Keys(playfabid, FDATA.STATS_KEYS_LIST[ind]).then(dataarr => {
                                    // 处理成为最近战绩数组
                                    if (minusobj !== undefined) {
                                        for (let i = 0; i < dataarr.length; i++) {
                                            let key = FDATA.STATS_KEYS_LIST[ind][i]
                                            if (key === "AccountLevelNew") continue
                                            let temp = minusobj[key]
                                            dataarr[i] -= (temp === undefined ? 0 : temp)
                                        }
                                    }
                                    // dataarr数据数组 ind第几种数据 name名字
                                    // 单位转换 - 等级 时间 行进距离
                                    dataarr = tools.stats_Data_Convert(dataarr, ind)
                                    // 组装回复文本 - 字符串
                                    let Rep = tools.stats_Reply_Convert(FDATA.STATS_RESPONSE_LIST_IMAGE[ind], name, dataarr)
                                    // 百分比数据计算 - 字符串中需要计算的还未替换的部分 kd winrate toprate
                                    Rep = tools.stats_Cal(Rep, dataarr, ind)
                                    // 转换换行
                                    let RepArr = tools.convert(Rep, Msg.user_id).split("[^分割$]")
                                    let gm_temp = ""
                                    switch (group) {
                                        case "":
                                            gm_temp = GM(IMAGE_PATH + "/stats-Brown-l.png")
                                            break
                                        case "sart":
                                            gm_temp = GM(IMAGE_PATH + "/stats-SART-l.png")
                                            break
                                        case "saw":
                                            gm_temp = GM(IMAGE_PATH + "/stats-SAW-l.png")
                                            break
                                        case "rebellion":
                                            gm_temp = GM(IMAGE_PATH + "/stats-Rebellion-l.png")
                                            break
                                        default:
                                            gm_temp = GM(IMAGE_PATH + "/stats-Brown-l.png")
                                            break
                                    }
                                    gm_temp
                                        .draw("image Over 210,75 0,0 '" + IMAGE_PATH + "/avatar" + (avater_null === false ? idontknowwhatnametotake : "_null") + ".jpg'")

                                        .fill('#000000')

                                        .font('font/SourceHanSerifSC-Medium.otf')
                                        .fontSize(22)
                                        .drawText(285, 100, RepArr[0])

                                        .font('font/WenYue-GuDianMingChaoTi-JRFC.otf')
                                        .fontSize((ind == 3 || ind == 5) ? 21 : 24)
                                        .drawText(215, 173, RepArr[1])

                                        .write(IMAGE_PATH + "/after" + idontknowwhatnametotake + ".png", err => {
                                            setTimeout(() => {
                                                FS.unlink(IMAGE_PATH + "/after" + idontknowwhatnametotake + ".png", err => { })
                                            }, 60000)
                                            if (err) {
                                                console.log(err)
                                                resolve("bear不想画画了，你战绩没了")
                                            } else {
                                                resolve("[CQ:image,file=" + "after" + idontknowwhatnametotake + ".png]")
                                            }
                                        })
                                }).catch(err => {
                                    if (err == -1) {
                                        resolve("[CQ:image,file=" + "stats.png]")
                                    }
                                })
                            })

                        })
                    }
                })
            }
        })
    },
    // 设定时间点
    setstats: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            if (array[0] === "help") {
                resolve(help[cmd])
            }
            if (Linklist["vip"]["fox"].indexOf(String(Msg.user_id)) === -1) {
                resolve("你好，你还不是 “fox” 级别贵宾，请先成为此级别贵宾再来试试吧！可以发送“打钱”试试")
            }
            if (Linklist["bindlist"][Msg.user_id] === undefined) {
                resolve("你还没有绑定查询战绩的账号，请先用 !bind 绑定一下吧！")
            }
            BEAR_STATS.Read_Playfab_Stats_By_Keys(Linklist["bindlist"][Msg.user_id]["playfab"], RealKeyList).then(dataarr => {
                let date = new Date()
                let statsObj = {
                    "time": "" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                }
                for (let i = 0; i < RealKeyList.length; i++) {
                    statsObj[RealKeyList[i]] = dataarr[i]
                }
                // console.log("LIST,", Statslist)
                // console.log("OBJ:", statsObj)
                Statslist[Msg.user_id] = statsObj
                console.log("LIST1,", Statslist)
                FS.writeFile("./bear_stats_data.json", JSON.stringify(Statslist), error => {
                    resolve("设置存档点成功")
                })
            })
        })
    },
    // 从时间点开始查询
    ckstats: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            if (array[0] === undefined || array[0] === "help") {
                resolve(help[cmd])
            }
            if (Linklist["vip"]["fox"].indexOf(String(Msg.user_id)) === -1) {
                resolve("你好，你还不是 “fox” 级别贵宾，请先成为此级别贵宾再来试试吧！")
            }
            if (Linklist["bindlist"][Msg.user_id] === undefined) {
                resolve("你还没有绑定查询战绩的账号，请先用 !bind 绑定一下吧！")
            }
            if (Statslist[Msg.user_id] === undefined) {
                resolve("你还没有设置存档点，请先使用一次 !setstats 命令，然后玩几局游戏再来查询吧！")
            }
            console.log("ck -> stats")
            fun_user.stats(cmd, array, Msg, Statslist[Msg.user_id]).then(ret => {
                resolve("从" + Statslist[Msg.user_id]["time"] + "到现在的数据：" + ret)
            })
        })
    },
    fox: function (cmd, array, Msg) {
        return new Promise((resolve, reject) => {
            if (array[0] === "help") {
                resolve(help[cmd])
            }
            if (fox_array.length < 10) {
                REQUEST("http://fox-info.net/fox-gallery", (err, res, body) => {
                    let $ = CHEERIO.load(body)
                    for (let i = 0; i < 45; i++) {
                        fox_array.push("[CQ:image,url=" + $(".gallery-icon img").eq(i).attr("src") + "]")
                    }
                    let one = fox_array.splice(0, 1)[0]
                    resolve(one)
                })
            } else {
                let one = fox_array.splice(0, 1)[0]
                resolve(one)
            }
        })
    }
}

let T = {
    Tools: tools,
    Fun_GM: fun_gm,
    Fun_admin: fun_admin,
    Fun: fun_user,
}

module.exports = T

//////////////////////
console.log(tools.rand(10000000) + " bear fun ver x.x.x")
//////////////////////