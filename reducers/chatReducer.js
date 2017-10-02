const initialState = {
	messages : [],
	text : " ",
	message_status: "no_sended",
  show_chat_modal : false,
  show_location_modal : false,
  show_custom_map : false,
  my_coordenates : {},
  other_guy_coordenates : {}
}

export default function chatReducer (state = initialState, action) {
  switch (action.type) {
  	case "SET_MESSAGES":
  		return {
  			...state,
  			messages: action.messages
  		}
  	case "UPDATE_TEXT":
  		return {
  			...state,
  			text : ""
  		}
  	case "UPDATE_MESSAGE_STATUS":
  		return {
  			...state,
  			message_status : action.message_status
  		}
    case "SHOW_CHAT_MODAL":
      return{
        ...state,
        show_chat_modal: true
      }
    case "HIDE_CHAT_MODAL":
      return{
        ...state,
        show_chat_modal : false
      }
    case "SHOW_LOCATION_MODAL":
      return {
        ...state,
        show_location_modal : true
      }
    case "HIDE_LOCATION_MODAL":
      return{
        ...state,
        show_location_modal : false
      }
    case "SHOW_CUSTOM_MAP":
      return {
        ...state,
        show_custom_map : true
      }
    case "HIDE_CUSTOM_MAP":
      return {
        ...state,
        show_custom_map: false
      }
    case "UPDATE_MY_COORDENATES":
      return {
        ...state,
        my_coordenates: action.my_coordenates,
      }
    case "UPDATE_OTHER_GUY_COORDENATES":
      return {
        ...state,
        other_guy_coordenates: action.other_guy_coordenates
      }
    default:
      return state
  }
}