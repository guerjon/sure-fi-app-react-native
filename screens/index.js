import {Navigation} from 'react-native-navigation';

import MainScreen from '../MainScreen'
import Bridges from '../bridges/index.js'
import PairBridge from '../bridges/pair'
import ForcePair from '../bridges/force_pair'
import ScanCentralUnits from '../bridges/scan_central_units'
import ScanRemoteUnits from '../bridges/scan_remote_units'
import WriteBridgeConfiguration from '../bridges/write_bridge_configuration'
import BridgesConfiguration from '../bridges/bridges_configuration/index'
import ConfigurationScanCentralUnits from '../bridges/bridges_configuration/scan_central_units'
import ConfigurationScanRemoteUnits from '../bridges/bridges_configuration/scan_remote_units'
import BatteryLevel from '../bridges/bridges_configuration/battery_level'
import UpdateFirmwareCentral from '../bridges/bridges_configuration/update_firmware_central'
import SelectFirmwareCentral from '../bridges/bridges_configuration/select_firmware_central'
import FirmwareUpdate from '../bridges/firmware_update'
import ConfigureRadio from '../bridges/configure_radio'
import DeviceControlPanel from '../bridges/device_control_panel'
import SetupCentralExamples from '../bridges/setup_central_examples'
import Deploy from '../bridges/deploy'
import PINCodeModal from '../bridges/pin_code_modal'
import BridgeDetails from '../bridges/bridge_details'
import Register from '../bridges/register'
import RadioConfiguration from '../bridges/radio/index'
import OperationValues from '../bridges/operation_values'
import Relay from '../bridges/relay'
import Login from '../login'
import Videos from '../videos'

import Chat from '../bridges/chat'
import CustomMap from '../bridges/chat/custom_map'
import ChatOptions from '../bridges/chat/chat_options'


export function registerScreens(store,Provider){
	Navigation.registerComponent('MainScreen', () => MainScreen,store,Provider)
	Navigation.registerComponent('Bridges', () => Bridges,store,Provider)
	Navigation.registerComponent('PairBridge', () => PairBridge,store,Provider)
	Navigation.registerComponent('ForcePair', () => ForcePair,store,Provider)
	Navigation.registerComponent('ScanCentralUnits', () => ScScanRemoteUnitsanCentralUnits,store,Provider)
	Navigation.registerComponent('ScanRemoteUnits', () => ScanRemoteUnits,store,Provider)
	Navigation.registerComponent('WriteBridgeConfiguration', () => WriteBridgeConfiguration,store,Provider)
	Navigation.registerComponent('BridgesConfiguration', () => BridgesConfiguration,store,Provider)
	Navigation.registerComponent('ConfigurationScanCentralUnits', () => ConfigurationScanCentralUnits,store,Provider)
	Navigation.registerComponent('ConfigurationScanRemoteUnits', () => ConfigurationScanRemoteUnits,store,Provider)
	Navigation.registerComponent('BatteryLevel', () => BatteryLevel,store,Provider)
	Navigation.registerComponent('UpdateFirmwareCentral', () => UpdateFirmwareCentral,store,Provider)
	Navigation.registerComponent('SelectFirmwareCentral', () => SelectFirmwareCentral,store,Provider)
	Navigation.registerComponent('FirmwareUpdate', () => FirmwareUpdate,store,Provider)
	Navigation.registerComponent('ConfigureRadio', () => ConfigureRadio,store,Provider)
	Navigation.registerComponent('DeviceControlPanel', () => DeviceControlPanel,store,Provider)
	Navigation.registerComponent('SetupCentralExamples', () => SetupCentralExamples,store,Provider)
	Navigation.registerComponent('Deploy', () => Deploy,store,Provider)
	Navigation.registerComponent('BridgeDetails', () => BridgeDetails,store,Provider)
	Navigation.registerComponent('Register', () => Register,store,Provider)
	Navigation.registerComponent('RadioConfiguration', () => RadioConfiguration,store,Provider)
	Navigation.registerComponent('Login', () => Login,store,Provider)
	Navigation.registerComponent('Videos',() => Videos,store,Provider)
	Navigation.registerComponent('OperationValues', () => OperationValues,store,Provider)
	Navigation.registerComponent('Relay',() => Relay,store,Provider)
	Navigation.registerComponent('Chat',() => Chat,store,Provider)
	Navigation.registerComponent('ChatOptions',() => ChatOptions,store,Provider)
	Navigation.registerComponent('PINCodeModal',() => PINCodeModal,store,Provider)
	Navigation.registerComponent('CustomMap',() => CustomMap,store,Provider)
}