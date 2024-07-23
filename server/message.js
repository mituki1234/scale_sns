const fs = require('fs');
const path = require('path');
const { generateUniqueRandomString, messageIds } = require('./utils');

// メッセージIDの初期化
function initializeMessageIds(filePath) {
    messageIds.clear();  // まず既存のセットをクリア
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const messages = JSON.parse(data);
        messages.forEach(message => {
            try {
                messageIds.add(message.ID);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    }
}

// メッセージ情報が入っているファイルが存在しない場合に作成する関数
function createFileIfNotExists(filePath, path) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]), 'utf-8');
    }
}

// メッセージを処理する関数
function handleMessage(ws, wss, filePath, clients, WebSocket, receivedMessage) {
    // メッセージを受信したときの処理
    console.log('Received message:', receivedMessage.message);

    const usersFilePath = './usersdata/usersdata.json';

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

    const IffoundToken = usersData.find(user => user.token === receivedMessage.username);
    console.log(receivedMessage.username);
    if (IffoundToken) {
        receivedMessage.username = IffoundToken.id;
        receivedMessage.ID = generateUniqueRandomString(20);
        console.log('Parsed message:', receivedMessage.message);

        // メッセージをファイルに保存する（アイコンなし）
        fs.readFile(filePath, 'utf-8', (err, data) => {
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
            messages.push(receivedMessage);

            fs.writeFile(filePath, JSON.stringify(messages, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                } else {
                    console.log('Message written to file:', receivedMessage.message);
                }
            });
        });

        // 受信したメッセージを全クライアントに送信（アイコン付き）
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                // アイコンの画像をBase64エンコード
                const Iffounduser = usersData.find(user => user.id === receivedMessage.username);
                const iconPath = path.join(__dirname, IffoundToken.icon);
                const iconData = fs.readFileSync(iconPath, 'base64');
                const messageWithIcon = { ...receivedMessage, icon: iconData };
                if(Iffounduser){
                    messageWithIcon.username = Iffounduser.username;
                }
                client.send(JSON.stringify(messageWithIcon));
            }
        });
    }
}

module.exports = {
    handleMessage,
    initializeMessageIds,
    createFileIfNotExists
};