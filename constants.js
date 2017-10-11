var md5 = require('md5');

export const BASE_URL = "https://tjdk5m3fi2.execute-api.us-west-2.amazonaws.com/prod/"
export const FIRMWARE_CENTRAL_ROUTE = "https://tjdk5m3fi2.execute-api.us-west-2.amazonaws.com/prod/firmware/get_available_firmware"
export const API_REGISTERING_LINK = BASE_URL +   "systems/register_bridge_system"
export const UPLOAD_IMAGE_LINK = "https://admin.sure-fi.com/mobile_api/upload_system_images"
export const UNPAIR_LINK = BASE_URL + "systems/unpair_bridge_system"
export const DEVICE_REGISTRATION_LINK = BASE_URL + "sessions/check_device_registration"
export const DEVICE_REGISTRATE_LINK = BASE_URL + "sessions/register_device"
export const CHECK_USER_EXITS = BASE_URL + "users/check_exists"
export const USER_LOGIN = BASE_URL + "users/login"
export const SESSION_START = BASE_URL + "sessions/start"
export const FINISH_USER_REGISTRATION = BASE_URL + "sessions/confirm_device_registration"
export const PUSH_CLOUD_STATUS_ROUTE = BASE_URL + "hardware/update_status"
export const GET_STATUS_CLOUD_ROUTE = BASE_URL + "hardware/get_status"
export const GET_MESSAGES_CLOUD_ROUTE = BASE_URL  + "hardware/get_messages"
export const GET_DEVICE_NAME_ROUTE = BASE_URL + "hardware/get_name"
export const UPDATE_DEVICE_NAME_ROUTE = BASE_URL + "hardware/update_name"
export const TESTING_RESULTS_ROUTE = BASE_URL + "testing/get_test_results"
export const GET_USERS_FROM_PIN  = BASE_URL  + "users/get_user_from_pin"
export const GET_DEVICE_DOCUMENTS = BASE_URL + "documents/get_device_documents"
export const GET_USER_VIDEOS = BASE_URL + "users/get_videos"
export const WRITE_HARDWARE_LOG = BASE_URL + "hardware/write_hardware_log"


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

export const SUREFI_CMD_SERVICE_UUID = "C8BF000A-0EC5-2536-2143-2D155783CE78"
export const SUREFI_CMD_WRITE_UUID = "C8BF000B-0EC5-2536-2143-2D155783CE78"
export const SUREFI_CMD_READ_UUID = "C8BF000C-0EC5-2536-2143-2D155783CE78"


export const SUREFI_SEC_SERVICE_UUID = "58BF000A-0EC5-2536-2143-2D155783CE78"
export const SUREFI_SEC_HASH_UUID = "58BF000B-0EC5-2536-2143-2D155783CE78"

export const PAIR_SUREFI_SERVICE = "98BF000A-0EC5-2536-2143-2D155783CE78"
export const PAIR_SUREFI_WRITE_UUID = "98BF000C-0EC5-2536-2143-2D155783CE78"
export const PAIR_SUREFI_READ_UUID = "98BF000D-0EC5-2536-2143-2D155783CE78"

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

export const BYTES_TO_INT = array => { //big endian
	var result = ((array[array.length - 1]) | 
              (array[array.length - 2] << 8) | 
              (array[array.length - 3] << 16) | 
              (array[array.length - 4] << 24));
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

const checkHex = (n) => {return/^[0-9A-Fa-f]{1,64}$/.test(n)}

export const Hex2Bin = (n) => {if(!checkHex(n))return 0;return parseInt(n,16).toString(2)}

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
	//console.log("MATCH_DEVICE",device_id);
	devices = devices.filter(device => {
		//console.log("device",device.manufactured_data.device_id);
		if (!device)
			return false
		
		var data_upper_case = device.manufactured_data.device_id.toUpperCase()
		device_id = device_id.toUpperCase()
		//console.log("searched_device: " + data_upper_case + " my device: " + device_id);
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


export const FIND_PROGRAMING_NUMBER = data =>{
	var data = data.value
	
	var bootloader_info = BYTES_TO_HEX(data)
	bootloader_info = bootloader_info.substr(2,bootloader_info.length).toUpperCase()
	
	var lowerReadCrc            = bootloader_info.substr(0,4)
	var lowerCalculatedCrc      = bootloader_info.substr(4,4)
	var lowerVersionNumberMajor = bootloader_info.substr(8,2)
	var lowerVersionNumberMinor = bootloader_info.substr(10,2)
	var lowerProgramNumber      = bootloader_info.substr(12,4)
	var upperReadCrc            = bootloader_info.substr(16,4)
	var upperCalculatedCrc      = bootloader_info.substr(20,4)
	var upperVersionNumberMajor = bootloader_info.substr(24,2)
	var upperVersionNumberMinor = bootloader_info.substr(26,2)
	var upperProgramNumber      = bootloader_info.substr(28,4)
	var bootingUpperMemory      = bootloader_info.substr(32,2)

	if(lowerProgramNumber == "FFFF") {
	    lowerProgramNumber = "0000"
	}

	if( upperProgramNumber == "FFFF" ){
	    upperProgramNumber = "0000"
	}

	if( lowerReadCrc == lowerCalculatedCrc) {
	    lowerImageOK = true
	    lowerProgramNumber = INCREMENT_PROGRAM_NUMBER(lowerProgramNumber)
	}

	if (upperReadCrc == upperCalculatedCrc){
	    upperImageOK = true
	    upperProgramNumber = INCREMENT_PROGRAM_NUMBER(upperProgramNumber)
	}

	if( bootingUpperMemory == "00") {
		return lowerProgramNumber
	}

	else if  (bootingUpperMemory == "01") {
		return upperProgramNumber
	}

	else {
		console.log("CRC ERROR","Error Updating Firmware. CRC Error on Bridge Device")
	    return 0
	}	
}

const INCREMENT_PROGRAM_NUMBER = programNumber => {
	programNumber = parseInt(programNumber, 10) + 1
	var byte_program_number = LONG_TO_BYTE_ARRAY(programNumber)
	return byte_program_number
}

const LONG_TO_BYTE_ARRAY = long => {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0];

    for ( var index = byteArray.length -1; index >= 0; index -- ) {
        var byte = long & 0xff;
        byteArray [ index ] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
};

export const GET_LARGEST = (a,b,c) => {
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

			return ("V" + version_split[0] + ".0" + version_split[1])
		}
			
		if (version == 1)
			return "V1.0"
		if (version > 1){
			var version_split = version.toString().split(".")
			return ("V" + version_split[0] +  ".0" + version_split[1]  )
		}

		return ("V" + version.toString())
	}else{
		return ""
	}

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
