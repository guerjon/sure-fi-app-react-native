import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	FlatList,
  	Alert,
  	NativeModules,
  	NativeEventEmitter
	} from 'react-native';

import {styles,first_color} from '../styles/index.js'
import  {connect} from 'react-redux';
import ScanCentralUnits from './scan_central_units'
import ScannedDevicesList from '../helpers/scanned_devices_list'
import Background from '../helpers/background'
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation'
<<<<<<< HEAD
import { BleManager,Service,Characteristic } from 'react-native-ble-plx';
import {
 	SUREFI_SEC_SERVICE_UUID,
 	SUREFI_SEC_HASH_UUID,
 	ARRAY_BUFFER_TO_BASE64
 } from '../constants' 
=======
import BleManager from 'react-native-ble-manager';
import BluetoothState from 'react-native-bluetooth-state';
>>>>>>> d2db0e976c76e981655382da58a866864f446e08

const helpIcon = (<Icon name="info-circle" size={30} color="black" />)
const bluetoothIcon = (<Icon name="bluetooth" size={30} color="black" />)
const refreshIcon = (<Icon name="refresh" size={30} color="black"/>)

class Bridges extends Component{
	
	static navigationOptions ={
		title : "Scan Sure-Fi Code",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	constructor(props) {
		super(props);
		this.manager = new BleManager();
	}


	showHelpAlert(){
		Alert.alert(
			"Instructions",
			"1. Locate the Qr Code found on your Sure-Fi Bridge \n\n "+
			"2. Using the viewfinder on this screen bring the CR Conde into focus. You may have to move the bridge closer or farther away from your device \n\n" +
			"3. When the code has been scanned,select \"Continue\" to connect the Sure-Fi Bridge."
		)
	}

	showOrHideDevicesList(){
		var {list_status,dispatch} = this.props;
		if(list_status == "showed"){
			dispatch({type : "HIDE_DEVICES_LIST"})
		}

		if(list_status == "hidden"){
			dispatch({type : "SHOW_DEVICES_LIST"})
		}
	}

	stopScanning(device){
		console.log("stopScanning()",device)
		this.manager.stopDeviceScan();
		const reset_stack = NavigationActions.reset({
            index : 1,
            actions : [
                NavigationActions.navigate({routeName:"Main"}),
                NavigationActions.navigate(
                	{
                		routeName:"DeviceControlPanel",
                		device : device,
                		dispatch: this.props.dispatch,
                		device_status:"first_connection",
                		fast_manager: this.manager
                	})
            ]
        })

        this.props.navigation.dispatch(reset_stack)
	}

	render(){


		return(
			<Background>
				<View style={{flex:1,marginHorizontal:10}}>
					<View style={{height:250,alignItems:"center",marginBottom:60}}>
						<ScanCentralUnits navigation={this.props.navigation} stopScanning={(device)=> this.stopScanning(device)}/>
					</View>
					<View style={{flexDirection:"row"}}>
						<View style={{flex:1}}>
							<Image  
								source={require('../images/instructions_image_1.imageset/instructions_image_1.png')} 
								style={{width:200,height:70}}
							/>	
						</View>
						<View style={{alignItems:"center",flex:1,flexDirection:"row"}}>	
							<TouchableHighlight style={{marginLeft: 30}} elevation={5} onPress={() => this.showHelpAlert()} >
								{helpIcon}
							</TouchableHighlight>
							<TouchableHighlight style={{marginLeft:25}} onPress={() => this.showOrHideDevicesList()}>
								{bluetoothIcon}
							</TouchableHighlight>

						</View>
					</View>
					 <ScrollView>
						<ScannedDevicesList manager={this.manager}/>
					</ScrollView>
				</View>
			</Background>

		);
		
	}
}

const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    manufactured_data: state.scanCentralReducer.manufactured_data,
    scanning_status: state.scanCentralReducer.scanning_status,
    list_status : state.scannedDevicesListReducer.list_status,
    devices : state.pairReducer.devices
})

export default connect(mapStateToProps)(Bridges)