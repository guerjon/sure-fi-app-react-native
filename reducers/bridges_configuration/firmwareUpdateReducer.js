const initialState = {
  firmware_update_state : null,
  progress : 0,
  application_firmware_files: [],
  radio_firmware_files: [],
  bluetooth_firmware_files: [],
  view_kind : "normal",
  largest_version: 0,
  app_update_status : "no_started",
  radio_update_status: "no_started",
  bt_update_status: "no_started",
  current_update : "no_started"
}

export default function firmwareUpdateReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_FIRMWARE_UPDATE_REDUCER":
      return {
        firmware_update_state : null,
        progress : 0
      }
    case "STARING_FIRMWARE_UPDATE":
      return{
        ...state,
        firmware_update_state:"staring"
      }
    case "STARED_FIRMWARE_UPDATE":
      return{
        ...state,
        firmware_update_state: "stared"
      }
    case "STAR_ROW":
      return{
        ...state,
        firmware_update_state: "start_row"
      }
    case "START_FETCH":
      return {
        ...state,
        firmware_update_state: "fetch_stared"
      }
    case "CHANGE_PROGRESS":
      return{
        ...state,
        progress: action.new_progress
      }
    case "SET_APPLICATION_FIRMWARE_FILES":
      return {
        ...state,
        application_firmware_files : action.application_firmware_files
      }
    case "SET_RADIO_FIRMWARE_FILES":
      return{
        ...state,
        radio_firmware_files: action.radio_firmware_files 
      }
    case "SET_BLUETOOTH_FIRMWARE_FILES":
      return {
        ...state,
          bluetooth_firmware_files : action.bluetooth_firmware_files
      }
    case "SHOW_ADVANCED_VIEW":
      console.log("bi ha de entrar")
      return {
        ...state,
        view_kind : "advanced"
      }
    case "SHOW_NORMAL_VIEW":
      return {
        ...state,
        view_kind : "normal"
      }
    case "UPDATE_LARGEST_VERSION":
      return {
        ...state,
        largest_version : action.largest_version
      }
    case "APP_UPDATE_STATUS":
      return {
        ...state,
        app_update_status : action.app_update_status
      }
    case "RADIO_UPDATE_STATUS":
      return{
        ...state,
        radio_update_status : action.radio_update_status
      }
    case "BT_UPDATE_STATUS":
      return{
        ...state,
        bt_update_status : action.bt_update_status
      }
    case "UPDATE_CURRENT_UPDATE":
      return {
        ...state,
        current_update: action.current_update
      }
    default:
      return state

  }
}
