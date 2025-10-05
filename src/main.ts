import { WebSocketServer , WebSocket} from "ws";

interface orderData {
	positionX: number;
	positionY: number;
	theta: number;
	armX: number;
	armY: number;
}

const wss = new WebSocketServer({ port: 3000 });
let clients: Set<WebSocket> = new Set();

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


const broadcast = (data:Object) => {
  const json = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(json);
    }
  }
};

// function sendOrder(jsonData) {
//  
// }

// const broadcast({x: , y: , theta: });
