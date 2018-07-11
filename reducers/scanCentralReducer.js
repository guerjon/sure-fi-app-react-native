import {
  SET_MANUFACTURED_DATA, 
  CENTRAL_DEVICE_MATCHED, 
  CENTRAL_DEVICE_NOT_MATCHED,
  RESET_QR_CENTRAL_STATE,
  SCANNING_CENTRAL_UNITS,
  SCANNED_CENTRAL_UNITS,
  BLUETOOTH_ERROR,
  ADD_NEW_BRIDGE,
  NO_ACTIVITY,
  LOADING,
  LOADED
} from '../constants'

import {
  AppState
} from 'react-native'

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
  bridge_status: 0,
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
  power_activated_led:[],
  fail_safe_option: [],
  configuration_data_state: NO_ACTIVITY,
  heart_beat: [],
  cloud_heart_beat : [],
  cloud_equipment_fail_safe_options: [],
  equipments_paired_with: [],
  radio_update_status: [],
  app_firmware_update_on_course: false,
  device_scan_link: false, //string
  cloud_fail_safe_options: [],
  temp_fail_safe_options_value: [],
  relay_times_selected: 0,
  appState: AppState.currentState,
  wiegand_led_mode: 0,
  configuration_update_status: 0,
  get_last_package_time_queue: [],
  show_paired_devices_modal: false,
  devices_name: [],
  loading_devices_name: false,
  show_devices_paired_with: false,
  wiegand_enable : []
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
        fail_safe_option: [],
        configuration_data_state: NO_ACTIVITY,
        heart_beat: [],
        cloud_heart_beat : [],
        cloud_equipment_fail_safe_options: [],
        appState: AppState.currentState,
        wiegand_enable: [0],        
      }
    case "SET_POWER_ACTIVATE_LED":
      return{
        ...state,
        power_activated_led: action.power_activated_led
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
    case "SET_BRIDGE_STATUS":
      return {
        ...state,
        bridge_status : action.bridge_status
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
    case "SET_CLOUD_FAIL_SAFE_OPTIONS":
      return{
        ...state,
        cloud_fail_safe_options: action.cloud_fail_safe_options
      }

    case "SET_CONFIGURATION_DATA_STATE":
    return {
      ...state,
      configuration_data_state: action.configuration_data_state
    }
    case "SET_HEART_BEAT":
      return{
        ...state,
        heart_beat: action.heart_beat
      }
    case "SET_CLOUD_HEART_BEAT":
      return {
        ...state,
        cloud_heart_beat: action.cloud_heart_beat
      }
    case "SET_CLOUD_EQUIPMENT_FAIL_SAFE_OPTIONS":
      return{
        ...state,
        cloud_equipment_fail_safe_options: action.cloud_equipment_fail_safe_options
      }
      
    case "SET_EQUIPMENTS_PAIRED_WITH":
      return{
        ...state,
        equipments_paired_with: action.equipments_paired_with
      }
    case "SET_RADIO_UPDATE_STATUS":
      return{
        ...state,
        radio_update_status: action.radio_update_status
      }
    case "SET_APP_FIRMWARE_UPDATE_ON_COURSE":
      return{
        ...state,
        app_firmware_update_on_course: action.app_firmware_update_on_course
      }
    case "SET_DEVICE_SCAN_LINK":
      return{
        ...state,
        device_scan_link : action.device_scan_link
      }
    case "SET_TEMP_FAIL_SAFE_OPTIONS_VALUE":
      return{
        ...state,
        temp_fail_safe_options_value: action.temp_fail_safe_options_value
      }
    case "SET_RELAY_TIMES_SELECTED":
      return{
        ...state,
        relay_times_selected: action.relay_times_selected
      }
    case "SET_APP_STATE":
      return{
        ...state,
        app_state: action.app_state
      }
    case "SET_WIEGAND_LED_MODE":
      return{
        ...state,
        wiegand_led_mode: action.wiegand_led_mode
      }
    case "SET_CONFIGURATION_UPDATE_STATUS":
      return{
      ...state,
      configuration_update_status: action.configuration_update_status
      }
    case "SET_GET_LAST_PACKAGE_TIME_QUEUE":
      return{
        ...state,
        get_last_package_time_queue: action.get_last_package_time_queue
      }

    case "SET_SHOW_PAIRED_DEVICES_MODAL":
      return{
        ...state,
        show_paired_devices_modal: action.show_paired_devices_modal
      }
    case "SET_DEVICES_NAME":
      return{
        ...state,
        devices_name: action.devices_name
      }
    case "SET_LOADING_DEVICES_NAME":
      return{
        ...state,
        loading_devices_name: action.loading_devices_name
      }
    case "SET_SHOW_DEVICES_PAIRED_WITH":
      return{
        ...state,
        show_devices_paired_with: action.show_devices_paired_with
      }
    case "SET_WIEGAND_ENABLE":
      return{
        ...state,
        wiegand_enable: action.wiegand_enable
      }
    default:
      return state
  }
}