const initialState = {
  devices : []
}

export default function scannedDevicesListReducer (state = initialState, action) {
  switch (action.type) {
    case "ADD_DEVICE":
      return {
        ...state,
        devices : action.devices
      }
    default:
      return state
  }
}