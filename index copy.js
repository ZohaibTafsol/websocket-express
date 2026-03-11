import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mysql from "mysql2";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/:username", (req, res) => {
    db.query("SELECT * from messages", (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        res.render("chat", { username: req.params.username, messages: results });
    });
});

const server = createServer(app);
const db = mysql.createConnection({
    host: "mysql.railway.internal",
    user: "root",
    password: "pYuSCrAAvMTzaPwPBRICSRfzrcvOehVf",
    database: "railway"
});

const io = new Server(server);

io.on("connection", (socket) => {
     
    //   when user send a message
    socket.on("chat message", (data) => {
        // insert message, username and created_at is now to database
        db.query("INSERT INTO messages (message, username, created_at) VALUES (?, ?, ?)", [data.message, data.username, new Date()], (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            io.emit("chat message", data);
        });
    });

    //   when user is typing
    socket.on("typing", (typingData) => {
        io.emit("typing", typingData);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}`);
});