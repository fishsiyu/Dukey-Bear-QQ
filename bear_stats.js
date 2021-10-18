var SEARCH_NAME = "Presents"
var START_POS = 99
var SEARCH_NUM = 10

var PlayFab = require("playfab-sdk/Scripts/PlayFab/PlayFab")
var PlayFabClient = require("playfab-sdk/Scripts/PlayFab/PlayFabClient")
var PlayFabServer = require("playfab-sdk/Scripts/PlayFab/PlayFabServer")
var info = {}

// 导出的对象
var BEAR_STATS = {}

function LoginWithCusID() {
    console.log('start login!')
    PlayFab.settings.titleId = "xxxx";
    var loginRequest = {
        TitleId: PlayFab.settings.titleId,
        CustomId: "bigfishfish_want_to_make_loxx",
        CreateAccount: true
    };
    PlayFabClient.LoginWithCustomID(loginRequest, LoginCallback);
}

function LoginWithCusID_Time() {
    console.log('start login!')
    PlayFab.settings.titleId = "d36d";
    var loginRequest = {
        TitleId: PlayFab.settings.titleId,
        CustomId: "bigfishfish_want_to_make_loxx",
        CreateAccount: true
    };
    PlayFabClient.LoginWithCustomID(loginRequest, LoginCallback);
    setTimeout(LoginWithCusID_Time, 86300000);
}

/**
 * 服务器的登录
 */
function LoginCallback(error, result) {
    console.log('log_err---:', error)
    if (error) {
        setTimeout(() => {
            LoginWithCusID()
        }, 1000);
        return
    }
    info.code = result.code;
    info.status = result.status;
    info.SessionTicket = result.data.SessionTicket;
    info.PlayFabId = result.data.PlayFabId;
    info.NewlyCreated = result.data.NewlyCreated;
    info.LastLoginTime = result.data.LastLoginTime;
    info.EntityToken = result.data.EntityToken.EntityToken;
    info.TokenExpiration = result.data.EntityToken.TokenExpiration;
    info.Entity = result.data.EntityToken.Entity;
    // console.log('info---:', info)

    // DoGetPlayerCombinedInfo("6AD1F6DA85E76228");
    // DoGetCatalogItems();
    // DoGetAccountInfo();
    // DoGetPlayFabIDsFromSteamIDs();
    // DoGetPlayerProfile();
    // DoGetAllUsersCharacters();
    // GetCharacterLeaderboard();
    // GetLeaderboard(); // 
    // GetPlayerStatistics();
    // GetGameServerRegions();
    // GetUserInternalData();
    // SGetPlayerStatistics();
    // GetLeaderboardAroundPlayer()
}

/**
 * GetPlayerCombinedInfo
 * 获取玩家所有信息
 */
function DoGetPlayerCombinedInfo(p_id) {
    var quest = {
        "PlayFabId": p_id,
        "InfoRequestParameters": {
            "GetUserAccountInfo": false, // 账户信息
            "GetUserInventory": false,
            "GetUserVirtualCurrency": false,
            "GetUserData": false,
            // "UserDataKeys": [
            //     "preferences",
            //     "progress"
            // ],
            "GetUserReadOnlyData": false,
            "GetCharacterInventories": false,
            "GetCharacterList": false,
            "GetTitleData": false, // 貌似用不到的一些数据
            "GetPlayerStatistics": true, // 玩家所有数据
            "GetPlayerProfile": false // 一些ID
        }
    }
    PlayFabClient.GetPlayerCombinedInfo(quest, (err, result) => {
        if (err) {
            console.log('获取玩家数据发生err---:', err)
        } else {
            // Read_Playfab_Stats_By_Keys(result.data.InfoResultPayload.PlayerStatistics)
        }
    })
}

/**
 * 获取物品列表
 */
function DoGetCatalogItems() {
    console.log('begin!');

    var CataRequest = {
        // CatalogVersion: 1
    };

    PlayFabClient.GetCatalogItems(CataRequest, GetCatalogCallback)
}
function GetCatalogCallback(err, result) {
    console.log('err---:', err)
    // console.log('result---:', result)

    result.data.Catalog.forEach(item => {
        console.log(item)
    });
}
/**
 * 获得账号信息...注册时间
 */
function DoGetAccountInfo() {
    var AccRequest = {
        PlayFabId: ''
    };

    PlayFabClient.GetAccountInfo(AccRequest, GetAccCallback);
}
function GetAccCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result)
    console.log('data---:', result.data.AccountInfo.TitleInfo)
}
/**
 * 通过steam id获得playfab id
 */
function DoGetPlayFabIDsFromSteamIDs() {
    var GetIdRequest = {
        SteamStringIDs: [
            '76561198313427504'
        ]
    }

    PlayFabClient.GetPlayFabIDsFromSteamIDs(GetIdRequest, GetIdCallback)
}
function GetIdCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result)
    console.log('data---:', result.data.Data[0])
}
/**
 * 获取用户信息 貌似没什么用
 */
function DoGetPlayerProfile() {
    var GetProRequest = {
        PlayFabId: ''
    }

    PlayFabClient.GetPlayerProfile(GetProRequest, GetProCallback)
}
function GetProCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result)
    // console.log('data---:', result.data.Data)
}
/**
 * 获取用户 Character Id 感觉信息不在这里面
 * 未能获得Character id
 */
function DoGetAllUsersCharacters() {
    var GetChaRequest = {
        PlayFabId: ''
    }

    PlayFabClient.GetAllUsersCharacters(GetChaRequest, GetChaCallback)
}
function GetChaCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result)
    console.log('data---:', result.data)
}
/**
 * cha 其他函数
 */
function GetCharacterLeaderboard() {
    var GetChaRequest = {
        StatisticName: 'Kills',
        StartPosition: 0,
        MaxResultsCount: 20
    }

    PlayFabClient.GetCharacterLeaderboard(GetChaRequest, GetChaLCallback)
}
function GetChaLCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result)
    console.log('data---:', result.data)
}
/**
 * 获取用户 cha 数据
 */
function DoGetCharacterStatistics() {
    var GetStaRequest = {
        CharacterId: '*********'
    }

    PlayFabClient.GetCharacterStatistics(GetStaRequest, GetStaCallback)
}
function GetStaCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result)
    console.log('data---:', result.data)
}
/**
 * 获取排行榜 所有关键词对应关系清楚了
 */
function GetLeaderboard() {
    var GetRequest = {
        StatisticName: SEARCH_NAME,
        StartPosition: START_POS,
        MaxResultsCount: SEARCH_NUM,
    }

    PlayFabClient.GetLeaderboard(GetRequest, GetledCallback)
}
function GetledCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result.data)
    console.log('data---:', result.data.Leaderboard[0].Profile)
}
/**
 * GetUserData 好像没用
 * GetUserPublisherData
 * 获取用户信息
 */
function GetPlayerStatistics() {
    var GetRequest = {
        // PlayFabId: ''
        // StatisticNames: [
        //     'Wins'
        // ]
    }
    PlayFabClient.GetPlayerStatistics(GetRequest, GetDCallback)
}
function GetDCallback(err, result) {
    console.log('err---:', err)
    console.log('result---:', result.data)
    // console.log('data---:', result.data.Leaderboard[0].Profile)
}
/**
 * 查看游戏区服
 */
function GetGameServerRegions() {
    var GetRequest = {
        BuildVersion: '0.88.3',
        TitleId: 'd36d'
    }

    PlayFabClient.GetGameServerRegions(GetRequest, GetRe)
}
function GetRe(err, result) {
    console.log('err---:', err)
    console.log('result---:', result.data)
    // console.log('data---:', result.data.Leaderboard[0].Profile)
}
/**
 * 查看用户数据2.0 需要key
 */
function GetUserInternalData() {
    var GetRequest = {
        PlayFabId: '',
        Keys: [
            'Wins',
            'Kills'
        ]
    }

    PlayFabServer.GetUserInternalData(GetRequest, GetOnlyRe)
}
function GetOnlyRe(err, result) {
    console.log('err---:', err)
    console.log('result---:', result.data)
    // console.log('data---:', result.data.Leaderboard[0].Profile)
}
/**
 * 获取用户数据
 */
function GetLeaderboardAroundPlayer() {
    var GetRequest = {
        PlayFabId: '',
        StatisticName: SEARCH_NAME,
        MaxResultsCount: 1,
    }

    PlayFabClient.GetLeaderboardAroundPlayer(GetRequest, GetSRe)
}
function GetSRe(err, result) {
    console.log('err---:', err)
    console.log('result---:', result.data)
    console.log('data---:', result.data.Leaderboard[0].Profile)
}

////////////////////////////////////////////////////////////////////////////
////////// 这个自定义函数终于能返回结果了我好感动啊啊啊
////////// 上面的 api 全是摆设 QwQ 只能直接用
////////////////////////////////////////////////////////////////////////////

/**
 * @method Read_Playfab_Stats_By_Keys 根据关键词获得数据
 * @param p_id string
 * @param keys string_arr
 */
BEAR_STATS.Read_Playfab_Stats_By_Keys = function (p_id, keys) {
    return new Promise((resolve, reject) => {
        var quest = {
            "PlayFabId": p_id,
            "InfoRequestParameters": {
                "GetUserAccountInfo": false, // 账户信息
                "GetUserInventory": false,
                "GetUserVirtualCurrency": false,
                "GetUserData": false,
                "GetUserReadOnlyData": false,
                "GetCharacterInventories": false,
                "GetCharacterList": false,
                "GetTitleData": false, // 貌似用不到的一些数据
                "GetPlayerStatistics": true, // 玩家所有数据
                "GetPlayerProfile": false // 一些ID
            }
        }
        var resarr = []
        PlayFabClient.GetPlayerCombinedInfo(quest, (err, result) => {
            if (err) {
                console.log('获取玩家数据发生err---:', err)
                reject(-1)
            } else {
                var Result = result.data.InfoResultPayload.PlayerStatistics
                keys.forEach((key, index) => {
                    // 就每个key遍历result，遍历到就装入数组，装完就返回数组
                    // resolve(Result)
                    let finddata = false
                    Result.forEach((one_stat, index1) => {
                        if (key == one_stat.StatisticName) {
                            finddata = true
                            resarr[index] = one_stat.Value
                        }
                    })
                    if (finddata == false) {
                        resarr[index] = 0
                    }
                })
                resolve(resarr)
            }
        })
    })
}

/**
 * @method Get_Playfab_ID 获取playfabid
 * @param num steam 16 位数 id
 */
BEAR_STATS.Get_Playfab_ID = function (num) {
    return new Promise((resolve, reject) => {
        var GetIdRequest = {
            SteamStringIDs: [
                num
            ]
        }
        PlayFabClient.GetPlayFabIDsFromSteamIDs(GetIdRequest, (err, result) => {
            if (err) {
                console.log("获取playfabid遇到了错误：", err)
                reject(-1)
            } else {
                resolve(result.data.Data[0].PlayFabId)
            }
        })
    })
}

/**
 * @method Get_Playfab_Stats_Words_List 获取所有战绩种类
 */
BEAR_STATS.Get_Playfab_Stats_Words_List = function () {
    return new Promise((resolve, reject) => {
        var quest = {
            "PlayFabId": "",
            "InfoRequestParameters": {
                "GetUserAccountInfo": false, "GetUserInventory": false, "GetUserVirtualCurrency": false, "GetUserData": false, "GetUserReadOnlyData": false, "GetCharacterInventories": false, "GetCharacterList": false, "GetTitleData": false, "GetPlayerProfile": false,
                "GetPlayerStatistics": true
            }
        }
        PlayFabClient.GetPlayerCombinedInfo(quest, (err, result) => {
            if (err) {
                console.log('函数发生err---:', err)
            } else {
                var heihei = []
                result.data.InfoResultPayload.PlayerStatistics.forEach(item => {
                    heihei.push(item["StatisticName"])
                })
                resolve(heihei)
            }
        })
    })
}

BEAR_STATS.Get_Top_Stats_By_Key = function (sname, sindex) {
    return new Promise((resolve, reject) => {
        var GetRequest = {
            StatisticName: sname,
            StartPosition: sindex,
            MaxResultsCount: 1,
        }
        PlayFabClient.GetLeaderboard(GetRequest, (err, result) => {
            if (err) {
                console.log("获取top - ", err)
                reject(-1)
            } if (result == null || result.data.Leaderboard[0] == undefined) {
                reject(-1)
            } else {
                resolve(result.data.Leaderboard[0]["StatValue"])
            }
        })
    })
}


// 开始
LoginWithCusID_Time()

module.exports = BEAR_STATS