const initialState = {
	battery_level : 0
}

export default function batteryLevelReducer (state = initialState, action) {
  switch (action.type) {
  	case "RESET_BATTERY_LEVEL_REDUCER":
  		return initialState

  	case "CHANGE_BATTERY_LEVEL":
  		return {
  			...state,
  			battery_level : action.battery_level
  		}
    default:
      return state
  }
}