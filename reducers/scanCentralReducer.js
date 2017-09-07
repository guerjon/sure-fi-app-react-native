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
  scanning_status: "",
  camera_status : "hidden",
  photo_data : {},
  show_permissions_modal : false,
  show_serial_input : false,
  show_qr_image: true,
  manager : {},
  current_view : "",
  justDeploy : false,
  manual_disconnect : false,
  should_connect : true,
  interval : 0,
  indicator_number : null
}


export default function scanCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_CENTRAL_REDUCER":
      return {
        ...state,
        manufactured_data : [],
        central_device : {},
        scanning_status : "",
        camera_status : "hidden",
        photo_data : {},
        show_permissions_modal : false,
        show_serial_input : false,
        manager : {},
        current_view : "",
        justDeploy : false,
        manual_disconnect : false,
        interval : 0 
      }
    case "RESET_CAMERA":
      return {
        ...state,
        manufactured_data : [],
        central_device : {},
        scanning_status : "no_device_found",
        photo_data : {}
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
    case "SEARCHING":
      return{
        scanning_status : "scanning"
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
    case "SHOW_SCANNED_IMAGE":
      return {
        ...state,
        photo_data : action.photo_data
      }
    case "SHOW_ACCEPT_PERMITIONS_MODAL":
      return {
        ...state,
        scanning_status : "show_modal"
      }
    case "SHOW_PERMISSIONS_MODAL":
      return{
        ...state,
        show_permissions_modal : true
      }
    case "HIDE_PERMISSIONS_MODAL":
      return{
        ...state,
        show_permissions_modal : false
      }
    case "NO_DEVICE_FOUND":
      return{
        ...state,
        scanning_status : "no_device_found"
      }
    case "SHOW_SERIAL_INPUT" :
      return {
        ...state,
        show_serial_input : true
      }
    case "HIDE_SERIAL_INPUT":
      return {
        ...state,
        show_serial_input : false
      }
    case "SHOW_QR_IMAGE":
      return {
        ...state,
        show_qr_image : true
      }
    case "HIDE_QR_IMAGE":
      return {
        ...state,
        show_qr_image: false
      }
    case "SAVE_BLE_MANAGER":
      return {
        ...state,
        manager : action.manager
      }
    case "CURRENT_VIEW":
      return {
        ...state,
        current_view : action.current_view
      }
    case "SET_JUST_DEPLOY":
      return {
        ...state,
        just_deploy : action.just_deploy
      }
    case "SET_MANUAL_DISCONNECT":
      return {
        ...state,
        manual_disconnect : action.manual_disconnect,
        
      }
    case "SET_SHOULD_CONNECT":
      return {
        ...state,
        should_connect : action.should_connect
      }
    case "SET_INTERVAL":
      return {
        ...state,
        interval : action.interval
      }
    case "SET_INDICATOR_NUMBER":
      return {
        ...state,
        indicator_number : action.indicator_number
      }
    default:
      return state
  }
}