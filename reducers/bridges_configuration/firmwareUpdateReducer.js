const initialState = {
  firmware_update_state : null,
  progress : 0
}

export default function firmwareUpdateReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_FIRMWARE_UPDATE_REDUCER":
      return {
        initialState
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

    default:
      return state

  }
}
