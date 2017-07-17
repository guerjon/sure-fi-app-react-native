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
  battery_voltage :0
}

export default function setupCentralReducer (state = initialState, action) {
  switch (action.type) {
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
        spreading_factor : action.spreading_factor,
        band_width : action.band_width,
        power : action.power
      }
    case "UPDATE_POWER_VALUES":
      return {
        ...state,
        power_voltage : action.power_voltage,
        battery_voltage : action.battery_voltage
      }
    default:
      return state
  }
}