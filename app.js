var express = require('express');
var app = express();
var s = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + "/client/index.html")
});

app.use('/client', express.static(__dirname + '/client'))

s.listen(2000);

var socketList = {};

var io = require('socket.io')(s, {});
io.sockets.on('connection', function (socket){
    socket.id = Math.random();
    socket.x = 0;
    socket.y = 0;
    socket.number = "" + Math.floor(10 * Math.random());
    socketList[socket.id] = socket;

    socket.on('disconnect', function(){
        delete socketList[socket.id];
    })

})

setInterval(function(){
    var pack = [];
    for(var i in socketList){
        var socket = socketList[i];
        socket.x++;
        socket.y++;
        pack.push({
            x:socket.x,
            y:socket.y,
            number:socket.number
        })
    }
    for(var i in socketList){
        var socket = socketList[i]
        socket.emit('newPosition', pack);
    }
}, 20)