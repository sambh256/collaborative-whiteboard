const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = 3000;

// Serve static files (React frontend)
app.use(express.static('public'));

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new WebSocketServer({ server });

let canvasState = [];

wss.on('connection', (ws) => {
    console.log('New connection established');

    // Send current canvas state to new users
    ws.send(JSON.stringify({ type: 'canvas_state', data: canvasState }));

    ws.on('message', (message) => {
        const { type, data } = JSON.parse(message);

        if (type === 'drawing') {
            canvasState.push(data); // Update canvas state
            broadcast({ type: 'drawing', data });
        }
    });

    const broadcast = (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    };
});
