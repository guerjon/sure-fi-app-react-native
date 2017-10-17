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
} from '../constants'

import {
	COMMAND_FORCE_UNPAIR
} from '../commands'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}


export const IS_CONNECTED = (id) => {
	
	return new Promise((fulfill,reject) => {
		
		BleManager.getConnectedPeripherals([SUREFI_CMD_SERVICE_UUID]).then(response => {
			
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
		}).catch(error => reject(error))
	})
}

export const WRITE_COMMAND = (id,data) => {
	
	//console.log("WRITING_COMMAND: " + data)

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

export const WRITE_PAIRING = (id,data) => {
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
	return new Promise ((fulfill,reject) => {
		WRITE_COMMAND(id,COMMAND_FORCE_UNPAIR)
		.then(response => {
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