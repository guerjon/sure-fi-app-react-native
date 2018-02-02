const initialState = {
  rs_settings_data : {}
}

export default function rsSettingsReducer (state = initialState, action) {
  switch (action.type) {
    case "SET_RS_SETTINGS_DATA":
      return {
        ...state,
        rs_settings_data : action.rs_settings_data
      }
    default:
      return state
  }
}