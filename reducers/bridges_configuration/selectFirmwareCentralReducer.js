const initialState = {
	download_firmware_files: "inactive",
	central_firmware_files : [],
	central_firmware_file_selected : {},
	kind_firmware : null,
	update_status : "without_activity"
}

export default function selectFirmwareCentralReducer (state = initialState, action) {
	switch(action.type){
		case "RESET_FIRMWARE_CENTRAL_REDUCER":
			return {
				download_firmware_files: "inactive",
				central_firmware_files : [],
				central_firmware_file_selected : {},
				kind_firmware : null,
				update_status : "without_activity"
			}
		case "DOWNLOADING_FIRMWARE_FILES":
			return {
				...state,
				download_firmware_files : "active"
			} 
		case "DOWNLOADED_FIRMWARE_FILES":
			return {
				...state,
				download_firmware_files : "downloaded",
				central_firmware_files : action.central_firmware_files
			}
		case "FIRMWARE_FILE_SELECTED":
			return{
				...state,
				central_firmware_file_selected : action.central_firmware_file_selected
			}
		case "DELETE_FIRMWARE_SELECTED":
			return {
				...state,
				central_firmware_file_selected : {}
			}
		case "SET_KIND_FIRMWARE":
			return {
				...state,
				kind_firmware : action.kind_firmware
			}
		case "START_UPDATE":
			return {
				...state,
				update_status : "update_started"
			}
		case "FINISH_UPDATE":
			return {
				...state,
				update_status : "without_activity"
			}
		case "PARTIAL_RESET_FIRMWARE_CENTRAL_REDUCER":
			return {
				update_status : "without_activity",
				
			}
		default:
			return state
	}
}
