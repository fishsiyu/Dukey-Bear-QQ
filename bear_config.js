var data = {
    // 基本设定
    basic_info: {
        server_address: "ws://x.x.x.x:xxxx",
        local_address: "ws://0.0.0.0:xxxx",
        server_address_h: "http://x.x.x.x:xxxx",
        local_address_h: "http://0.0.0.0:xxxx",
        port: "xxxx",
        authkey: "hiiambigfishfish",
        qq: "xxxxxxxxx",
        path: "/.../bear/...",
    },
    // 消息种类分类
    post_type: {
        MSG_GROUP: "GroupMessage",              // 群组消息
        MSG_PRIVATE: "FriendMessage",          // 私聊消息
        MSG_ADD: "CQGroupMemberAddRequestEvent",// 成员加群
        MSG_LEAVE: "CQMemberLeaveEvent",        // 成员减少
        MSG_MUTE: "CQGroupMuteChangeEvent",     // 成员禁言
    },
    // 群内权力
    group_role: {
        ROLE_OWNER: "OWNER",
        ROLE_ADMIN: "ADMINISTRATOR",
        ROLE_MEMBER: "MEMBER"
    },
    // 函数配置
    fun_info: {
        funStartWith: ["!", "！"]
    },
    // 管理
    gm: {
        admin: [785536588]
    },
    // 正则表达式
    reg: {
        cq_at: /\[CQ:at,qq=([0-9]+)\]/,
        cq_image: /\[CQ:image,(url)*(file)*=([a-zA-Z0-9:_=\/\.\-\?]+)\]/,
        brief: /[a-zA-Z0-9]+/
    },
    // 一些 url
    url: {
    }
}

module.exports = data