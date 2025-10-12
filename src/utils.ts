import { SerialPort } from "serialport";

export async function device_path(vid: string, pid: string): Promise<string | undefined> {
	const device = (await SerialPort.list()).find((d) =>
		d.vendorId === vid &&
		d.productId === pid
	);

	if (!device) {
		return undefined;
	}

	return device.path;
}

export function crc8(buffer: Buffer): number {
  let crc = 0xFF;
  for (let byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x80) !== 0) {
        crc = ((crc << 1) & 0xFF) ^ 0xD5;
      }
      else {
        crc = (crc << 1) & 0xFF;
      }
    }
  }
  return crc ^ 0xFF;
}
