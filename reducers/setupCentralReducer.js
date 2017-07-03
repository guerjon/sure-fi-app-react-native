import { FETCHING_DATA, FETCHING_DATA_SUCCESS, FETCHING_DATA_FAILURE } from '../constants'
const initialState = {
	screen_status : "index",
  show_continue_button : false,
  central_photo_data : {},
  central_unit_description : ""
}

export default function setupCentralReducer (state = initialState, action) {
  switch (action.type) {
  	case "SHOW_CAMERA":
  		return {
  			...state,
  			screen_status : "camera"
  		}
    case "SHOW_IMAGE":
      return {
        ...state,
        screen_status : "image",
        central_photo_data : action.central_photo_data
      }
    case "SHOW_INDEX" : 
      return {
        ...state,
        screen_status : "index"
      }
    case "SHOW_CONTINUE_BUTTON":
      return {
        ...state,
        show_continue_button : true
      }
    case "HIDE_CONTINUE_BUTTON":
      return {
        ...state,
        show_continue_button : false
      }
    case "UPDATE_CENTRAL_UNIT_DESCRIPTION" :
      return {
        ...state,
        central_unit_description : action.central_unit_description
      }
    default:
      return state
  }
}