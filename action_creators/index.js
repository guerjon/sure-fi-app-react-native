import BleManager from "react-native-ble-manager"

import {
	NativeModules,
	NativeEventEmitter
} from 'react-native'

import {
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	PUSH_CLOUD_STATUS_ROUTE,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_WRITE_UUID,
	PAIR_SUREFI_READ_UUID,
	SUREFI_SEC_SERVICE_UUID,
	SUREFI_SEC_HASH_UUID,
	WRITE_HARDWARE_LOG,
	HEADERS_FOR_POST,
	BASE64,
	COMMAND,
	HVAC_TYPE,
	HVAC_SUREFI_THERMOSTAT_SERVICE,
	RX_DATA_CHAR_SHORT_UUID,
	TX_DATA_CHAR_SHORT_UUID,
	prettyBytesToHex,
	BYTES_TO_INT_LITTLE_ENDIANG
} from '../constants'
import {store} from "../app"
import {
	COMMAND_FORCE_UNPAIR
} from '../commands'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import Command from '../command'

function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}


export const IS_CONNECTED = (id) => {
	
	return new Promise((fulfill,reject) => {
		
		BleManager.getConnectedPeripherals().then(response => {
			
			if(response.length){ // means its at least one device connected
				
                var device = response.filter(connected_device => {
                	
                    if(connected_device.id == id){
                        return fulfill(true)
                    }
                })
                if(device){ // means is connected to central_device
                    return fulfill(true)
                }
            }else{ 
                return fulfill(false)
            }

		}).catch(error => {
			reject("error",error)
		})
	})
}

export const START_NOTIFICATION = (id) => {
	return new Promise((fulfill,reject) => {
		BleManagerModule.retrieveServices(id, () => {
			BleManager.startNotification(
				id,
				SUREFI_CMD_SERVICE_UUID,
				SUREFI_CMD_READ_UUID
			).then(response => fulfill())
			.catch(error => reject(error))
		})
	})
}

export const PUSH_CLOUD_STATUS = (hardware_serial,hardware_status) => {
	console.log("push_cloud_status() on action_creators")
	return new Promise((fulfill,reject) => {
		fetch(PUSH_CLOUD_STATUS_ROUTE,{
			method : "POST",
			headers: {
			    'Accept': 'application/json',
			    'Content-Type': 'application/json',				
			},
			body : JSON.stringify({
				hardware_serial : hardware_serial,
				hardware_status : hardware_status	
			})
		}).then(response => {
			fulfill(response)
		}).catch(error => {
			console.log("error on PUSH_CLOUD_STATUS",error)
			reject(error)	
		})
	})
}

/*
	Data is an array with the hex commands to write and sometimes have data
	example simple command [0x21]
	example command with data [0x21,0x04,0x23,0x52]
*/
export const WRITE_COMMAND = (id,data,type) => {
	console.log("WRITE_COMMAND()","data : " + prettyBytesToHex(data) )
	LOG_INFO(data,COMMAND)

	return new Promise((fulfill,reject) => {	
		BleManagerModule.retrieveServices(id,() => {
			BleManager.write(id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20)
			.then(response => {
				fulfill(response)
			})
			.catch(error => {
				console.log("Error on WRITE_COMMAND",error)
				reject(error)
			})
		})
	})
}

export const HVAC_WRITE_COMMAND = (id,data) => {
	LOG_INFO(data,COMMAND)
	var command = data[0];
	data.shift(); //remove the command
	var new_structure_command = [0x7E,command,data.length].concat(data)
	return new Promise((fulfill,reject) => {
		BleManager.write(id,HVAC_SUREFI_THERMOSTAT_SERVICE,TX_DATA_CHAR_SHORT_UUID,new_structure_command,20)
		.then(response => {
			fulfill(response)
		})
		.catch(error => {
			console.log("Error on WRITE_COMMAND",error)
			reject(error)
		})
	})
}


/*
	@data is an array with the hex commands to write and sometimes have data
	example simple command [0x21]
	example command with data [0x21,0x04,0x23,0x52]
	@type is the type of command we have 5 types COMMAND, NOTIFICATION, ERROR, CONNECTED, DISCONNECTED AND LOCKED
	the types can be found in constans.js

*/
export const LOG_INFO = (data,type,name) => {
	//console.log("LOG_INFO()",type)
	var data_to_save = data.slice(0)	
	var value = data_to_save.shift()

	var commands = store.getState().bluetoothDebugLog.commands
	var id = store.getState().bluetoothDebugLog.global_command_id
	id += 1

	var command = new Command(id,value,type,data_to_save,name,"action")

	commands.unshift(command)

	store.dispatch({type:"UPDATE_COMMANDS",commands:commands,global_command_id:id})
}


export const WRITE_PAIRING = (id,data) => {
	LOG_INFO(data,COMMAND)
	console.log("WRITE_PAIRING()")
	return new Promise((fulfill,reject) => {
		BleManagerModule.retrieveServices(id,() => {
			console.log("1")
			BleManager.write(id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID,data,20)
			.then(response => {
				console.log("response",response)
				fulfill(response)
			})
			.catch(error => {
				console.log("error",error)
				reject(response)
			})
		})
	})
}

export const WRITE_FORCE_UNPAIR = (id) => {
	console.log("WRITE_FORCE_UNPAIR()")
	return new Promise ((fulfill,reject) => {
		WRITE_COMMAND(id,COMMAND_FORCE_UNPAIR)
		.then(response => {
			console.log("BEFORE WRITE UNPAIR")
			WRITE_UNPAIR(id)
			.then(response => {
				fulfill()
			})
			.catch(error => reject(error))
		})
		.catch(error => reject(error))
	})
}


export const WRITE_UNPAIR = (id) => {
	console.log("WRITE_UNPAIR()")
	LOG_INFO([0,0,0])
	return new Promise((fulfill,reject) => {
		BleManagerModule.retrieveServices(id,() => {
			BleManagerModule.unPair(id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID,20,() => {
				fulfill()
			})
		})
	})
}

/*
	Write the security string to keep the connection without this the device will be disconnected on 5 seconds
*/
export const WRITE_HASH = (id,data) => {
	return new Promise((fulfill,reject) => {
		BleManagerModule.retrieveServices(id,() => {
            BleManager.write(id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then(response => {
            	fulfill(response)
            }).catch(error => {
            	console.log("Error",error)	
            	reject(error)
            });
		})
	})
}

export const READ_STATUS = id => {
	return new Promise((fulfill,reject) => {
		BleManager.read(id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_READ_UUID).then(response => {
			fulfill(response)
    	}).catch(error => reject(error))		
	})	
}

export const READ_TX = id => {
	return new Promise((fulfill,reject) => {	
		BleManager.read(id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID).then(response => {
			fulfill(response)
    	}).catch(error => reject(error))
	})	
}

export const DISCONNECT = id => {
	return new Promise((fulfill,reject) => {
		BleManager.disconnect(id)
		.then(response => {
			fulfill("Disconnected: " + id)
		})
		.catch(error => console.log("error",error))
	})
}

export const CONNECT = (device) => {
		IS_CONNECTED(device.id)
		.then(response => {
			if(!response)
				BleManager.connect(device.id).then(response => {})
		})
		.catch(error => console.log("Error",error))
}

export const POST_LOG = log => {
	fetch(WRITE_HARDWARE_LOG,{
		method: "post",
		headers: HEADERS_FOR_POST,
		body: JSON.stringify(log)
	}).then(response => {
		
	}).catch(error => {
		Alert.alert("Error",error)
	})
}
/*
	if text is included then 
*/
export const LOG_CREATOR = (bytes,manufactured_id,UUID,log_type,text) => {

	var log_value = bytesToHex(bytes)
	log_value = BASE64.btoa(log_value)

	var body = {
		log_type : log_type,
		log_value : log_value,
		device_id : UUID, //this looks wrong but is correct the name its bad on the sistem
		hardware_serial : manufactured_id.toUpperCase() //this looks wrong but is correct the name its bad on the sistem
	}

	return body
}


function calculateHours(number_seconds){
	return parseInt(number_seconds / 3600)
}

function calculateMinutes(number_seconds){
	return parseInt(number_seconds / 60)
}	

function calculateSeconds(number_seconds,minutes){
	return number_seconds - (minutes * 60)
}

export const parseSecondsToHumanReadable = (number_seconds) => {
	number_seconds = BYTES_TO_INT_LITTLE_ENDIANG(number_seconds)
	var time = ""
	if(number_seconds < 60 ){ // a min
		time = number_seconds + " seconds "
	}else if(number_seconds < 3600){ //an hour
		
		let minutes = calculateMinutes(number_seconds)
		let rest_of_seconds = calculateSeconds(number_seconds,minutes)

		time = minutes + "m " + rest_of_seconds + "s " 
		
	}else if(number_seconds < 86400){ // a day

		let hours = calculateHours(number_seconds)
		let minutes = calculateMinutes(number_seconds - (3600 * hours))
		let rest_of_seconds = number_seconds - ((hours * 3600) + (minutes * 60) )

		time = hours + "h "  + minutes + "m " + rest_of_seconds + "s"

	}else if(number_seconds >= 86400){ //more than a day
		var days = number_seconds / 86400
		time = parseInt(days) + " days "
	}

	return time
}



