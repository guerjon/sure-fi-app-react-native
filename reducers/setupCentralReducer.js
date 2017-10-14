import { FETCHING_DATA, FETCHING_DATA_SUCCESS, FETCHING_DATA_FAILURE } from '../constants'
const initialState = {
	screen_status : "index",
  show_continue_button : false,
  central_photo_data : {},
  central_unit_description : "",
  device_status : 0, //this status keeps the real status of the bridge [0 => undefined, 1 => unpaired,2 =>pairing, 3 => paired,4 => deployed ],
  app_version : 0,
  radio_version : 0,
  bluetooth_version : 0,
  radio_settings : [],
  spreading_factor : 0,
  band_width : 0,
  power : 0,
  power_voltage : 0,
  battery_voltage :0,
  show_modal : false,
  is_editing: false,
  device_name : "",
  remote_device_name : "",
  hopping_table : 0,
  action_from_disconnect : "",
  write_pair_result : false,
  write_unpair_result: false,
  hardware_status : null,
  options_loaded : false,
  app_board_version : "",
  radio_board_version : "",
  register_board_1 : "",
  register_board_1 : "",
  show_switch_button : false,
  debug_mode_status : false,
  pair_disconnect : false,
  unpair_disconnect : false,
  deploy_disconnect: false,
  switch_disconnect : false,
  show_status_box : true,
  original_name: "",
  show_disconnect_notification : true,
  allow_notifications : true
}

export default function setupCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_SETUP_CENTRAL_REDUCER":
      return initialState
  	case "SHOW_CAMERA":
  		return {
  			...state,
  			screen_status : "camera"
  		}
    case "SHOW_IMAGE":
      return {
        ...state,
        screen_status : "image",
        central_photo_data : action.central_photo_data
      }
    case "SHOW_INDEX" : 
      return {
        ...state,
        screen_status : "index"
      }
    case "SHOW_CONTINUE_BUTTON":
      return {
        ...state,
        show_continue_button : true
      }
    case "HIDE_CONTINUE_BUTTON":
      return {
        ...state,
        show_continue_button : false
      }
    case "UPDATE_CENTRAL_UNIT_DESCRIPTION" :
      return {
        ...state,
        central_unit_description : action.central_unit_description
      }
    case "UPDATE_OPTIONS":
      return {
        ...state,
        device_status : action.device_status
      }
    case "UPDATE_APP_VERSION":
      return {
        ...state,
        app_version : action.version
      }
    case "UPDATE_RADIO_VERSION":
      return {
        ...state,
        radio_version : action.version
      }
    case "UPDATE_BLUETOOTH_VERSION":
      return{
        ...state,
        bluetooth_version : action.version
      }
    case "UPDATE_RADIO_SETTINGS":
      return{
        ...state,
        power : action.power,
        retry_count : action.retry_count,
        heartbeat_period: action.heartbeat_period,
        acknowledments : action.acknowledments,
      }
    case "UPDATE_HOPPING_TABLE":
      return {
        ...state,
        hopping_table: action.hopping_table
      }

    case "UPDATE_SPREADING_FACTOR":
      return {
        ...state,
        spreading_factor : action.spreading_factor
      }
    case "UPDATE_BAND_WIDTH":
      return {
        ...state,
        band_width: action.band_width
      } 

    case "UPDATE_POWER_VALUES":
      return {
        ...state,
        power_voltage : action.power_voltage,
        battery_voltage : action.battery_voltage
      }
    case "SHOW_MODAL":
      return {
        ...state,
        show_modal: true
      }
    case "HIDE_MODAL":
      return {
        ...state,
        show_modal: false
      }
    case "START_EDITING": //start editing the name of the devices on the status_box file
      return {
        ...state,
        is_editing: true
      }
    case "FINISH_EDITING":
      return {
        ...state,
        is_editing: false
      }
    case "UPDATE_DEVICE_NAME":
      return {
        ...state,
        device_name : action.device_name,
        original_name : action.original_name ? action.original_name : state.original_name
      }
    case "UPDATE_REMOTE_DEVICE_NAME":
      return {
        ...state,
        remote_device_name : action.remote_device_name
      }
    case "UPDATE_ACTION_FROM_DISCONNNECT":
      return {
        ...state,
        action_from_disconnect : action.action_from_disconnect
      }
    case "SET_WRITE_PAIR_RESULT":
      return {
        ...state,
        write_pair_result : action.write_pair_result
      }
    case "SET_WRITE_UNPAIR_RESULT":
      return {
        ...state,
        write_unpair_result: action.write_unpair_result
      }
    case "SET_HARDWARE_STATUS":
      return {
        ...state,
        hardware_status : action.hardware_status
      }
    case "OPTIONS_LOADED":
      return {
        ...state,
        options_loaded : action.options_loaded
      }
    case "SET_APP_BOARD":
      return {
        ...state,
        app_board_version : action.app_board_version
      }
    case "SET_RADIO_BOARD":
      return {
        ...state,
        radio_board_version : action.radio_board_version
      }
    case "SET_REGISTER_BOARD_1":
      return {
        ...state,
        register_board_1 : action.register_board_1
      }
    case "SET_REGISTER_BOARD_2":
      return {
        ...state,
        register_board_2 : action.register_board_2
      }
    case "SHOW_SWITCH_BUTTON":
      return {
        ...state,
        show_switch_button : true
      }
    case "HIDE_SWITCH_BUTTON":
      return {
        ...state,
        show_switch_button: false
      }
    case "SET_DEBUG_MODE_STATUS":
      return {
        ...state,
        debug_mode_status : action.debug_mode_status
      }
    case "SET_PAIR_DISCONNECT":
      return{
        ...state,
        pair_disconnect: action.pair_disconnect
      }
    case "SET_UNPAIR_DISCONNECT":
      return{
        ...state,
        unpair_disconnect: action.unpair_disconnect
      }
    case "SET_DEPLOY_DISCONNECT":
      return{
        ...state,
        deploy_disconnect: action.deploy_disconnect
      }
    case "SET_SWITCH_DISCONNECT":
      return {
        ...state,
        switch_disconnect : action.switch_disconnect
      }
    case "SHOW_STATUS_BOX":
      return{
        ...state,
        show_status_box : action.show_status_box
      }
    case "ALLOW_NOTIFICATIONS":
      return{
        ...state,
        allow_notifications : action.allow_notifications
      }
    default:
      return state
  }
}