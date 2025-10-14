export type Commands =
  | ReceiveSuccess
  | ReceiveFailed
  | Ping
  | Pong
  | SetLocation
  | CurrentLocation
  | ArmStop
  | LeftArmMove
  | RightArmMove
  | LeftArmFoldUpper
  | RightArmFoldUpper
  | LeftArmFoldLower
  | RightArmFoldLower
  | ArmSuctionOnOff
  | EmergencyStop
  | SideArmOpen
  | SideArmOpenMax
  | SideArmFold;

export type BoxSize = "A" | "B" | "C" | "D" | "E";

export type EmergencyStop = {
  command: "emergency_stop";
};

export type ReceiveSuccess = {
  command: "receive_success";
};

export type ReceiveFailed = {
  command: "receive_failed";
  error_code: number;
};

export type Ping = {
  command: "ping";
};

export type Pong = {
  command: "pong";
};

export type SetLocation = {
  command: "set_location";
  x: number;
  y: number;
  degree: number;
};

export type CurrentLocation = {
  command: "current_location";
  x: number;
  y: number;
  degree: number;
};

export type ArmStop = {
  command: "arm_stop";
};

export type LeftArmMove = {
  command: "left_arm_move";
  box: BoxSize;
}

export type RightArmMove = {
  command: "right_arm_move";
  box: BoxSize;
}

export type LeftArmFoldUpper = {
  command: "left_arm_fold_upper"
}

export type RightArmFoldUpper = {
  command: "right_arm_fold_upper"
}

export type LeftArmFoldLower = {
  command: "left_arm_fold_lower"
}

export type RightArmFoldLower = {
  command: "right_arm_fold_lower"
}

export type ArmSuctionOnOff = {
  command: "arm_suction_on_off";
  is_on: boolean;
}

export type SideArmOpen = {
  command: "side_arm_open";
};

export type SideArmOpenMax = {
  command: "side_arm_open_max";
};

export type SideArmFold = {
  command: "side_arm_fold";
};

export function parse_nrcc2025(chunk: Buffer): Commands | undefined {
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
    case 0x03:
      return {command: "pong"};
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
    case "ping": {
      const command_byte = Buffer.from(new Uint8Array([0x01]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "set_location": {
      const command_byte = Buffer.from(new Uint8Array([0x10]).buffer);
      const x_bytes = Buffer.from(new Int32Array([cmd.x]).buffer);
      const y_bytes = Buffer.from(new Int32Array([cmd.y]).buffer);
      const degree_bytes = Buffer.from(new Int32Array([cmd.degree * 100]).buffer);
      return Buffer.concat([command_byte, x_bytes, y_bytes, degree_bytes]);
    }
    case "arm_stop": {
      const command_byte = Buffer.from(new Uint8Array([0x50]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "right_arm_move": {
      const command_byte = Buffer.from(new Uint8Array([0x51]).buffer);
      let box_number = Buffer.alloc(0);
      switch (cmd.box) {
        case "A": {
          box_number = Buffer.from(new Uint8Array([0]).buffer);
          break;
        }
        case "B": {
          box_number = Buffer.from(new Uint8Array([1]).buffer);
          break;
        }
        case "C": {
          box_number = Buffer.from(new Uint8Array([2]).buffer);
          break;
        }
        case "D": {
          box_number = Buffer.from(new Uint8Array([3]).buffer);
          break;
        }
        case "E": {
          box_number = Buffer.from(new Uint8Array([4]).buffer);
          break;
        }
      }
      return Buffer.concat([command_byte, box_number]);
    }
    case "left_arm_move": {
      const command_byte = Buffer.from(new Uint8Array([0x52]).buffer);
      let box_number = Buffer.alloc(0);
      switch (cmd.box) {
        case "A": {
          box_number = Buffer.from(new Uint8Array([0]).buffer);
          break;
        }
        case "B": {
          box_number = Buffer.from(new Uint8Array([1]).buffer);
          break;
        }
        case "C": {
          box_number = Buffer.from(new Uint8Array([2]).buffer);
          break;
        }
        case "D": {
          box_number = Buffer.from(new Uint8Array([3]).buffer);
          break;
        }
        case "E": {
          box_number = Buffer.from(new Uint8Array([4]).buffer);
          break;
        }
      }
      return Buffer.concat([command_byte, box_number]);
    }
    case "right_arm_fold_upper": {
      const command_byte = Buffer.from(new Uint8Array([0x5A]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "left_arm_fold_upper": {
      const command_byte = Buffer.from(new Uint8Array([0x5B]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "right_arm_fold_lower": {
      const command_byte = Buffer.from(new Uint8Array([0x5C]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "left_arm_fold_lower": {
      const command_byte = Buffer.from(new Uint8Array([0x5D]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "arm_suction_on_off": {
      const command_byte = Buffer.from(new Uint8Array([0x60]).buffer);
      let is_on_byte = Buffer.alloc(0);
      if (cmd.is_on) {
        is_on_byte = Buffer.from(new Uint8Array([1]).buffer);
      } else {
        is_on_byte = Buffer.from(new Uint8Array([0]).buffer);
      }
      return Buffer.concat([command_byte, is_on_byte]);
    }
    case "emergency_stop": {
      const command_byte = Buffer.from(new Uint8Array([0x0A]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "side_arm_open": {
      const command_byte = Buffer.from(new Uint8Array([0x31]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "side_arm_open_max": {
      const command_byte = Buffer.from(new Uint8Array([0x33]).buffer);
      return Buffer.concat([command_byte]);
    }
    case "side_arm_fold": {
      const command_byte = Buffer.from(new Uint8Array([0x32]).buffer);
      return Buffer.concat([command_byte]);
    }
  }

  return undefined;
}
