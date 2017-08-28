import React, { Component } from 'react';
import { StackNavigator,addNavigationHelpers,TabNavigator } from 'react-navigation'
import { View, Image } from 'react-native'
import { connect } from 'react-redux';
import {styles,option_blue} from './styles'
import MainScreen from './MainScreen'
import Bridges from './bridges/index.js'
import PairBridge from './bridges/pair'
import ForcePair from './bridges/force_pair'

import ScanCentralUnits from './bridges/scan_central_units'
import ScanRemoteUnits from './bridges/scan_remote_units'
import WriteBridgeConfiguration from './bridges/write_bridge_configuration'
import BridgesConfiguration from './bridges/bridges_configuration/index'
import ConfigurationScanCentralUnits from './bridges/bridges_configuration/scan_central_units'
import ConfigurationScanRemoteUnits from './bridges/bridges_configuration/scan_remote_units'
//import BluetoothFirmwareUpdate from './bridges/bridges_configuration/bluetooth_firmware_update'
import BatteryLevel from './bridges/bridges_configuration/battery_level'

import UpdateFirmwareCentral from './bridges/bridges_configuration/update_firmware_central'
import SelectFirmwareCentral from './bridges/bridges_configuration/select_firmware_central'
import FirmwareUpdate from './bridges/firmware_update'
import ConfigureRadio from './bridges/configure_radio'
import DeviceControlPanel from './bridges/device_control_panel'
import SetupCentralExamples from './bridges/setup_central_examples'
import Deploy from './bridges/deploy'
import BridgeDetails from './bridges/bridge_details'
import Register from './bridges/register'
import RadioConfiguration from './bridges/radio/index'
import Login from './login'

const mapStateToProps = state => ({
  nav: state.nav,
});

export const AppNavigator = StackNavigator({
	Bridges: {screen: Bridges},
	Main: {screen: MainScreen,headerMode: 'screen'},
	DeviceControlPanel : {screen : DeviceControlPanel},

	ForcePair : {screen : ForcePair},
	FirmwareUpdate : {screen : FirmwareUpdate},

	PairBridge: {screen: PairBridge},
	BridgesConfiguration : {screen : BridgesConfiguration},
	ConfigureRadio : {screen : ConfigureRadio},
	RadioConfiguration : {screen : RadioConfiguration},
	WriteBridgeConfiguration : {screen : WriteBridgeConfiguration },
	BridgeDetails : {screen : BridgeDetails},
	Deploy: {screen : Deploy},
	
	UpdateFirmwareCentral : {screen : UpdateFirmwareCentral},
	SelectFirmwareCentral : {screen : SelectFirmwareCentral},
	
	ScanRemoteUnits: { screen: ScanRemoteUnits},	
	ScanCentralUnits: { screen: ScanCentralUnits},
	
	
	ConfigurationScanCentralUnits : {screen : ConfigurationScanCentralUnits},
	ConfigurationScanRemoteUnits : {screen : ConfigurationScanRemoteUnits},
	
	SetupCentralExamples : {screen : SetupCentralExamples},
	Register : {screen : Register},
	BatteryLevel : {screen : BatteryLevel},
	Login : {screen : Login},
	
});



class App extends Component{
	render(){
		var {dispatch,nav} = this.props;
		return (
			<AppNavigator navigation={addNavigationHelpers({ dispatch, state: nav })} />
		)
	}
}

export default connect(mapStateToProps)(App);
