import {
    Animated
} from 'react-native'
import {
    width,
    height,
} from '../../styles/index.js'

const y_distance = (width - 300) / 2;

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
  application_and_bluetooth_firmware_update: false,
  
  filling_porcentage:  0,
  show_firmware_update_details: false,
  need_firmware_update: false,
  firmware_update_status: 0,
  current_firmware_update: 0,
  show_current_firmware_update: true,
  firmareButtonAnimation: new Animated.ValueXY({x: (height/2 + 50) ,y: ((width/2) - 125) }),
  radioFirmwareUpdateBoxRadius: new Animated.Value(5),
  radioFirmwareUpdateBoxPosition: new Animated.ValueXY({x: width/4,y: width/8 - 25}),
  radioFirmwareUpdateBoxShape: new Animated.ValueXY({x: width - 60,y:300}),
  
  appFirmwareUpdateBoxRadius: new Animated.Value(5),
  appFirmwareUpdateBoxPosition: new Animated.ValueXY({x: width/4,y: width/8 - 25}),
  appFirmwareUpdateBoxShape: new Animated.ValueXY({x: width - 60 ,y: 300 }),

  bluetoothFirmwareUpdateBoxRadius: new Animated.Value(5),
  bluetoothFirmwareUpdateBoxPosition: new Animated.ValueXY({x: width/4,y: width/8 - 25}),
  bluetoothFirmwareUpdateBoxShape: new Animated.ValueXY({x: width - 60,y:300}),
  app_major_version_on_cloud: 0,
  radio_major_version_on_cloud : 0,
  bluetooth_major_version_on_cloud: 0,
  major_general_version: 0,
  app_firwmare_files_on_cloud: [],
  radio_firwmare_files_on_cloud: [],
  bluetooth_firwmare_files_on_cloud: [],

}

export default function updateFirmwareCentralReducer (state = initialState, action) {
  switch (action.type) {
    case "RESET_ANIMATIONS":
      return{
        ...state,
        firmareButtonAnimation: new Animated.ValueXY({x: (height/2 + 50) ,y: ((width/2) - 125) }),
        radioFirmwareUpdateBoxRadius: new Animated.Value(5),
        radioFirmwareUpdateBoxPosition: new Animated.ValueXY({x: 50,y: y_distance }),
        radioFirmwareUpdateBoxShape: new Animated.ValueXY({x: 300,y:300}),
        appFirmwareUpdateBoxRadius: new Animated.Value(5),
        appFirmwareUpdateBoxPosition: new Animated.ValueXY({x: 50,y: y_distance }),
        appFirmwareUpdateBoxShape: new Animated.ValueXY({x: 300 ,y: 300 }),
        bluetoothFirmwareUpdateBoxRadius: new Animated.Value(5),
        bluetoothFirmwareUpdateBoxPosition: new Animated.ValueXY({x: 50,y: y_distance }),
        bluetoothFirmwareUpdateBoxShape: new Animated.ValueXY({x: 300,y:300}),        
    }
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
    case "SET_FILLING_PORCENTAGE":
      return{
        ...state,
        filling_porcentage: action.filling_porcentage
      }
    case "SET_SHOW_FIRMWARE_UPDATE_DETAILS":
      return{
        ...state,
        show_firmware_update_details: action.show_firmware_update_details
      }
    case "SET_NEED_FIRMWARE_UDPATE":
      return{
        ...state,
        need_firmware_update: action.need_firmware_update
      }
    case "SET_FIRMWARE_UPDATE_STATUS":
      return{
        ...state,
        firmware_update_status: action.firmware_update_status
      }
    case "SET_CURRENT_FIRMWARE_UPDATE":
      return{
        ...state,
        current_firmware_update: action.current_firmware_update
      }
    case "SET_SHOW_CURRENT_FIRMWARE_UPDATE":
      return{
        ...state,
        show_current_firmware_update: action.show_current_firmware_update
      }
    case "SET_MAJOR_FIRMWARE_VERSION":
      return{
        ...state,
        major_firmware_version: action.major_firmware_version
      }
    case "SET_APP_MAJOR_VERSION_ON_CLOUD":
      return{
        ...state,
        app_major_version_on_cloud: action.app_major_version_on_cloud
      }
    case "SET_RADIO_MAJOR_VERSION_ON_CLOUD":
      return{
        ...state,
        radio_major_version_on_cloud: action.radio_major_version_on_cloud
      }
    case "SET_BLUETOOTH_MAJOR_VERSION_ON_CLOUD":
      return{
        ...state,
        bluetooth_major_version_on_cloud: action.bluetooth_major_version_on_cloud
      }            
    case "SET_MAJOR_GENERAL_VERSION":
      return{
        ...state,
        major_general_version: action.major_general_version
      }

    case "SET_APP_FIRMWARE_FILES_ON_CLOUD":
      return{
        ...state,
        app_firwmare_files_on_cloud: action.app_firwmare_files_on_cloud      
      }
    case "SET_RADIO_FIRMWARE_FILES_ON_CLOUD":
      return{
        ...state,
        radio_firwmare_files_on_cloud: action.radio_firwmare_files_on_cloud
      }
    case "SET_BLUETOOTH_FIRMWARE_ON_CLOUD":
      return{
        ...state,
        bluetooth_firwmare_files_on_cloud : action.bluetooth_firwmare_files_on_cloud
      }

    default:
      return state
  }
}