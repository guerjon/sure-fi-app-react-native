import React, { Component } from 'react'
import {
	View, 
	Text,
	Image,
	TouchableHighlight,
	ScrollView,  
	Platform,
  	PermissionsAndroid,
  	NativeAppEventEmitter,
  	NativeModules,
  	NativeEventEmitter,
  	Alert
} from 'react-native'
import {connect} from 'react-redux'
import {styles,first_color} from '../styles/index'
import modules from '../CustomModules.js'
import Icon from 'react-native-vector-icons/FontAwesome';
import {
	SCANNING_UNITS,
	CONNECTING_CENTRAL_UNIT,
	WRITING_CENTRAL_UNIT,
	WROTE_CENTRAL_UNIT,
	CONNECTING_REMOTE_UNIT,
	WRITING_REMOTE_UNIT,
	WROTE_REMOTE_UNIT,
	ERROR_ON_CENTRAL_SCANNING,
	ERROR_ON_CENTRAL_WROTE,
	ERROR_ON_REMOTE_SCANNING,
	ERROR_ON_REMOTE_WROTE,
	DEVICES_NOT_FOUNDED,
	ADD_DEVICES,
	TO_HEX_STRING,
	BASE64,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	HEX_TO_BYTES,
	OLD_SURE_FI_CMD_SERVICE,
	OLD_SUREFI_CMD_WRITE_UUID
} from '../constants'
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;


const myIcon = (<Icon name="check" size={15} color="#00DD00" />)
const spinner = (<Icon name="spinner" size={15} color="gray" />)

class WriteBridgeConfiguration extends Component{

	static navigationOptions = {
		title : "Configuring Sure-Fi Bridge",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentDidMount() {
		var {dispatch,central_device,remote_device} = this.props;
		this.manager = this.props.navigation.state.params.manager
		dispatch({type: SCANNING_UNITS})
		this.writeCentral()
		
	}

  	writeCentral(){
  		var {central_device,remote_device,dispatch} = this.props
  		dispatch({type:CONNECTING_CENTRAL_UNIT})
  		
  		let data = HEX_TO_BYTES(remote_device.manufactured_data.device_id)
  		
  		
  		
  		BleManager.retrieveServices(central_device.id).then((peripheralData) => {
  			dispatch({type: WRITING_CENTRAL_UNIT})	
          	BleManager.write(central_device.id,OLD_SURE_FI_CMD_SERVICE, OLD_SUREFI_CMD_WRITE_UUID, data).then((reponse) => {
          			dispatch({type: WROTE_CENTRAL_UNIT})
          			this.writeRemote()
          		}).catch((error) => {
          			console.log('Connection error', error);
          			Alert.alert("Error")
        		});
        });	
  	}

  	writeRemote(){
  		var {central_device,remote_device,dispatch} = this.props
  		dispatch({type:CONNECTING_REMOTE_UNIT})
  		let data = HEX_TO_BYTES(central_device.manufactured_data.device_id)

  		BleManager.retrieveServices(remote_device.id).then((peripheralData) => {
  			dispatch({type: WRITING_REMOTE_UNIT})
          	BleManager.write(remote_device.id,OLD_SURE_FI_CMD_SERVICE, OLD_SUREFI_CMD_WRITE_UUID, data).then((reponse) => {
          			dispatch({type: WROTE_REMOTE_UNIT})
          			this.showAlert()
          			BleManager.disconnect(central_device.id).then(() => {
          				BleManager.disconnect(remote_device.id).then(() => {
          					console.log("devices disconnected")
          				})
          			})
          	}).catch((error) => {
          		console.log('Connection error', error);
          		Alert.alert("Error")
        	});
        });	

  	}
 
 	showAlert(){
 		Alert.alert(
			"Success",
			"The paring was made correclty.",
			[
				{text: "Continue",onPress : () => this.props.navigation.goBack("Bridges")}
			]
		);
 	}

	smartBack(){
		this.props.navigation.goBack()
	}

	render(){
		var {
			write_bridge_bluetooth_error,
			scanning_units,
			connecting_central_unit,
			connecting_remote_unit,
			writing_central_unit,
			writing_remote_unit,
			wrote_remote_unit,
			wrote_central_unit,
			error_on_central_scanning,
			error_on_central_wrote,
			error_on_remote_scanning,
			error_on_remote_wrote,
		} = this.props;
		
		if(write_bridge_bluetooth_error){
			<ScrollView style={styles.pairContainer} >
				<Image  
					source={require('../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>
					<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
						<View style={{backgroundColor:"white",width: 20,height:20}}>
							Bluetooth device is turned off
						</View>
					</View>
				</Image>
			</ScrollView>
		}

		return(
			<ScrollView style={styles.pairContainer} >
				<Image  
					source={require('../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>	
					<View style={styles.rowContainer}>
						<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
						<View style={styles.rowContainerContainer}>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Scanning Central Unit
								</Text>
								<Text style={styles.simpleRowText}>
									{scanning_units ? myIcon : spinner } 
								</Text>
							</View>
							
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Connected
								</Text>
								<Text style={styles.simpleRowText}>
									{connecting_central_unit ? myIcon : spinner } 
								</Text>
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Configured
								</Text>
								<Text style={styles.simpleRowText}>
									{writing_central_unit ? myIcon : spinner } 
								</Text>						
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Paired
								</Text>
								<Text style={styles.simpleRowText}>
									{wrote_central_unit ? myIcon : spinner } 
								</Text>						
							</View>
						</View>
					</View>
					<View style={styles.rowContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Remote Unit
								</Text>
							</View>
						<View style={styles.rowContainerContainer} >
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Scanning Remote Unit
								</Text>
								<Text style={styles.simpleRowText}>
									{scanning_units ? myIcon : spinner } 
								</Text>
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Remote Unit Connected
								</Text>
								<Text>
								{connecting_remote_unit ? myIcon : spinner }
								</Text>
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Remote Unit Configured
								</Text>
								<Text style={styles.simpleRowText}>
									{writing_remote_unit ? myIcon : spinner }
								</Text>						
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Paired
								</Text>
								<Text style={styles.simpleRowText}>
									{wrote_remote_unit ? myIcon : spinner }
								</Text>						
							</View>
						</View>
					</View>
				</Image>
			</ScrollView> 
		)
	}
}

const mapStateToProps = state => ({
	scanning_units  : state.writeBridgeConfigurationReducer.scanning_units,
	connecting_central_unit : state.writeBridgeConfigurationReducer.connecting_central_unit,
	writing_central_unit : state.writeBridgeConfigurationReducer.writing_central_unit,
	wrote_central_unit : state.writeBridgeConfigurationReducer.wrote_central_unit,
	connecting_remote_unit : state.writeBridgeConfigurationReducer.connecting_remote_unit,
	writing_remote_unit : state.writeBridgeConfigurationReducer.writing_remote_unit,
	wrote_remote_unit : state.writeBridgeConfigurationReducer.wrote_remote_unit,
	error_on_central_scanning : state.writeBridgeConfigurationReducer.error_on_central_scanning,
	error_on_central_wrote  : state.writeBridgeConfigurationReducer.error_on_central_wrote,
	error_on_remote_scanning : state.writeBridgeConfigurationReducer.error_on_remote_scanning,
	error_on_remote_wrote : state.writeBridgeConfigurationReducer.error_on_remote_wrote,

  	central_device: state.scanCentralReducer.central_device,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices,

});

export default connect(mapStateToProps)(WriteBridgeConfiguration)
