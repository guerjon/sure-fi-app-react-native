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
import HVACDeviceControlPanel from '../bridges/hvac_device_control_panel'
import ModuleDeviceControlPanel from '../bridges/module_device_control_panel'
import SetupCentralExamples from '../bridges/setup_central_examples'
import Deploy from '../bridges/deploy'
import PINCodeModal from '../bridges/pin_code_modal'

import DemoUnitKeyModal from '../bridges/demo_unit_key_modal'
import InsertIDModal from '../bridges/insert_id_modal'
import SetDemoModeTimeModal from '../bridges/set_demo_unit_time_modal'
import SetRuntimeModal from '../bridges/set_run_time_modal'
import DocumentationModal from '../documentation_modal'
import VideosModal from '../videos_modal'
import ProcessTransactionModal from '../bridges/process_transaction_modal'

import BridgeDetails from '../bridges/bridge_details'
import Register from '../bridges/register'
import RadioConfiguration from '../bridges/radio/index'
import OperationValues from '../bridges/operation_values'
import Documentation from '../bridges/documentation'
import Relay from '../bridges/relay'
import Login from '../login'
import Videos from '../videos'
import BluetoothDebugLog from '../bluetooth_debug_log'
import RSSettings from '../bridges/rs_settings'
import PaymentOptions from '../bridges/payment/payment_options'
import HVACPair from '../bridges/hvac/pair'
import ModulePair from '../bridges/module/pair'

import HVACOperatingValues from '../bridges/hvac/operating_values'
import ModuleOperatingValues from '../bridges/module/operating_values'
import ModuleConfiguration from '../bridges/module/configuration'
import HVACConfigureRadio from '../bridges/hvac/configure_radio'
import Configuration from '../bridges/hvac/configuration'
import HVACFirmwareUpdate from '../bridges/hvac/firmware_update'
import AdvanceFirmwareUpdate from '../bridges/hvac/advance_firmware_update'
import HelpScreen from '../help_screen'
import Troubleshooting from '../bridges/hvac/troubleshooting'
//import TroubleshootingModule from '../bridges/module/troubleshooting'
const screens =
[
	['MainScreen',MainScreen],
	['Bridges',Bridges],
	['PairBridge',PairBridge],
	['ForcePair',ForcePair],
	['ScanCentralUnits',ScanCentralUnits],
	['ScanRemoteUnits',ScanRemoteUnits],
	['WriteBridgeConfiguration',WriteBridgeConfiguration],
	['BridgesConfiguration',BridgesConfiguration],
	['ConfigurationScanCentralUnits',ConfigurationScanCentralUnits],
	['ConfigurationScanRemoteUnits',ConfigurationScanRemoteUnits],
	['BatteryLevel',BatteryLevel],
	['UpdateFirmwareCentral',UpdateFirmwareCentral],
	['SelectFirmwareCentral',SelectFirmwareCentral],
	['FirmwareUpdate',FirmwareUpdate],
	['ConfigureRadio',ConfigureRadio],
	['DeviceControlPanel',DeviceControlPanel],
	['SetupCentralExamples',SetupCentralExamples],
	['Deploy',Deploy],
	['BridgeDetails',BridgeDetails],
	['Register',Register],
	['RadioConfiguration',RadioConfiguration],
	['Login',Login],
	['Videos',Videos],
	['OperationValues',OperationValues],
	['Relay',Relay],
	['PINCodeModal',PINCodeModal],
	['DemoUnitKeyModal',DemoUnitKeyModal],
	['InsertIDModal',InsertIDModal],
	['SetDemoModeTimeModal',SetDemoModeTimeModal],
	['Documentation',Documentation],
	['BluetoothDebugLog',BluetoothDebugLog],
	['RSSettings',RSSettings],
	['HVACDeviceControlPanel',HVACDeviceControlPanel],
	['PaymentOptions',PaymentOptions],
	["HVACPair",HVACPair],
	["HVACOperatingValues",HVACOperatingValues],
	["SetRuntimeModal",SetRuntimeModal],
	["HVACConfigureRadio",HVACConfigureRadio],
	["Configuration",Configuration],
	["HVACFirmwareUpdate",HVACFirmwareUpdate],
	["HelpScreen",HelpScreen],
	["DocumentationModal",DocumentationModal],
	["VideosModal",VideosModal],
	["ModuleDeviceControlPanel",ModuleDeviceControlPanel],
	["ModuleOperatingValues",ModuleOperatingValues],
	["ModuleConfiguration",ModuleConfiguration],
	["ModulePair",ModulePair],
	["AdvanceFirmwareUpdate",AdvanceFirmwareUpdate],
	["ProcessTransactionModal",ProcessTransactionModal],
	["Troubleshooting",Troubleshooting],
//	["TroubleshootingModule",TroubleshootingModule]
];

export function registerScreens(store,Provider){
	screens.forEach((screen) => {
		var screen_name = screen[0]
		var screen_object = screen[1]
		Navigation.registerComponent(screen_name, () => screen_object,store,Provider)		
	})	
}