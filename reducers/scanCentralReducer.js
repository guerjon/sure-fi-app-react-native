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
  central_device: {},
  scanning_status: "",
  camera_status : "hidden",
  photo_data : {},
  show_permissions_modal : false,
  show_serial_input : false,
  manager : {},
  justDeploy : false,
  should_connect : true,
  interval : 0,
  indicator_number : null,
  fast_manager : null,
  allow_scanning : true,
  show_camera : true,
  getting_commands: false,
  show_device_not_matched : false,
  warranty_information : 0,
  demo_unit_time : 0,
  demo_unit_price: 0,
  show_activate_option : false,
  partners: [],
  pairing_info: [],
  last_package_time: [],
  last_package_time_thermostat : [],
  run_time : [],
  activated : true,
  demo_mode_time : [],
  activated_led: [],
  heart_beat_slider_value: 1
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
        justDeploy : false,
        manual_disconnect : false,
        interval : 0 ,
        show_device_not_matched: false,
        demo_unit_price: 0
      }
    case "SET_DEMO_UNIT_PRICE": 
    {
      return {
        ...state,
        demo_unit_price: action.demo_unit_price
      }
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
    case "SHOW_CAMERA":
      return {
        ...state,
        show_camera : action.show_camera 
      }
    case "UPDATE_DEVICE":
      console.log("new_device",action.device)
      return {
        ...state,
        central_device : action.device
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
    case "SAVE_BLE_MANAGER":
      return {
        ...state,
        manager : action.manager
      }
    case "SET_JUST_DEPLOY":
      return {
        ...state,
        just_deploy : action.just_deploy
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
    case "SET_FAST_MANAGER":
      return {
        ...state,
        fast_manager: action.fast_manager
      }
    case "ALLOW_SCANNING":
      return{
        ...state,
        allow_scanning: action.allow_scanning
      }
    case "SET_GETTING_COMMANDS":
      return{
        ...state,
        getting_commands : action.getting_commands
      }
    case "SHOW_DEVICE_NOT_MATCHED":
      return {
        ...state,
        show_device_not_matched : action.show_device_not_matched
      }
    case "SET_WARRANTY_INFORMATION":
      return {
        ...state,
        warranty_information : action.warranty_information
      }
    case "SET_DEMO_UNIT_TIME":
      return{
        ...state,
        demo_unit_time: action.demo_unit_time
      }
    case "SET_SHOW_TO_ACTIVATE_OPTION":
      return {
        ...state,
        show_activate_option : action.show_activate_option
      }
    case "SET_PARTNERS":
      return{
        ...state,
        partners : action.partners
      }
    case "SET_PAIRING_INFO":
      return{
        ...state,
        pairing_info : action.pairing_info
      }
    case "SET_LAST_PACKAGE_TIME":
      return{
        ...state,
        last_package_time: action.last_package_time
      }
    case "SET_LAST_PACKAGE_TIME_THERMOSTAT":
      return {
        ...state,
        last_package_time_thermostat : action.last_package_time_thermostat
      }
    case "SET_RUN_TIME":
      return {
        ...state,
        run_time: action.run_time
      }
    case "SET_ACTIVATED":
      return{
        ...state,
        activated: action.activated
      }
    case "SET_DEMO_MODE_TIME":
      return{
        ...state,
        demo_mode_time: action.demo_mode_time
      }
    case "SET_ACTIVATED_LED":
      return{
        ...state,
        activated_led: action.activated_led
      }
    case "SET_FAIL_SAFE_OPTION":
      return{
        ...state,
        fail_safe_option: action.fail_safe_option
      }
    case "SET_HEART_BEAT_SLIDER_VALUE":
      return {
        ...state,
        heart_beat_slider_value: action.heart_beat_slider_value
      }
    default:
      return state
  }
}