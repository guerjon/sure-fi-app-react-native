import {
  SET_MANUFACTURED_DATA, 
  CENTRAL_DEVICE_MATCHED, 
  CENTRAL_DEVICE_NOT_MATCHED,
  RESET_QR_CENTRAL_STATE,
  SCANNING_CENTRAL_UNITS,
  SCANNED_CENTRAL_UNITS,
  BLUETOOTH_ERROR,
  ADD_NEW_BRIDGE,

} from '../constants'

const initialState = {
  manufactured_data : [],
  central_device : {},
  scanning_status: "no_device_found",
  central_device_status : "disconnected" 
  //central_device_status : "connected" 
}

export default function configurationScanCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "CONFIGURATION_RESET_CENTRAL_REDUCER":
      return {
        ...state,
        manufactured_data : [],
        central_device : {},
        scanning_status : "no_device_found",
        central_device_status : "disconnected"
      }
    case "CONFIGURATION_CENTRAL_DEVICE_MATCHED":
    	return {
    		...state,
        central_device : action.central_device,
        scanning_status : "device_scanned_and_matched"
    	}
    case "CONFIGURATION_CENTRAL_DEVICE_NOT_MATCHED":
    	return {
    		...state,
        scanning_status : "device_scanned_not_matched"
    	}
    case "CONFIGURATION_SCANNING_CENTRAL_UNITS":
      return {
        ...state,
        scanning_central_units : true
      }

    case "CONFIGURATION_CENTRAL_DEVICE_IS_NOT_ON_PAIRING_MODE":
      return {
        scanning_status : "device_is_not_on_paring_mode"
      }
    case "START_SCANNING":
      return {
         central_device : {}
      }
    case "CONNECTING_CENTRAL_DEVICE":
      return {
        ...state,
        central_device_status : "connecting"
      }
    case "CONNECTED_CENTRAL_DEVICE":
      return {
        ...state,
        central_device_status : "connected"
      }
    case "DISCONNECT_CENTRAL_DEVICE":
      return{
        ...state,
        central_device_status : "disconnected"
      }
    default:
      return state
  }
}