const initialState = {
	page_status : "loading",
	power_selected : null,
	spreading_factor_selected : null,
	band_width_selected : null,
	retry_count_selected : null,
	heartbeat_period_selected : null,
	acknowledments_selected : null,
	hopping_table_selected :null,
	sfb_table_selected : null,
	radio_values_lenght : 8,
	text_input_editable : false
}

export default function configureRadioCentralReducer (state = initialState, action) {
	switch (action.type) {
		case "RESTART_CONFIGURATION_RADIO":
			return initialState
			
		case "UPDATE_POWER":
	      	return {
	        	...state,
	        	power_selected : action.power_selected,
	      	}
	    case "UPDATE_SPREADING_FACTOR":
	      	return {
	        	...state,
	        	spreading_factor_selected : action.spreading_factor_selected,
	      	}
	    case "UPDATE_BAND_WIDTH":
	      	return {
	        	...state,
	        	band_width_selected : action.band_width_selected
	      	}
	    case "UPDATE_RETRY_COUNT":
	      	return {
	        	...state,
	        	retry_count_selected : action.retry_count_selected,
	      	}
	    case "UPDATE_HEARTBEAT_PERIOD":
	      	return {
	        	...state,
	        	heartbeat_period_selected: action.heartbeat_period_selected, 
	      	}
	    case "UPDATE_ACKNOWLEDMENTS":
	      	return{
	        	...state,
	        	acknowledments_selected : action.acknowledments_selected
	      	}			
	    case "UPDATE_PAGE_STATUS":
	    	return {
	    		...state,
	    		page_status : action.page_status
	    	}      
	    case "UPDATE_HOPPING_TABLE":
	    	return {
	    		...state,
	    		hopping_table_selected : action.hopping_table_selected
	    	}	
	    case "UPDATE_SFBTABLE":
	    	return {
	    		...state,
	    		sfb_table_selected : action.sfb_table_selected
	    	}
	    case "UPDATE_CHECKBOX_SELECTED":
	    	return{
	    		...state,
	    		checkbox_selected : action.checkbox_selected
	    	}
	    case "TEXT_INPUT_EDITABLE":
	    	return{
	    		...state,
	    		text_input_editable: action.text_input_editable
	    	}
	    case "SET_RADIO_VALUES_LENGHT":
	    	return {
	    		...state,
	    		radio_values_lenght : action.radio_values_lenght
	    	}
	    default:
	      return state
  	}
}