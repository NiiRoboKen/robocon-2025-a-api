export type Commands =
  | ReceiveSuccess
  | Ping
  | ReceiveFailed
  | Pong
  | EmergencyStop
  | CurrentLocation
  | SetLocation
  | AllSideArmOpen
  | RightSideArmOpen
  | LeftSideArmOpen
  | SideArmOpenMax
  | AllSideArmFold
  | RightSideArmFold
  | LeftSideArmFold
  | AllArmStop
  | RightArmStop
  | LeftArmStop
  | ArmCeilingDeploy
  | ArmCollectMode
  | AllArmFoldUpper
  | AllArmFoldLower
  | RightArmFoldLower
  | LeftArmFoldLower
  | AllArmStart
  | RightArmStart
  | LeftArmStart
  | AllArmSuctionOnOff
  | RightArmSuctionOnOff
  | LeftArmSuctionOnOff;


export type ReceiveSuccess = {
  command: "receive_success",
}

export type Ping = {
  command: "ping",
}

export type ReceiveFailed = {
  command: "receive_failed",
  error_code: number,
}

export type Pong = {
  command: "pong",
}

export type EmergencyStop = {
  command: "emergency_stop",
}

export type CurrentLocation = {
  command: "current_location",
  x: number,
  y: number,
  degree: number
}

export type SetLocation = {
  command: "set_location",
  x: number,
  y: number,
  degree: number
}

export type AllSideArmOpen = {
  command: "all_side_arm_open",
}

export type RightSideArmOpen = {
  command: "right_side_arm_open",
}

export type LeftSideArmOpen = {
  command: "left_side_arm_open",
}

export type SideArmOpenMax = {
  command: "side_arm_open_max",
}

export type AllSideArmFold = {
  command: "all_side_arm_fold",
}

export type RightSideArmFold = {
  command: "right_side_arm_fold",
}

export type LeftSideArmFold = {
  command: "left_side_arm_fold",
}

export type AllArmStop = {
  command: "all_arm_stop",
}

export type RightArmStop = {
  command: "right_arm_stop",
}

export type LeftArmStop = {
  command: "left_arm_stop",
}

export type ArmCeilingDeploy = {
  command: "arm_ceiling_deploy",
}

export type ArmCollectMode = {
  command: "arm_collect_mode",
}

export type AllArmFoldUpper = {
  command: "all_arm_fold_upper",
}

export type AllArmFoldLower = {
  command: "all_arm_fold_lower",
}

export type RightArmFoldLower = {
  command: "right_arm_fold_lower",
}

export type LeftArmFoldLower = {
  command: "left_arm_fold_lower",
}

export type AllArmStart = {
  command: "all_arm_start",
}

export type RightArmStart = {
  command: "right_arm_start",
}

export type LeftArmStart = {
  command: "left_arm_start",
}

export type AllArmSuctionOnOff = {
  command: "all_arm_suction_on_off",
  is_on: boolean,
}

export type RightArmSuctionOnOff = {
  command: "right_arm_suction_on_off",
  is_on: boolean,
}

export type LeftArmSuctionOnOff = {
  command: "left_arm_suction_on_off",
  is_on: boolean,
}

export function parse_nrcc2025(chunk: Buffer): Commands | undefined {
  if (chunk.length === 0) {
    return undefined;
  }
  switch (chunk.at(0)) {
    case 0x00:
      return { command: "receive_success" };
    case 0x02:
      if (chunk.length !== 2) {
        return undefined;
      }
      return { command: "receive_failed", error_code: chunk.at(1)! };
    case 0x03:
      return { command: "pong" };
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

export function build_nrcc2025(cmd: Commands): Buffer | undefined {
  switch (cmd.command) {
    case "receive_success": {
      const command_byte = Buffer.from(new Uint8Array([0x00]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "ping": {
      const command_byte = Buffer.from(new Uint8Array([0x01]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "receive_failed": {
      const command_byte = Buffer.from(new Uint8Array([0x02]).buffer);
      const error_code = Buffer.from(new Uint8Array([cmd.error_code]).buffer);
      return Buffer.concat([command_byte, error_code]);
    }
    case "emergency_stop": {
      const command_byte = Buffer.from(new Uint8Array([0x0A]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "set_location": {
      const command_byte = Buffer.from(new Uint8Array([0x10]).buffer);
      const x_bytes = Buffer.from(new Int32Array([cmd.x]).buffer);
      const y_bytes = Buffer.from(new Int32Array([cmd.y]).buffer);
      const degree_bytes = Buffer.from(new Int32Array([cmd.degree * 100]).buffer);
      return Buffer.concat([command_byte, x_bytes, y_bytes, degree_bytes]);
    }
    case "all_side_arm_open": {
      const command_byte = Buffer.from(new Uint8Array([0x30]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "right_side_arm_open": {
      const command_byte = Buffer.from(new Uint8Array([0x31]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "left_side_arm_open": {
      const command_byte = Buffer.from(new Uint8Array([0x32]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "side_arm_open_max": {
      const command_byte = Buffer.from(new Uint8Array([0x33]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "all_side_arm_fold": {
      const command_byte = Buffer.from(new Uint8Array([0x34]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "right_side_arm_fold": {
      const command_byte = Buffer.from(new Uint8Array([0x35]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "left_side_arm_fold": {
      const command_byte = Buffer.from(new Uint8Array([0x36]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "all_arm_stop": {
      const command_byte = Buffer.from(new Uint8Array([0x50]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "right_arm_stop": {
      const command_byte = Buffer.from(new Uint8Array([0x51]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "left_arm_stop": {
      const command_byte = Buffer.from(new Uint8Array([0x52]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "arm_ceiling_deploy": {
      const command_byte = Buffer.from(new Uint8Array([0x53]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "arm_collect_mode": {
      const command_byte = Buffer.from(new Uint8Array([0x54]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "all_arm_fold_upper": {
      const command_byte = Buffer.from(new Uint8Array([0x55]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "all_arm_fold_lower": {
      const command_byte = Buffer.from(new Uint8Array([0x56]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "right_arm_fold_lower": {
      const command_byte = Buffer.from(new Uint8Array([0x57]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "left_arm_fold_lower": {
      const command_byte = Buffer.from(new Uint8Array([0x58]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "all_arm_start": {
      const command_byte = Buffer.from(new Uint8Array([0x5A]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "right_arm_start": {
      const command_byte = Buffer.from(new Uint8Array([0x5B]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "left_arm_start": {
      const command_byte = Buffer.from(new Uint8Array([0x5C]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "all_arm_suction_on_off": {
      const command_byte = Buffer.from(new Uint8Array([0x60]).buffer);
      let is_on_byte = Buffer.alloc(0);
      if (cmd.is_on) {
        is_on_byte = Buffer.from(new Uint8Array([1]).buffer);
      } else {
        is_on_byte = Buffer.from(new Uint8Array([0]).buffer);
      }
      return Buffer.concat([command_byte, is_on_byte]);
    }
    case "right_arm_suction_on_off": {
      const command_byte = Buffer.from(new Uint8Array([0x61]).buffer);
      let is_on_byte = Buffer.alloc(0);
      if (cmd.is_on) {
        is_on_byte = Buffer.from(new Uint8Array([1]).buffer);
      } else {
        is_on_byte = Buffer.from(new Uint8Array([0]).buffer);
      }
      return Buffer.concat([command_byte, is_on_byte]);
    }
    case "left_arm_suction_on_off": {
      const command_byte = Buffer.from(new Uint8Array([0x62]).buffer);
      let is_on_byte = Buffer.alloc(0);
      if (cmd.is_on) {
        is_on_byte = Buffer.from(new Uint8Array([1]).buffer);
      } else {
        is_on_byte = Buffer.from(new Uint8Array([0]).buffer);
      }
      return Buffer.concat([command_byte, is_on_byte]);
    }
  }

  return undefined;
}
