const initialState = {
  slider_value : 0,
  relay_1_image_status : false,
  relay_2_image_status : false,
  relay_loading: true,
  qs : "0000"
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
    case "SET_RELAY_LOADING":
      return{
        ...state,
        relay_loading : action.relay_loading
      }
    case "SET_QS":
      return {
        ...state,
        qs : action.qs
      }
    case "RESET_RELAY_REDUCER":
      return initialState
    default:
      return state
  }
}