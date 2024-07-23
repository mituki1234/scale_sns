const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { handleMessage, initializeMessageIds, createFileIfNotExists } = require('./message');
const { IfloginOk } = require('./login');
const { log_in_using_token, check_login_state_in_token } = require('./tokencheck');
const { sign_up_check } = require('./signup');

// Expressサーバーを作成
const app = express();
const port = 3000;

// 静的ファイルを提供
app.use(express.static(path.join(__dirname, '../client')));

app.listen(port, () => {
    console.log(`HTTPサーバーがポート${port}で起動しました`);
});

// WebSocketサーバーを作成
const wss = new WebSocket.Server({ port: 3001 });

// 接続されたクライアントを格納するためのSet
let clients = new Set();

// メッセージを保存するファイルパス
const messagesFilePath = 'messages.json';

// ファイルの存在確認と作成
createFileIfNotExists(messagesFilePath, path);
initializeMessageIds(messagesFilePath);

// 接続時の処理
wss.on('connection', function connection(ws) {
    // クライアントが接続したときの処理
    console.log("接続されました！");

    // クライアントをセットに追加
    clients.add(ws);

    // 過去のメッセージを読み込んでクライアントに送信
    fs.readFile(messagesFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        let messages = [];
        try {
            messages = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }

        messages.forEach(message => {
            if (ws.readyState === WebSocket.OPEN) {
                const FilePath = './usersdata/usersdata.json';

                const usersData = JSON.parse(fs.readFileSync(FilePath, 'utf-8'));

                const Iffounduser = usersData.find(user => user.id === message.username);
                if(Iffounduser){
                    const iconPath = path.join(__dirname, Iffounduser.icon);
                    const iconData = fs.readFileSync(iconPath, 'base64');
                    message.icon = iconData;
                    message.username = Iffounduser.username;
                }
                ws.send(JSON.stringify(message));
                console.log(message.type);
            }
        });
    });

    ws.on('message', function incoming(message) {
        var receivedMessage = JSON.parse(message);
        console.log(receivedMessage);
        if (receivedMessage.type === 'login') {
            IfloginOk(ws, receivedMessage);

        } else if (receivedMessage.type === 'message') {
            handleMessage(ws, wss, messagesFilePath, clients, WebSocket, receivedMessage);

        } else if (receivedMessage.type === 'Token'){
            log_in_using_token(ws, receivedMessage);

        } else if (receivedMessage.type === "logincheck") {
            check_login_state_in_token(ws, receivedMessage);
            
        } else if (receivedMessage.type === 'signup'){
            sign_up_check(ws, receivedMessage);

        }
    });

    // 接続が閉じられたときの処理
    ws.on('close', function close() {
        console.log("接続が解除されました。");
        clients.delete(ws);
    });
});