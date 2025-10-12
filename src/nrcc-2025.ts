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


export function pasrse_nrcc2025(chunk: Buffer): Commands | undefined {
  if (chunk.length === 0) {
    return undefined;
  }
  switch (chunk.at(0)) {
    case 0x00:
      return {command: "receive_success"};
    case 0x02:
      if (chunk.length !== 2) {
        return undefined;
      }
      return {command: "receive_failed", error_code: chunk.at(1)! };
    case 0x20:
      if (chunk.length !== 13) {
        return undefined;
      }
      return {
        command: "current_location",
        x: chunk.readInt32BE(1),
        y: chunk.readInt32BE(5),
        degree: chunk.readInt32BE(9) / 100
      };
  }
  return undefined;
}
