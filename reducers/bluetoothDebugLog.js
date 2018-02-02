const initialState = {
    commands: [],
    global_command_id : 0,
    inner_commands : []
}

export default function bluetoothDebugLog (state = initialState, action) {
  
  	switch (action.type) {
      case "UPDATE_COMMANDS":
        return {
          ...state,
          commands : action.commands,
          global_command_id: action.global_command_id
        }
      case "UPDATE_INNER_COMMANDS":
        return {
          ...state,
          inner_commands : action.inner_commands
        }
    	default:
      	return state
  	}
}