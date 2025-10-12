import { Transform } from "node:stream";
import type { TransformCallback, TransformOptions } from "node:stream";

import { crc8 } from "./utils.ts";

const SOF_BYTE = 0x55;
const ESCAPE_BYTE = 0x5A;
const EOF_BYTE = 0xAA;
const XOR_BYTE = 0x42;

type Step = "wait_sof" | "wait_length" | "read_payload" | "read_escaped_payload" | "check_crc" | "wait_eof";

export interface SbtpOptions extends TransformOptions {}

export class SbtpParser extends Transform {
  constructor({...options }) {
    super(options);
    this.step = "wait_sof";
    this.payload_length = 0;
    this.payload = Buffer.alloc(0);
  }
  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    for (let byte of chunk) {
      switch (this.step) {
        case "wait_sof":
          if (byte === SOF_BYTE) {
            this.step = "wait_length"
          }
          break;
        case "wait_length":
          this.payload_length = byte;
          this.step = "read_payload"
          break;
        case "read_payload":
          if (byte === SOF_BYTE || byte === EOF_BYTE) {
            this.reset();
            break;
          }
          if (byte === ESCAPE_BYTE) {
            this.step = "read_escaped_payload";
            break;
          }
          this.payload = Buffer.concat([this.payload, Buffer.from([byte])]);

          if (this.payload.length == this.payload_length) {
            this.step = "check_crc";
            break;
          }

          break;
        case "read_escaped_payload":
          if (byte === SOF_BYTE || byte === EOF_BYTE || byte === ESCAPE_BYTE) {
            this.reset();
            break;
          }
          this.payload = Buffer.concat([this.payload, Buffer.from([byte ^ XOR_BYTE])]);

          if (this.payload.length == this.payload_length) {
            this.step = "check_crc";
            break;
          }

          this.step = "read_payload";
          break;
        case "check_crc":
          const crc_byte = crc8(this.payload);
          if (byte !== crc_byte) {
            this.reset();
            break;
          }
          this.step = "wait_eof";
          break;
        case "wait_eof":
          if (byte === EOF_BYTE) {
            this.push(Buffer.concat([this.payload]));
          }
          this.reset();
          break;
      }
    }

    callback();
  }

  reset() {
    this.step = "wait_sof";
    this.payload_length = 0;
    this.payload = Buffer.alloc(0);
  }

  step: Step;
  payload_length: number;
  payload: Buffer;
}

export function build_sbtp(buffer: Buffer) {
  const sof = Buffer.from(new Uint8Array([SOF_BYTE]).buffer);
  const length = Buffer.from(new Uint8Array([buffer.length]).buffer);

  let payload = Buffer.alloc(0);
  for (let byte of buffer) {
    if (byte === SOF_BYTE || byte === EOF_BYTE || byte === ESCAPE_BYTE) {
      payload = Buffer.concat([payload, Buffer.from(new Uint8Array([byte ^ XOR_BYTE]))]);
    } else {
      payload = Buffer.concat([payload, Buffer.from(new Uint8Array([byte]))]);
    }
  }

  const crc = Buffer.from(new Uint8Array([crc8(buffer)]).buffer);
  const eof = Buffer.from(new Uint8Array([EOF_BYTE]).buffer);
  return Buffer.concat([sof, length, payload, crc, eof]);
}
