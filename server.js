const express = require("express");
const app = express();
const socket = require("socket.io");


app.use(express());
const port = 8000;

let content = "";
const buffer = [];
/*
 buffer = [
     {
      timestamp: t6545687634545478676,
      string: 'bgtrgherhrehre',
      position: 214
     }
 ]
 */
const cursors = new Map();
/*
    {
        clientId: fgi43h897gy478hygf8923gh,
        position: 0
    }
 */

const server = app.listen(
    port,
    console.log(`Server works on ${(port)}`)
);

const io = socket(server);

const bufferProcess = () => {
    const sortedBuffer = buffer.sort(o => o.timestamp).slice();
    for(let { timestamp, string, position } of sortedBuffer)
    {
        content = [content.slice(0, position), string, content.slice(position)].join('');
        const toRemove = buffer.indexOf(e => e.timestamp == timestamp);
        for(let el of buffer)
        {
            if(el.position >= position)
                el.position++;
        }
        buffer.splice(toRemove, 1);
    }
    setTimeout(bufferProcess, 1000);
}
setTimeout(bufferProcess, 1000);

io.on("connection", (socket) => {
    cursors.set(socket.id, 0);
    io.emit("init",content);
    io.emit("setCursor", 0);
    socket.on("newString", ({ string, pos }) => {
        io.emit("processString", { string , pos });

        const matchedCursor = [...cursors].filter(([k,v]) => v >= pos);
        console.log(matchedCursor);
        if(matchedCursor)
        for({clientId, position} of matchedCursor)
        {
            io.to(clientId).emit("setCursor", position + string.length);
            cursors.set(clientId, position + string.length);
        }

        console.log("To jest newString:",string)
        buffer.push({
            timestamp: Date.now(),
            string,
            position: pos
        })
    });
    socket.on("requestCursorPosition", (params) => {

    });
    socket.on("reset", (params) => {
        buffer.splice(0, buffer.length);
        content = "";
        io.emit("init",content);
    });

    socket.on("disconnect", (socket) => {
        cursors.delete(socket.id);
    });
});

