import BleManager from 'react-native-ble-manager'
import {
	NativeModules
} from 'react-native'

import {SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_READ_UUID} from '../constants'
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