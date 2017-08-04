const initialState = {
  firmware_file: null,
  central_update_mode : false,
  active_tab : "charging"
}

export default function updateFirmwareCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_UPDATE_FIRMWARE_CENTRAL_REDUCER":
      return {
        firmware_file: null,
        central_update_mode : false
      }
    case "SET_CENTRAL_FIRMWARE_FILE":
      return {  
        ...state,
        firmware_file : action.firmware_file,
        central_update_mode : true
      }
    case "DELETE_CENTRAL_FIRMWARE_FILE":
      return {
        ...state,
        firmware_file: null
      }  
    case "SET_UP_UPDATE_MODE":
      return{
        ...state,
        central_update_mode: true
      }
    case "CHANGE_TAB":
      return{
        ...state,
        active_tab : action.active_tab
      } 
    default:
      return state
  }
}