const initialState = {
    register_status : 0,
    show_contacts_modal : false
}

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
    case "SHOW_CODE_OPTION":
        return {
            ...state,
            register_status : 1
        }
    case "HIDE_CODE_OPTION":
        return {
            ...state,
            register_status : 0
        }
    case "SHOW_NAME_BOX":
        return {
            ...state,
            register_status : 2
        }
    case "HIDE_NAME_BOX":
        return {
            ...state,
            register_status : 1
        }
    case "SHOW_ACTIVATE_BUTTON":
        return {
            ...state,
            register_status : 3
        }
    case "HIDE_ACTIVATE_BUTTON":
        return {
            ...state,
            register_status: 2
        }
    case "SHOW_EMAIL_BOX":
        return {
            ...state,
            register_status : 4
        }
    case "SHOW_CONTACTS_MODAL":
        return {
            ...state,
            show_contacts_modal : true
        }
    case "HIDE_CONTACTS_MODAL":
        return {
            ...state,
            show_contacts_modal : false
        }
    default:
      return state
  }
}