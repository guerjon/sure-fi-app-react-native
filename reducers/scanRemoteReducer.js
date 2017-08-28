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
  camera_status : "hidden",
  remote_device_status : "",
  scan_result_id : null
}


export default function scanRemoteReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_REMOTE_REDUCER":
      return {
        manufactured_data : [],
        remote_device : {},
        scanning_status: "no_device_found",
        camera_status : "hidden",
        remote_device_status : null,
        scan_result_id : null
      }
    case "REMOTE_DEVICE_MATCHED":
      return {
        ...state,
        remote_device : action.remote_device,
        scanning_status : "device_scanned_and_matched"
      }
    case "REMOTE_DEVICE_NOT_MATCHED":
      return {
        ...state,
        scanning_status : "device_scanned_not_matched",
        remote_device_status : "not_matched",
        scan_result_id : action.scan_result_id
      }
    case "SCANNING_REMOTE_UNITS":
      return {
        ...state,
        scanning_remote_units : true
      }

    case "REMOTE_DEVICE_IS_NOT_ON_PAIRING_MODE":
      return {
        scanning_status : "device_is_not_on_paring_mode"
      }
    case "START_SCANNING":
      return {
        ...state,
        remote_device : {}
      }
    case "CLEAN_CAMERA":
      return{
        ...state,
        scanning_status : "clean_camera"
      }
    case "IS_NOT_REMOTE_DEVICE":
      return {
        ...state,
        scanning_status : "is_not_remote_device"
      }
    case "HIDE_REMOTE_CAMERA":
      return {
        ...state,
        camera_status : "hidden"
      }
    case "SHOW_REMOTE_CAMERA":
      return {
        ...state,
        camera_status : "showed"
      }
    case "UPDATE_DEVICE":
      return {
        ...state,
        remote_device : action.device
      }
    case "CONNECTING_REMOTE_DEVICE":
      return {
        ...state,
        scanning_status : "device_scanned_and_matched"
      }
    default:
      return state
  }
}