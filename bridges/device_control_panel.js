//Third part libraries
import React, {Component} from 'react'
import SlowBleManager from 'react-native-ble-manager'
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
	BYTES_TO_HEX,
	SUREFI_SEC_SERVICE_UUID,
	SUREFI_SEC_HASH_UUID,
	BYTES_TO_INT
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
//import {BleManager} as FastBleManager from 'react-native-ble-plx';
import BleManager from 'react-native-ble-manager'
import {WhiteRowLink} from '../helpers/white_row_link'
const helpIcon = (<Icon name="info-circle" size={30} color="black" />)
const backIcon = (<Icon name="arrow-left" size={30} color="white"/> )
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

var interval = 0;

class SetupCentral extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

	constructor(props) {
		super(props);
		this.device = props.device
		this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this)
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.handleConnectedDevice = this.handleConnectedDevice.bind(this)
		this.fast_manager = props.manager
	}

	componentWillMount() {
		console.log("componentWillMount()")
		this.props.dispatch({type: "RESET_SETUP_CENTRAL_REDUCER"}) //something its wrong when the user push back after connect to another device, with this we reset all the state.
		this.handleDisconnected = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectedPeripheral);
		this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',this.handleCharacteristicNotification)
		this.handleConnected = bleManagerEmitter.addListener('BleManagerConnectPeripheral',this.handleConnectedDevice)
	}

	componentDidMount() {
		SlowBleManager.start().then(response => {}).catch(error => console.log(error))
		this.checkDeviceState()
	}

	componentWillUnmount() {
		this.handleDisconnected.remove()
		this.handleCharacteristic.remove()
		this.handleConnected.remove()
		this.disconnect()
	}

	checkDeviceState(){
		let device = this.device

		if(device.manufactured_data.device_state != "0004"){
			this.fastTryToConnect(device)
		}else{
			this.deployConnection(device)
		}
	}

	fastTryToConnect(device){
		console.log("fastTryToConnect()")
	    
		this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})

		IS_CONNECTED(device.id)
		.then(response => {
			if(!response)
				SlowBleManager.connect(device.id).then(response => {})
		})
		setTimeout(() => this.checkConnectionStatus(device),3000) // sometimes the fastConnection fails, if this happen, on 2 seconds it will try to connect again
	}

	checkConnectionStatus(device){
		IS_CONNECTED(device.id)
		.then(response => {
			if(!response)
				SlowBleManager.connect(device.id).then(response => {})
		})		
	}

	deployConnection(device){
		this.props.dispatch({type: "CONNECTING_CENTRAL_DEVICE"})
		this.createConnectionInterval(device)	
	}
	
	createConnectionInterval(device){
		if(interval == 0){
			interval = setInterval(() => this.connect(device),5000)
			console.log("interval created")			
		}else{
			console.log("the interval can't be created it was created previosly")
		}
	}

	connect(device){
		console.log("connect()")
		let manufactured_data = device.manufactured_data.security_string
		IS_CONNECTED(device.id)
		.then(response => {
			if(!response)
				SlowBleManager.connect(device.id).then(response => console.log("response connect()",response))
		})
		.catch(error => console.log("Error",error))
	}

	eraseInterval(){
		console.log("eraseInterval()")
		if(interval){
			clearInterval(interval)
			interval = 0
		}else{
			console.log("interval was clear previously")
		}	
	}

	normalConnected(){
		console.log("normalConnected()")

		var device = this.device
		var id = this.device.id
		var data = GET_SECURITY_STRING(this.device.manufactured_data.device_id,this.device.manufactured_data.tx)
		
		IS_CONNECTED(id)
		.then(response => {
			if(!response){
				BleManagerModule.retrieveServices(id,() => {
		            BleManager.write(id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then(response => {
						if(this.device.writePairResult){
							this.device.writePairResult = false
							this.writePairResult(device)
						}else if(this.device.writeUnpairResult){
							this.device.writeUnpairResult = false
							this.writeUnpairResult(device)
						}else{	
							this.setConnectionEstablished(device)
						}
		            }).catch(error => {
		            	console.log("Error",error)	
		            });
				})				
			}
		})
		.catch(error => {
			console.log("Error",error)
		})
	}

	deployConnected(){
		let device = this.device
		var id = device.id
		var data = device.manufactured_data.security_string

		IS_CONNECTED(id)
		.then(response => {
			if(!response){
				BleManagerModule.retrieveServices(id,() => {
		            BleManager.write(id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then(response => {
		            	this.eraseInterval()
		            	this.setConnectionEstablished()
		            }).catch(error => {
		            	console.log("Error",error)	
		            })
				})
			}
		})
		.catch(error => {
			console.log("Error",error)
		})
	}

    handleConnectedDevice(){
    	console.log("handleConnectedDevice()")
    	if(this.device.manufactured_data.device_state != "0004"){
    		this.normalConnected()
    	}else{	
    		this.deployConnected()
    	}
    }

    setConnectionEstablished(){
    	console.log("setConnectionEstablished()")
    	this.props.dispatch({type: "CONNECTED_CENTRAL_DEVICE"})
    	this.startNotification(this.device)
    }

    handleDisconnectedPeripheral(){		
    	console.log("handleDisconnectedPeripheral()")
    	if(this.props.manual_disconnect){
    		this.props.dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect: false})
			this.props.dispatch({
				type : "DISCONNECT_CENTRAL_DEVICE"
			})    		
    	}
	}

	startNotification(device){
		console.log("startNotification()",device.id)
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
								this.getCloudStatus(device)	
							}
						)
					}
				)        		
        	}
        )
	}

	writePairResult(device){
		console.log("writePairResult()",device.id)
		WRITE_COMMAND(device.id,[0x21])
		.then(response => {
			this.setConnectionEstablished(device)
		})
		.catch(error => console.log("error",error))		
	}

	writeUnpairResult(device){
		console.log("writeUnpairResult()",device.id)
		WRITE_COMMAND(device.id,[0x22])
		.then(response => {
			this.setConnectionEstablished(device)
		})
		.catch(error => console.log("error",error))
	}

	getCloudStatus(device){
		console.log("getCloudStatus()")
		//console.log("this.device.manufactured_data",this.device.manufactured_data.device_state)
		let hardware_serial = device.manufactured_data.device_id.toUpperCase()
		let data = {
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
		fetch(GET_STATUS_CLOUD_ROUTE,data)
		.then(response => {
			let status = JSON.parse(response._bodyInit).data.status
			console.log("getCloudStatusResponse",status)
			this.props.dispatch({type: "SET_HARDWARE_STATUS",hardware_status:status}) //this will be necesary on another component
			this.c_status = status.split("|")[0]
			this.c_expected_status = status.split("|")[1]
			this.getStatus(device,this.c_status,this.c_expected_status)

		}).catch(error => console.log("error",error))
	}
	
	getStatus(device,current_status_on_cloud,expected_status){
		console.log("getStatus()",current_status_on_cloud,expected_status,device.id)
		READ_STATUS(device.id)
		.then(response => {
			console.log("response on getStatus",response)
    		this.current_device_status = response[0]
    		let current_device_status = response[0]
    		
    		this.props.dispatch({type: "UPDATE_OPTIONS",device_status : current_device_status})
    		this.props.dispatch({type:"CONNECTED_CENTRAL_DEVICE"})
    		console.log("current_device_status",current_device_status)
    		console.log("expected_status",expected_status)
			if(current_device_status != expected_status){ //something was wrong and is need show a notification
				console.log("1")
				this.show_notification = true
				let indicator_number = ((parseInt(current_device_status) * 10)  +  parseInt(expected_status.substr(1)))
				this.props.dispatch({type:"SET_INDICATOR_NUMBER",indicator_number:indicator_number })
				if(current_device_status != current_status_on_cloud){
					console.log("2")
					this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
				}

			}else{ //all correct on the device, we need know if was a pair or unpair before
				this.show_notification = false
				this.props.dispatch({type:"SET_INDICATOR_NUMBER",indicator_number: current_device_status})
				if(current_device_status != current_status_on_cloud){
	    			this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
	    		}
			}

    		this.getAllInfo(device)
		})
		.catch(error => console.log("error",error))
    }

    pushStatusToCloud(device,current_status,current_status_on_cloud,expected_status_on_cloud){
    	console.log("pushStatusToCloud()")
    	
		let rx = device.manufactured_data.device_id
		let tx = device.manufactured_data.tx //tx is always right because when we write on the device we always change the local tx on the device
		let device_id = device.manufactured_data.device_id
		let hardware_status = "0" + current_status + "|" +  expected_status_on_cloud + "|" + rx + "|" + tx
		
		PUSH_CLOUD_STATUS(device_id,hardware_status).then(response => {
			console.log("response on pushStatusToCloud()",response._bodyInit)
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
					    	WRITE_COMMAND(device.id,[COMMAND_GET_VOLTAGE])
					    	.then(response => {

					    	}).catch(error => console.log("error",error))

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
		var value = data.value[0]
		
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
				if(this.props.force){ //this comes from the file options method resetStacktoForce
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
			case 0x18:
				data.value.shift()
				this.updateRelayValues(data.value)
				break
			case 0x19:

				data.value.shift()
				this.goToOperationValues(data.value)
				break				
			case 0x1B:
				if(data.value[1]){ // debug mode is enabled
					WRITE_COMMAND(this.device.id,[0x28,0x00])
					.then(response => {
						Alert.alert("Debug Mode Disabled")
						this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: false})

					})
					.catch(error =>  Alert.alert("Error",error))
				} else{
					WRITE_COMMAND(this.device.id,[0x28,0x01])
					.then(response => {
						Alert.alert("Debug Mode Enabled")	
						this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: true})
					})
					.catch(error =>  Alert.alert("Error",error))
				}
				break
			case 0x1C:
				console.log("data",data)
				data.value.shift()

				var miliseconds = BYTES_TO_INT(data.value)
				console.log(miliseconds)

				if(miliseconds){
					if(miliseconds > 1000){
						var seconds = miliseconds / 1000	
						
						if(seconds > 60){
							var minutes = seconds / 60
							
							if(minutes > 60){
								var hours = minutes / 60
								
								if(hours > 24){
									var days = hours / 24
									Alert.alert("Last Connection","The last connection was made about " + days + " days")	
								}else{
									Alert.alert("Last Connection","The last connection was made about " + hours + " hours")		
								}
							}else{
								Alert.alert("Last Connection","The last connection was made about " + minutes + " minutes")	
							}
						}else{
							Alert.alert("Last Connection","The last connection was made about " +seconds+ " seconds.")	
						}
					}else{
						Alert.alert("Last Connection","The last connection was made about just now")	
					}
				}else{
					Alert.alert("Last Connection no registred")	
				}
			break;
			case 0x1A:
				data.value.shift()
				this.handleResetCauseNotification(data.value)
			break;
			default:
				console.log("No options found to: " + value)
			return
		}		
	}

	handleResetCauseNotification(values){
        let powerOn       = values[0] 
        let brownOut      = values[1]
        let wakeFromIdle  = values[2]
        let wakeFromSleep = values[3]
        let watchdogTimer = values[4]
        let deadmanTimer  = values[5]
        let softwareReset = values[6]
        let externalReset = values[7]

        Alert.alert(
        	"Reset Causes",
        	"Power on - " + powerOn + "\n" +
        	"Brown Out - "  + brownOut + "\n" +
        	"Wake from Idle - "  +wakeFromIdle + "\n" +
        	"Wake from Sleep - "  +wakeFromSleep + "\n" +
        	"Watchdog Timer - "  +watchdogTimer + "\n" +
        	"Deadman Timer - "  + deadmanTimer + "\n" +
        	"Software Reset - "  + softwareReset + "\n" +
        	"External Reset - "  + externalReset + "\n", 
        	[
        		{text: "Continue",onPress: () => {}},
        		{text: "Clear", onPress: () => this.clearResetCauses(), style: 'cancel'}
        	]
        )
	}

	clearResetCauses(){
		WRITE_COMMAND(this.device.id,[0x27])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))		
	}

	disconnectOnBack(){
		console.log("disconnectOnBack()")
		//this.disconnect_on_back = true
		IS_CONNECTED(this.device.id)
		.then(response => {
			if(response){
				this.props.dispatch({type:"UPDATE_ACTION_FROM_DISCONNNECT",action_from_disconnect:"disconnectOnBack"})
				SlowBleManager.disconnect(this.device.id)
				.then(response => {
				}).catch(error => console.log("error",error))
			}
		})
	}

	disconnect(){
		console.log("disconnect()")
		IS_CONNECTED(this.device.id)
		.then(response => {
			if(response){
				this.props.dispatch({type:"UPDATE_ACTION_FROM_DISCONNNECT",action_from_disconnect:"manual"})
				SlowBleManager.disconnect(this.device.id)
				.then(response => {
				}).catch(error => console.log("error",error))
			}
		})
	}

	manualDisconnect(){
		console.log("manualDisconnect()")
		
		this.props.dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect : true})
		
		IS_CONNECTED(this.device.id)
		.then(response => {
			if(response){
				//this.props.dispatch({type:"UPDATE_ACTION_FROM_DISCONNNECT",action_from_disconnect:"manual"})
				SlowBleManager.disconnect(this.device.id)
				.then(response => {
				}).catch(error => console.log("error",error))
			}
		})
	}

	manualConnect(){
		this.checkDeviceState()
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

	getDebugModeStatus(){
		WRITE_COMMAND(this.device.id,[0x29])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))		
	}


	getLastPackageTime(){
		WRITE_COMMAND(this.device.id,[0x2A])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))		
	}

	getResetCauses(){
		WRITE_COMMAND(this.device.id,[0x26])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))
	}

	renderInfo(){
		if(this.props.user_status == "logged")
			var admin_values = (
				<View>
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
				</View>
			)
		else
			var admin_values = null

		if(this.props.central_device_status == "connecting")
			return null

		if(this.props.central_device_status == "connected" && this.props.power_voltage){

			return (
				<View style={{alignItems:"center"}}>
					{admin_values}
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
						<WhiteRowLink name="RESET APPLICATION BOARD" callback={() => this.resetBoard()}/>
						<WhiteRowLink name="DEBUG MODE"  callback={() => this.getDebugModeStatus()}/>
						<WhiteRowLink name="GET LAST PACKET TIME" callback={() => this.getLastPackageTime()}/>
						<WhiteRowLink name="RESET CAUSES" callback={() => this.getResetCauses()}/>
					</View>
				</View>	
			)
		}

		return null
	}

	renderOptions(device,central_device_status,indicator_number){
		if(central_device_status == "connecting")
			return <ActivityIndicator/>

		if(!IS_EMPTY(device) &&  central_device_status == "connected" && indicator_number){
			return <Options 
				device={device}
				indicatorNumber={this.props.indicator_number}
				goToPair={() => this.goToPair()}
				goToDeploy={() => this.goToDeploy()}
				goToFirmwareUpdate={() => this.goToFirmwareUpdate()}
				goToConfigureRadio={() => this.goToConfigureRadio()}
				goToForcePair={() => this.goToForcePair()}
				goToInstructionalVideos = {() => this.goToInstructionalVideos()}
				getOperationValues = {() => this.getOperationValues()}
				device_status = {this.props.central_device_status}
				fastTryToConnect = {(device) => this.fastTryToConnect(device)}
				getCloudStatus = {(device) => this.getCloudStatus(device)}
				getRelayValues = {() => this.getRelayValues()}

			/>
		}
		
		return <ActivityIndicator/>
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

		if(this.props.power_voltage < 11){
		//if(true){
			this.handleCharacteristic.remove()
			var fastTryToConnect = (device) => this.fastTryToConnect(device)
			this.props.navigator.showModal(
				{
					screen:"PairBridge",
					title : "Pair Sure-Fi Device",
					passProps:{fastTryToConnect:fastTryToConnect},
					
				}
			)
		}else{
			this.props.dispatch({type:"SHOW_MODAL"})
		}
	}

	goToDeploy(){
		this.handleCharacteristic.remove()
		var getCloudStatus = (device) => this.getCloudStatus(device)
		this.props.navigator.showModal({
		  	screen: 'Deploy', // unique ID registered with Navigation.registerScreen
		  	title: "Deploy Sure-Fi Bridge",
			passProps:
			{
				getCloudStatus:getCloudStatus
			}
		});
	}

	goToFirmwareUpdate(){
		this.handleCharacteristic.remove()
		this.props.navigator.showModal({
			screen:"FirmwareUpdate",
			title : "Firmware Update",
		})
	}

	goToConfigureRadio(){
		this.handleCharacteristic.remove()
		this.props.navigator.showModal(
			{
				screen:"ConfigureRadio",
				title: "Configure Radio"
			}
		)
	}

    updateRelayValues(values){
    	let props = this.props
    	let dispatch = props.dispatch
    	
    	dispatch({type: "SET_SLIDER_VALUE",slider_value: values[0]})
    	dispatch({type: "SET_RELAY_IMAGE_1_STATUS",relay_1_image_status : values[1]})
    	dispatch({type: "SET_RELAY_IMAGE_2_STATUS",relay_2_image_status : values[2]})

    	this.goToRelay()
    }

	goToRelay(){

		this.props.navigator.showModal({
			screen: "Relay",
			title: "Relay Settings",
			passProps: {
				getRelayValues : () => this.getRelayValues()
			}
		})
	}

	goToForcePair(){
		this.handleCharacteristic.remove()
		var getCloudStatus = (device) => this.getCloudStatus(device)
		this.props.navigator.showModal(
		{
			screen:"ForcePair",
			title: "Force Pair",
			passProps:
			{
				getCloudStatus:getCloudStatus 
			}
		})
	}


	goToInstructionalVideos(){
		Alert.alert("Videos on process","Videos coming soon.")
	}

	getOperationValues(){
		WRITE_COMMAND(this.device.id,[0x25])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))
	}

	getRelayValues(){
		WRITE_COMMAND(this.device.id,[0x24])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))		
	}

	goToOperationValues(values){
		this.props.navigator.showModal({
			screen : "OperationValues",
			title : "Operation Values",
			passProps: {
				values: values
			}
		})
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
		console.log("render()")
		
		return (
			<Background>
				<ScrollView>
					<View>
						<StatusBox
							device = {this.device} 
							device_status = {this.props.central_device_status}
							readStatusCharacteristic={(device) => this.getStatus(device)}
							tryToConnect={(device) => this.tryToConnect(device)}
							manualDisconnect={() => this.manualDisconnect()}
							manualConnect={(device) => this.manualConnect(device)}

						/>
					</View>
					<View>
						{this.renderNotification(this.show_notification,this.props.indicator_number)}
					</View>
					<View>
						{this.renderOptions(this.props.device,this.props.central_device_status,this.props.indicator_number)}
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
  	show_modal : state.setupCentralReducer.show_modal,
  	action_from_disconnect : state.setupCentralReducer.action_from_disconnect,
  	manager : state.scanCentralReducer.manager,
  	just_deploy : state.scanCentralReducer.just_deploy,
  	manual_disconnect : state.scanCentralReducer.manual_disconnect,
  	should_connect : state.scanCentralReducer.should_connect,
  	interval : state.scanCentralReducer.interval,
  	indicator_number : state.scanCentralReducer.indicator_number,
  	write_pair_result : state.scanCentralReducer.write_pair_result,
  	user_status : state.mainScreenReducer.user_status,
  	debug_mode_status : state.setupCentralReducer.debug_mode_status
});


export default connect(mapStateToProps)(SetupCentral);