import { WebSocketServer , WebSocket} from "ws";
import { usb, Device } from "usb";
import { SerialPort } from "serialport";

interface orderData {
	positionX: number;
	positionY: number;
	theta: number;
	armX: number;
	armY: number;
}

const wss = new WebSocketServer({ port: 3000 });
let clients: Set<WebSocket> = new Set();


const CH340_VID = 0x1a86;
const CH340_PID = 0x7523;
const SERIAL_BAUDRATE = 115200;

let primary_ch340: Device | undefined;
let serial: SerialPort | undefined;


usb.on("attach", async (device) => {
	// CH340以外
	if (device.deviceDescriptor.idVendor !== CH340_VID || device.deviceDescriptor.idProduct !== CH340_PID) {
		return;
	}

	// 既に接続済み
	if (primary_ch340) {
		console.log("CH340 is already connected.");
		return;
	}

	const ch340 = (await SerialPort.list()).find((d) =>
		d.vendorId === CH340_VID.toString(16) &&
		d.productId === CH340_PID.toString(16) &&
		d.serialNumber === primary_ch340
	);

	if (!ch340) {
		return;
	}

	primary_ch340 = device;
	console.log(`CH340 connected. path=${ch340.path}`);

	serial = new SerialPort({ path: ch340.path, baudRate: SERIAL_BAUDRATE });
	console.log(`serial port open. baud=${SERIAL_BAUDRATE}`);
});


usb.on("detach", (device) => {
	if (primary_ch340 !== device) {
		return;
	}
	serial?.close();
	serial = undefined;
	console.log("serial port close.");

	primary_ch340 = undefined;
	console.log("CH340 disconnected.");
});


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
