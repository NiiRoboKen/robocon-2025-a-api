import { Transform } from "node:stream";
import type { TransformOptions, TransformCallback } from "node:stream";

export type Commands = ReceiveSuccess | ReceiveFailed | CurrentLocation;

export type ReceiveSuccess = {
  command: "receive_success";
};

export type ReceiveFailed = {
  command: "receive_failed";
  error_code: number;
};

export type CurrentLocation = {
  command: "current_location";
  x: number;
  y: number;
  degree: number;
};

export interface Nrcc2025Options extends TransformOptions {}

export class Nrcc2025Parser extends Transform {
  constructor({ ...options }: Nrcc2025Options) {
    super(options);
  }
  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
    if (chunk.length === 0) {
      callback();
    }
    switch (chunk.at(0)) {
      case 0x00:
        this.push({command: "receive_success"} as Commands);
        break;
      case 0x02:
        if (chunk.length !== 2) {
          callback();
        }
        this.push({command: "receive_failed", error_code: chunk.at(1)} as Commands);
        break;
      case 0x20:
        if (chunk.length !== 13) {
          callback();
        }
        this.push({
          command: "current_location",
          x: chunk.readInt32BE(1),
          y: chunk.readInt32BE(5),
          degree: chunk.readInt32BE(9) / 100
          } as Commands
        );
        break;
    }
    callback();
  }
}
