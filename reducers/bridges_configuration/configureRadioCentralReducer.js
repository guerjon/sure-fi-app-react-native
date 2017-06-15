const initialState = {
	page_status : "loading",
	options_selected : null,
	power_selected : null,
	spreading_factor_selected : null,
	band_width_selected : null

}

export default function selectFirmwareCentralReducer (state = initialState, action) {
	switch (action.type) {
		case 'CONFIGURE_RADIO_CENTRAL_PAGE_LOADED':
			return {
				...state,
				power_selected : action.power_selected,
				spreading_factor_selected : action.spreading_factor_selected,
				band_width_selected : action.band_width_selected,				
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
		case "CLOSE_OPTIONS":
			return {
				...state,
				options_selected : null
			}			
		case "OPTION_SELECTED":
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
				console.log("something was wrong on configureRadioCentralReducer")
			return{
				...state,
			}
	    default:
	      return state
  	}
}