import express from 'express';
import http from 'http';
import { Server } from 'socket.io';


const app = express();
const server = http.createServer(app);
// const io = socketIo(server);
const io = new Server(server);


app.set('view engine', 'ejs');
app.use(express.static('public')); // serve static files from "public" folder

app.get('/', (req, res) => {
    res.render('video');
});

app.get("/:username", (req, res) => {
    db.query("SELECT * from messages", (err, results) => {
        if (err) {
            console.error(err);
            return;
        }
        res.render("chat", { username: req.params.username, messages: results });
    });
});

// WebSocket signaling
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for offer from the client
    socket.on('offer', (data) => {
        console.log('Offer received:', data);
        socket.broadcast.emit('offer', data); // broadcast the offer to the other user
    });

    // Listen for answer from the client
    socket.on('answer', (data) => {
        console.log('Answer received:', data);
        socket.broadcast.emit('answer', data); // broadcast the answer to the other user
    });

    // Listen for ICE candidate from the client
    socket.on('ice-candidate', (data) => {
        socket.broadcast.emit('ice-candidate', data); // send ICE candidate to the other user
    });
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

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://localhost:3000');
});