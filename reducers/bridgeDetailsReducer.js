const initialState = {
	show_remote_continue_button : false,
	brige_details_description : ""
}

export default function bridgeDetailsReducer (state = initialState, action) {
  
  	switch (action.type) {
  		case "SHOW_BRIDGE_DETAILS_BUTTON":
  			return {
          ...state,
  				show_remote_continue_button : true
  			}
  		case "HIDE_BRIDGE_DETAILS_BUTTON" :
  			return {
          ...state,
  				show_remote_continue_button : false
  			}
  		case "BRIDGE_DETAILS_DESCRIPTION" : 
      
  			return {
          ...state,
  				brige_details_description : action.brige_details_description
  			}
    	default:
      	return state
  	}
}