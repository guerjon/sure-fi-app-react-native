const initialState = {
  central_fetch_status : null,
  central_firmware_selected : {},
  central_firmwares : {}
}

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_SELECT_CENTRAL_FIRMWARE_FILE":
      return {
        central_fetch_status : null,
        central_firmware_selected : {}
      }
    case "CENTRAL_FETCH_STATUS_LOADING":
      return {  
        ...state,
        central_fetch_status : "loading"
      }
    case "CENTRAL_FETCH_STATUS_LOADED":
      return {  
        ...state,
        central_fetch_status : "loaded"
      }    
    case "SET_CENTRAL_FIRMWARES"
    default:
      return state
  }
}