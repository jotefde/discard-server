const express = require("express");
const app = express();
const socket = require("socket.io");


app.use(express());
const port = 8000;

let content = "Chuj Ci w dupe\nnie interesuj się";

const server = app.listen(
    port,
    console.log(`Server works on ${(port)}`)
);

const io = socket(server);

io.on("connection", (socket) => {
    socket.emit("init",content);
    socket.on("newString", ({ string, pos }) => {
        content = [content.slice(0, pos), string, content.slice(pos)].join('');
        socket.broadcast.emit("processString", { string , pos });
    });
});

