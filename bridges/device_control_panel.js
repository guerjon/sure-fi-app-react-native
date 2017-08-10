//Third part libraries
import React, {Component} from 'react'
import BleManager from 'react-native-ble-manager'
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';

import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	Dimensions,
  	TextInput,
  	ActivityIndicator,
  	NativeModules,
  	NativeEventEmitter,
  	Alert,
  	Modal
} from 'react-native'

import { 
	IS_EMPTY,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_READ_UUID,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_READ_UUID,
	byteArrayToLong,
	CALCULATE_VOLTAGE,
	GET_STATUS_CLOUD_ROUTE,
	GET_HEADERS,
	GET_MESSAGES_CLOUD_ROUTE,
	GET_SECURITY_STRING,
	PRETY_VERSION,
	BYTES_TO_HEX
} from '../constants'

import StatusBox from './status_box'
import Background from "../helpers/background"
import Options from './options';
import {
	styles,
	first_color,
	height,
	width,
	option_blue
} from '../styles/index.js'
import {
	IS_CONNECTED,
	WRITE_COMMAND,
	PUSH_CLOUD_STATUS,
	READ_STATUS,
	WRITE_HASH,
	DISCONNECT
} from '../action_creators'
import Notification from '../helpers/notification'
import {
	COMMAND_GET_DEVICE_DATA,
	COMMAND_GET_FIRMWARE_VERSION,
	COMMAND_GET_RADIO_FIRMWARE_VERSION,
	COMMAND_GET_BLUETOOTH_FIRMWARE_VERSION,
	COMMAND_GET_RADIO_SETTINGS,
	COMMAND_GET_VOLTAGE
} from '../commands'
import {
	powerOptions,
	bandWidth,
	spreadingFactor,
	heartbeatPeriod,
	acknowledments,
	retryCount
} from "../radio_values"
import {WhiteRow} from './white_row'
const helpIcon = (<Icon name="info-circle" size={30} color="black" />)
const backIcon = (<Icon name="arrow-left" size={30} color="white"/> )
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class SetupCentral extends Component{
	
	static navigationOptions = ({ navigation, screenProps }) => ({
		title : "Device Control Panel",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
		headerLeft: <TouchableHighlight style={{marginHorizontal:15}} onPress={() => navigation.state.params.handleBack() }>{backIcon}</TouchableHighlight>
	});

	constructor(props) {
		super(props);
		this.connected = false
		this.device = props.navigation.state.device
		this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this)
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.handleConnectedDevice = this.handleConnectedDevice.bind(this)
		this.show_notification = false
		this.current_device_status = 0 // the real status on the device 0 for none 1 for unpairing 2 for pairing 3 for paired 4 for deply
	}

	componentWillMount() {
        let props = this.props
		let tryToConnect = props.navigation.state.tryToConnect
		let writeUnpairResult = props.navigation.state.writeUnpairResult
		let intentionalDisconnect = props.navigation.state.intentionalDisconnect
		props.navigation.setParams({handleBack : () => this.handleBack()})

		this.handleDisconnected = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectedPeripheral);
		this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',this.handleCharacteristicNotification)
		this.handleConnected = bleManagerEmitter.addListener('BleManagerConnectPeripheral',this.handleConnectedDevice)

		BleManager.start().then(response => {}).catch(error => console.log(error))
		
		if(tryToConnect){
			BleManager.isPeripheralConnected(this.device.id).then(isConnected => {
				if(isConnected){
					this.connected = true
					if(writeUnpairResult){
						this.writeResultsRequests(this.device)
					}else{
						this.getCloudStatus(this.device)	
					}
					
					
				}else{
					this.device = props.navigation.state.device
					this.device.manufactured_data.security_string = GET_SECURITY_STRING(this.device.manufactured_data.device_id,this.device.manufactured_data.tx)
					this.tryToConnect(this.device)					
				}
			})

		}else{
        	this.device = props.navigation.state.device ? props.navigation.state.device : props.device
        	BleManager.isPeripheralConnected(this.device.id).then(isConnected => {
        		if(isConnected){	
        			this.connected = true;	
        			this.getCloudStatus(this.device)
        		}else{
        			this.tryToConnect(this.device)
        		}
        	})
        }
	}

	componentWillUnmount() {
		this.handleDisconnected.remove()
		this.handleCharacteristic.remove()
		this.handleConnected.remove()
	}

	handleBack(){
		let device = this.props.navigation.state.device ? this.props.navigation.state.device : this.props.device
		DISCONNECT(device.id)
		.then(response => {
			this.props.navigation.goBack()
		})
		.catch(error => console.log("error",error))
	}

	tryToConnect(device){
		//console.log("tryToConnect()")
        this.props.dispatch({
           type: "CONNECTING_CENTRAL_DEVICE",
        })

        this.interval = setInterval(() => this.connect(device),3000);
	}

	connect(device){
		BleManager.connectWithOutResponse(device.id)
	}

    handleConnectedDevice(data){
    	if(!this.connected){
	        if(this.interval)
	            clearInterval(this.interval)

			this.connected = true;
	        WRITE_HASH(this.device.id,this.device.manufactured_data.security_string)
	        .then(response => {
	            this.props.dispatch({
	                type: "CONNECTED_CENTRAL_DEVICE"
	            })
	            this.startNotification(this.device)            	
	        })
	        .catch(error => console.log("error",error))    		
    	}
    }

	startNotification(device){
		//console.log("startNotification()")
        BleManagerModule.retrieveServices(
        	device.id,
        	() => {
				BleManagerModule.startNotification(
					device.id,
					PAIR_SUREFI_SERVICE,
					PAIR_SUREFI_READ_UUID,
					() => {
						BleManagerModule.startNotification(
							device.id,
							SUREFI_CMD_SERVICE_UUID,
							SUREFI_CMD_READ_UUID,
							() => {	
								this.writeResultsRequests(device)	
							}
						)
					}
				)        		
        	}
        )
	}

	writeResultsRequests(device){
		//console.log("writeResultsRequests()")
		if(this.props.navigation.state.writePairingResult || this.props.navigation.state.writeUnpairResult){
			if(this.props.navigation.state.writePairingResult){
				WRITE_COMMAND(device.id,[0x21])
				.then(response => {
					this.getCloudStatus(device)
				})
				.catch(error => console.log("error",error))			
			}

			if(this.props.navigation.state.writeUnpairResult){

					WRITE_COMMAND(device.id,[0x22])
					.then(response => {
						this.getCloudStatus(device)
					})
					.catch(error => console.log("error",error))
			}
		}else{
			this.getCloudStatus(device)
		}
	}

	getCloudStatus(device){
		console.log("getCloudStatus()")
		let hardware_serial = device.manufactured_data.device_id.toUpperCase()
		let status_data = {
			method : "POST",
			headers :{
            'Accept': 'application/json',
            'Content-Type': 'application/json',             
        	},
			body : JSON.stringify({
				hardware_serial : hardware_serial
			})
		}
		//console.log("GET_STATUS_CLOUD_ROUTE",GET_STATUS_CLOUD_ROUTE)
		//console.log("status_data",status_data)
		fetch(GET_STATUS_CLOUD_ROUTE,status_data)
		.then(response => {
			
			let status = JSON.parse(response._bodyInit).data.status
			this.hardware_status = status
			this.c_status = status.split("|")[0]
			this.c_expected_status = status.split("|")[1]
			this.getStatus(device,this.c_status,this.c_expected_status)

		}).catch(error => console.log("error",error))
	}
	
	getStatus(device,current_status_on_cloud,expected_status){
		//console.log("getStatus()")
		READ_STATUS(device.id)
		.then(response => {
    		this.current_device_status = response[0]
    		let current_device_status = response[0]
    		
    		this.props.dispatch({type: "UPDATE_OPTIONS",device_status : current_device_status})
    		this.props.dispatch({type:"CONNECTED_CENTRAL_DEVICE"})

			if(current_device_status != expected_status){ //something was wrong and is need show a notification
				
				this.show_notification = true
				this.indicator_number = (parseInt(current_device_status) * 10)  +  parseInt(expected_status.substr(1))
				
				if(current_device_status != current_status_on_cloud){
					this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
				}

			}else{ //all correct on the device, we need know if was a pair or unpair before
				this.indicator_number = current_device_status
				if(current_device_status != current_status_on_cloud){
	    			this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
	    		}
			}

    		this.getAllInfo(device)
		})
		.catch(error => console.log("error",error))
    }




    pushStatusToCloud(device,current_status,current_status_on_cloud,expected_status_on_cloud){
    	/*console.log("pushStatusToCloud()")
    	console.log("pushStatusToCloud()",device)
    	console.log("pushStatusToCloud()",current_status)
    	console.log("pushStatusToCloud()",current_status_on_cloud)
    	console.log("pushStatusToCloud()",expected_status_on_cloud)*/
		let rx = device.manufactured_data.device_id
		let tx = device.manufactured_data.tx //tx is always right because when we write on the device we always change the local tx on the device
		let device_id = device.manufactured_data.device_id
		let hardware_status = "0" + current_status + "|" +  expected_status_on_cloud + "|" + rx + "|" + tx
		
		PUSH_CLOUD_STATUS(device_id,hardware_status).then(response => {
			this.props.dispatch({type: "UPDATE_OPTIONS",device_status : current_status})
		}).catch(error => console.log("error",error))
    }

    getAllInfo(device){
    	//console.log("getAllInfo()")
    	WRITE_COMMAND(device.id,[COMMAND_GET_FIRMWARE_VERSION])
    	.then(response => {
	    	WRITE_COMMAND(device.id,[COMMAND_GET_RADIO_FIRMWARE_VERSION])
	    	.then(response => {
		    	WRITE_COMMAND(device.id,[COMMAND_GET_BLUETOOTH_FIRMWARE_VERSION])
				.then(response => {
			    	WRITE_COMMAND(device.id,[COMMAND_GET_RADIO_SETTINGS])
			    	.then(response => {
				    	WRITE_COMMAND(device.id,[COMMAND_GET_VOLTAGE])
				    	.then(response => {

				    	}).catch(error => console.log("error",error))

			    	}).catch(error => console.log("error",error))
				})
		    	.catch(error => console.log("error",error))
	    	})
	    	.catch(error => console.log("error",error))    		
    	})
    	.catch(error => console.log("error",error))    	
    }



	byteArrayToLong(byteArray) {
	    var value = 0;
	    for ( var i = 0; i < byteArray.length; i++) {
	        value = (value * 256) + byteArray[i];
	    }

	    return value;
	};
	
	toHexString(byteArray) {
	  return Array.from(byteArray, function(byte) {
	    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
	  }).join('')
	}


	handleCharacteristicNotification(data){
		console.log("handleCharacteristicNotification")
		let value = data.value[0]
		
		switch(value){
			case 1 : //app firmware version
				if(data.value.length == 3){
					this.props.dispatch({type: "UPDATE_APP_VERSION",version : parseFloat(data.value[1].toString() +"." + data.value[2].toString())  })
				}
				break
			case 9 : // radio firmware version
				this.props.dispatch({type: "UPDATE_RADIO_VERSION",version : parseFloat(data.value[1].toString() +"." + data.value[2].toString())  })
				break
			case 8 : //radio settings
				let power = powerOptions.get(data.value[3])
				let spreading_factor = spreadingFactor.get(data.value[1]) 
				let band_width = bandWidth.get(data.value[2]) 
				let retry_count = data.value[4]
				let heartbeat_period = heartbeatPeriod.get(data.value[5]) 
				let acknowledments =  data.value[6] ? "Enabled" : "Disabled"
				let hopping_table = data.value[7]

				this.props.dispatch(
					{
						type: "UPDATE_RADIO_SETTINGS",
						power : power,
						spreading_factor : spreading_factor,
						band_width : band_width,
						retry_count : retry_count,
						heartbeat_period: heartbeat_period,
						acknowledments : acknowledments,
						hopping_table : hopping_table
					}
				)
				break
			case 18 : //bluetooth firmware version
				this.props.dispatch({type: "UPDATE_BLUETOOTH_VERSION",version : parseFloat(data.value[1].toString() + "." + data.value[2].toString()) })
				break
			case 0x14: //Voltage
				
				let v1 = ((data.value[1] & 0xff) << 8) | (data.value[2] & 0xff);  
				let v2 = ((data.value[3] & 0xff) << 8) | (data.value[4] & 0xff);
				let power_voltage = CALCULATE_VOLTAGE(v1).toFixed(2)
				let battery_voltage = CALCULATE_VOLTAGE(v2).toFixed(2) 
				this.props.dispatch({type : "UPDATE_POWER_VALUES",battery_voltage: battery_voltage, power_voltage : power_voltage})
				break
			case 0x16: // pair result
					if(data.value[1] == 2){
						Alert.alert(
							"Pairing Complete",
							"The pairing command has been successfully sent. Please test your Bridge and Confirm that it is functioning correctly.",
						)
					}else{
						Alert.alert(
							"Error !! something was wrong on the pairing process","Connect to the other bridge to fix it."
						)
					}
				break
			case 0x17:
				if(this.props.navigation.state.force){ //this comes from the file options method resetStacktoForce
					Alert.alert(
		    			"Success", "Un-Pair successfully sent"    		
	    			)		
	    			break
				}

				if(data.value[1] == 2){
					Alert.alert(
		    			"Success", "Un-Pair successfully sent"    		
	    			)		

				}else{
					Alert.alert(
						"Error !!","Un-Pair Unsuccessfully connect to the other bridge to fix it."
					)
				}
				break
			default:
				console.log("No options found to: " + value)
			return
		}		
	}

	handleDisconnectedPeripheral(device){
		//console.log("handleDisconnectedPeripheral()")
		this.connected = false
		this.props.dispatch({
			type : "DISCONNECT_CENTRAL_DEVICE"
		})
	}

	handleNotification(){
		console.log("no deberia de hacer nada")
	}

	resetBoard(){
		WRITE_COMMAND(this.device.id,[0x1C])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))
	}

	renderInfo(){

		if(this.props.central_device_status == "connecting")
			return null

		if(this.props.central_device_status == "connected" && this.props.power_voltage){

			return (
				<View style={{alignItems:"center"}}>
					<View>
						<Text style={styles.device_control_title}>
							CURRENT VERSION
						</Text>
						<WhiteRow name="Application" value={PRETY_VERSION(this.props.app_version) }/>
						<WhiteRow name="Radio" value={PRETY_VERSION(this.props.radio_version) }/>
						<WhiteRow name="Bluetooth" value ={PRETY_VERSION(this.props.bluetooth_version) }/>
					</View>
					<View>
						<Text style={styles.device_control_title}>
							CURRENT RADIO SETTINGS
						</Text>
						<WhiteRow name="Spreading Factor" value ={this.props.spreading_factor}/>
						<WhiteRow name="Bandwidth" value ={this.props.band_width}/>
						<WhiteRow name="Power" value ={this.props.power}/>
					</View>
					<View>
						<Text style={styles.device_control_title}>
							CURRENT POWER VALUES
						</Text>
						<WhiteRow name="Power Voltage" value={this.props.power_voltage}/>
						<WhiteRow name="Battery Voltage" value={this.props.battery_voltage}/>
					</View>
					<View style={{marginBottom:80}}>
						<Text style={styles.device_control_title}>
							OTHER COMMANDS
						</Text>
						<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}} onPress={() => this.resetBoard()}>
							<View style={{padding:15,flexDirection:"row"}}>
								<Text style={{fontSize:16,color:option_blue}}>
									RESET APPLICATION BOARD
								</Text>
							</View>
						</TouchableHighlight>						
					</View>
				</View>	
			)
		}

		return null
	}

	renderOptions(device,central_device_status,indicator_number){
		/*
		console.log("renderOptions","device: " + device, "central_device_status:" + central_device_status, "indicator_number:" + indicator_number)
		console.log("!IS_EMPTY(device)",!IS_EMPTY(device))
		console.log("indicator_number",indicator_number)
		console.log("central_device_status",central_device_status)
		*/
		if(central_device_status == "connecting")
			return null

		if(!IS_EMPTY(device) &&  central_device_status == "connected" && indicator_number){
			return <Options 
				device={device} 
				device_status = {central_device_status.central_device_status} 
				navigation={this.props.navigation}
				indicatorNumber={this.indicator_number}
				goToPair={() => this.goToPair()}
				goToDeploy={() => this.goToDeploy()}
				goToFirmwareUpdate={() => this.goToFirmwareUpdate()}
				goToConfigureRadio={() => this.goToConfigureRadio()}
				goToForcePair={() => this.goToForcePair()}
				
			/>
		}
		
		return null
	}

	renderNotification(show_notification,indicator_number){

		if(show_notification && indicator_number){
			return(
				<Notification 
					handleNotification={() => this.handleNotification()} 
					showNotification={show_notification}
					indicatorNumber={indicator_number}
				/>
			)

		}

		return null
	}

	goToPair(){
		//if((this.props.battery_voltage > 7) && (this.props.battery_voltage < 11)){
		if(true){
			this.handleCharacteristic.remove()
			this.props.navigation.navigate("PairBridge",{device: this.device})			
		}else{
			this.props.dispatch({type:"SHOW_MODAL"})
		}
	}

	goToDeploy(){
		this.handleCharacteristic.remove()
		this.props.navigation.navigate("Deploy",{device: this.device})	
	}

	goToFirmwareUpdate(){
		this.handleCharacteristic.remove()
		this.props.navigation.navigate("FirmwareUpdate",{device: this.device})
	}

	goToConfigureRadio(){
		this.handleCharacteristic.remove()
		this.props.navigation.navigate("ConfigureRadio",{device: this.device})
	}

	goToForcePair(){
		this.handleCharacteristic.remove()
		this.props.navigation.navigate("ForcePair",{device: this.device,hardware_status : this.hardware_status})
	}

	closeModal(){
		this.props.dispatch({type: "HIDE_MODAL"})
	}

	openModal(){
		this.props.dispatch({type: "SHOW_MODAL"})
	}

	renderModal(){
		return (
			<Modal 
				animationType={"slide"}
				transparent={true}
				visible={this.props.show_modal}
				onRequestClose={() => this.closeModal()}

			>
				<View style={{backgroundColor: 'rgba(10,10,10,0.5)',flex:1,alignItems:"center",justifyContent:"center"}}>
					<View style={{backgroundColor:"white",width: width-20,height:410,alignSelf:'center',borderRadius:10,alignItems:"center"}}>
						<View style={{marginVertical:10,marginHorizontal:20}}>
							<Text style={{fontSize:20}}>
								Pairing Error
							</Text>
						</View>
						<View style={{marginHorizontal:20,marginVertical:15}}>
							<Text>
								In order to Pair the Sure-Fi Bridge, the device must have a charged 9V Battery plugged into the PWR inputs
							</Text>
						</View>
						<Image 
							source={require('../images/pair_battery_image/pair_battery_image.png')}
							style={{width:200,height:200}}
						/>
						
						<TouchableHighlight 
							onPress={() => this.closeModal()} 
							style={{
								marginTop:10,
								borderTopWidth: 0.2,
								width:width,
								height: 60,
								alignItems:"center",
								justifyContent:"center",
								borderRadius: 10
							}}>
							<Text>
								Ok
							</Text>
						</TouchableHighlight>
					</View>
				</View>
			</Modal>
		)
	}

	render(){
		return (
			<Background>
				<ScrollView>
					<View>
						<StatusBox
							device = {this.device} 
							device_status = {this.props.central_device_status}
							readStatusCharacteristic={(device) => this.getStatus(device)}
							tryToConnect={(device) => this.tryToConnect(device)}
							disconnectDevice={() => this.disconnectDevice()}
						/>
					</View>
					<View>
						{this.renderNotification(this.show_notification,this.indicator_number)}
					</View>
					<View>
						{this.renderOptions(this.device,this.props.central_device_status,this.indicator_number)}
					</View>
					<View>
						{this.renderInfo()}
					</View>
					<View>
						{this.renderModal()}
					</View>
				</ScrollView>
			</Background>
		)
	}
}

const mapStateToProps = state => ({
	screen_status : state.setupCentralReducer.screen_status,
	show_continue_button : state.setupCentralReducer.show_continue_button,
	central_photo_data : state.setupCentralReducer.central_photo_data,
	central_unit_description : state.setupCentralReducer.central_unit_description,
	central_device_status: state.configurationScanCentralReducer.central_device_status,
	device: state.scanCentralReducer.central_device,
	/*device: {
      new_representation: '01010004FF0FF0FF1FF1',
      rssi: -57,
      name: 'Sure-Fi Brid',
      id: 'C1:BC:40:D9:93:B9',
      advertising: {
        CDVType: 'ArrayBuffer',
        data: 'AgEGDf///wEBAAT/D/D/H/ENCFN1cmUtRmkgQnJpZBEHeM6DVxUtQyE2JcUOCgC/mAAAAAAAAAAAAAAAAAA='
      },
      manufactured_data: {
        hardware_type: '01',
        firmware_version: '01',
        device_state: '0004',
        device_id: 'FF0FF0',
        tx: 'FF1FF1',
        address: 'C1:BC:40:D9:93:B9',
        security_string: [76,48,68,129,17,22,77,231,51,142,252,225,200,104,46,153]
      }
    },
    */
	app_version : state.setupCentralReducer.app_version,
	radio_version : state.setupCentralReducer.radio_version,
	bluetooth_version : state.setupCentralReducer.bluetooth_version,
	spreading_factor : state.setupCentralReducer.spreading_factor,
  	band_width : state.setupCentralReducer.band_width,
  	power : state.setupCentralReducer.power,
  	battery_voltage : state.setupCentralReducer.battery_voltage,
  	hopping_table : state.setupCentralReducer.hopping_table,
  	power_voltage : state.setupCentralReducer.power_voltage,
  	device_status : state.setupCentralReducer.device_status,
  	show_modal : state.setupCentralReducer.show_modal
});


export default connect(mapStateToProps)(SetupCentral);