const initialState = {
	session_token : null,
  user : null,
  user_login_status:"logout",
  user_data : null,
  fetching_data : false,
  device_found:false,
  documentation_info : {
    document_title: "Download documentation"
  },
  loaded_documentation_state: "no_activity"
}

export default function loginReducer (state = initialState, action) {
  switch (action.type) {
    case "SET_REGISTRATION_TOKEN":
    return {
        ...state,
        session_token : action.session_token
    }  	
    case "SET_USER_DATA":
      return {
        ...state,
        user_data : action.user_data
      }
    case "FETCHING_DATA":
      return{
        ...state,
        fetching_data: action.fetching_data
      }
    case "SET_DOCUMENTATION_PATH": //this is because we don't want create a new reducer for device_not_matched.js class
      return {
        ...state,
        documentation_path : action.documentation_path
      }
    case "DEVICE_FOUND":
      return{
        ...state,
        device_found : action.device_found
      }
    case "SET_DOCUMENTATION_INFO":
      return{
        ...state,
        documentation_info: action.documentation_info
      }
    case  "SET_LOADED_DOCUMENTATION_STATE":
      return{
        ...state,
        loaded_documentation_state: action.loaded_documentation_state
      }
    default:
      return state
  }
}
