const fs = require('fs');
const { generateToken } = require('./utils'); // utils.js から setCookie 関数をインポートします。

const usersFilePath = './usersdata/usersdata.json';
const http = require('http');

function IfloginOk(ws, receivedMessage) {
    if (receivedMessage.type === "login") {
        const { username, password } = receivedMessage;

        // ユーザーデータを読み込む
        const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

        // ユーザーの認証チェック
        const user = usersData.find(u => u.username === username && u.password === password);
        if (user) {
            // 認証成功時の処理
            console.log(user.username,'がログインに成功');
            const token = generateToken(user);
            const response = {
                type: 'login',
                success: true,
                token: token
            };
            ws.send(JSON.stringify(response));

            // ユーザーデータを更新して保存
            const updatedUsersData = usersData.map(u => u.username === user.username ? {...u, token: token} : u);
            saveUsersData(usersFilePath, updatedUsersData);
        } else {
            // 認証失敗時の処理
            const response = {
                type: 'login',
                success: false,
                message: 'ユーザー名またはパスワードが正しくありません。'
            };
            ws.send(JSON.stringify(response));
        }
    }
}

function saveUsersData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
    IfloginOk
};
