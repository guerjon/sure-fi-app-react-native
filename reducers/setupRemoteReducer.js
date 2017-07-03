import { FETCHING_DATA, FETCHING_DATA_SUCCESS, FETCHING_DATA_FAILURE } from '../constants'
const initialState = {
	screen_status : "index",
  show_remote_continue_button : false,
  remote_photo_data : {},
  remote_unit_description : ""
}

export default function setupRemoteReducer (state = initialState, action) {
  switch (action.type) {
  	case "SHOW_REMOTE_CAMERA":
  		return {
  			...state,
  			screen_status : "camera"
  		}
    case "SHOW_REMOTE_IMAGE":
      return {
        ...state,
        screen_status : "image",
        remote_photo_data : action.remote_photo_data
      }
    case "SHOW_REMOTE_INDEX" : 
      return {
        ...state,
        screen_status : "index"
      }
    case "SHOW_REMOTE_CONTINUE_BUTTON":
      return {
        ...state,
        show_remote_continue_button : true
      }
    case "HIDE_REMOTE_CONTINUE_BUTTON":
      return {
        ...state,
        show_remote_continue_button : false
      }
    case "UPDATE_REMOTE_UNIT_DESCRIPTION" :
      return {
        ...state,
        remote_unit_description : action.remote_unit_description
      }
    case "CLEAN_SETUP_REMOTE_CAMERA":
      return { 
        ...state,
        screen_status : "clean_setup_remote_camera"
      }

    default:
      return state
  }
}