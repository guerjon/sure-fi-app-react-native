import { combineReducers } from 'redux'
import appData from './dataReducer'
import nav from './navReducer'
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


import scannedDevicesListReducer from './scannedDevicesListReducer'
import setupCentralReducer from './setupCentralReducer'
import setupCentralExampleReducer from './setupCentralExampleReducer'
import setupRemoteReducer from './setupRemoteReducer'
import bridgeDetailsReducer from './bridgeDetailsReducer'
import registerReducer from './registerReducer'
import mainScreenReducer from './mainScreenReducer'

const rootReducer = combineReducers({
    appData,
    nav,
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
    mainScreenReducer
})

export default rootReducer