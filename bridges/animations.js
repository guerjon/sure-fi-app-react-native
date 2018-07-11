import React, {Component} from 'react'
import {Animated} from 'react-native'
import { connect } from 'react-redux';
import {store} from "../app"

import { 
    RADIO_FIRMWARE_UPDATE,
    APP_FIRMWARE_UDATE,
    BLUETOOTH_FIRMWARE_UPDATE,
    UNPAIR_STATUS,
    PAIR_STATUS,
} from "../constants"

const FIRMWARE_UPDATE_AVAIBLE  = 0
const UPDATING_FIRMWARE = 1
const FINISHING_FIRMWARE_UDAPTE = 2
const SYSTEM_UPDATED = 3

import {
    height,
    width,
} from '../styles/index.js'


export const finishRadioFirmwareUpdate = () => {
    console.log("finishRadioFirmwareUpdate()")
    store.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: APP_FIRMWARE_UDATE})

    Animated.timing(store.getState().updateFirmwareCentralReducer.radioFirmwareUpdateBoxRadius,{
        toValue: 300,
        duration: 1000
    }).start()

    Animated.timing(store.getState().updateFirmwareCentralReducer.radioFirmwareUpdateBoxPosition,{
        toValue: {x: height - 200,y: 10},
        duration: 1000
    }).start()

    Animated.timing(store.getState().updateFirmwareCentralReducer.radioFirmwareUpdateBoxShape,{
        toValue: {x: 75,y: 75},
        duration: 1000
    }).start()
}

export const finishAppFirmwareUpdate = () => {
    Animated.timing(store.getState().updateFirmwareCentralReducer.appFirmwareUpdateBoxRadius,{
        toValue: 300,
        duration: 1000
    }).start()

    Animated.timing(store.getState().updateFirmwareCentralReducer.appFirmwareUpdateBoxPosition,{
        toValue: {x: height - 200,y: (width/2 - 37) },
        duration: 1000
    }).start()

    Animated.timing(store.getState().updateFirmwareCentralReducer.appFirmwareUpdateBoxShape,{
        toValue: {x: 75,y: 75},
        duration: 1000
    }).start()        
}

export const finishBluetoothFirmwareUpdate = () => {
    console.log("finishBluetoothFirmwareUpdate()")
    store.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: FINISHING_FIRMWARE_UDAPTE})

    Animated.timing(store.getState().updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxRadius,{
        toValue: 300,
        duration: 1000
    }).start()

    Animated.timing(store.getState().updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxPosition,{
        toValue: {x: height - 200,y: (width - 75) },
        duration: 1000
    }).start()

    Animated.timing(store.getState().updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxShape,{
        toValue: {x: 50,y: 50},
        duration: 1000
    }).start()

    setTimeout(() => {
        store.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: 0})
        store.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: SYSTEM_UPDATED})
    },1000)
}

export const startRadioFirmwareUpdate = () => {
    console.log("startRadioFirmwareUpdate()")
    
    store.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: UPDATING_FIRMWARE})
    store.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: RADIO_FIRMWARE_UPDATE})
    
    Animated.timing(store.getState().updateFirmwareCentralReducer.firmareButtonAnimation,{
        toValue: {x: height, y: ((width/2) - 125)},
        duration: 1000,
    }).start()

}


export const startAppFirmwareUpdate = () => {
    console.log("startAppFirmwareUpdate()")
    store.dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage:0})
    store.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: UPDATING_FIRMWARE})
    store.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: APP_FIRMWARE_UDATE})
    
    Animated.timing(store.getState().updateFirmwareCentralReducer.firmareButtonAnimation,{
        toValue: {x: height, y: ((width/2) - 125)},
        duration: 1000,
    }).start()    
}

export const startBluetoothFirmwareUpdate = () =>{
    store.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: UPDATING_FIRMWARE})
    store.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: BLUETOOTH_FIRMWARE_UPDATE})
    store.dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage:0})
}    

export const initDeployDisconnect = () => {
    store.dispatch({type: "SET_DEPLOY_DISCONNECT",deploy_disconnect:true})
}

export const endDeployDisconnect = () => {
    store.dispatch({type: "SET_DEPLOY_DISCONNECT",deploy_disconnect:false})
}


