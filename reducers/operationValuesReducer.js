const initialState = {
  central_relay_image_1 : false,
  central_relay_image_2 : false,
  remote_relay_image_1 :  false,
  remote_relay_image_2 : false,
  led_label : false,
  aux_label : false,
  loading_operation_values : true,
  wiegand_values: {
    wiegand_binary: 0,
    fac_bin_string: 0,
    code_string : 0 ,
    wiegand_bytes : 0   
  },
  transmit_values: {
    txSuccess: 0,
    numRetries: 0,
    maxRetries: 0,
    rssiValue : 0,
    snrValue : 0
  },
  receive_values : {
    rssiValue_2: 0,
    snrValue_2 : 0
  }
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
    case "LOADING_OPERATION_VALUES":
      return {
        ...state,
        loading_operation_values : action.loading_operation_values
      }
    case "SET_WIEGAND_VALUES":
      console.log("SET_WIEGAND_VALUES");
      return {
        ...state,
        wiegand_values : action.wiegand_values
      }
    case "SET_TRANSMIT_VALUES":
      console.log("SET_TRANSMIT_VALUES");
      return {
        ...state,
        transmit_values : action.transmit_values
      }
    case "SET_RECEIVE_VALUES":
      console.log("SET_RECEIVE_VALUES");
      return {
        ...state,
        receive_values : action.receive_values
      }
    default:
      return state
  }
}
