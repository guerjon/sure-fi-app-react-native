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
  hopping_table : 0
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
        spreading_factor : action.spreading_factor,
        band_width : action.band_width,
        retry_count : action.retry_count,
        heartbeat_period: action.heartbeat_period,
        acknowledments : action.acknowledments,
        hopping_table : action.hopping_table
      }
    case "UPDATE_POWER":
      return {
        ...state,
        power : action.power,
      }
    case "UPDATE_SPREADING_FACTOR":
      return {
        ...state,
        spreading_factor : action.spreading_factor,
      }
    case "UPDATE_BAND_WIDTH":
      return {
        ...state,
        band_width : action.band_width
      }
    case "UPDATE_RETRY_COUNT":
      return {
        ...state,
        retry_count : action.retry_count,
      }
    case "UPDATE_HEARTBEAT_PERIOD":
      return {
        ...state,
        heartbeat_period: action.heartbeat_period, 
      }
    case "UPDATE_ACKNOWLEDMENTS":
      return{
        ...state,
        acknowledments : action.acknowledments
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
        device_name : action.device_name
      }
    default:
      return state
  }
}