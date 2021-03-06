const initialState = {
  list_status : "hidden",
  scanner : null
}

export default function scannedDevicesListReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_SCANNED_DEVICE_LIST":
      return {
        list_status : "hidden",
        scanner: null
      }
    case "SHOW_DEVICES_LIST":
      return {
        ...state,
        list_status : "showed"
      }
    case "HIDE_DEVICES_LIST":
      return{
        ...state,
        list_status : "hidden"
      }
    case "UPDATE_SCANNER":
      return {
        ...state,
        scanner : action.scanner
      }
    default:
      return state
  }
}