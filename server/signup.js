const fs = require('fs');
const { generateToken } = require('./utils');

function sign_up_check(ws, receivedMessage){
    const usersFilePath = './usersdata/usersdata.json';

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

    const IffoundToken = usersData.find(user => user.password === receivedMessage.password && user.username === receivedMessage.username && user.id === receivedMessage.id);

    if(!IffoundToken){
        console.log('重複したアカウントがなかったのでアカウントを作成します。')

        var createuser = {};

        createuser.id = receivedMessage.id;
        createuser.username = receivedMessage.username;
        createuser.password = receivedMessage.password;
        createuser.token = generateToken(IffoundToken, usersData);

        fs.readFile(usersFilePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }

            let usersdata = [];
            try {
                usersdata = JSON.parse(data);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
            usersdata.push(createuser);

            fs.writeFile(usersFilePath, JSON.stringify(usersdata, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                } else {
                    console.log('新しいユーザーを作成しました。', createuser);

                };
            });
            const response = {
                type: 'createuser',
                success: true,
                token: createuser.token
            }
            ws.send(JSON.stringify(response));
        });
    } else {
        console.log('重複したアカウントです。')
        const response = {
            type: 'createuser',
            success: false,
            message: 'すでにこのパスワードかユーザーネームかidが使われています'
        };
        ws.send(JSON.stringify(response));
    }
}
module.exports = {
    sign_up_check
};