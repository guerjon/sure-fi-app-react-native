const initialState = {
  slider_value : 0,
  relay_1_image_status : false,
  relay_2_image_status : false
}

export default function relayReducer (state = initialState, action) {
  switch (action.type) {
    case "SET_SLIDER_VALUE":
      return {
        ...state,
        slider_value : action.slider_value
      }
    case "SET_RELAY_IMAGE_1_STATUS":
      return {
        ...state,
        relay_1_image_status : action.relay_1_image_status
      }
    case "SET_RELAY_IMAGE_2_STATUS":
      return {
        ...state,
        relay_2_image_status : action.relay_2_image_status
      }
    default:
      return state
  }
}