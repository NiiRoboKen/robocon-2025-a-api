import { WebSocketServer , WebSocket} from "ws";
import { usb, Device, findByIds } from "usb";
import { SerialPort } from "serialport";

import { device_path } from "./utils.ts";
import { SbtpParser } from "./sbtp.ts";
import { Nrcc2025Parser } from "./nrcc-2025.ts"

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

async function init() {
	const device = findByIds(CH340_VID, CH340_PID);
	if (device) {
		const ch340_path = await device_path(
			CH340_VID.toString(16),
			CH340_PID.toString(16),
		);

		if (!ch340_path) {
			return;
		}

		primary_ch340 = device;
		console.log(`CH340 connected. path=${ch340_path}`);

		serial = new SerialPort({ path: ch340_path, baudRate: SERIAL_BAUDRATE });
		const parser = serial.pipe(new SbtpParser({})).pipe(new Nrcc2025Parser({}));
		parser.on("data", (data) => {
			console.log(data);
		});
		console.log(`serial port open. baud=${SERIAL_BAUDRATE}`);
	}
}

init()

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

	const ch340_path = await device_path(
		CH340_VID.toString(16),
		CH340_PID.toString(16),
	);

	if (!ch340_path) {
		return;
	}

	primary_ch340 = device;
	console.log(`CH340 connected. path=${ch340_path}`);

	serial = new SerialPort({ path: ch340_path, baudRate: SERIAL_BAUDRATE });
	const parser = serial.pipe(new SbtpParser({})).pipe(new Nrcc2025Parser({}));
	parser.on("data", (data) => {
		console.log(data);
	});
	console.log(`serial port open. baud=${SERIAL_BAUDRATE}`);
});


usb.on("detach", (device) => {
	if (primary_ch340 !== device) {
		return;
	}
	serial = undefined;
	primary_ch340 = undefined;
	console.log("CH340 disconnected.");
});


wss.on("connection", (ws: WebSocket) => {
	console.log("A new client connected!");

	ws.on("error", console.error);

	ws.on("message", (data: Buffer) =>{
		const jsonData = JSON.parse(data.toString()) as orderData;
		console.log("received:", jsonData);

		if (!primary_ch340) {
			console.log("Cant send. because CH340 is not found.");
		}
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
