const initialState = {
  firmware_file: null,
  central_update_mode : false,
  active_tab : "charging",
  bootloader_info : {
      "lowerReadCrc" : "000",
      "lowerCalcCrc" : "000",
      "lowerVersionMajor" : "000",
      "lowerVersionMinor" : "000",
      "lowerVersionBuild" : "000",
      "lowerProgramNumber" : "000",
      "upperReadCrc" : "000",
      "upperCalcCrc" : "000",
      "upperVersionMajor" : "000",
      "upperVersionMinor" : "000",
      "upperVersionBuild" : "000",
      "upperProgramNumber" : "000",
      "bootingUpperMemory" : "000" 
  },
  complete_firmware_update_on_course: false,
  radio_and_aplication_firmware_update: false,
  radio_and_bluetooth_firmware_update: false,
  application_and_bluetooth_firmware_update: false

}

export default function updateFirmwareCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_UPDATE_FIRMWARE_CENTRAL_REDUCER":
      return initialState
    case "SET_CENTRAL_FIRMWARE_FILE":
      return {  
        ...state,
        firmware_file : action.firmware_file,
        central_update_mode : true
      }
    case "DELETE_CENTRAL_FIRMWARE_FILE":
      return {
        ...state,
        firmware_file: null
      }  
    case "SET_UP_UPDATE_MODE":
      return{
        ...state,
        central_update_mode: true
      }
    case "CHANGE_TAB":
      return{
        ...state,
        active_tab : action.active_tab
      } 
    case "SET_BOOTLOADER_INFO":
      return {
        ...state,
        bootloader_info: action.bootloader_info
      }
    case "SET_COMPLETE_FIRMWARE_UPDATE_ON_COURSE":
      return{
        ...state,
        complete_firmware_update_on_course: action.complete_firmware_update_on_course
      }
    case "SET_RADIO_AND_APLICATION_FIRMWARE_UPDATE":
      return {
        ...state,
        radio_and_aplication_firmware_update: action.radio_and_aplication_firmware_update
      }
    case "SET_RADIO_AND_BLUETOOTH_FIRMWARE_UPDATE":
      return {
        ...state,
        radio_and_bluetooth_firmware_update: action.radio_and_bluetooth_firmware_update
      }
    case "SET_APPLICATION_AND_BLUETOOTH_FIRMWARE_UPDATE":
      return {
        ...state,
        application_and_bluetooth_firmware_update: action.application_and_bluetooth_firmware_update
      }
    default:
      return state
  }
}