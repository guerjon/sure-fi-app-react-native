import { combineReducers } from 'redux'
import appData from './dataReducer'
import pairReducer from './pairReducer'
import scanRemoteReducer from './scanRemoteReducer'
import scanCentralReducer from './scanCentralReducer'
import writeBridgeConfigurationReducer from './writeBridgeConfigurationReducer'
import configurationScanCentralReducer from './configurationScanCentralReducer'
import configurationScanRemoteReducer from './configurationScanRemoteReducer'

import updateFirmwareCentralReducer from './bridges_configuration/updateFirmwareCentralReducer'
import selectFirmwareCentralReducer from './bridges_configuration/selectFirmwareCentralReducer'
import firmwareUpdateReducer from './bridges_configuration/firmwareUpdateReducer'
import configureRadioCentralReducer from './bridges_configuration/configureRadioCentralReducer'
import bluetoothFirmwareUpdateReducer from './bridges_configuration/bluetoothFirmwareUpdateReducer'
import batteryLevelReducer from './bridges_configuration/batteryLevelReducer'

import scannedDevicesListReducer from './helpers/scannedDevicesListReducer'
import setupCentralReducer from './setupCentralReducer'
import setupCentralExampleReducer from './setupCentralExampleReducer'
import setupRemoteReducer from './setupRemoteReducer'
import bridgeDetailsReducer from './bridgeDetailsReducer'
import registerReducer from './registerReducer'
import mainScreenReducer from './mainScreenReducer'
import loginReducer from './loginReducer'


const rootReducer = combineReducers({
    appData,
    pairReducer,
    scanCentralReducer,
    scanRemoteReducer,
    writeBridgeConfigurationReducer,
    configurationScanCentralReducer,
    configurationScanRemoteReducer,
    updateFirmwareCentralReducer,
    selectFirmwareCentralReducer,
    firmwareUpdateReducer,
    configureRadioCentralReducer,
    scannedDevicesListReducer,
    setupCentralReducer,
    setupCentralExampleReducer,
    setupRemoteReducer,
    bridgeDetailsReducer,
    registerReducer,
    mainScreenReducer,
    bluetoothFirmwareUpdateReducer,
    batteryLevelReducer,
    loginReducer
})

export default rootReducer