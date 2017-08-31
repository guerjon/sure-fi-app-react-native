const initialState = {
	session_token : null
}

export default function loginReducer (state = initialState, action) {
  switch (action.type) {
    case "SET_REGISTRATION_TOKEN":
    return {
        ...state,
        session_token : action.session_token
    }  	
    default:
      return state
  }
}
