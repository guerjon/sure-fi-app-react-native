const initialState = {
  payment_loading : false,
  payment_allowed : true,
  payment_token: null,
}

export default function scanRemoteReducer (state = initialState, action) {
  switch (action.type) {
    case "SET_PAYMENT_LOADING":
      return {
        ...state,
        payment_loading: action.payment_loading
      }
    case "SET_PAYMENT_ALLOWED":
      return {
        ...state,
        payment_allowed : action.payment_allowed,
      }
    case "SET_PAYMENT_TOKEN":
      return {
        ...state,
        payment_allowed : action.payment_allowed,
      }
    default:
      return state
  }
}