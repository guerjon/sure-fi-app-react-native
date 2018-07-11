 var md5 = require('md5');
import React, {Component} from 'react'
import {success_green,cancel_red,gray_background} from './styles/index.js'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	ActivityIndicator,
  	Alert,
  	TouchableHighlight,
  	FlatList,
  	TouchableOpacity
} from 'react-native'
import {styles,first_color,width,height} from './styles/index.js'
export const BASE_URL = "https://tjdk5m3fi2.execute-api.us-west-2.amazonaws.com/prod/"
export const FIRMWARE_CENTRAL_ROUTE = "https://tjdk5m3fi2.execute-api.us-west-2.amazonaws.com/prod/firmware/get_available_firmware"


export const COMPLETE_DIRECT_UNIT_PURCHASE = "https://admin.sure-fi.com/stripe_api/complete_purchase"
export const CHECK_STATUS = "https://admin.sure-fi.com/stripe_api/check_status"
export const UPLOAD_IMAGE_LINK = "https://admin.sure-fi.com/mobile_api/upload_system_images"


export const UNPAIR_LINK = BASE_URL + "systems/unpair_bridge_system"
export const GET_PRICE_URL = BASE_URL + "systems/get_system_from_serial"
export const API_REGISTERING_LINK = BASE_URL +   "systems/register_bridge_system"

export const DEVICE_REGISTRATION_LINK = BASE_URL + "sessions/check_device_registration"
export const DEVICE_REGISTRATE_LINK = BASE_URL + "sessions/register_device"
export const SESSION_START = BASE_URL + "sessions/start"
export const FINISH_USER_REGISTRATION = BASE_URL + "sessions/confirm_device_registration"

export const CHECK_USER_EXITS = BASE_URL + "users/check_exists"
export const USER_LOGIN = BASE_URL + "users/login"
export const GET_USERS_FROM_PIN  = BASE_URL  + "users/get_user_from_pin"
export const GET_USER_VIDEOS = BASE_URL + "users/get_videos"


export const PUSH_CLOUD_STATUS_ROUTE = BASE_URL + "hardware/update_status"
export const GET_STATUS_CLOUD_ROUTE = BASE_URL + "hardware/get_status"
export const GET_MESSAGES_CLOUD_ROUTE = BASE_URL  + "hardware/get_messages"
export const GET_DEVICE_NAME_ROUTE = BASE_URL + "hardware/get_name"
export const UPDATE_DEVICE_NAME_ROUTE = BASE_URL + "hardware/update_name"
export const WRITE_HARDWARE_LOG = BASE_URL + "hardware/write_hardware_log"
export const GET_CONFIGURATION_LOG_URL = BASE_URL + "hardware/get_log"

export const TESTING_RESULTS_ROUTE = BASE_URL + "testing/get_test_results"
export const GET_DEVICE_DOCUMENTS = BASE_URL + "documents/get_device_documents"

export const LOADING_VALUE = "loading value ..."

export const HVAC_TYPE = 4
export const COMMAND = 0
export const NOTIFICATION = 1
export const ERROR = 2
export const CONNECTED = 3
export const DISCONNECTED = 4
export const LOOKED  = 5

export const SUCCESS_STATUS = 200
export const FAIL_STATUS = 403

export const NO_ACTIVITY = "NO_ACTIVITY"
export const LOADING = 'LOADING'
export const LOADED = 'LOADED'

export const UPDATING = 2
export const NO_UPDATING = 3


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

export const SUREFI_CMD_SERVICE_UUID = "C8BF000A-0EC5-2536-2143-2D155783CE78"
export const SUREFI_CMD_WRITE_UUID = "C8BF000B-0EC5-2536-2143-2D155783CE78" 
export const SUREFI_CMD_READ_UUID = "C8BF000C-0EC5-2536-2143-2D155783CE78" // i should get the notifications from this... so i need subscribte to this


export const SUREFI_SEC_SERVICE_UUID = "58BF000A-0EC5-2536-2143-2D155783CE78" // this service is for wirte the security string 
export const SUREFI_SEC_HASH_UUID = "58BF000B-0EC5-2536-2143-2D155783CE78" // this characteristic  is for write the security string

export const PAIR_SUREFI_SERVICE = "98BF000A-0EC5-2536-2143-2D155783CE78"
export const PAIR_SUREFI_TX = "98BF000B-0EC5-2536-2143-2D155783CE78" // rx
export const PAIR_SUREFI_WRITE_UUID = "98BF000C-0EC5-2536-2143-2D155783CE78" //tx 
export const PAIR_SUREFI_READ_UUID = "98BF000D-0EC5-2536-2143-2D155783CE78"


export const HVAC_SUREFI_THERMOSTAT_SERVICE = "E8BF000A-0EC5-2536-2143-2D155783CE78"
export const RX_DATA_CHAR_SHORT_UUID = "E8BF000B-0EC5-2536-2143-2D155783CE78"
export const TX_DATA_CHAR_SHORT_UUID = "E8BF000C-0EC5-2536-2143-2D155783CE78"
export const RADIO_STATUS_CHAR_SHORT_UUID = "E8BF000D-0EC5-2536-2143-2D155783CE78"
export const ADV_DATA_CHAR_SHORT_UUID = "E8BF000E-0EC5-2536-2143-2D155783CE78"

export const MODULE_SERVICE_SHORT_UUID = "01"
export const REMOTE_HARDWARE_TYPE = "02"

export const HARDWARE_CENTRAL_TYPE = "eaa4c810-e477-489c-8ae8-c86387b1c62e"
export const HARDWARE_REMOTE_TYPE = "0ef2c2a6-ef1f-43e3-be3a-e69628f5c7bf"


export const WIEGAND_CENTRAL = "01"
export const WIEGAND_REMOTE = "02"
export const EQUIPMENT_TYPE = "04"
export const THERMOSTAT_TYPE = "03"
export const MODULE_WIEGAND_CENTRAL = "07"
export const MODULE_WIEGAND_REMOTE = "08"
export const RELAY_WIEGAND_CENTRAL = 0x0A 
export const RELAY_WIEGAND_REMOTE = 0x0B 


export const RADIO_FIRMWARE_UPDATE = 1
export const APP_FIRMWARE_UDATE = 2
export const BLUETOOTH_FIRMWARE_UPDATE = 3

export const NORMAL_USER = 1
export const ADMIN_USER = 2


export const UNPAIR_STATUS = 1
export const PAIRING_STATUS = 3
export const PAIR_STATUS = 4


export const FORCE_PAIR_STATUS = 98
export const FORCE_UNPAIR_STATUS = 99



export const LOG_TYPES = [
	'BOOTLOADERINFO',
	'FAILSAFES',
	'FIRMWAREVERSIONS',
	'OPERATINGVALUES',
	'RADIOFIRMWARE',
	'BLUETOOTHFIRMWARE',
	'APPFIRMWARE',
	'HOPPINGTABLE',
	'RADIOSETTINGS',
	'POWERLEVELS',
	'LASTPACKET',
	'RESETCAUSES',
]


export const TO_HEX_STRING = string_array => {
	var byteArray = JSON.parse(string_array);
	return byteArray.map(function(byte) {
		return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	}).join('')
}

export const BYTES_VALUES = [
	"0000",
	"0001",
	"0010",
	"0011",
	"0100",
	"0101",
	"0110",
	"0111",
	"1000",
	"1001",
	"1010",
	"1011",
	"1100",
	"1101",
	"1110",
	"1111",
]

export const FORCE_PAIR = 1
export const NORMAL_PAIR = 0

export const BYTES_TO_HEX = (byteArray) => {
	return byteArray.map(function(byte) {
		return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	}).join('')
}

export const TWO_BYTES_TO_INT = (byte_1,byte_2) =>{
	return ((byte_1 & 0xff) << 8) | (byte_2 & 0xff); 
}


export const FOUR_BYTES_TO = (byte_1,byte_2,byte_3,byte_4) =>{
	return ((byte_1 & 0xff) << 32) | (byte_2 & 0xff << 16) | (byte_3 & 0xff << 8) | (byte_4 && 0xff ); 
}

export const FOUR_BYTES_ARRAY_TO_DECIMAL = (four_bytes_array) => {
	var result = false
	if(four_bytes_array){
		if(Array.isArray(four_bytes_array)){
			if(four_bytes_array.length == 4){
				return ((four_bytes_array[0] & 0xff) << 32) | ([1] & 0xff << 16) | (four_bytes_array[2] & 0xff << 8) | (four_bytes_array[3] && 0xff ); 				
			}
		}
	}

	return result
}

export const FOUR_BYTES_ARRAY_TO_DECIMAL_BIG_ENDIAN = (four_bytes_array) => {
	var result = false
	if(four_bytes_array){
		if(Array.isArray(four_bytes_array)){
			if(four_bytes_array.length == 4){
				return ((four_bytes_array[3] & 0xff) << 32) | ([2] & 0xff << 16) | (four_bytes_array[1] & 0xff << 8) | (four_bytes_array[0] && 0xff ); 				
			}
		}
	}

	return result
}



export const BYTES_TO_INT = array => { //big endian
	var result = ((array[array.length - 1]) | 
              (array[array.length - 2] << 8) | 
              (array[array.length - 3] << 16) | 
              (array[array.length - 4] << 24));
	return result
}

export const BYTES_TO_INT_LITTLE_ENDIANG = array => { 
	var result = ((array[array.length - 4]) | 
              (array[array.length - 3] << 8) | 
              (array[array.length - 2] << 16) | 
              (array[array.length - 1] << 24));
	return result
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

const checkHex = (n) => {
	return/^[0-9A-Fa-f]{1,64}$/.test(n)}

export const Hex2Bin = (n) => {
	if(!checkHex(n))
		return 0;

	return parseInt(n,16).toString(2)}

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

export const DECIMAL_TO_FOUR_BYTES = decimal => {
	var byteArray = [0,0,0,0]
	for (var index = 0; index < byteArray.length; index++) {
		var byte = decimal & 0xff;
		byteArray[index] = byte;
		decimal = (decimal - byte) / 256;
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

export const IS_STRING = obj => {
	if (typeof obj === 'string' || obj instanceof String)
		return true
	return false
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

export const HEADERS_FOR_POST = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

export const DEC2HEX = i => {
	var result = "0000";
	if      (i >= 0    && i <= 15)    { result = "000" + i.toString(16); }
	else if (i >= 16   && i <= 255)   { result = "00"  + i.toString(16); }
	else if (i >= 256  && i <= 4095)  { result = "0"   + i.toString(16); }
	else if (i >= 4096 && i <= 65535) { result =         i.toString(16); }
	return result
}

export const DEC2BIN = n => {
	return (n >>> 0).toString(2)
}

export const CRC16 = bytes => {
	var crc = 0
	var k = 0
	var CRC_TABLE = [0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
         0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef]

	bytes.map(data_byte => {
		k = 0xFFFFFFFF & ((crc >> 12) ^ (data_byte >> 4))
        crc = 0xFFFF & (CRC_TABLE[k & 0x0F] ^ (crc << 4))
        k = 0xFFFFFFFF & ((crc >> 12) ^ (data_byte >> 0))
        crc = 0xFFFF & (CRC_TABLE[k & 0x0F] ^ (crc << 4))
	})

	return crc & 0xFFFF	
}


export const DIVIDE_MANUFACTURED_DATA = (manufacturedData, address) => {
	var divide_manufactured_data = {}
	if(manufacturedData){
		divide_manufactured_data.hardware_type = manufacturedData.substr(0, 2) // 01 or 02
		divide_manufactured_data.firmware_version = manufacturedData.substr(2, 2) //all four bytes combinations
		divide_manufactured_data.device_state = manufacturedData.substr(4, 4)
		divide_manufactured_data.device_id = manufacturedData.substr(8, 6);
		divide_manufactured_data.tx = manufacturedData.substr(14, 6);
		divide_manufactured_data.extra_byte = manufacturedData.substr(20,2)
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


export const GET_SECURITY_STRING_WITH_EXTRA_BYTE = (peripheralRXUUID, peripheralTXUUID,extra_byte) => {
	peripheralRXUUID = peripheralRXUUID.toUpperCase()
	peripheralTXUUID = REVERSE_STRING(peripheralTXUUID.toUpperCase()) + "x~sW5-C\"6fu>!!~X" 
	let string = peripheralRXUUID + peripheralTXUUID + extra_byte
	
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
			
		if(!device.manufactured_data)
			return false
			
		if(!device.manufactured_data.device_id)
			return false
			
		
		var data_upper_case = device.manufactured_data.device_id.toUpperCase()
		device_id = device_id.toUpperCase()
		return data_upper_case == device_id;
	})
	return devices
}


export const GET_PAIRING_TO_DEVICES = (device,type) => {
	if (!device.manufactured_data)
		return false
		
	return device.manufactured_data.hardware_type == type
	
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

export const INCREMENT_PROGRAM_NUMBER = programNumber => {

	programNumber = parseInt(programNumber, 10) + 1
	console.log("programNumber",programNumber)
	var byte_program_number = LONG_TO_BYTE_ARRAY(programNumber)
	return byte_program_number
}

export const LONG_TO_BYTE_ARRAY = long => {  //BIG INIDIAN
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0];

    for ( var index = byteArray.length -1; index >= 0; index -- ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};

export const INT_TO_BYTE_ARRAY = int => {
	var byteArray = [0, 0, 0, 0];

    for ( var index = 0; index < byteArray.length; index ++ ) {
        var byte = int & 0xff;
        byteArray [ index ] = byte;
        int = (int - byte) / 256 ;
    }

    return byteArray;
}

export const GET_LARGEST = (a,b,c) => {
	//console.log("a: " + a + " b: " + b + " c: " + c)
	var major_version = 0
    if(a > b)
        if(a > c)
            major_version = a
        else
            major_version = c
    else
        if(b > c)
            major_version = b
        else 
            major_version = c
    
    return major_version
}

export const PRETY_VERSION = version => {
	if(version){
		if(version < 1){
			var version_split = version.toString().split(".")

			return ("v" + version_split[0] + ".0" + version_split[1])
		}
			
		if (version == 1)
			return "v1.0"
		if (version > 1){
			var version_split = version.toString().split(".")
			if(version_split[1] != null && version_split != undefined){
				return ("v" + version_split[0] +  ".0" + version_split[1])	
			}else{
				return ("v" + version_split[0] +  ".0")	
			}
			
		}

		return ("v" + version.toString())
	}else{
		return ""
	}

}

export const prettyBytesToHex = bytes => {
	var string_bytes = bytesToHex(bytes)
	var final_string = ""
	for(var i = 0; i < string_bytes.length -1; i = i + 2){
		var j = i + 1
		if(j < string_bytes.length){
			final_string = final_string + " | " + string_bytes.charAt(i) + string_bytes.charAt(i + 1) + " , "
		}
	}
	return final_string;
}

export const prettyBytesToHexTogether = bytes => {
	var string_bytes = bytesToHex(bytes)
	var final_string = ""
	for(var i = 0; i < string_bytes.length -1; i = i + 2){
		var j = i + 1
		if(j < string_bytes.length){
			final_string = final_string + string_bytes.charAt(i) + string_bytes.charAt(i + 1)
		}
	}
	return final_string.toUpperCase();
}


export const bytesToHex = bytes => {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

export const MAKE_ID = () => {
  var text = "";
  var possible = "abcdef01234567890";

  for (var i = 0; i < 12; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


export const stringFromUTF8Array = data => 
{
	
    const extraByteMap = [ 1, 1, 1, 1, 2, 2, 3, 0 ];
    var count = data.length;
    var str = "";
    
    for (var index = 0;index < count;)
    {
      var ch = data[index++];
      if (ch & 0x80)
      {	
        var extra = extraByteMap[(ch >> 3) & 0x07];
        if (!(ch & 0x40) || !extra || ((index + extra) > count)){
        
          return null;
        }
        
        ch = ch & (0x3F >> extra);
        for (;extra > 0;extra -= 1)
        {
          var chx = data[index++];
          if ((chx & 0xC0) != 0x80){
        
          		return null;
          }
            
          
          ch = (ch << 6) | (chx & 0x3F);
        }
      }
      
      str += String.fromCharCode(ch);
    }
    
    return str;
}


var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

    return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
}

export const reverseTwoComplement = decimal_number => {

	
  	var first_byte_less_one = decimal_number - 1
  	
  	var string_array = first_byte_less_one.toString(2).split("")
  	let is_positive = true

  	if(string_array[0] == "1"){ // the negative numbers start with 1
  		is_positive = false
  	}

  	var reverse_string_array = string_array.map(x => {
  		if(x == '1') 
  			return '0' 
  		else return '1'
  	})

  	var new_string_array = reverse_string_array.reduce((acumulator,x) => acumulator + x,"")
  	if(is_positive)
  		return parseInt(new_string_array,2)
  	else 
  		return (parseInt(new_string_array,2) * -1)

  	return final_result

}

function doPrettyZeros(number){
	if(number == "0"){
		return "0x00"
	}else{
		var number_string = number.toString()
		if(number_string.length > 1)
			return "0x" + number

		return "0x0" + number
	}
}


export const TRANSMIT = params => {
	var transmit_info = params.transmit_info
	var success_text = transmit_info.success == 1 ? "SUCCESS" : "FAILURE";
	var success_color = transmit_info.success == 1 ? success_green : "red";
	var num_retries = transmit_info.numRetries + " retries"
	
	var rssi = "RSSI: "  + reverseTwoComplement([transmit_info.rssi[0]]) + " dBm"
	var snr = "SNR: " + transmit_info.snr + " dB"
	var ack_data = transmit_info.ackDataLength + " Byte ACK" 

	

	return (
		<View style={{marginRight:10,marginLeft:5,padding:10,width: ((width/3) - 5)}}>
			<View style={{flexDirection:"row"}}>
				<Text style={{color:success_color}}>
					{success_text}
				</Text>
			</View>
			<View>
				<Text>
					{num_retries}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{rssi}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{snr}
				</Text>
			</View>
			<View>
				<Text>
					{ack_data}
				</Text>
			</View>
		</View>
	)
}


export const RECEIVE = params => {
	var receive_info = params.receive_info
	var success_text = receive_info.success == 1 ? "SUCCESS" : "FAILURE";
	var success_color = receive_info.success == 1 ? success_green : "red";
	var rssi = "RSSI: "  + reverseTwoComplement([receive_info.rssi[0]]) + " dBm"
	var snr = "SNR: " + receive_info.snr

	return (
		<View style={{marginRight:5,marginLeft:5,padding:10,width: ((width/3) - 5)}}>
			<View style={{flexDirection:"row"}}>
				<Text style={{color:success_color}}>
					{success_text}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{rssi}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{snr}
				</Text>
			</View>
		</View>
	)
}


export const ERROR_BLOCK = params => {
	var error = params.error
	return(
		<View style={{width:width/8,borderRadius:30,alignItems:"center"}}>
			<Text style={{backgroundColor:gray_background,padding:5,margin:1,fontSize:10}}>
				{doPrettyZeros(error)}
			</Text>
		</View>
	)
}


export const TIME = params => {
	var value = ""
	var minutes = params.minutes
	
	if(minutes < 1){
		value = "Less than a minute"

	}else if(minutes >= 1 && minutes <= 60){
		
		value = minutes + " minutes"

	}else if(minutes > 60 && minutes < 240){
	
		var hours = parseInt(minutes / 60)
		var rest_minutes = minutes - (hours * 60)
		value = hours + " Hours " + rest_minutes + " minutes"

	}else if(minutes >= 240 && minutes <= 254){

		value = "More than 4 hours"

	}else {
		value = "Empty"
	}

	return (
		<View style={{marginLeft:5}}>
			<Text>
				{value}
			</Text>
		</View>
	)
}


export const SWITCH = params => {
	let style = {
		borderWidth:3,
		width:35,
		height:35,
		marginHorizontal:3,
		alignItems:"center",
		borderRadius:2,
		justifyContent:"center",
		borderColor: params.color,
		borderRadius:50,
		backgroundColor: params.background,
	}
	
	let name = params.name ? params.name : " - " 

	if(params.isActivated){
		style.borderColor = params.color
		style.backgroundColor = params.color

		return (
			<TouchableOpacity 
				style={style}
				onPress={() => params.onPress(1)}
			>
				<Text style={{color:"black",fontSize:14}}>
					{name}
				</Text>
			</TouchableOpacity> 
		)
	}

	return (
		<TouchableOpacity 
			style={style}
			onPress={() => params.onPress(0)}
		>
			<Text style={{color:"black",fontSize:14}}>
				{name}
			</Text>
		</TouchableOpacity>
	)	
}