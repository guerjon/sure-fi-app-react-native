const initialState = {
	current_screen : "Bridges",
}

export default function screenReducer (state = initialState, action) {
  
  	switch (action.type) {
  		case "SET_CURRENT_SCREEN":
  			return {
          ...state,
  				current_screen : action.current_screen
  			}
    	default:
      	return state
  	}
}