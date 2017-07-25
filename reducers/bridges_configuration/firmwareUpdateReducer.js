const initialState = {
  firmware_update_state : null,
  progress : 0,
  application_firmware_files: [],
  radio_firmware_files: [],
  bluetooth_firmware_files: []
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
    default:
      return state

  }
}
