const initialState = {
	download_firmware_files: "inactive",
	central_firmware_files : [],
	central_firmware_file_selected : {},
	kind_firmware : null
}

export default function selectFirmwareCentralReducer (state = initialState, action) {
	switch(action.type){
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
		default:
			return state
	}
}
