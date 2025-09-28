import { WebSocketServer , WebSocket} from "ws";

interface orderData {
	positionX: number;
	positionY: number;
	theta: number;
	armX: number;
	armY: number;
}

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (ws: WebSocket) => {
	console.log("A new client connected!");

	ws.on("error", console.error);

	ws.on("message", (data: Buffer) =>{
		const jsonData = JSON.parse(data.toString()) as orderData;
		console.log("received:", jsonData);

		// sendOrder(jsonData);
	});
	ws.on("close", () => {
		console.log("Client disconnected");
	});
});



// function sendOrder(jsonData) {
//  
// }

// ws.send(JSON.stringify({ x:  , y: , theta: }));
