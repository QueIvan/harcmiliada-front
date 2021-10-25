const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

function changePort(port){
  var portValue = parseInt(port);
  portValue += (portValue === 65535) ? -1:1;
  return portValue.toString();
}

console.log(process.env.PORT)

const port = changePort(process.env.PORT);

const app = express();

const server = http.createServer(app);

app.use(express.static(__dirname + '/../../build'));

const io = socketIo(server, { cors: { orgin: "*" } });

io.on("connect", (socket) => {

    console.log(`Connected: ${socket.id}`);

    socket.on('disconnect', () =>
       console.log(`Disconnected: ${socket.id}`));
       
    socket.on('join', (room) => {
        console.log(`Socket ${socket.id} joining ${room}`);
        socket.join(room);
    });

    socket.on('sendCommand', (data, rooms) => {
        rooms.forEach(element => {
            console.log(`Socket ${socket.id} sent command to ${element}`)
            io.to(element).emit('recieveCommand', data);
        });
    });

});

server.listen(port, () => console.log(`Listening on port ${port}`));
