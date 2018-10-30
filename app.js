var express = require('express');
var app = express();
var s = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + "/client/index.html")
});

app.use('/client', express.static(__dirname + '/client'))

s.listen(2000);

var socketList = {};
var playerList = {};

var Player = function(id){
    var self = {
        x:250,
        y:250,
        id:id,
        number: "" + Math.floor(10 * Math.random()),
        right:false,
        left:false,
        up:false,
        down:false
    }
    return self;
}

var io = require('socket.io')(s, {});
io.sockets.on('connection', function (socket){
    socket.id = Math.random();
    
    socketList[socket.id] = socket;

    playerList[socket.id] = Player(socket.id);

    socket.on('disconnect', function(){
        delete socketList[socket.id];
        delete playerList[socket.id];
    })

})

setInterval(function(){
    var pack = [];
    for(var i in playerList){
        var player = playerList[i];
        player.x++;
        player.y++;
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        })
    }
    for(var i in socketList){
        var socket = socketList[i]
        socket.emit('newPosition', pack);
    }
}, 20)