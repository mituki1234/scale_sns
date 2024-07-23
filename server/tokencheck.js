const fs = require('fs');

function log_in_using_token(ws, receivedMessage) {
    const usersFilePath = './usersdata/usersdata.json';

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

    const IffoundToken = usersData.find(user => user.token === receivedMessage.Token);
    console.log(IffoundToken);
    if(IffoundToken){
        console.log("クッキーに保存されたトークンを使ってログインに成功");
        const response = {
            type: 'UseTokenlogin',
            success: true,
        };
        ws.send(JSON.stringify(response));
    } else {
        console.log("トークンが違います。");
        const response = {
            type: 'UseTokenlogin',
            success: false,
        };
        ws.send(JSON.stringify(response));
    }
}
function check_login_state_in_token(ws, receivedMessage) {
    const usersFilePath = './usersdata/usersdata.json';

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));

    const IffoundToken = usersData.find(user => user.token === receivedMessage.Token);
    console.log(IffoundToken);
    if(IffoundToken){
        console.log('クッキーに保存されたトークンを使ってログインの維持に成功');
        const response = {
            type: 'LoginCheckUseToken',
            success: true,
        };
        ws.send(JSON.stringify(response));
    } else {
        console.log("トークンが違うので帰ってください。");
        const response = {
            type: 'LoginCheckUseToken',
            success: false,
        };
        ws.send(JSON.stringify(response));
    }
}
module.exports = {
    log_in_using_token,
    check_login_state_in_token
};