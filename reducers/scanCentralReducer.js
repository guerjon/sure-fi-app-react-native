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
  camera_status : "hidden"
}


export default function scanCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_CENTRAL_REDUCER":
      return {
        ...state,
        manufactured_data : [],
        central_device : {},
        scanning_status : "no_device_found"
      }
    case "CENTRAL_DEVICE_MATCHED":
      return {
        ...state,
        central_device : action.central_device,
        scanning_status : "device_scanned_and_matched"
      }
    case "CENTRAL_DEVICE_NOT_MATCHED":
      return {
        ...state,
        scanning_status : "device_scanned_not_matched"
      }
    case "SCANNING_CENTRAL_UNITS":
      return {
        ...state,
        scanning_central_units : true
      }

    case "CENTRAL_DEVICE_IS_NOT_ON_PAIRING_MODE":
      return {
        scanning_status : "device_is_not_on_paring_mode"
      }
    case "START_SCANNING":
      return {
        ...state,
        central_device : {}
      }
    case "CLEAN_CAMERA":
      return{
        ...state,
        scanning_status : "clean_camera"
      }
    case "IS_NOT_CENTRAL_DEVICE":
      return {
        ...state,
        scanning_status : "is_not_central_device"
      }
    case "HIDE_CAMERA":
      return {
        ...state,
        camera_status : "hidden"
      }
    case "SHOW_CAMERA":
      return {
        ...state,
        camera_status : "showed"
      }
    case "UPDATE_DEVICE":
      console.log("new_device",action.device)
      return {
        ...state,
        central_device : action.device
      }
    default:
      return state
  }
}