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
    socket.on("newChar", ({ char, pos }) => {
        content = [content.slice(0, pos), char, content.slice(pos)].join('');
        //console.log(content);
        socket.broadcast.emit("processChar", { char, pos });
        console.log("newChar: ",char);
    });
});

