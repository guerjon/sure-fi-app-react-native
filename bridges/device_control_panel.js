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
	BYTES_TO_INT,
	TESTING_RESULTS_ROUTE,
	HEADERS_FOR_POST,
	DIVIDE_MANUFACTURED_DATA,
	FIND_ID
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
	COMMAND_GET_VOLTAGE,
	COMMAND_GET_REGISTERED_BOARD_1,
	COMMAND_GET_REGISTERED_BOARD_2,
	COMMAND_GET_APP_PIC_VERSION,
	COMMAND_GET_RADIO_PIC_VERSION,
	COMMAND_GET_HOPPING_TABLE
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
import BleManager from 'react-native-ble-manager'
import { BleManager as FastBleManager} from 'react-native-ble-plx';
import {WhiteRowLink,WhiteRowInfoLink} from '../helpers/white_row_link'
import {PIC_VERSIONS} from './pic_versions'
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

		console.log("id",this.device.id);
		console.log("name",this.device.name);
		console.log("address",this.device.manufactured_data.address);
		console.log("device_id",this.device.manufactured_data.device_id	);
		console.log("device_state",this.device.manufactured_data.device_state);
		console.log("firmware_version",this.device.manufactured_data.firmware_version);
		console.log("tx",this.device.manufactured_data.tx);
		console.log("hardware_type",this.device.manufactured_data.hardware_type);
		console.log("security_string",this.device.manufactured_data.security_string);

		this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this)
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.handleConnectedDevice = this.handleConnectedDevice.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.fast_manager = new FastBleManager()
		this.devices_found = []
		this.is_in = false
		this.changing_time = false
	}


    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "pin_number":
                    this.showPINModal()
                break
                default:
                break
            }
        } 
    }


	componentWillMount() {
		console.log("componentWillMount()")
		this.props.dispatch({type: "RESET_SETUP_CENTRAL_REDUCER"}) //something its wrong when the user push back after connect to another device, with this we reset all the state.
		this.handleDisconnected = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectedPeripheral);
		this.activateHandleCharacteristic()
		this.handleConnected = bleManagerEmitter.addListener('BleManagerConnectPeripheral',this.handleConnectedDevice)
	}

	componentDidMount() {
		SlowBleManager.start().then(response => {}).catch(error => console.log(error))
		this.checkDeviceState(this.device)
		
		//this.showPINModal()
	}

	componentWillUnmount() {
		this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: false})
		this.handleDisconnected.remove()
		this.disactivateHandleCharacteristic()
		this.handleConnected.remove()
		this.disconnect()
		this.fast_manager.stopDeviceScan()
		//PUSH_CLOUD_STATUS(this.device.manufactured_data.device_id,"04|04|FFCFFC|FCCFCC").then(response => console.log(response)).catch(error => console.log(error))
	}

	showPINModal(){
		this.props.navigator.showLightBox({
            screen: "PINCodeModal",
            style: {
                backgroundBlur: "dark", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.5)" // tint color for the background, you can specify alpha here (optional)
            },
            adjustSoftInput: "resize", // android only, adjust soft input, modes: 'nothing', 'pan', 'resize', 'unspecified' (optional, default 'unspecified')
        });
	}


	activateHandleCharacteristic(){
		this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',this.handleCharacteristicNotification)
	}

	disactivateHandleCharacteristic(){
		this.handleCharacteristic.remove()
	}

	checkDeviceState(device){
		console.log("checkDeviceState()")
		var state = device.manufactured_data.device_state.slice(-2)
		if(state != "04"){
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
		//setTimeout(() => this.checkConnectionStatus(device),3000) // sometimes the fastConnection fails, if this happen, on 2 seconds it will try to connect again
	}

	checkConnectionStatus(device){
		IS_CONNECTED(device.id)
		.then(response => {
			if(!response)
				SlowBleManager.connect(device.id).then(response => {})
		})		
	}

	deployConnection(device){
		console.log("deployConnection()")
		this.props.dispatch({type: "CONNECTING_CENTRAL_DEVICE"})
		this.createConnectionInterval(device)	
	}
	
	createConnectionInterval(device){
		console.log("createConnectionInterval()")
		if(interval == 0){
			console.log("entra")
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
		console.log("deployConnected()")
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
    	var state = this.device.manufactured_data.device_state.slice(-2)

    	if(state != "04"){
    		this.changing_time = false
    		this.normalConnected()
    	}else{	

    		this.deployConnected()
    	}
    }

    setConnectionEstablished(){
    	console.log("setConnectionEstablished()")
    	this.props.dispatch({type: "CONNECTED_CENTRAL_DEVICE"})
    	this.changing_time = false
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
								//this.getCloudStatus(device)	
							 	 this.readStatusOnDevice(device)
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

	readStatusOnDevice(device){
		console.log("readStatusOnDevice()");
		READ_STATUS(device.id)
		.then(response => {
			console.log("response",response);
			this.status_on_bridge = response[0] //this is the internal status on the bridge
			if(this.status_on_bridge == 2){
				this.readStatusOnDevice(device)
			}else{
				this.getCloudStatus(device)
			}
		})
		.catch(error => Alert.alert("Error",error))
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
		var status = this.device.manufactured_data.device_state.slice(-2)
		
		//this.getStatus(device,this.c_status,this.c_expected_status)
		console.log("GET_STATUS_CLOUD_ROUTE",GET_STATUS_CLOUD_ROUTE)
		fetch(GET_STATUS_CLOUD_ROUTE,data)
		.then(response => {
			let status = JSON.parse(response._bodyInit).data.status
			console.log("getCloudStatusResponse",status)
			this.props.dispatch({type: "SET_HARDWARE_STATUS",hardware_status:status}) //this will be necesary on another component

			let current_status_on_cloud = status.split("|")[0] //last know status on the device
			let expected_status = status.split("|")[1] // current expected status the sure_fi should have this state
			let current_status_on_bridge = this.status_on_bridge

			this.choseNextStep(current_status_on_cloud,expected_status,current_status_on_bridge,device)

		}).catch(error => console.log("error",error))
	}
	


	choseNextStep(current_status_on_cloud,expected_status,current_status_on_bridge,device){
		console.log("getStatus()",current_status_on_cloud,expected_status,current_status_on_bridge)
			current_status_on_cloud = parseInt(current_status_on_cloud,10)
			expected_status = parseInt(expected_status,10)
			current_status_on_bridge = parseInt(current_status_on_bridge,10)


    		/*this.props.dispatch({type: "UPDATE_OPTIONS",device_status : current_device_status})
    		this.props.dispatch({type:"CONNECTED_CENTRAL_DEVICE"})
    		this.props.dispatch({type:"SET_INDICATOR_NUMBER",indicator_number:status })
    		this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
			*/
    		
    		if(current_status_on_bridge != expected_status){ //something was wrong :( lets choose what is the next step
    			switch(current_status_on_bridge){
    				case 1: 
    					this.handleUnpairedFail(expected_status) // the device is currently unpair
    				break
    				case 2:
    					this.handlePairingFail(expected_status) 
    				break
    				case 3:
    					this.handlePairedFail(expected_status) 
    				break
    				case 4:
    					this.handleDeployedFail(expected_status)
    				break
    				default:
    					Alert.alert("Error","The internal state on the device its wrong.")
    				break
    			}
    		}else{
    			this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: current_status_on_bridge})
    		}

    		//console.log("current_device_status",current_device_status)
    		//console.log("expected_status",expected_status)
			/*if(current_device_status != expected_status){ //something was wrong and is need show a notification
				//console.log("1")
				console.log("current_status",current_device_status)
				console.log("expected_status",expected_status)

				if(current_device_status == 4 && expected_status == "03"){
					
					this.show_notification = false
					this.props.dispatch({type:"SET_INDICATOR_NUMBER",indicator_number: current_device_status})
					if(current_device_status != current_status_on_cloud){
		    			this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
		    		}

				}else{
					this.show_notification = true
					let indicator_number = ((parseInt(current_device_status) * 10)  +  parseInt(expected_status.substr(1)))
					this.props.dispatch({type:"SET_INDICATOR_NUMBER",indicator_number:indicator_number })
					if(current_device_status != current_status_on_cloud){
						//console.log("2")
						this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
					}					
				}

			}else{ //all correct on the device, we need know if was a pair or unpair before
				this.show_notification = false
				this.props.dispatch({type:"SET_INDICATOR_NUMBER",indicator_number: current_device_status})
				if(current_device_status != current_status_on_cloud){
	    			this.pushStatusToCloud(device,current_device_status,current_status_on_cloud,expected_status)
	    		}
			}
			*/
    		this.getAllInfo(device)
    }


    handleUnpairedFail(expected_status){ //  device state 1
		switch(expected_status){
			case 2: // this case should never happend because we never push 2 to the cloud like expected_status
				Alert.alert("Error","The expected_status its 2 and the current status on the bridge its 1" )
			break
			case 3: // this case happend when the pair was not made correctly the device should be paired but is unpaired we give setIndicator like 0xE0 to show the ForcePair Option
				this.setForcePairOption()
			break
			case 4: // this case happend when the pair was not made correctly the device should be paired but is unpaired we give setIndicator like 0xE1 to show the ForceDeploy Option
				this.setForceDeployOption()
			break
			default: //this shouldnt never happend
				this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 0XEE})
			break
		}
    }

    handlePairingFail(expected_status){ // device state 2
    	switch(expected_status){
    		case 1: // THIS SHOULD NEVER HAPPEN
    			Alert.alert("Error","The expected_status its 1 and the current status on the bridge its 2" )
    		break
    		case 3: // this can happen if the device start to pair but never end
    			this.setForcePairOption()
    		break
    		case 4:
    			this.setForceDeployOption()
    		break
    		default: //this shouldnt never happend
    			this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 0XEE})
    		break
    	}
    }

    handlePairedFail(expected_status){ // device_state 3
    	switch(expected_status){
    		case 1:
    			this.setForceUnPairOption()
    		break
    		case 2: // this should never Happend
    			Alert.alert("Error","The expected_status its 2 and the current status on the bridge its 3" )
    		break
    		case 4:
    			this.setForceDeployOption()
    		break
    		default: //this shouldnt never happend
    			this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 0XEE}) 
    		break
    	}    	
    }

    handleDeployedFail(expected_status){ // device_state 4
    	switch(expected_status){
    		case 1:
    			this.setForceUnPairOption()
    		break
    		case 2: //this shouldn never happend
    			Alert.alert("Error","The expected_status its 2 and the current status on the bridge its 3" )
    		break
    		case 3: //this shouldn never happend because you can't undeploy 

    			Alert.alert("Error","The expected_status its 3 and the current status on the bridge its 4" )

    		break
    		default: //this shouldnt never happend
    			this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 0XEE}) 
    		break
    	}
    }

    setForcePairOption(){
    	this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number : 0xE0})
    }

    setForceDeployOption(){
    	this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 0xE1})
    }

    setForceUnPairOption(){
    	this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 0xE2})
    }

    pushStatusToCloud(device,current_status,current_status_on_cloud,expected_status_on_cloud){
    	console.log("pushStatusToCloud()")
    	
		let rx = device.manufactured_data.device_id
		let tx = device.manufactured_data.tx //tx is always right because when we write on the device we always change the local tx on the device
		let device_id = device.manufactured_data.device_id
		let hardware_status = "0" + current_status + "|" +  expected_status_on_cloud + "|" + rx + "|" + tx
		this.props.dispatch({type: "UPDATE_OPTIONS",device_status : current_status})
		/*PUSH_CLOUD_STATUS(device_id,hardware_status).then(response => {
			//console.log("response on pushStatusToCloud()",response._bodyInit)
			
		}).catch(error => console.log("error",error))*/
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

						    	WRITE_COMMAND(device.id,[COMMAND_GET_REGISTERED_BOARD_1])
						    	.then(response => {
						    		
							    	WRITE_COMMAND(device.id,[COMMAND_GET_REGISTERED_BOARD_2])
							    	.then(response => {
							    		
							    	WRITE_COMMAND(device.id,[COMMAND_GET_REGISTERED_BOARD_2])
							    	.then(response => {
							    		
								    	WRITE_COMMAND(device.id,[COMMAND_GET_APP_PIC_VERSION])
								    	.then(response => {
									    	WRITE_COMMAND(device.id,[COMMAND_GET_RADIO_PIC_VERSION])
									    	.then(response => {
									    		WRITE_COMMAND(device.id,[COMMAND_GET_HOPPING_TABLE])
									    		.then(response => {
									    		})
									    	}).catch(error => console.log("error",error))								    		
								    	}).catch(error => console.log("error",error))

							    	}).catch(error => console.log("error",error))

							    	}).catch(error => console.log("error",error))

						    	}).catch(error => console.log("error",error))

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
				console.log("data",data.value);
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
						retry_count : retry_count,
						heartbeat_period: heartbeat_period,
						acknowledments : acknowledments,
					}
				)
				break
			case 18 : //bluetooth firmware version
				this.props.dispatch({type: "UPDATE_BLUETOOTH_VERSION",version : parseFloat(data.value[1].toString() + "." + data.value[2].toString()) })
				break

			case 0x10: //Register Board name 1
				data.value.shift()
				//console.log("Register Board name 1",data.value)
				let register_board_1 = BYTES_TO_HEX(data.value) 
				//console.log("Register Board name 1",register_board_1)
				register_board_1 = parseInt(register_board_1, 16)
				this.props.dispatch({type: "SET_REGISTER_BOARD_1",register_board_1: register_board_1})
				break

			case 0x11: // Register Board name 2
				data.value.shift()
				//console.log("Register Board name 2",data.value)
				let register_board_2 = BYTES_TO_HEX(data.value) 
				register_board_1 = parseInt(register_board_2, 16)
				this.props.dispatch({type: "SET_REGISTER_BOARD_2",register_board_2: register_board_2})
				break
			case 0x25: // App pic Version
				if(data.value.length > 4){					
					
					this.app_hex_board_version = this.getCorrectHexVersion(data)
					let app_board_version = this.getCorrectStringVerison(this.app_hex_board_version)
					this.props.dispatch({type: "SET_APP_BOARD",app_board_version: app_board_version})

				}else{
					Alert.alert("Error","Something is wrong with the app pic version values.")
				}
				this.startOperationsAfterConnect(this.device)
				break

			case 0x26: // Radio Pic Version
				if(data.value.length > 4){
					
					this.radio_hex_board_version = this.getCorrectHexVersion(data)
					let radio_board_version = this.getCorrectStringVerison(this.radio_hex_board_version)
					this.props.dispatch({type: "SET_RADIO_BOARD",radio_board_version: radio_board_version})

				}else{
					Alert.alert("Error","Something is wrong with the radio pic version values.")
				}
				break

			case 0x14: //Voltage
				
				let v1 = ((data.value[1] & 0xff) << 8) | (data.value[2] & 0xff);  
				let v2 = ((data.value[3] & 0xff) << 8) | (data.value[4] & 0xff);
				let power_voltage = CALCULATE_VOLTAGE(v1).toFixed(2)
				let battery_voltage = CALCULATE_VOLTAGE(v2).toFixed(2) 
				this.props.dispatch({type : "UPDATE_POWER_VALUES",battery_voltage: battery_voltage, power_voltage : power_voltage})
				this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: true})
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

			case 0x19:

				data.value.shift()
				this.goToOperationValues(data.value)
				break

			case 0x20: 
				var selectedDeviceHoppingTable = data.value[1]
				selectedDeviceHoppingTable = parseInt(selectedDeviceHoppingTable,16)

				this.selectHoppingTable(selectedDeviceHoppingTable,data.value[1])
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
				//console.log("data",data)
				data.value.shift()

				var miliseconds = BYTES_TO_INT(data.value)
				//console.log(miliseconds)

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
				//console.log("No options found to: " + value)
			return
		}		
	}

	getCorrectHexVersion(data){
		var current_version = [data.value[1],data.value[2],data.value[3],data.value[4]]
		current_version = BYTES_TO_HEX(current_version).toString().toUpperCase()
		return current_version
	}

	getCorrectStringVerison(current_version){
		var versions = new Map(PIC_VERSIONS) 
		var app_board_version = versions.get(current_version)
		return app_board_version
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

	setAppBoardVersion(){
		
	  	let app_board_version = this.props.app_board_version.split(" ")
	  	console.log("app_board_version",app_board_version)
		fetch(
			TESTING_RESULTS_ROUTE,
			{
				method: "POST",
				headers: HEADERS_FOR_POST,
				body : JSON.stringify({
					test_key :  app_board_version[0]
				})
			}
		).then(
			response => {
				console.log("response")
				console.log(response)
			}
		).catch(
			error => {
				console.log(error)
			}
		)
	}

	setRadioBoardVersion(){

	}

	selectHoppingTable(selectedDeviceHoppingTable,normal_hopping_table){
        let tableIndex = parseInt(selectedDeviceHoppingTable,16) % 72 

        var option = tableIndex % 3

        if (selectedDeviceHoppingTable >= 72) {

            option += 1

        }

        if (selectedDeviceHoppingTable >= 144) {

            option += 1

        }

        switch (option) {

        case 0:

            selectedDeviceSF = "SF10"

            selectedDeviceBandwidth = "250kHz"

            break

        case 1:

            selectedDeviceSF = "SF9"

            selectedDeviceBandwidth = "125kHz"

            break

        default:

            selectedDeviceSF = "SF8"
            selectedDeviceBandwidth = "62.5kHz"
            break
        }

        this.props.dispatch({type: "UPDATE_HOPPING_TABLE",hopping_table:normal_hopping_table})
        this.props.dispatch({type: "UPDATE_SPREADING_FACTOR",spreading_factor:selectedDeviceSF})
        this.props.dispatch({type: "UPDATE_BAND_WIDTH",band_width:selectedDeviceBandwidth})

	}

	renderInfo(){
		let user_type = this.props.user_data ?  this.props.user_data.user_type : false

		//if(user_type)
		if(true)
			var admin_values = (
				<View>
					<View>
						<View style={styles.device_control_title_container}>
							<Text style={styles.device_control_title}>
								CURRENT FIRMWARE VERSION
							</Text>
						</View>
						<WhiteRow name="Application" value={PRETY_VERSION(this.props.app_version) }/>
						<WhiteRow name="Radio" value={PRETY_VERSION(this.props.radio_version) }/>
						<WhiteRow name="Bluetooth" value ={PRETY_VERSION(this.props.bluetooth_version) }/>
					</View>
					<View>
						<View style={styles.device_control_title_container}>
							<Text style={styles.device_control_title}>
								RADIO SETTINGS
							</Text>
						</View>
						<WhiteRow name="Spreading Factor" value ={this.props.spreading_factor}/>
						<WhiteRow name="Bandwidth" value ={this.props.band_width}/>
						<WhiteRow name="Power" value ={this.props.power}/>
						<WhiteRow name="Hopping table" value ={this.props.hopping_table}/>

					</View>
					<View>
						<View style={styles.device_control_title_container}>
							<Text style={styles.device_control_title}>
								HARDWARE INFO
							</Text>
						</View>
						
						<WhiteRowInfoLink callback={() => this.setAppBoardVersion()} name="App Board" value={this.props.register_board_1 +  " - " + this.props.register_board_2 +"\n"+ this.props.app_board_version }/>
						<WhiteRowInfoLink callback={() => this.setRadioBoardVersion()} name="Radio Board" value={this.props.radio_board_version}/>
					</View>										
				</View>
			)
		else
			var admin_values = null
	
			return (
				<View style={{alignItems:"center"}}>
					{admin_values}
					<View>
						<View style={styles.device_control_title_container}>
							<Text style={styles.device_control_title}>
								POWER VALUES
							</Text>
						</View>
						<WhiteRow name="Power Voltage" value={this.props.power_voltage}/>
						<WhiteRow name="Battery Voltage" value={this.props.battery_voltage}/>
					</View>
					
					
					<View style={{marginBottom:80}}>
						<View style={styles.device_control_title_container}>
							<Text style={styles.device_control_title}>
								OTHER COMMANDS
							</Text>
						</View>
						{this.getOtherCommands(user_type)}
					</View>
				</View>	
			)
		return null
	}

	getOtherCommands(user_type){
		//if(user_type){
		if(true){
			return (
				<View>
					<WhiteRowLink name="RESET APPLICATION BOARD" callback={() => this.resetBoard()}/>
					<WhiteRowLink name="DEBUG MODE"  callback={() => this.getDebugModeStatus()}/>
					<WhiteRowLink name="GET LAST PACKET TIME" callback={() => this.getLastPackageTime()}/>
					<WhiteRowLink name="RESET CAUSES" callback={() => this.getResetCauses()}/>
				</View>
			)
		}else{
			return (
				<View style={{marginBottom:20}}>
					<WhiteRowLink name="RESET APPLICATION BOARD" callback={() => this.resetBoard()}/>
				</View>
			)
		}
	}

	renderOptions(){

		return <Options 
			device={this.device}
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
			goToRelay = {() => this.goToRelay()}
			goToChat={() => this.goToChat()}
			goToDocumentation = {() => this.goToDocumentation()}
			activateHandleCharacteristic = {() => this.activateHandleCharacteristic()}
		/>
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
	/* --------------------------------------------------------------------------------------------------- Go To Seccion ---------------------------------------------------------------*/
	/* --------------------------------------------------------------------------------------------------- Go To Seccion ---------------------------------------------------------------*/

	goToPair(){

		//if(this.props.power_voltage < 11){
		if(true){
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
		
		/*this.props.navigator.showModal({
		  	screen: 'Deploy', // unique ID registered with Navigation.registerScreen
		  	title: "Deploy Sure-Fi Bridge",
			passProps:
			{
				getCloudStatus:getCloudStatus
			}
		});*/
	}

	goToFirmwareUpdate(){
		this.handleCharacteristic.remove()

		let user_type = this.props.user_data ?  this.props.user_data.user_type : false
		//console.log("getOptions()",this.props.indicatorNumber,this.props.user_data);
		var admin_options = ["SYS_ADMIN","PROD_ADMIN","CLIENT_DEV"]
		
		
		if(admin_options.lastIndexOf(user_type) !== -1){

			this.props.navigator.showModal({
				screen: "FirmwareUpdate",
				title : "Firmware Update",
				fastTryToConnect : () => this.fastTryToConnect(),
				rightButtons: [
		            {
		                title: 'Advanced', // for a textual button, provide the button title (label)
		                id: 'advanced', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
		            },
		        ],
		        passProps: {
		        	fastTryToConnect: () => this.fastTryToConnect()
		        	//device : this.device
		        }
			})			
		}else{
			this.props.navigator.showModal({
				screen: "FirmwareUpdate",
				title : "Firmware Update",
				fastTryToConnect : () => this.fastTryToConnect(),
				passProps: {
					fastTryToConnect: () => this.fastTryToConnect()
					//device : this.device
				}
			})			
		}
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

	goToRelay(){
		console.log("goToRelay()");
		this.disactivateHandleCharacteristic()
		this.props.navigator.showModal({
			screen: "Relay",
			title: "Relay Settings",
			passProps: {
				activateHandleCharacteristic: () => this.activateHandleCharacteristic(),
				device : this.device
			}
		})
	}

	goToChat(){
		console.log("goToChat--Device_Control()");
		this.disactivateHandleCharacteristic()

		this.props.navigator.push({
			screen : "Chat",
			title: "Sure-Fi Chat",
			passProps: {
				activateHandleCharacteristic: () => this.activateHandleCharacteristic(),
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

	
	goToOperationValues(values){
		this.props.navigator.showModal({
			screen : "OperationValues",
			title : "Operation Values",
			passProps: {
				values: values
			}
		})
	}



	goToDocumentation(){
		console.log("goToDocumentation");
		this.props.navigator.push({
			screen: "DeviceNotMatched",
			title: "Documentation",
			passProps:{
				showAlert: false,
				device_id: this.props.device.manufactured_data.device_id
			}
		})
	}

	/* --------------------------------------------------------------------------------------------------- Go To Seccion ---------------------------------------------------------------*/
	/* --------------------------------------------------------------------------------------------------- Go To Seccion ---------------------------------------------------------------*/	

	getOperationValues(){
		WRITE_COMMAND(this.device.id,[0x25])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))
	}

	closeModal(){
		this.props.dispatch({type: "HIDE_MODAL"})
	}

	openModal(){
		this.props.dispatch({type: "SHOW_MODAL"})
	}

	startOperationsAfterConnect(device){
		this.searchPairedUnit(device)
	}

	searchPairedUnit(device){
		console.log("searchPairedUnit()")
		let state = device.manufactured_data.device_state.slice(-2)

		if(state == "03" || state == "04"){
			//this.scanByFiveSeconds(device)
		}
	}

	scanByFiveSeconds(device){
		console.log("scanByFiveSeconds()")
		this.devices_found = []
		this.is_in = false
		this.startDeviceScan(device)
		setTimeout(() => this.stopScanByFiveSeconds(device),5000)	
	}

	stopScanByFiveSeconds(device){
		console.log("stopScanByFiveSeconds()")
		this.fast_manager.stopDeviceScan();
		
		
		for (var i = 0; i < this.devices_found.length; i++) {
			var device_found = this.devices_found[i]
		 	if(device_found.manufactured_data.device_id == device.manufactured_data.tx){
            	this.is_in = true
		 	}
		}

		if(this.is_in){
			this.other_guy = this.devices_found[0]
			this.props.dispatch({type: "SHOW_SWITCH_BUTTON"})
		}else{
			this.props.dispatch({type: "HIDE_SWITCH_BUTTON"})
		}

		setTimeout(() => {
			if(!this.changing_time)
				this.scanByFiveSeconds(device)
		},2000)
	}

	startDeviceScan(device){

		this.fast_manager.startDeviceScan(null,null,(error,found_device) => {
            //console.log("device",device)
            if(error){
                //console.log("error",error)
                Alert.alert("Error",)
                return
            }

            if (found_device.name == "Sure-Fi Brid" || found_device.name == "SF Bridge") {
            	var data = this.getManufacturedData(found_device)
            	
                if(data.manufactured_data.device_id == device.manufactured_data.tx){
                	this.devices_found.push(data)                	
                }
            }
        })		
	}


    getManufacturedData(device) {
        if (device) {
            device.manufactured_data = DIVIDE_MANUFACTURED_DATA(device.CORRECT_DATA.substring(14), device.id);
            delete device.manufacturerData
            delete device.CORRECT_DATA;
        }else{
          console.log("error on getManufacturedData device is null or 0")
        }
        return device;
    }

	

	switchUnit(){
		this.changing_time = true
		this.fast_manager.stopDeviceScan()
		this.disconnect()
        this.props.dispatch({
	        type: "NORMAL_CONNECTING_CENTRAL_DEVICE",
	    })	
	    this.props.dispatch({
	    	type: "HIDE_SWITCH_BUTTON"
	    })

		setTimeout(
			() => {			
				this.device = this.other_guy
				this.other_guy = null
		    	this.props.dispatch({
		            type: "CENTRAL_DEVICE_MATCHED",
		            central_device: this.other_guy,
		        });
		    	this.checkDeviceState(this.device)
			},
			2000
		)

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

	renderCustomActions(){
		
	}

	render(){
		//console.log("datos aca",this.props.central_device_status,this.props.indicator_number,this.props.power_voltage)
		var props = this.props
		if(!IS_EMPTY(this.device) &&  props.central_device_status == "connected" && props.indicator_number && props.power_voltage){
			var content = (
				<View>
					<View>
						{this.renderNotification(this.show_notification,props.indicator_number)}
					</View>
					<View>
						{this.renderOptions()}
					</View>
					<View>
						{this.renderInfo()}
					</View>
					<View>
						{this.renderModal()}
					</View>
				</View>
			)
		}else{
			var content = null
		}

		return (
			<Background>
				<ScrollView>
					<View>
						<StatusBox
							device = {this.device} 
							device_status = {props.central_device_status}
							indicator_number = {props.indicator_number}
							power_voltage = {props.power_voltage}
							readStatusCharacteristic={(device) => this.getStatus(device)}
							tryToConnect={(device) => this.tryToConnect(device)}
							manualDisconnect={() => this.manualDisconnect()}
							manualConnect={(device) => this.manualConnect(device)}
							switchUnit={() => this.switchUnit()}
						/>
					</View>
					<View>
						{content}
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
	device:{
	  	id: 'F4:AF:68:14:7A:3E',
	  	name: 'Sure-Fi Brid',
		manufactured_data : {
			address: 'F4:AF:68:14:7A:3E',
			device_id: 'FFCFFC',
			device_state: '0204',
			firmware_version: '01',
			tx: 'FCCFCC',
			hardware_type: '02',
			security_string: [ 128, 8, 55, 87, 34, 114, 52, 88, 179, 59, 82, 237, 203, 74, 58, 82 ],
	  	}
	},
	central_device_status: state.configurationScanCentralReducer.central_device_status,
	checkDeviceState: state.scanCentralReducer.central_checkDeviceState,
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
  	debug_mode_status : state.setupCentralReducer.debug_mode_status,
  	app_board_version : state.setupCentralReducer.app_board_version,
  	radio_board_version : state.setupCentralReducer.radio_board_version,
  	register_board_1 : state.setupCentralReducer.register_board_1,
  	register_board_2 : state.setupCentralReducer.register_board_2,
  	show_switch_button : state.setupCentralReducer.show_switch_button,
  	user_data : state.loginReducer.user_data

});


export default connect(mapStateToProps)(SetupCentral);