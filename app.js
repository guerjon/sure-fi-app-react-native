import React, { Component } from 'react';
import { StackNavigator,addNavigationHelpers } from 'react-navigation'
import { View, Image } from 'react-native'
import { connect } from 'react-redux';
import {styles} from './styles'
import MainScreen from './MainScreen'
import Bridges from './bridges/index.js'
import PairBridge from './bridges/pair'

import ScanCentralUnits from './bridges/scan_central_units'
import ScanRemoteUnits from './bridges/scan_remote_units'
import WriteBridgeConfiguration from './bridges/write_bridge_configuration'
import BridgesConfiguration from './bridges/bridges_configuration/index'
import ConfigurationScanCentralUnits from './bridges/bridges_configuration/scan_central_units'
import UpdateFirmwareCentral from './bridges/bridges_configuration/update_firmware_central'
import SelectFirmwareCentral from './bridges/bridges_configuration/select_firmware_central'

const mapStateToProps = state => ({
  nav: state.nav,
});

export const AppNavigator = StackNavigator({
	BridgesConfiguration : {screen : BridgesConfiguration},
	Main: {screen: MainScreen,headerMode: 'screen'},
	PairBridge: {screen: PairBridge},
	Bridges: {screen: Bridges},	
	ScanRemoteUnits: { screen: ScanRemoteUnits},	
	ScanCentralUnits: { screen: ScanCentralUnits},
	WriteBridgeConfiguration : {screen : WriteBridgeConfiguration },
	SelectFirmwareCentral : {screen : SelectFirmwareCentral},
	UpdateFirmwareCentral : {screen : UpdateFirmwareCentral},
	ConfigurationScanCentralUnits : {screen : ConfigurationScanCentralUnits},
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