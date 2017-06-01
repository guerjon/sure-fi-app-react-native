import { combineReducers } from 'redux'
import appData from './dataReducer'
import nav from './navReducer'
import pairReducer from './pairReducer'
import scanRemoteReducer from './scanRemoteReducer'
import scanCentralReducer from './scanCentralReducer'
import writeBridgeConfigurationReducer from './writeBridgeConfigurationReducer'
import configurationScanCentralReducer from './configurationScanCentralReducer'
import updateFirmwareCentralReducer from './bridges_configuration/updateFirmwareCentralReducer'
import selectFirmwareCentralReducer from './bridges_configuration/selectFirmwareCentralReducer'

const rootReducer = combineReducers({
    appData,
    nav,
    pairReducer,
    scanCentralReducer,
    scanRemoteReducer,
    writeBridgeConfigurationReducer,
    configurationScanCentralReducer,
    updateFirmwareCentralReducer,
    selectFirmwareCentralReducer
})

export default rootReducer