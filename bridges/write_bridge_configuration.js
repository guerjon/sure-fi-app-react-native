
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
import { NavigationActions } from 'react-navigation'
import RNFetchBlob from 'react-native-fetch-blob'
import {
	SCANNING_UNITS,
	CONNECTING_CENTRAL_UNIT,
	WRITING_CENTRAL_UNIT,
	WROTE_CENTRAL_UNIT,
	CONNECTING_REMOTE_UNIT,
	WRITING_REMOTE_UNIT,
	WROTE_REMOTE_UNIT,
	DEVICES_NOT_FOUNDED,
	ADD_DEVICES,
	TO_HEX_STRING,
	BASE64,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_WRITE_UUID,
	PAIR_SUREFI_READ_UUID,
	SUREFI_CMD_READ_UUID,
	HEX_TO_BYTES,
	API_REGISTERING_LINK,
	UPLOAD_IMAGE_LINK,
	UNPAIR_LINK,
	SUREFI_SEC_SERVICE_UUID,
	SUREFI_SEC_HASH_UUID,

} from '../constants'
import BleManager from 'react-native-ble-manager';
var randomstring = require('random-string');
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
//central_id EB:16:3A:07:E2:44
//remote_id F4:AF:68:14:7A:3E

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
  		dispatch({type: "RESET_STATE"})
		bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicNotification(data) );
		bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',(data) => this.disconnectDevice(data) );
		dispatch({type: SCANNING_UNITS})
		this.central_id_bytes = HEX_TO_BYTES(central_device.manufactured_data.device_id)
		this.remote_id_bytes = HEX_TO_BYTES(remote_device.manufactured_data.device_id)
		//this.temporalyConnect()
		this.getSystemKey()
	}

	disconnectDevice(data){
		//Alert.alert("The bridge is not connected.","The bridge has been disconected.")
	}

	temporalyConnect(){
		
		var {central_device,remote_device,dispatch} = this.props
		var central_manufactured_data = central_device.manufactured_data.security_string
		var remote_manufactured_data = remote_device.manufactured_data.security_string

		BleManagerModule.start({},start => {
			
			dispatch({type:CONNECTING_CENTRAL_UNIT})
			BleManager.connect(central_device.id).then(() => {
				
		    	BleManagerModule.retrieveServices(central_device.id, () => {
		    		
		    		BleManager.write(central_device.id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,central_manufactured_data,20).then(() =>{
			    		
			    		BleManager.connect(remote_device.id).then(() => {
			    			
			    			dispatch({type:CONNECTING_REMOTE_UNIT})
				    		BleManagerModule.retrieveServices(remote_device.id, () => {
								
				    			BleManager.write(remote_device.id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,remote_manufactured_data,20).then(() =>{
				    				
				    				this.startCentralNotification()	
				    			}).catch(error => Alert.alert("ERROR",error))
				    		})
			    		}).catch(error => Alert.alert("ERROR",error))
		    		}).catch(error => Alert.alert("ERROR",error))
		    	})
		    }).catch(error => Alert.alert("ERROR",error))
		})
	}


	startCentralNotification(){

		var {central_device,remote_device,dispatch} = this.props
		
        BleManagerModule.retrieveServices(
        	central_device.id,
        	() => {
        		
        		BleManagerModule.startNotification(
					central_device.id,
					PAIR_SUREFI_SERVICE,
					PAIR_SUREFI_READ_UUID,
					() => this.startRemoteNotification()
				)
        	}
        )
	}

	startRemoteNotification(){
		var {remote_device,remote_device,dispatch} = this.props
        BleManagerModule.retrieveServices(
        	remote_device.id,
        	() => {
        		
        		BleManagerModule.startNotification(
					remote_device.id,
					PAIR_SUREFI_SERVICE,
					PAIR_SUREFI_READ_UUID,
					() => this.writeCentral()
				)
        	}
        )		
	}



	writeCentral(){
		var {central_device,dispatch} = this.props
		
		BleManagerModule.retrieveServices(central_device.id,() => {
			
			dispatch({type: WRITING_CENTRAL_UNIT})
			BleManager.write(central_device.id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID,this.remote_id_bytes,20).then(() => {
				dispatch({type: WROTE_CENTRAL_UNIT})
				dispatch({type: WRITING_REMOTE_UNIT})
				dispatch({type: WROTE_REMOTE_UNIT})
				this.disconnectDevices()
			})
		})
	}


	writeRemote(){
		var {remote_device,central_device,dispatch} = this.props
		BleManagerModule.retrieveServices(remote_device.id, () => {
			BleManager.write(remote_device.id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID,this.central_id_bytes,20).then(() => {		
			});
		})
	}


	disconnectDevices(){
		var {remote_device,central_device,dispatch} = this.props
		BleManager.disconnect(remote_device.id).then(() => {
			BleManager.disconnect(central_device.id).then(() => {
				Alert.alert("Success","The pairing was make correctly")
				const navigation_reset = NavigationActions.reset({
					index : 0,
					actions: [
						NavigationActions.navigate({routeName: "BridgesConfiguration"})
					]
				})
				this.props.navigation.dispatch(navigation_reset)
			})
		})		
	}

	handleCharacteristicNotification(data){
		
	}

	getSystemKey(){
		var {
			remote_photo_data,
			remote_unit_description,
			central_photo_data,
			central_unit_description,
			central_device,
			remote_device,
			brige_details_description
		} = this.props
		
		
		fetch(API_REGISTERING_LINK,{
			method: 'POST',
			headers: {
			    'Accept': 'application/json',
			    'Content-Type': 'application/json',				
			},
			body : JSON.stringify({
				system_type : 4,	
				bridge_serial_central : central_device.manufactured_data.device_id,
				bridge_serial_remote : remote_device.manufactured_data.device_id,
				bridge_desc_central : central_unit_description,
				bridge_desc_remote : remote_unit_description,
				system_title : brige_details_description,
				system_address : "",
				system_longitude : "",
				system_latitude : ""

			})
		}).then(response => {
			
			if(response.status == 200){

				var data = JSON.parse(response._bodyText);
				if(data.status == "success"){
					let key = data.data.system_id
					console.log("key",key)
					this.uploadImages(key,central_photo_data,remote_photo_data)
				}else{
					Alert.alert("Error","Error connecting with the server.")	
				}
			}else{
				Alert.alert("Error","Error connecting with the server.")
			}
		})
	}	

	uploadImages(key,central_photo_data,remote_photo_data){
		let boundary = randomstring({length: 32})
		var xhr = new XMLHttpRequest();
		//xhr.addEventListener("load", (response) => {
		xhr.onreadystatechange = () => {
    		if (xhr.readyState == XMLHttpRequest.DONE) {
    			var response = JSON.parse(xhr.responseText)
    			if(response.status == "success"){
    				this.temporalyConnect()
    			}else{
    				
    			}
    		}
		}
		var central_photo = {
		    uri: central_photo_data.path,
		    type: 'image/jpeg',
		    name: 'central_image',
		};

		var remote_photo = {
			uri : remote_photo_data.path,
		    type: 'image/jpeg',
		    name: 'remote_image',			
		}


		var body = new FormData();
		body.append(boundary)
		body.append("central_image",central_photo)
		body.append(boundary)
		body.append("remote_image",remote_photo)

		body.append(boundary)
		body.append("system_id",key)

		xhr.open('POST', UPLOAD_IMAGE_LINK);
		xhr.send(body);

	}
/*

  	writeCentral(){
  		
  		var {central_device,remote_device,dispatch} = this.props
  		
  		
  		let data = HEX_TO_BYTES(remote_device.manufactured_data.device_id)
  		
  		dispatch({type:CONNECTING_CENTRAL_UNIT})

		BleManager.connect(central_device.id).then(() => {
			dispatch({type: WRITING_CENTRAL_UNIT})
	        BleManager.retrieveServices(central_device.id, () => { 	
	        	BleManager.write(central_device.id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then((response) => {
		          	BleManager.write(central_device.id,SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_WRITE_UUID, data).then((reponse) => {
		          		dispatch({type: WROTE_CENTRAL_UNIT})
		          		this.writeRemote()
		          	}).catch((error) => {
		          		
		          		Alert.alert("Error",error)
		        	});  	
	        	}).catch(error => Alert.alert("ERROR",e))
	        })
		});
  	}

  	writeRemote(){
  		
  		var {central_device,remote_device,dispatch} = this.props
  		let data = HEX_TO_BYTES(central_device.manufactured_data.device_id)

		dispatch({type:CONNECTING_REMOTE_UNIT})

		BleManagerModule.connect(remote_device.id).then(() => {
			dispatch({type: WRITING_REMOTE_UNIT})
			BleManager.retrieveServices(central_device.id, () => {
	        	BleManager.write(remote_device.id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then((response) => {
		          	BleManager.write(remote_device.id,SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_WRITE_UUID, data).then((reponse) => {
		          		dispatch({type: WROTE_REMOTE_UNIT})
		          		BleManager.disconnect(central_device.id).then(response => {
		          				
		          			BleManager.disconnect(remote_device.id).then(response => {
		          				
		          			})
		          		})
		          	}).catch((error) => {
		          		
		          		Alert.alert("Error",error)
		        	});  	
	        	}).catch(error => Alert.alert("ERROR",e))
	        })				
		});
  	}
 */
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
	
  	central_device:  state.scanCentralReducer.central_device,
  	remote_device : state.scanRemoteReducer.remote_device,
  	//central_device : {id : "EB:16:3A:07:E2:44",manufactured_data : {device_id : "fccfcc", security_string : [101,36,83,218,155,45,110,242,46,202,232,179,108,242,229,107]}},
  	//remote_device :  {id : "F4:AF:68:14:7A:3E", manufactured_data : {device_id : "ffcffc", security_string : [220,242,122,137,222,237,88,54,139,224,19,157,116,107,205,121]}},
  	devices : state.pairReducer.devices,
  	remote_photo_data : state.setupRemoteReducer.remote_photo_data,
  	remote_unit_description : state.setupRemoteReducer.remote_unit_description,
  	central_photo_data : state.setupCentralReducer.central_photo_data,
	central_unit_description : state.setupCentralReducer.central_unit_description,
	brige_details_description : state.bridgeDetailsReducer.brige_details_description,

});

export default connect(mapStateToProps)(WriteBridgeConfiguration)
