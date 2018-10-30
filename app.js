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
        down:false,
        speed:5
    }

    self.updatePosition = function(){
        if(self.right){
            self.x += self.speed;
        }
        if(self.left){
            self.x -= self.speed;
        }
        if(self.up){
            self.y -= self.speed;
        }
        if(self.down){
            self.y += self.speed;
        }
    }

    return self;
}

var io = require('socket.io')(s, {});
io.sockets.on('connection', function (socket){
    socket.id = Math.random();
    
    socketList[socket.id] = socket;
    var player = Player(socket.id);
    playerList[socket.id] = player;

    socket.on('disconnect', function(){
        delete socketList[socket.id];
        delete playerList[socket.id];
    })

    socket.on('keypress', function(data){
        if(data.inputId === 'up'){
            player.up = data.state;
        }
        else if(data.inputId === 'down'){
            player.down = data.state;
        }
        else if(data.inputId === 'right'){
            player.right = data.state;
        }
        else if(data.inputId === 'left'){
            player.left = data.state;
        }
    })

})

setInterval(function(){
    var pack = [];
    for(var i in playerList){
        var player = playerList[i];
        player.updatePosition();
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