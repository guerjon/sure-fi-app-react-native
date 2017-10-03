const initialState = {
  screen_status : "show_welcome_screen",
  contacts_permission : "undetermined",
  phone_state_permission : "undetermined",
  sms_permission : "undetermined",
  info : {},
  user_status : "logout",
  first_open_app : true,
  session_key : null,
}

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
    case "SHOW_WELCOME_SCREEN":
      return {
        ...state,
        screen_status : "show_welcome_screen"
      }
    case "SHOW_MAIN_SCREEN":
      return {
        ...state,
        screen_status: "show_main_screen"
      }
    case "UPDATE_CONTACT_PERMISSION":
      return {
        ...state,
        contacts_permission : action.contacts_permission
      }
    case "UPDATE_PHONE_STATE_PERMISSION":
      return {
        ...state,
        phone_state_permission : action.phone_state_permission
      }
    case "UPDATE_SMS_PERMISSION":
      return {
        ...state,
        sms_permission : action.sms_permission
      }
    case "SHOW_REGISTER_SCREEN":
      return {
        ...state,
        screen_status : "show_register_screen",
        info : action.info
      }
    case "SET_USER_INFO":
      return {
        ...state,
        user : action.user,
        password : action.password,
        status : action.status
      }
    case "SET_USER_STATUS":
      return {
        ...state,
        user_status : action.user_status
      }
    case "FIRST_OPEN_APP":
      return {
        ...state,
        first_open_app : action.first_open_app
      }
    case "SET_SESSION_KEY":
      return{
        ...state,
        set_session_key: action.set_session_key
      }
    default:
      return state
  }
}