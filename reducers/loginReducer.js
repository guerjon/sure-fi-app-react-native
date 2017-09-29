const initialState = {
	session_token : null,
  user : null,
  user_login_status:"logout",
  user_data : null,
  fetching_data : false
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
    default:
      return state
  }
}
