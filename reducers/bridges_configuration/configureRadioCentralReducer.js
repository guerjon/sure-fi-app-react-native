const initialState = {
	page_status : "loading",
	options_selected : null,
	power_selected : null,
	spreading_factor_selected : null,
	band_width_selected : null,
	retry_count_selected : null,
	heartbeat_period_selected : null,
	acknowledments_selected : null

}

export default function selectFirmwareCentralReducer (state = initialState, action) {
	switch (action.type) {
		case 'CONFIGURE_RADIO_CENTRAL_PAGE_LOADED':
			return {
				...state,
				power_selected : action.power_selected,
				spreading_factor_selected : action.spreading_factor_selected,
				band_width_selected : action.band_width_selected,				
				retry_count_selected : action.retry_count_selected,
				heartbeat_period_selected : action.heartbeat_period_selected,
				acknowledments_selected : action.acknowledments_selected,
				page_status : "loaded"
			}
		case "SHOW_POWER_OPTIONS":
			return {
				...state,
				options_selected : "power_options"
			}
		case "SHOW_SPREADING_FACTOR_OPTIONS":
			return {
				...state,
				options_selected : "spreading_factor_options"	
			}
		case "SHOW_BANDWIDTH_OPTIONS":
			return {
				...state,
				options_selected : "bandwidth_options"
			}
		case "SHOW_RETRY_COUNT_OPTIONS":
			return {
				...state,
				options_selected : "retry_count_options"
			}			
		case "SHOW_HEARTBEAT_PERIOD_OPTIONS":
			return {
				...state,
				options_selected : "heartbeat_period_options"
			}
		case "SHOW_ACKNOWLEDMENTS_OPTIONS":
			return {
				...state,
				options_selected : "acknowledments_options"
			}
		case "CLOSE_OPTIONS":
			return {
				...state,
				options_selected : null
			}			
		case "OPTION_SELECTED":
			console.log("option_Selected on reducer", action.value)
			if(action.option_selected == "power_options")
				return {
					...state,
					power_selected : action.value
				}
			if(action.option_selected == "spreading_factor_options")
				return{
					...state,
					spreading_factor_selected : action.value
				}
			if(action.option_selected == "bandwidth_options")
				return{
					...state,
					band_width_selected : action.value
				}
			if(action.option_selected == "retry_count_options")
				return{
					...state,
					retry_count_selected : action.value
				}
			if(action.option_selected == "heartbeat_period_options"){
				return {
					...state,
					heartbeat_period_selected : action.value
				}
			}
			if(action.option_selected == "acknowledments_options"){
				return {
					...state,
					acknowledments_selected : action.value
				}
			}

				console.log("something was wrong on configureRadioCentralReducer")
			return{
				...state,
			}
	    default:
	      return state
  	}
}