// グローバル変数としてメッセージIDを格納するセットを定義
let messageIds = new Set();
const fs = require('fs');
const usersFilePath = './usersdata/usersdata.json'
// ユーティリティ関数としてメッセージID生成関数を定義
function generateUniqueRandomString(length) {
    let uniqueId;
    do {
        uniqueId = generateRandomString(length);
        if(!messageIds.has(uniqueId)) {
            break;
        } else {
            console.log("重複しました。珍しいですね。");
        }
    } while (messageIds.has(uniqueId));
    messageIds.add(uniqueId);
    return uniqueId;
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}

function setCookie(ws, name, value, options = {}) {
    let cookie = `${name}=${value}`;
    if (options.httpOnly) {
        cookie += '; HttpOnly';
    }
    if (options.secure) {
        cookie += '; Secure';
    }
    ws.cookies = ws.cookies || [];
    ws.cookies.push(cookie);
}

function generateToken(user) {
    const token = generateRandomStringToken(20);
    return token;
}

function generateRandomStringToken(length) {
    var checktoken;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    do {
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charactersLength);
            result += characters.charAt(randomIndex);
        }
        checktoken = usersData.find(user => user.token === result);
    } while (checktoken)
    return result;
}

module.exports = {
    setCookie,
    generateUniqueRandomString,
    generateRandomString,
    generateRandomStringToken,
    generateToken,
    messageIds
};
