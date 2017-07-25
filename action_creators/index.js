import BleManager from 'react-native-ble-manager'
import {
	NativeModules
} from 'react-native'

import {
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_READ_UUID,
	PUSH_CLOUD_STATUS_ROUTE
} from '../constants'

const BleManagerModule = NativeModules.BleManager;

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