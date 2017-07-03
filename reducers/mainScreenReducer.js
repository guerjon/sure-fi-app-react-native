const initialState = {
	screen_status : "default"
}

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
  	case "SHOW_MAIN_SCREEN":
  		return {
  			...state,
  			screen_status: "show_main_screen"
  		}
    default:
      return state
  }
}