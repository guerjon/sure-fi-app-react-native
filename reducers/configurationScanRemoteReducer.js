import {
  SET_MANUFACTURED_DATA, 
  REMOTE_DEVICE_MATCHED, 
  REMOTE_DEVICE_NOT_MATCHED,
  RESET_QR_REMOTE_STATE,
  SCANNING_REMOTE_UNITS,
  SCANNED_REMOTE_UNITS,
  BLUETOOTH_ERROR,
  ADD_NEW_BRIDGE,

} from '../constants'

const initialState = {
  manufactured_data : [],
  remote_device : {},
  scanning_status: "no_device_found",
  remote_device_status : "disconnected"
}

export default function configurationScanRemoteReducer (state = initialState, action) {
  switch (action.type) {
    case "CONFIGURATION_RESET_REMOTE_REDUCER":
      return {
        ...state,
        manufactured_data : [],
        remote_device : {},
        scanning_status : "no_device_found",
        remote_device_status : "disconnected"
      }
    case "CONFIGURATION_REMOTE_DEVICE_MATCHED":
    	return {
    		...state,
        remote_device : action.remote_device,
        scanning_status : "device_scanned_and_matched"
    	}
    case "CONFIGURATION_REMOTE_DEVICE_NOT_MATCHED":
    	return {
    		...state,
        scanning_status : "device_scanned_not_matched"
    	}
    case "CONFIGURATION_SCANNING_REMOTE_UNITS":
      return {
        ...state,
        scanning_remote_units : true
      }

    case "CONFIGURATION_REMOTE_DEVICE_IS_NOT_ON_PAIRING_MODE":
      return {
        scanning_status : "device_is_not_on_paring_mode"
      }
    case "START_SCANNING":
      return {
         remote_device : {}
      }
    case "CONFIGURATION_CONNECTING_REMOTE_DEVICE":
      return {
        ...state,
        remote_device_status : "connecting"
      }
    case "CONFIGURATION_CONNECTED_REMOTE_DEVICE":
      return {
        ...state,
        remote_device_status : "connected"
      }
    case "CONFIGURATION_DISCONNECT_REMOTE_DEVICE":
      return{
        ...state,
        remote_device_status : "disconnected"
      }
    default:
      return state
  }
}