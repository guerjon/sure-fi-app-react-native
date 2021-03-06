import { FETCHING_DATA, FETCHING_DATA_SUCCESS, FETCHING_DATA_FAILURE } from '../constants'
const initialState = {
  device_status : 0, //this status keeps the real status of the bridge [0 => undefined, 1 => unpaired,2 =>pairing, 3 => paired,4 => deployed ],
  app_info : [],
  radio_info : [],
  bluetooth_info : [],
  radio_settings : [],
  spreading_factor : 0,
  band_width : 0,
  power : 0,
  power_voltage : null,
  battery_voltage :null,
  show_modal : false,
  is_editing: false,
  device_name : "",
  remote_device_name : "",
  hopping_table : [],
  write_pair_result : false,
  write_unpair_result: false,
  hardware_status : null,
  options_loaded : false,
  app_board_version : "",
  radio_board_version : false,
  register_board_1 : "",
  register_board_1 : "",
  show_switch_button : false,
  debug_mode_status : false,
  pair_disconnect : false,
  unpair_disconnect : false,
  deploy_disconnect: false,
  firmware_update_disconnect : false,
  show_status_box : true,
  original_name: "",
  show_disconnect_notification : true,
  allow_notifications : true,
  connection_established : false, // allows to know when the device is connected and security clear on the bridge
  manual_disconnect : false,
  handleDisconnected : false,
  handleConnected : false,
  handleCharacteristic : false,
  getAllCommands: false,
  show_disconnecting_modal : false,
  registration_info : [],
  show_going_back_screen: false,
  on_back_disconnect: false,
  pairing_device_status: false,
  reset_factory_disconnect: false
}

export default function setupCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_SETUP_CENTRAL_REDUCER":
      return initialState
    case "UPDATE_OPTIONS":
      return {
        ...state,
        device_status : action.device_status
      }
    case "SET_APP_INFO":
      return {
        ...state,
        app_info : action.app_info
      }
    case "SET_RADIO_INFO":
      return {
        ...state,
        radio_info : action.radio_info
      }
    case "SET_BLUETOOTH_INFO":
      return{
        ...state,
        bluetooth_info : action.bluetooth_info
      }
    case "UPDATE_RADIO_SETTINGS":
      return{
        ...state,
        power : action.power,
        retry_count : action.retry_count,
        heartbeat_period: action.heartbeat_period,
        acknowledments : action.acknowledments,
      }
    case "SET_RADIO_SETTINGS_HVAC":
      return{
        ...state,
        radio_settings: action.radio_settings
      }
    case "UPDATE_HOPPING_TABLE":
      return {
        ...state,
        hopping_table: action.hopping_table
      }

    case "SET_HOPPING_TABLE":
      return{
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
    case "SET_WRITE_PAIR_RESULT":
        console.log("SET_WRITE_PAIR_RESULT",action.write_pair_result)
      return {
        ...state,
        write_pair_result : action.write_pair_result
      }
    case "SET_WRITE_UNPAIR_RESULT":
      console.log("SET_WRITE_UNPAIR_RESULT",action.write_unpair_result)
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
    case "SET_MANUAL_DISCONNECT":
      return {
        ...state,
        manual_disconnect : action.manual_disconnect,
        
    }      
    case "SET_FIRMWARE_UPDATE_DISCONNECT":
      return {
        ...state,
        firmware_update_disconnect : action.firmware_update_disconnect
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
    case "UPDATE_POWER":
      return{
        ...state,
        power: action.power
      }
    case "SET_CONNECTION_ESTABLISHED":
      return{
        ...state,
        connection_established: action.connection_established
      }
    case "SET_HANDLE_DISCONNECT":
      return{
        ...state,
        handleDisconnected : action.handleDisconnected
      }
    case "SET_HANDLE_CONNECT":
      return{
        ...state,
        handleConnected : action.handleConnected
      }
    case "SET_HANDLE_CHARACTERISTIC":
      return{
        ...state,
        handleCharacteristic : action.handleCharacteristic
      }

    case "SET_GET_ALL_COMMANDS":
      return {
        ...state,
        getAllCommands: action.getAllCommands
      }
    case "SHOW_DISCONNECT_MODAL":
      return{
        ...state,
        show_disconnecting_modal: true
      }
    case "HIDE_DISCONNECT_MODAL":
      return{
        ...state,
        show_disconnecting_modal: false
      }
    case "UPDATE_REGISTRATION_INFO":
      return {
        ...state,
        registration_info : action.registration_info
      }
    case "SHOW_GOING_BACK_SCREEN":
      return{
        ...state,
        show_going_back_screen: action.show_going_back_screen
      }
    case "SET_ON_BACK_DISCONNECT":
      return {
        ...state,
        on_back_disconnect: action.on_back_disconnect
      }
    case "SET_PAIRING_DEVICE_STATUS":
      return{
        ...state,
        pairing_device_status: action.pairing_device_status
      }
    case "SET_RESET_FACTORY_DISCONNECT":
      return{
        ...state,
        reset_factory_disconnect: action.reset_factory_disconnect
      }
    default:
      return state
  }
}