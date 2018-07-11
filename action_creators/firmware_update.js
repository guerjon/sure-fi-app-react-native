import { 
    RADIO_FIRMWARE_UPDATE,
    APP_FIRMWARE_UDATE,
    BLUETOOTH_FIRMWARE_UPDATE,
    UNPAIR_STATUS,
    PAIR_STATUS,
    EQUIPMENT_TYPE,
    THERMOSTAT_TYPE,
    FIRMWARE_CENTRAL_ROUTE, 
    HEADERS_FOR_POST,
    GET_HEADERS,
    MODULE_WIEGAND_CENTRAL,
    MODULE_WIEGAND_REMOTE,
    RELAY_WIEGAND_CENTRAL,
    RELAY_WIEGAND_REMOTE,
    BYTES_TO_HEX
} from "../constants"

import {Alert} from 'react-native'

import {
    finishRadioFirmwareUpdate,
    finishAppFirmwareUpdate,
    finishBluetoothFirmwareUpdate,
    startRadioFirmwareUpdate,
    startAppFirmwareUpdate,
} from '../bridges/animations'

import {store} from "../app"

var hardware_type = 0
import RNFetchBlob from 'react-native-fetch-blob'


export const START_RADIO_FIRMWARE_UPDATE = 1

export const WRITING_START_RADIO_UPDATE_COMMAND = 4
export const WRITING_START_APP_UPDATE_COMMAND = 20
export const WRITING_START_BLUETOOTH_UPDATE_COMMAND = 21

export const WRITTED_START_RADIO_UPDATE_COMMAND = 22
export const WRITTED_START_APP_UPDATE_COMMAND = 23
export const WRITTED_START_BLUETOOTH_UPDATE_COMMAND = 24

export const STARTING_WRITING_PAGES = 6
export const STARTING_ROW = 7
export const WRITING_ROW_PICE = 8
export const RETRING_ROW_PIECE = 9
export const ENDING_ROW_PIECE = 10
export const ENDING_RADIO_FIRMWARE_UPDATE = 11
export const ENDING_APP_FIRMWARE_UPDATE = 25

export const START_APP_FIRMWARE_UPDATE = 12
export const START_BLUETOOTH_FIRMWARE_UPDATE = 13

export const FETCHING_RADIO_FIRMWARE_FILE = 2
export const FETCHING_APP_FIRMWARE_FILE = 15
export const FETCHING_BLUETOOTH_FIRMWARE_FILE = 16

export const FETCHED_RADIO_FILE_FETCHED = 17
export const FETCHED_APP_FILE_FETCHED = 18
export const FETCHED_BLUETOOTH_FILE_FETCHED = 19


export const FIRMWARE_LOG_CREATOR = (command,extra_data) => {
    const new_log = {
        command: command,
        extra_data: extra_data
    }
    const firmware_update_logs =  store.getState().firmwareUpdateReducer.firmware_update_logs.slice()

    firmware_update_logs.push(new_log)

    store.dispatch({type: "SET_FIRMWARE_UPDATE_LOGS",firmware_update_logs:firmware_update_logs})
}


export const FIRMWARE_UPDATE_ACCIONS = new Map([
    [START_RADIO_FIRMWARE_UPDATE,"START_RADIO_FIRMWARE_UPDATE"],
    [WRITING_START_RADIO_UPDATE_COMMAND,"WRITING_START_RADIO_UPDATE_COMMAND"],
    [WRITING_START_APP_UPDATE_COMMAND,"WRITING_START_APP_UPDATE_COMMAND"],
    [WRITING_START_BLUETOOTH_UPDATE_COMMAND,"WRITING_START_BLUETOOTH_UPDATE_COMMAND"],
    [WRITTED_START_RADIO_UPDATE_COMMAND,"WRITTED_START_RADIO_UPDATE_COMMAND"],
    [WRITTED_START_APP_UPDATE_COMMAND,"WRITTED_START_APP_UPDATE_COMMAND"],
    [WRITTED_START_BLUETOOTH_UPDATE_COMMAND,"WRITTED_START_BLUETOOTH_UPDATE_COMMAND"],
    [STARTING_WRITING_PAGES,"STARTING_WRITING_PAGES"],
    [STARTING_ROW,"STARTING_ROW"],
    [WRITING_ROW_PICE,"WRITING_ROW_PICE"],
    [RETRING_ROW_PIECE,"RETRING_ROW_PIECE"],
    [ENDING_ROW_PIECE,"ENDING_ROW_PIECE"],
    [ENDING_RADIO_FIRMWARE_UPDATE,"ENDING_RADIO_FIRMWARE_UPDATE"],
    [ENDING_APP_FIRMWARE_UPDATE,"ENDING_APP_FIRMWARE_UPDATE"],
    [START_APP_FIRMWARE_UPDATE,"START_APP_FIRMWARE_UPDATE"],
    [START_BLUETOOTH_FIRMWARE_UPDATE,"START_BLUETOOTH_FIRMWARE_UPDATE"],
    [FETCHING_RADIO_FIRMWARE_FILE,"FETCHING_RADIO_FIRMWARE_FILE"],
    [FETCHING_APP_FIRMWARE_FILE,"FETCHING_APP_FIRMWARE_FILE"],
    [FETCHING_BLUETOOTH_FIRMWARE_FILE,"FETCHING_BLUETOOTH_FIRMWARE_FILE"],
    [FETCHED_RADIO_FILE_FETCHED,"FETCHED_RADIO_FILE_FETCHED"],
    [FETCHED_APP_FILE_FETCHED,"FETCHED_APP_FILE_FETCHED"],
    [FETCHED_BLUETOOTH_FILE_FETCHED,"FETCHED_BLUETOOTH_FILE_FETCHED"],
])


const createStartFirmwareLogUpdate = (firmware_type) => {
    console.log("createStartFirmwareLogUpdate()")
    
    if(firmware_type == RADIO_FIRMWARE_UPDATE)
        FIRMWARE_LOG_CREATOR(START_RADIO_FIRMWARE_UPDATE) 
    
    if(firmware_type == BLUETOOTH_FIRMWARE_UPDATE)
        FIRMWARE_LOG_CREATOR(START_BLUETOOTH_FIRMWARE_UPDATE)

    if(firmware_type == APP_FIRMWARE_UDATE)
        FIRMWARE_LOG_CREATOR(START_APP_FIRMWARE_UPDATE)

}


export const  startFirmwareUpdate =  async (firmware_type,hardware_type) => {
    console.log("startFirmwareUpdate() - action_creators",hardware_type)
    hardware_type = parseInt(hardware_type) 
    if(hardware_type == 0)
        hardware_type = parseInt(hardware_type,16)

    createStartFirmwareLogUpdate(firmware_type)
	const byteCharacters = await fetchFirmwareFile(firmware_type,hardware_type)    
    
    if(byteCharacters){
        if((firmware_type == RADIO_FIRMWARE_UPDATE) || (firmware_type == APP_FIRMWARE_UDATE) ){
            var bytes_arrays = [];      
            var sliceSize = 2048
            var total_bytes = 0
            
            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);
                
                const byteNumbers = new Array(slice.length);

                for (let i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
                  total_bytes++
                }
                
                bytes_arrays.push(byteNumbers);
            }   
            if(firmware_type == APP_FIRMWARE_UDATE){
                FIRMWARE_LOG_CREATOR(FETCHED_APP_FILE_FETCHED)
                startAppFirmwareUpdate()
            }else if(firmware_type == RADIO_FIRMWARE_UPDATE){
                FIRMWARE_LOG_CREATOR(FETCHED_RADIO_FILE_FETCHED)
                startRadioFirmwareUpdate()
            }        
            
            return new Promise.resolve({"total_bytes" : total_bytes, "bytes_arrays" : bytes_arrays})

        }else if(firmware_type == BLUETOOTH_FIRMWARE_UPDATE){
            FIRMWARE_LOG_CREATOR(FETCHED_BLUETOOTH_FILE_FETCHED)
            return byteCharacters
        }  
    }else 
        return new Promise.reject()
}



const selectHardwareTypeKey = (hardware_type) => {
    console.log("selectHardwareTypeKey()",hardware_type)

    if(hardware_type ==  parseInt(THERMOSTAT_TYPE) ){
        return "cc8a24bf-960f-443d-acb9-a764fc6618d4"

    }else if(hardware_type == parseInt(EQUIPMENT_TYPE)){

        return "f91b9afb-6922-4347-8f43-b5ad5d37c36f"

    }else if(hardware_type == parseInt(MODULE_WIEGAND_CENTRAL)){
        
        return "6bd2b45d-5ade-4d8d-b068-9c2c20e11977"            

    }else if(hardware_type == parseInt(MODULE_WIEGAND_REMOTE)){
        
        return "5c396f23-7916-441b-be60-da93b36d87ff"

    }else if(hardware_type == RELAY_WIEGAND_CENTRAL){
        
        return "6bd2b45d-5ade-4d8d-b068-9c2c20e11977"            

    }else if(hardware_type == RELAY_WIEGAND_REMOTE){
        
        return "5c396f23-7916-441b-be60-da93b36d87ff"

    }else{
        Alert.alert("Error","Hardware Type is Undefinded.")
        return
    }
}

const getChipSetNumber = (type) => {
    console.log("getChipSetNumber",type)
    if(type == APP_FIRMWARE_UDATE){
        const chipset_bytes = store.getState().setupCentralReducer.app_info.slice(6,10).reverse()
        const number = BYTES_TO_HEX(chipset_bytes).toUpperCase()
        return number
    }else if(type == RADIO_FIRMWARE_UPDATE){
        const chipset_bytes = store.getState().setupCentralReducer.radio_info.slice(6,10).reverse()
        const number = BYTES_TO_HEX(chipset_bytes).toUpperCase()
        return number
    }else{
        console.error("The getChipSetNumber type isn't incorrect")
        return
    }
}

const initDeployDisconnect = () => {
    console.log("initDeployDisconnect()")
    store.dispatch({type: "SET_DEPLOY_DISCONNECT",deploy_disconnect:true})
}

export const fetchFirmwareFile = async (firmware_type,hardware_type,return_files_array) => {
    let key = selectHardwareTypeKey(hardware_type)
    let body = {
        hardware_type_key: key
    }
    
    if(firmware_type == APP_FIRMWARE_UDATE){
        FIRMWARE_LOG_CREATOR(FETCHING_APP_FIRMWARE_FILE)        
        body.firmware_type = "application"
        body.chipset = getChipSetNumber(APP_FIRMWARE_UDATE) 

    }else if(firmware_type == RADIO_FIRMWARE_UPDATE){
        FIRMWARE_LOG_CREATOR(FETCHING_RADIO_FIRMWARE_FILE)
        body.firmware_type = "radio"
        body.chipset =  getChipSetNumber(RADIO_FIRMWARE_UPDATE)

    }else if(firmware_type == BLUETOOTH_FIRMWARE_UPDATE){
        FIRMWARE_LOG_CREATOR(FETCHING_BLUETOOTH_FIRMWARE_FILE)
        body.firmware_type = "bluetooth"

    }else{
        Alert.alert("Error","Hardware Type is Undefinded.")
        return
    }

    const json_body = JSON.stringify(body)

    let response = await fetch(FIRMWARE_CENTRAL_ROUTE, {
        headers: HEADERS_FOR_POST,
        method: 'POST',
        body : json_body 
    })
    
    let files_array = JSON.parse(response._bodyInit).data.files
    
    if(return_files_array){
        return new Promise.resolve(files_array) 
    }

    if(files_array){
        
        let firmware_path = files_array[0].firmware_path
        
        if((firmware_type == RADIO_FIRMWARE_UPDATE) || (firmware_type == APP_FIRMWARE_UDATE) ){
            
            let firmware_file_response = await  RNFetchBlob.fetch('GET', firmware_path,GET_HEADERS)
            if(firmware_type == RADIO_FIRMWARE_UPDATE){
                console.log("firmware_file_response",firmware_file_response)    
            }
            
            let firmware_file_data =  firmware_file_response.text()
                    
            return new Promise.resolve(firmware_file_data) 

        }else if(firmware_type == BLUETOOTH_FIRMWARE_UPDATE){

            let firmware_file_response = await  RNFetchBlob.config({fileCache : true}).fetch('GET', firmware_path,GET_HEADERS)

            return new Promise.resolve(firmware_file_response)
        }         
    }
}

export const chooseCommand = (options,firmware_type)  => {
    if(firmware_type){
        if(options.length == 2){
            if(firmware_type == APP_FIRMWARE_UDATE){
                return options[0]
            }else if(firmware_type == RADIO_FIRMWARE_UPDATE){
                return options[1]
            }else{
                Alert.alert("Error","The firmware_type isn't defined.")
                return false
            }       
        }else{
            Alert.alert("Error","The options aren't incorrect ay chooseCommand() method")
            return false
        }
    }else{
        Alert.alert("Error","The firmware_type isn't defined.");
        return false
    }    
}


