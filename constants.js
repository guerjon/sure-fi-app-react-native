var md5 = require('md5');

export const BASE_URL = "https://tjdk5m3fi2.execute-api.us-west-2.amazonaws.com/prod/"
export const FIRMWARE_CENTRAL_ROUTE = "https://tjdk5m3fi2.execute-api.us-west-2.amazonaws.com/prod/firmware/get_available_firmware"
export const API_REGISTERING_LINK = BASE_URL +   "systems/register_bridge_system"
export const UPLOAD_IMAGE_LINK = "https://admin.sure-fi.com/mobile_api/upload_system_images"
export const UNPAIR_LINK = BASE_URL + "systems/unpair_bridge_system"
export const DEVICE_REGISTRATION_LINK = BASE_URL + "sessions/check_device_registration"
export const DEVICE_REGISTRATE_LINK = BASE_URL + "sessions/register_device"
export const CHECK_USER_EXITS = BASE_URL + "users/check_exists"
export const FINISH_USER_REGISTRATION = BASE_URL + "sessions/confirm_device_registration"

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


export const BYTES_TO_HEX = (byteArray) => {
	return byteArray.map(function(byte) {
		return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	}).join('')
}

export const HEX_TO_BYTES = (hex) => {
	for (var bytes = [], c = 0; c < hex.length; c += 2) {
		var sub = hex.substr(c, 2);
		var parse_int = parseInt(sub, 16)

		bytes.push(parse_int);
	}
	return bytes;
}

export const UINT8TOSTRING = (u8a) => {
	var CHUNK_SZ = 0x8000;
	var c = [];
	for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
		c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
	}
	return c.join("");
}


export const longToByteArray = (long) => {
	// we want to represent the input as a 8-bytes array
	var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];

	for (var index = 0; index < byteArray.length; index++) {
		var byte = long & 0xff;
		byteArray[index] = byte;
		long = (long - byte) / 256;
	}

	return byteArray;
}

export const byteArrayToLong = (byteArray) => {
    var value = 0;
    for ( var i = 0; i < byteArray.length; i++) {
        value = (value * 256) + byteArray[i];
    }
    return value;
};

export const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const BASE64 = {
	btoa: (input: string = '') => {
		let str = input;
		let output = '';

		for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

			charCode = str.charCodeAt(i += 3 / 4);

			if (charCode > 0xFF) {
				throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
			}

			block = block << 8 | charCode;
		}

		return output;
	},

	atob: (input: string = '') => {
		let str = input.replace(/=+$/, '');
		let output = '';

		if (str.length % 4 == 1) {
			throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
		}
		for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++);

			~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
				bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
		) {
			buffer = chars.indexOf(buffer);
		}

		return output;

	}
}

export const IS_EMPTY = obj => {
	for (var key in obj) {
		if (obj.hasOwnProperty(key))
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
export const SUREFI_CMD_READ_UUID = "C8BF000C-0EC5-2536-2143-2D155783CE78"


export const SUREFI_SEC_SERVICE_UUID = "58BF000A-0EC5-2536-2143-2D155783CE78"
export const SUREFI_SEC_HASH_UUID = "58BF000B-0EC5-2536-2143-2D155783CE78"

export const PAIR_SUREFI_SERVICE = "98BF000A-0EC5-2536-2143-2D155783CE78"
export const PAIR_SUREFI_WRITE_UUID = "98BF000C-0EC5-2536-2143-2D155783CE78"
export const PAIR_SUREFI_READ_UUID = "98BF000D-0EC5-2536-2143-2D155783CE78"




export const DIVIDE_MANUFACTURED_DATA = (manufacturedData, address) => {
	var divide_manufactured_data = {}
	if(manufacturedData){
	
		divide_manufactured_data.hardware_type = manufacturedData.substr(0, 2) // 01 or 02
		divide_manufactured_data.firmware_version = manufacturedData.substr(2, 2) //all four bytes combinations
		divide_manufactured_data.device_state = manufacturedData.substr(4, 4)
		divide_manufactured_data.device_id = manufacturedData.substr(8, 6);
		divide_manufactured_data.tx = manufacturedData.substr(14, 6);
		divide_manufactured_data.address = address;
		divide_manufactured_data.security_string = GET_SECURITY_STRING(manufacturedData.substr(8, 6), manufacturedData.substr(14, 6))
	}

	return divide_manufactured_data;
}

export const GET_SECURITY_STRING = (peripheralRXUUID, peripheralTXUUID) => {
	peripheralRXUUID = REVERSE_STRING(peripheralRXUUID.toUpperCase())
	peripheralTXUUID = peripheralTXUUID.toUpperCase() + "x~sW5-C\"6fu>!!~X"
	let string = peripheralRXUUID + peripheralTXUUID
	let md5_string = md5(string)
	let hex_string = HEX_TO_BYTES(md5_string)
	return hex_string
}

export const FIND_ID = (data, idToLookFor) => {
	if (data) {
		for (var i = 0; i < data.length; i++) {
			if (data[i].id == idToLookFor) {
				return true
			}
		}
	}
	return false;
}

export const MATCH_DEVICE = (devices, device_id) => {
	
	devices = devices.filter(device => {
		if (!device)
			return false
		if (!device.manufactured_data)
			return false
		if (!device.manufactured_data.device_id)
			return false

		var data_upper_case = device.manufactured_data.device_id.toUpperCase()
		device_id = device_id.toUpperCase()
		
		return data_upper_case == device_id;
	})

	return devices
}


export const GET_CENTRAL_DEVICES = (devices) => {
	//console.log("first",devices)
	devices = devices.filter(function(device) {
		if (!device.manufactured_data)
			return false
		return device.manufactured_data.hardware_type == "01"
	})
	//console.log("after",devices)
	return devices
}

export const GET_REMOTE_DEVICES = (devices) => {
	devices = devices.filter(function(device) {
		if (!device.manufactured_data)
			return false

		return device.manufactured_data.hardware_type == "02"
	})
	return devices

}

export const GET_DEVICES_ON_PAIRING_MODE = devices => {
	devices = devices.filter(device => {
		if(!device.manufactured_data)
			return false
		var state = device.manufactured_data.device_state.substring(2,4)

		if(state == "01"){
			return device
		}		
		return false
	})
	return devices
}

export const GET_DEVICES_ON_CONFIGURE_MODE = devices => {
	devices = devices.filter(device => {
		if(!device.manufactured_data)
			return false
		
		var state = device.manufactured_data.device_state.substring(2,4)

		if(state == "03"){
			return device
		}		
		return false
	})
	return devices
}


export const CALCULATE_VOLTAGE = x => {
	let voltage = (x / 4095) * 16.5
	return voltage
}

