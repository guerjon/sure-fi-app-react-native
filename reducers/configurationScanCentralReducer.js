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
  central_device_matched : false,
  central_device : {},
  scanning_central_units: false,
  bluetooth_error : false,
  central_device_is_not_on_pairing_mode : false
}

export default function configurationScanCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "CONFIGURATION_RESET_CENTRAL_REDUCER":
      return {
        ...state,
        manufactured_data : [],
        central_device_matched : false,
        central_device : {},
        scanning_central_units: false,
        bluetooth_error : false,
        central_device_is_not_on_pairing_mode : false        
      }
    case "CONFIGURATION_SET_MANUFACTURED_DATA":
      return {
        ...state,
        manufactured_data: action.manufactured_data,
      }
    case "CONFIGURATION_CENTRAL_DEVICE_MATCHED":
    	return {
    		...state,
    		central_device_matched: true,
    		central_device: action.central_device
    	}
    case "CONFIGURATION_CENTRAL_DEVICE_NOT_MATCHED":
    	return {
    		...state,
    		central_device_matched: false
    	}
    case "CONFIGURATION_RESET_QR_CENTRAL_STATE":
      return {
        ...state,
        central_device_matched: false,
        central_device : {},
        central_device_is_not_on_pairing_mode: false
      }
    case "CONFIGURATION_SCANNING_CENTRAL_UNITS":
      return {
        ...state,
        scanning_central_units : true
      }
    case "CONFIGURATION_SCANNED_CENTRAL_UNITS" :
      return {
        ...state,
        scanning_central_units : false,
        scanned_central_units: true,

      }
    case "CONFIGURATION_BLUETOOTH_ERROR": 
        return {
          bluetooth_error: true
        }

    case "CONFIGURATION_ADD_NEW_BRIDGE":
      return {
        ...state,
        bridges : action.bridges
      }
    case "CONFIGURATION_CENTRAL_DEVICE_IS_NOT_ON_PAIRING_MODE":
      return {
        central_device_is_not_on_pairing_mode : true
      }
    default:
      return state
  }
}