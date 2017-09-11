const initialState = {
  central_relay_image_1 : false,
  central_relay_image_2 : false,
  remote_relay_image_1 :  false,
  remote_relay_image_2 : false,
  led_label : false,
  aux_label : false
}

export default function operationValuesReducer (state = initialState, action) {
  switch (action.type) {
    case "SET_CENTRAL_RELAY_IMAGE_1":
    return {
        ...state,
        central_relay_image_1 : action.central_relay_image_1
    }  	
    case "SET_CENTRAL_RELAY_IMAGE_2":
    return {
        ...state,
        central_relay_image_2 : action.central_relay_image_2
    }   
    case "SET_REMOTE_RELAY_IMAGE_1":
    return {
        ...state,
        remote_relay_image_1 : action.remote_relay_image_1
    }   
    case "SET_REMOTE_RELAY_IMAGE_2":
    return {
        ...state,
        remote_relay_image_2 : action.remote_relay_image_2
    }   
    case "SET_LED_LABEL":
    return {
      ...state,
      let_label: action.led_label
    }
    case "SET_AUX_LABEL":
      return {
        ...state,
        aux_label : action.aux_label
      }

    default:
      return state
  }
}
