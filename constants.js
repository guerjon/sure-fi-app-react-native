export const FIRMWARE_CENTRAL_ROUTE = "http://admin.sure-fi.com/mobile/api/firmware/get_available_firmware/eaa4c810-e477-489c-8ae8-c86387b1c62e"

export const LOADING = 'LOADING'
export const LOADED = 'LOADED'

export const SET_MANUFACTURED_DATA = "SET_MANUFACTURED_DATA"

export const DEVICES_FOUNDED = "DEVICES_FOUNDED"
export const DEVICES_NOT_FOUNDED = "DEVICES_NOT_FOUNDED"

export const CENTRAL_DEVICE_MATCHED = "CENTRAL_DEVICE_MATCHED"
export const CENTRAL_DEVICE_NOT_MATCHED = "CENTRAL_DEVICE_NOT_MATCHED"

export const REMOTE_DEVICE_MATCHED = "REMOTE_DEVICE_MATCHED"
export const REMOTE_DEVICE_NOT_MATCHED = "REMOTE_DEVICE_NOT_MATCHED"
export const REMOTE_DEVICES_FOUNDED = "DEVICES_FOUNDED"
export const REMOTE_DEVICES_NOT_FOUNDED = "DEVICES_NOT_FOUNDED"


export const RESET_QR_STATE = "RESET_QR_STATE"

export const RESET_QR_CENTRAL_STATE = "RESET_QR_CENTRAL_STATE"
export const RESET_QR_REMOTE_STATE = "RESET_QR_REMOTE_STATE"

export const CENTRAL_PAIRED = "CENTRAL_PAIRED"
export const REMOTE_PAIRED = "REMOTE_PAIRED"
export const SCANNING_CENTRAL_UNITS = "SCANNING_CENTRAL_UNITS"
export const SCANNED_CENTRAL_UNITS = "SCANNED_CENTRAL_UNITS"
export const SCANNING_REMOTE_UNITS = "SCANNING_REMOTE_UNITS"
export const SCANNED_REMOTE_UNITS = "SCANNED_REMOTE_UNITS"


export const SCANNING_UNITS = "SCANNING_UNITS"

export const CONNECTING_CENTRAL_UNIT = "CONNECTING_CENTRAL_UNIT"
export const WRITING_CENTRAL_UNIT = "WRITING_CENTRAL_UNIT"
export const WROTE_CENTRAL_UNIT = "WROTE_CENTRAL_UNIT"
export const CONNECTING_REMOTE_UNIT = "CONNECTING_REMOTE_UNIT"
export const WRITING_REMOTE_UNIT = "WRITING_REMOTE_UNIT"
export const WROTE_REMOTE_UNIT = "WROTE_REMOTE_UNIT"

export const ERROR_ON_CENTRAL_SCANNING = "ERROR_ON_CENTRAL_SCANNING"
export const ERROR_ON_CENTRAL_WROTE = "ERROR_ON_CENTRAL_WROTE"
export const ERROR_ON_REMOTE_SCANNING = "ERROR_ON_REMOTE_SCANNING"
export const ERROR_ON_REMOTE_WROTE = "ERROR_ON_REMOTE_WROTE"


export const BLUETOOTH_ERROR = "BLUETOOTH_ERROR"
export const RESET_SCAN_CENTER_STATE = "RESET_SCAN_CENTER_STATE"

export const WRITE_BRIDGE_BLUETOOTH_ERROR = "WRITE_BRIDGE_BLUETOOTH_ERROR"

export const SET_BLE = "SET_BLE"
export const TURN_ON_SCANNING = "TURN_OFF_SCANNING"
export const TURN_OFF_SCANNING = "TURN_OFF_SCANNING"
export const ADD_NEW_BRIDGE = "ADD_NEW_BRIDGE"
export const ADD_DEVICES = "ADD_DEVICES"
export const RESET_PAIR_REDUCER_STATE = "RESET_PAIR_REDUCER_STATE"

export const TO_HEX_STRING = string_array => {
		var byteArray = JSON.parse(string_array);
  		return byteArray.map(function(byte) {
    		return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  		}).join('')
}


export const BYTES_TO_HEX= (byteArray) => {
  return byteArray.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

export const HEX_TO_BYTES = (hex) => {
      for (var bytes = [], c = 0; c < hex.length; c += 2){
      var sub = hex.substr(c, 2);
      var parse_int = parseInt(sub, 16)

      bytes.push(parse_int);
    }
    return bytes;
}

export const  UINT8TOSTRING = (u8a) => {
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
    }
    return c.join("");
  }


export const longToByteArray = (long) => {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
}

export const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const BASE64 = {
  btoa: (input:string = '')  => {
    let str = input;
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

      charCode = str.charCodeAt(i += 3/4);

      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      
      block = block << 8 | charCode;
    }
    
    return output;
  },

  atob: (input:string = '') => {
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  
  }
}

export const IS_EMPTY = obj => {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

export const REVERSE_STRING = str => {
    var splitString = str.split("");
    var reverseArray = splitString.reverse();
    var joinArray = reverseArray.join(""); 
    return joinArray; 
}
 

  

export const GET_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/x-www-form-urlencoded',
}

export const SUREFI_CMD_SERVICE_UUID = "C8BF000A-0EC5-2536-2143-2D155783CE78"
export const SUREFI_CMD_WRITE_UUID = "C8BF000B-0EC5-2536-2143-2D155783CE78"
export const SUREFI_CMD_READ_UUID  = "C8BF000C-0EC5-2536-2143-2D155783CE78"


export const SUREFI_SEC_SERVICE_UUID = "58BF000A-0EC5-2536-2143-2D155783CE78"
export const SUREFI_SEC_HASH_UUID = "58BF000B-0EC5-2536-2143-2D155783CE78"


export const COMMAND_START_FIRWMARE_UPDATE = 0x03
export const COMMAND_START_ROW = 0x04
export const COMMAND_ROW_PIECE = 0x05
export const COMMAND_END_ROW = 0x06
export const COMMAND_FINISH_FIRMWARE_UPDATE = 0x07


