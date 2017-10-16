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
	FIND_ID,
	stringFromUTF8Array,
	LOG_TYPES,
	BASE64,
	GET_DEVICE_NAME_ROUTE,
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
	DISCONNECT,
	POST_LOG,
	LOG_CREATOR
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
	COMMAND_GET_HOPPING_TABLE,
	COMMAND_GET_BOOTLOADER_INFO,
	COMMAND_GET_ALL_VERSIONS
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
var second_interval = 0;

class SetupCentral extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        appStyle: {
      		orientation: 'portrait',
    	}
    }

	constructor(props) {
		super(props);
		this.device = props.device
		this.manufactured_device_id = this.device.manufactured_data.device_id.toUpperCase()
/*
		console.log("id",this.device.id);
		console.log("name",this.device.name);
		console.log("address",this.device.manufactured_data.address);
		console.log("device_id",this.manufactured_device_id);
		console.log("device_state",this.device.manufactured_data.device_state);
		console.log("firmware_version",this.device.manufactured_data.firmware_version);
		console.log("tx",this.device.manufactured_data.tx);
		console.log("hardware_type",this.device.manufactured_data.hardware_type);
		console.log("security_string",this.device.manufactured_data.security_string);
*/
		this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this)
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.handleConnectedDevice = this.handleConnectedDevice.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.fast_manager = new FastBleManager()

		this.devices_found = []
		this.is_in = false
		this.changing_time = false
		this.allow_go_to_operation_values = false
	}

	componentWillMount() {
		console.log("componentWillMount()")
		
		this.startSlowBleManager()
		this.activateListeners()
		
		this.props.dispatch({type: "RESET_SETUP_CENTRAL_REDUCER"}) //something its wrong when the user push back after connect to another device, with this we reset all the state.
		this.props.dispatch({type: "SET_FAST_MANAGER",fast_manager: this.fast_manager})
		
		this.fetchDeviceName(this.device.manufactured_data.device_id.toUpperCase(),this.device.manufactured_data.tx.toUpperCase())

	}

	componentDidMount() {
		console.log("componentDidMount()");

		this.checkDeviceState(this.device) //enter point for all the connections
	}

	checkDeviceState(device){
		
		var state = device.manufactured_data.device_state.slice(-2)
		console.log("checkDeviceState()",state)

		if(state != "04"){
			this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})
			this.fastTryToConnect(device)
		}else{
			this.props.dispatch({type: "CONNECTING_CENTRAL_DEVICE"})
			this.deployConnection(device)
		}
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


	startSlowBleManager(){
		console.log("startSlowBleManager()");
		SlowBleManager.start().then(response => {}).catch(error => console.log(error))
	}

	activateListeners(){
		console.log("activateListeners()");
		this.handleDisconnected = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectedPeripheral);
		this.handleConnected = bleManagerEmitter.addListener('BleManagerConnectPeripheral',this.handleConnectedDevice)
		this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',this.handleCharacteristicNotification)		
	}



	componentWillUnmount() {
		this.props.restartAll()

		this.changing_time = true
		this.props.dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect: true})
		this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: false})
		this.handleDisconnected.remove()

		this.disactivateHandleCharacteristic()
		this.eraseSecondInterval()
		this.eraseInterval()
		this.handleConnected.remove()
		this.disconnect()
		

		//PUSH_CLOUD_STATUS(this.manufactured_device_id"04|04|FFCFFC|FCCFCC").then(response => console.log(response)).catch(error => console.log(error))
	}

	disconnect(){
		console.log("disconnect()")
		
		this.fast_manager.stopDeviceScan()

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


	showPINModal(){
		this.props.navigator.showLightBox({
            screen: "PINCodeModal",
            style: {
            	flex:1,
                backgroundBlur: "none", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.7)" // tint color for the background, you can specify alpha here (optional)
            },
            passProps: {
            	hideRightButton: () => this.hideRightButton()
            }

        });
	}

	hideRightButton(){
		this.props.navigator.setButtons({
			rightButtons: []
		})
	}


	activateHandleCharacteristic(){
		this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',this.handleCharacteristicNotification)
	}

	disactivateHandleCharacteristic(){
		this.handleCharacteristic.remove()
	}

	fastTryToConnect(device){
		console.log("fastTryToConnect()")
	    
		if(this.props.device.manufactured_data.device_state.slice(-2) == "04"){
			this.props.dispatch({type: "CONNECTING_CENTRAL_DEVICE"})
			this.deployConnection(device)
		}else{
			this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})

			IS_CONNECTED(device.id)
			.then(response => {
				console.log("responseeeee",response);
				if(!response){console.log("entra?");
					SlowBleManager.connect(device.id)
					.then(response => {})
					.catch(error => console.log("Error on fastTryToConnect()",error))
				}else{
					this.startOperationsAfterConnect(device)
				}
			})
			.catch(error => console.log("Error on fastTryToConnect()",error))
			//setTimeout(() => this.checkConnectionStatus(device),3000) // sometimes the fastConnection fails, if this happen, on 2 seconds it will try to connect again

		}

	}

	checkConnectionStatus(device){
		IS_CONNECTED(device.id)
		.then(response => {
			if(!response)
				SlowBleManager.connect(device.id)
				.then(response => {})
				.catch(error => console.log("Error on checkConnectionStatus()",error))
		})		
	}

	deployConnection(device){
		console.log("deployConnection()")
		this.props.dispatch({type: "SET_DEPLOY_DISCONNECT",deploy_disconnect:true})
		this.createConnectionInterval(device)	
	}
	
	createConnectionInterval(device){
		console.log("createConnectionInterval()")
		if(interval == 0){
			interval = setInterval(() => this.connect(device),3000)
			console.log("interval created")			
		}else{
			console.log("the interval can't be created it was created previosly")
		}
	}

	connect(device){
		console.log("connect()",device.manufactured_data.device_id)
		let manufactured_data = device.manufactured_data.security_string
		IS_CONNECTED(device.id)
		.then(response => {
			if(!response){
				console.log("response 1")
				SlowBleManager.connect(device.id)
				.then(response => console.log("response connect()",response))
				.catch(error => {
					console.log("error on connect()",error)
					this.eraseInterval();
				} )
			}else{
				console.log("response 2")
				this.handleConnectedDevice()
			}

		})
		.catch(error => console.log("error on connect()",error))
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

	eraseSecondInterval(){
		console.log("ereseSecondInterval()");
		if(second_interval){
			clearInterval(second_interval)
			second_interval = 0
		}else{
			console.log("second interval was clear previosly");
		}
	}

	simpleConnect(device){
		console.log("simpleConnect()");
		IS_CONNECTED(device.id)
		.then(response => {

			SlowBleManager.connect(device.id)
			.then(response => {})
			.catch(error => console.log("Error on simpleConnect()1",error))

		}).catch(error =>  console.log("Error on simpleConnect()2",error))

	}

	normalConnected(){
		console.log("normalConnected()")

		var device = this.device
		var id = this.device.id
		var data = GET_SECURITY_STRING(this.manufactured_device_id,this.device.manufactured_data.tx)
		
		IS_CONNECTED(id)
		.then(response => {

				BleManagerModule.retrieveServices(id,() => {
		            BleManager.write(id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then(response => {
		            	
		            	this.eraseInterval()
		            	this.setConnectionEstablished(device)

		            }).catch(error => {
		            	console.log("Error",error)
		            });
				})				
			
		}).catch(error => {
			console.log("Error on normalConnected()",error)
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

    	var state = this.device.manufactured_data.device_state.slice(-2)
    	console.log("handleConnectedDevice()",state)

    	this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: parseInt(state)})

    	if(this.props.pair_disconnect || this.props.unpair_disconnect){
    		
    		this.normalConnected()

    	}else if(state != "04"){

    		this.changing_time = false

    		this.normalConnected()

    	}else{	

    		this.deployConnected()

    	}
    }

    setConnectionEstablished(){
    	console.log("setConnectionEstablished()")
		
		if(this.props.pair_disconnect || this.props.unpair_disconnect){
    		

    		if(this.props.pair_disconnect){
    			this.props.dispatch({type:"SET_PAIR_DISCONNECT",pair_disconnect: false})	
    			this.searchPairedUnit(this.device)

    		}else{
    			this.props.dispatch({type:"SET_UNPAIR_DISCONNECT",unpair_disconnect:false})
    			this.eraseSecondInterval()
    		}
    	}

    	this.props.dispatch({type: "SHOW_DISCONNECT_NOTIFICATION",show_disconnect_notification: true})
    	this.props.dispatch({type: "SET_DEPLOY_DISCONNECT",deploy_disconnect:false})
    	
    	this.changing_time = false
    	this.startNotification(this.device)
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
							 	 this.readStatusOnDevice(device)
							}
						)
					}
				)        		
        	}
        )
	}

	readStatusOnDevice(device){
		console.log("readStatusOnDevice()");
		READ_STATUS(device.id)
		.then(response => {
			console.log("response",response);
			this.status_on_bridge = response[0] //this is the internal status on the bridge
			if(this.status_on_bridge == 2){
				console.log("status_on_bridge 1",this.status_on_bridge);
				this.readStatusOnDevice(device)

			}else{
				console.log("status_on_bridge 2",this.status_on_bridge);

				device.manufactured_data.device_state = this.setCorrectStatusToDevice(response[0],device);

	    		this.props.dispatch({
                    type: "CENTRAL_DEVICE_MATCHED",
                    central_device: device
                });

				this.getCloudStatus(device)

			}
		})
		.catch(error => console.log("Error readStatusOnDevice",error))
	}

    handleDisconnectedPeripheral(){		
    	
    	console.log("handleDisconnectedPeripheral()",
    		this.props.pair_disconnect,
    		this.props.unpair_disconnect,
    		this.props.manual_disconnect,
    		this.props.deploy_disconnect,
    		this.props.switch_disconnect
    	)
    	
    	if(this.props.pair_disconnect){
    		console.log("entra aqui - 1");
    		this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})

    		setTimeout(() => this.simpleConnect(this.device),3000)
    		

    	}else if(this.props.unpair_disconnect){
    		console.log("entra aqui - 2");
    		this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})
			
			this.eraseSecondInterval()
			this.props.dispatch({type: "HIDE_SWITCH_BUTTON"})
			console.log("this.props.device on handleDisconnected()",this.props.device.manufactured_data.device_id);
			setTimeout(() => this.simpleConnect(this.props.device),3000)
    		
    	}else if(this.props.manual_disconnect){
    		console.log("entra aqui 3 - manual");

		}else if(this.props.deploy_disconnect){
			console.log("entra aqui 4 - deploy");

    	}
    	else if(this.props.switch_disconnect){
    		console.log("entra aqui - 5");

    		this.props.dispatch({type: "CONNECTING_CENTRAL_DEVICE"})
    		
    		if(this.props.debug_mode_status)
    			this.simpleConnect(this.device)
    		else{
    			this.props.dispatch({type: "SET_SWITCH_DISCONNECT",switch_disconnect:false})
    			this.deployConnection(this.device)
    		}

    	}else{
    		console.log("this.props.show_disconnect_notification",this.props.show_disconnect_notification);
    		if(this.props.show_disconnect_notification)
    			Alert.alert("Bluetooth Error","Bluetooth Device Disconnect.")

			this.props.dispatch({
				type : "DISCONNECT_CENTRAL_DEVICE"
			})    		
			this.fastTryToConnect(this.device)
    	}
	}



	writePairResult(device){
		console.log("writePairResult()",device.id)
		WRITE_COMMAND(device.id,[0x21])
		.then(response => {
			//this.setConnectionEstablished(device)
		})
		.catch(error => console.log("error writePairResult",error))		
	}

	writeUnpairResult(device){
		console.log("writeUnpairResult()",device.id)
		WRITE_COMMAND(device.id,[0x22])
		.then(response => {
			//this.setConnectionEstablished(device)
		})
		.catch(error => console.log("error writeUnpairResult",error))
	}

	setCorrectStatusToDevice(status_on_bridge,device){
		switch(status_on_bridge){
			case 1: 
				return "0001"
			case 2:
				return "0002"
			case 3:
				return "0003"
			case 4:
				return "0004"
			default:
				return device.manufactured_data.device_status
		}

	}

	readStatusAfterUnpair(device){
		console.log("readStatusAfterUnpair()")
		READ_STATUS(device.id)
		.then(response => {
			this.status_on_bridge = response[0]
			if(this.status_on_bridge == 4)
				this.readStatusAfterUnpair()
			else{
				device.manufactured_data.device_state = this.setCorrectStatusToDevice(response[0],device)
				this.props.dispatch({
                    type: "CENTRAL_DEVICE_MATCHED",
                    central_device: device
                });

				this.getCloudStatus(device)
			}

		})
		.catch(error => console.log("error on readStatusAfterUnpair()",error))
			
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
		fetch(GET_STATUS_CLOUD_ROUTE,data)
		.then(response => {
			//console.log("response on cloud",response);
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
			if(current_status_on_cloud != "" && expected_status){
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

			}else{
    			this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: current_status_on_bridge})
    		}

    		this.getAllInfo(device)
    }

	getAllInfo(device){
    	console.log("getAllInfo()")// the last one on be called its 0x07
    	
    	this.turnOnNotifications()
    	setTimeout(() => this.getFirmwareVersion(device),2000)

	}

	getFirmwareVersion(device){
		console.log("getFirmwareVersion()")
    	WRITE_COMMAND(device.id,[COMMAND_GET_FIRMWARE_VERSION])
    	.then(response => {		    		
    	})
    	.catch(error => console.log("error",error))		
	}


    handleUnpairedFail(expected_status){ //  device state 1
		switch(expected_status){
			case 2: // this case should never happend because we never push 2 to the cloud like expected_status
				//Alert.alert("Error","The expected status its 2 and the current status on the bridge its 1" )
				this.setForcePairOption()
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
    			Alert.alert("Error","The expected status its 1 and the current status on the bridge its 2" )
    			//this.setForcePairOption()
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
    			//Alert.alert("Error","The expected status its 2 and the current status on the bridge its 3" )
    			this.setForceUnPairOption()
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
    			this.setForceUnPairOption()
    			//Alert.alert("Error","The expected status its 2 and the current status on the bridge its 3" )
    		break
    		case 3: //this shouldn never happend because you can't undeploy 
    			this.setForceUnPairOption()
    			
    			//Alert.alert("Error","The expected status its 3 and the current status on the bridge its 4" )
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
		console.log("handleCharacteristicNotification",this.props.allow_notifications,data.value)
		if(this.props.allow_notifications){
			var value = data.value[0]
			var device = this.device;
			//console.log("handleCharacteristicNotification on device ()",value);
			data.value.shift()

			switch(value){
				case 0x01 : //app firmware version
					console.log("getting app firmware_version");
					
					WRITE_COMMAND(device.id,[COMMAND_GET_RADIO_FIRMWARE_VERSION])
			    	.then(response => {

		    			
		    			this.saveOnCloudLog(data.value,"APPFIRMWARE")
		    			if(data.value.length > 1)
							this.props.dispatch({type: "UPDATE_APP_VERSION",version : parseFloat(data.value[0].toString() +"." + data.value[1].toString())  })
					
					})
			    	.catch(error => console.log("error getting App firmware version",error))    	


					break
				case 0x07: //Bootloader info
					console.log("getting app bootloaderinfo");
					
					this.saveOnCloudLog(data.value,"BOOTLOADERINFO")
					this.startOperationsAfterConnect(this.device)
					
					this.turnOffNotifications()

					
					break
				case 9 : // radio firmware version
					console.log("getting radio firmware_version");
					WRITE_COMMAND(device.id,[COMMAND_GET_BLUETOOTH_FIRMWARE_VERSION])
					.then(response => {
						
						this.saveOnCloudLog(data.value,"RADIOFIRMWARE")
						if(data.value.length > 1)
							this.props.dispatch({type: "UPDATE_RADIO_VERSION",version : parseFloat(data.value[0].toString() +"." + data.value[1].toString())  })
					})
					.catch(error => console.log("error getting Radio firmware version",error))
					
					break
				case 8 : //radio settings
					
					console.log("getting radio settings",data.value);
					
					this.saveOnCloudLog(data.value,"RADIOSETTINGS")

					let spreading_factor = spreadingFactor.get(data.value[0]) 
					let band_width = bandWidth.get(data.value[1])
					let power = powerOptions.get(data.value[2])
					let hopping_table = data.value[6]
					
					let retry_count = data.value[3]
					let heartbeat_period = heartbeatPeriod.get(data.value[4]) 
					let acknowledments =  data.value[5] ? "Enabled" : "Disabled"
					

			    	WRITE_COMMAND(device.id,[COMMAND_GET_VOLTAGE])
			    	.then(response => {
						this.props.dispatch(
							{
								type: "UPDATE_RADIO_SETTINGS",
								power : power,
								retry_count : retry_count,
								heartbeat_period: heartbeat_period,
								acknowledments : acknowledments,
							}
						)

					}).catch(error => console.log("error",error))
					break
				case 18 : //bluetooth firmware version
					console.log("getting bluetooth firmware version");
					
					WRITE_COMMAND(device.id,[COMMAND_GET_RADIO_SETTINGS])
					.then(response => {
						
						this.saveOnCloudLog(data.value,"BLUETOOTHFIRMWARE")
						this.props.dispatch({type: "UPDATE_BLUETOOTH_VERSION",version : parseFloat(data.value[0].toString() + "." + data.value[1].toString()) })
					}).catch(error => console.log("error",error))
					
					break

				case 0x10: //Register Board name 1
					console.log("getting Register Board name 1");
					
					let register_board_1 = stringFromUTF8Array(data.value) 
					console.log("register_board_1",register_board_1);

					this.props.dispatch({type: "SET_REGISTER_BOARD_1",register_board_1: register_board_1})


					WRITE_COMMAND(device.id,[COMMAND_GET_REGISTERED_BOARD_2])
					.then(response => {
						
					}).catch(error => console.log("error",error))			

					break

				case 0x11: // Register Board name 2
					console.log("getting Register Board name 2");
					WRITE_COMMAND(device.id,[COMMAND_GET_APP_PIC_VERSION])
			    	.then(response => {
						
						//console.log("Register Board name 2",data.value)

						let register_board_2 = stringFromUTF8Array(data.value) 

						this.props.dispatch({type: "SET_REGISTER_BOARD_2",register_board_2: register_board_2})
					}).catch(error => console.log("error",error))								
					break
				case 0x25: // App pic Version
					
					console.log("getting App pic Version");
					
			    	WRITE_COMMAND(device.id,[COMMAND_GET_RADIO_PIC_VERSION])
			    	.then(response => {
						if(data.value.length > 3){					
							
							this.app_hex_board_version = this.getCorrectHexVersion(data)
							let app_board_version = this.getCorrectStringVerison(this.app_hex_board_version)
							this.props.dispatch({type: "SET_APP_BOARD",app_board_version: app_board_version})

						}else{
							Alert.alert("Error","Something is wrong with the app pic version values.")
						}
						

			    	}).catch(error => console.log("error",error))			    				
					break
				case 0x26: // Radio Pic Version
						console.log("getting Radio Pic Version");
						WRITE_COMMAND(device.id,[COMMAND_GET_HOPPING_TABLE])
			    		.then(response => {
							if(data.value.length > 3){
								
								this.radio_hex_board_version = this.getCorrectHexVersion(data)
								let radio_board_version = this.getCorrectStringVerison(this.radio_hex_board_version)
								this.props.dispatch({type: "SET_RADIO_BOARD",radio_board_version: radio_board_version})

							}else{
								Alert.alert("Error","Something is wrong with the radio pic version values.")
							}
			    		})
			    		.catch(error => console.log("error",error))		
					break

				case 0x14: //Voltage
					console.log("getting Voltage");

					
					WRITE_COMMAND(device.id,[COMMAND_GET_REGISTERED_BOARD_1])
					.then(response => {
						
						this.saveOnCloudLog(data.value,"POWERLEVELS")
						let v1 = ((data.value[0] & 0xff) << 8) | (data.value[1] & 0xff);  
						let v2 = ((data.value[2] & 0xff) << 8) | (data.value[3] & 0xff);
						let power_voltage = CALCULATE_VOLTAGE(v1).toFixed(2)
						let battery_voltage = CALCULATE_VOLTAGE(v2).toFixed(2) 
						this.props.dispatch({type : "UPDATE_POWER_VALUES",battery_voltage: battery_voltage, power_voltage : power_voltage})
						this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: true})

					}).catch(error => console.log("error",error))
					break
				case 0x16: // pair result
					console.log("getting pair result");
					
					if(data.value[0] == 2){
						Alert.alert(
							"Pairing Complete",
							"The pairing command has been successfully sent. Please test your Bridge and Confirm that it is functioning correctly.",
						)
					}else{
						Alert.alert(
							"Error","Pairing on the other device failed. Please connect to the other device to finish the pairing process."
						)
					}
					
					this.turnOffNotifications()

					break
				case 0x17: // un-pair result
					console.log("getting unpair result");
					if(this.props.force){ //this comes from the file options method resetStacktoForce
						Alert.alert(
			    			"Success", "Un-Pair successfully sent"    		
		    			)		
		    			break
					}

					if(data.value[0] == 2){
						Alert.alert(
			    			"Success", "Un-Pair successfully sent"    		
		    			)		

					}else{
						Alert.alert(
							"Error","Un-pair on the other unit failed. Please connect to the other unit to complete the un-pair process."
						)
					}
					this.turnOffNotifications()
					break
				case 0x1E: // all versions
					
					console.log("getting all versions");

					this.saveOnCloudLog(data.value,"FIRMWAREVERSIONS")
					this.getBootloaderInfo()
					break

				case 0x20: //get hopping table
					console.log("getting hopping table",data.value);
					
					var selectedDeviceHoppingTable = data.value[0]
					selectedDeviceHoppingTable = parseInt(selectedDeviceHoppingTable,16)
					this.saveOnCloudLog(data.value,"HOPPINGTABLE")

					this.selectHoppingTable(selectedDeviceHoppingTable,data.value[0])
					this.getDebugModeStatus()
					
					break
				case 0x1B: //get debug mode status
					console.log("get debug mode status");
					
					if(data.value[0]){
						this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: true})
					}else{
						this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: false})
					}

					this.getAllVersion()

					break
				case 0x1C: // last packet
					console.log("get last packet")
					this.turnOffNotifications()
					this.saveOnCloudLog(data.value,"LASTPACKET") 
					var miliseconds = BYTES_TO_INT(data.value)
					//console.log(miliseconds)

					if(miliseconds){
						if(miliseconds > 1000){
							var seconds =  miliseconds / 1000	
							
							if(seconds > 60){
								var minutes = seconds / 60
								
								if(minutes > 60){
									var hours = minutes / 60
									
									if(hours > 24){
										var days = hours / 24
										Alert.alert("Last Connection","The last connection was made about " + Math.round(days) + " day(s) ago.")	
									}else{
										Alert.alert("Last Connection","The last connection was made about " + Math.round(hours) + " hour(s) ago.")		
									}
								}else{
									Alert.alert("Last Connection","The last connection was made about " + Math.round(minutes) + " minute(s) ago.")	
								}
							}else{
								Alert.alert("Last Connection","The last connection was made about " + Math.round(seconds) + " second(s) ago.")	
							}
						}else{
							Alert.alert("Last Connection","The last connection was made about just now")	
						}
					}else{
						Alert.alert("Last Connection","No connection has been made since power up.")	
					}
				break;
				case 0x1A: //reset causes
					console.log("getting reset causee");
					this.turnOffNotifications()

					this.saveOnCloudLog(data.value,"RESETCAUSES")
					this.handleResetCauseNotification(data.value)

				break;
				default:
					//console.log("No options found to: " + value)
				return
			}					
		}
	}

	saveOnCloudLog(value,log_type){
		var body = LOG_CREATOR(value,this.manufactured_device_id,this.device.id,log_type)
		POST_LOG(body)
	}

	getDebugModeStatus(){
		console.log("getDebugModeStatus()");

		WRITE_COMMAND(this.device.id,[0x29]) // response with 0x1B
		.then(response => {
		})
		.catch(error => console.log("Error on getDebugModeStatus()",error));
	}


	setDebugModeStatus(){
		if(this.props.debug_mode_status){ // debug mode is enabled
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: false})
			WRITE_COMMAND(this.device.id,[0x28,0x00])
			.then(response => {
				
			})
			.catch(error =>  console.log("Error on setDebugModeStatus()",error))
		} else{
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: true})
			WRITE_COMMAND(this.device.id,[0x28,0x01])
			.then(response => {
				
			})
			.catch(error =>  console.log("Error on setDebugModeStatus()",error))
		}		
	}

	turnOnNotifications(){
		console.log("turnOnNotifications()")
		this.props.dispatch({type :"ALLOW_NOTIFICATIONS",allow_notifications:true})
	}

	turnOffNotifications(){
		console.log("turnOffNotifications()")
		this.props.dispatch({type: "ALLOW_NOTIFICATIONS",allow_notifications:false})
	}

	getCorrectHexVersion(data){
		var current_version = [data.value[0],data.value[1],data.value[2],data.value[3]]
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
        	"Reset Counts",
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
		.catch(error => console.log("Error on clearResetCauses()",error))
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

	switchDisconnect(id,type){
		console.log("switchDisconnect()");
		this.props.dispatch({type:"SET_SWITCH_DISCONNECT",switch_disconnect: true})
		this.simpleDisconnect(id,type)
	}

	manualDisconnect(){
		console.log("manualDisconnect()")
		
		this.props.dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect : true})
		this.simpleDisconnect()

	}

	simpleDisconnect(id,type){
		if(id)
			var device_id = id
		else
			var device_id = this.device.id

		IS_CONNECTED(device_id)
		.then(response => {
			console.log("response",response);
			if(response){
				//this.props.dispatch({type:"UPDATE_ACTION_FROM_DISCONNNECT",action_from_disconnect:"manual"})
				SlowBleManager.disconnect(device_id)
				.then(response => {
				}).catch(error => console.log("error",error))

			}else{
				if(type == "switch_unit"){

				}
			}
		})		
	}

	manualConnect(){
		this.checkDeviceState(this.device)
	}

	handleNotification(){
		console.log("no deberia de hacer nada")
	}

	resetBoard(){
		WRITE_COMMAND(this.device.id,[0x1C])
		.then(response => {
		})
		.catch(error => console.log("Error on resetBoard()",error))
	}


	getLastPackageTime(){
		this.turnOnNotifications()
		WRITE_COMMAND(this.device.id,[0x2A])
		.then(response => {
		})
		.catch(error =>  console.log("Error on getLastPackageTime()",error))		
	}

	getResetCauses(){
		this.turnOnNotifications()
		console.log("getResetCauses()");
		WRITE_COMMAND(this.device.id,[0x26])
		.then(response => {
		})
		.catch(error => console.log("Error on getResetCauses()",error))
	}

	setBoardVersion(setAppBoardVersion){
		
	  	let app_board_version = this.props.app_board_version.split(" ")
	  	console.log("app_board_version",app_board_version)
		fetch(
			TEcNG_RESULTS_ROUTE,
			{
				method: "POST",
				headers: HEADERS_FOR_POST,
				body : JSON.stringify({
					test_key :  setAppBoardVersion
				})
			}
		).then(
			response => {
				var data = JSON.parse(response._bodyInit) 
				if(data.status == "success"){
					
					Alert.alert("App Board Test Log",data.data.log.test_log_content)
				}else{
					Alert.alert("App Board Test Log","No text Log found")
				}
			}
		).catch(
			error => {
				console.log(error)
			}
		)
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

		if(user_type)
		//if(true)
			var admin_values = (
				<View>
					<View>
						<View style={{alignItems:"center"}}>
							<Text style={{color:"gray",fontSize:20,marginBottom:5}}>
								FIRMWARE VERSIONS
							</Text>
						</View>
						<WhiteRow name="Application" value={PRETY_VERSION(this.props.app_version) }/>
						<WhiteRow name="Radio" value={PRETY_VERSION(this.props.radio_version) }/>
						<WhiteRow name="Bluetooth" value ={PRETY_VERSION(this.props.bluetooth_version) }/>
					</View>
					<View>
						<View style={styles.device_control_title_container}>
							<Text style={{color:"gray",fontSize:20,marginVertical:5}}>
								RADIO SETTINGS
							</Text>
						</View>
						<WhiteRow name="Spreading Factor" value ={this.props.spreading_factor}/>
						<WhiteRow name="Bandwidth" value ={this.props.band_width}/>
						<WhiteRow name="Power" value ={this.props.power}/>
						<WhiteRow name="Hopping table" value ={this.props.hopping_table}/>

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
						<WhiteRow name="Power Voltage" value={this.props.power_voltage + " volts"}/>
						<WhiteRow name="Battery Voltage" value={this.props.battery_voltage + " volts"}/>
					</View>					
					{
						user_type && (
							<View>
								<View style={styles.device_control_title_container}>
									<Text style={styles.device_control_title}>
										HARDWARE INFO
									</Text>
								</View>
								
								<WhiteRowInfoLink callback={() => this.setBoardVersion(this.props.register_board_1)} name="App Board" value={this.props.register_board_1 +  "  " +"\n"+ this.props.app_board_version }/>
								<WhiteRowInfoLink callback={() => this.setBoardVersion(this.props.register_board_2)} name="Radio Board" value={this.props.register_board_2 +  "  " +"\n"+ this.props.radio_board_version}/>
							</View>
						)
					}

					
					
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
	/*

		return (
				<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}} onPress={() => params.callback()}>
					<View style={{pang:10,flexDirection:"row"}}>
						<View style={{flex:0.7}}>
							<Text style={{fontSize:14}}>
								{params.name}
							</Text>
						</View>
						<View style={{flex:1}}>
							<Text style={{fontSize:12}}>
								{params.value}
							</Text>
						</View>				
					</View>
				</TouchableHighlight>
			)
			
	*/

		if(user_type){
		//if(true){
			console.log("this.props.debug_mode_status",this.props.debug_mode_status);
			return (
				<View>
					<WhiteRowLink name="Restart Application Board" callback={() => this.resetBoard()}/>
					<WhiteRowLink name={this.props.debug_mode_status ? "Disable Debug Mode" : "Enable Debug Mode"}  callback={() => this.setDebugModeStatus()}/>
					<WhiteRowLink name="Get Last Packet Time" callback={() => this.getLastPackageTime()}/>
					<WhiteRowLink name="View Reset Counts" callback={() => this.getResetCauses()}/>
				</View>
			)
		}else{
			return (
				<View style={{marginBottom:20}}>
					<WhiteRowLink name="Restart Application Board" callback={() => this.resetBoard()}/>
				</View>
			)
		}
	}

	renderOptions(){

		return <Options 
			device={this.props.device}
			indicatorNumber={this.props.indicator_number}
			goToPair={() => this.goToPair()}
			goToDeploy={() => this.goToDeploy()}
			goToFirmwareUpdate={() => this.goToFirmwareUpdate()}
			goToConfigureRadio={() => this.goToConfigureRadio()}
			goToForcePair={() => this.goToForcePair()}
			goToInstructionalVideos = {() => this.goToInstructionalVideos()}
			goToOperationValues = {() => this.goToOperationValues()}
			device_status = {this.props.central_device_status}
			fastTryToConnect = {(device) => this.fastTryToConnect(device)}
			getCloudStatus = {(device) => this.getCloudStatus(device)}
			goToRelay = {() => this.goToRelay()}
			goToChat={() => this.goToChat()}
			goToDocumentation = {() => this.goToDocumentation()}
			activateHandleCharacteristic = {() => this.activateHandleCharacteristic()}
			checkDeviceState = {(device) => this.checkDeviceState(device)}
			readStatusOnDevice = {(device) => this.readStatusOnDevice(device)}
			readStatusAfterUnpair = {device => this.readStatusAfterUnpair(device)} 
			setConnectionEstablished = {() => this.setConnectionEstablished()}

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

	goToPair(){

		this.eraseSecondInterval()		
		this.fast_manager.stopDeviceScan()
		this.props.navigator.showModal(
			{
				screen:"PairBridge",
				title : "Pair Sure-Fi Device",
				passProps:{
					checkDeviceState : (device) => this.checkDeviceState(device),
					readStatusOnDevice : (device) => this.readStatusOnDevice(device),
					getCloudStatus : (device) => this.getCloudStatus(device),
					searchPairedUnit : (device) => this.searchPairedUnit(device)
				},
				rightButtons: [
		            {
		                title: 'Manual', // for a textual button, provide the button title (label)
		                id: 'insert_pin', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
		            },
		        ],					
			}
		)
		/*}else{
			this.props.dispatch({type:"SHOW_MODAL"})
		}*/
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
		//if(true){
			this.props.navigator.showModal({
				screen: "FirmwareUpdate",
				title : "Firmware Update",
				rightButtons: [
		            {
		                title: 'Advanced', // for a textual button, provide the button title (label)
		                id: 'advanced', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
		            },
		        ],
		        passProps: {
		        	fastTryToConnect: () => this.fastTryToConnect(),
		        	saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
		        	activateHandleCharacteristic : () => this.activateHandleCharacteristic(),
		        	animated: false,
		        	admin : true
		        	//device : this.device
		        }
			})			
		}else{
			this.props.navigator.showModal({
				screen: "FirmwareUpdate",
				title : "Firmware Update",
				fastTryToConnect : () => this.fastTryToConnect(),
				animated: false,
				passProps: {
					fastTryToConnect: () => this.fastTryToConnect(),
					saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
					activateHandleCharacteristic : () => this.activateHandleCharacteristic(),
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
				title: "Configure Radio",
				passProps: {
					activateHandleCharacteristic : () => this.activateHandleCharacteristic()
				}
			}
		)
	}

	goToRelay(){
		console.log("goToRelay()");
		
		this.props.navigator.showModal({
			screen: "Relay",
			title: "Default Settings",
			animated: false,
			passProps: {
				activateHandleCharacteristic: () => this.activateHandleCharacteristic(),
				saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type)
			},
			navigatorButtons: {
				rightButtons: [
					{
						id : "update",
						title : "UPDATE"
					}
				]
			}
		})
	}

	goToChat(){
		console.log("goToChat--Device_Control()");
		this.disactivateHandleCharacteristic()

		this.props.navigator.push({
			screen : "Chat",
			title: "Sure-Fi Chat",
			animated: false,
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
			animated: false,
			passProps:
			{
				getCloudStatus:getCloudStatus,
				setConnectionEstablished : () => this.setConnectionEstablished()
			}
		})
	}

	goToInstructionalVideos(){
		this.props.navigator.push({
			screen : "Videos",
			title : "Instruction Videos",
			animated: false
		})
	}
	
	goToOperationValues(){
		this.disactivateHandleCharacteristic()
		this.props.navigator.showModal({
			screen : "OperationValues",
			title : "Operating Values",
			animated: false,
			passProps: {
				activateHandleCharacteristic: () => this.activateHandleCharacteristic(),
				saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type)
			}			
		})
	}

	goToDocumentation(){
		console.log("goToDocumentation");

		this.props.navigator.push({
			screen: "DeviceNotMatched",
			title: "Documentation",
			animated: false,
			passProps:{
				showAlert: false,
				device_id: this.props.device.manufactured_data.device_id
			}
		})
	}
	
	/* --------------------------------------------------------------------------------------------------- Go To Seccion ---------------------------------------------------------------*/	



	closeModal(){
		this.props.dispatch({type: "HIDE_MODAL"})
	}

	openModal(){
		this.props.dispatch({type: "SHOW_MODAL"})
	}

	startOperationsAfterConnect(device){
		this.fetchDeviceName(this.device.manufactured_data.device_id.toUpperCase(),this.device.manufactured_data.tx.toUpperCase());
		this.props.dispatch({type: "CONNECTED_CENTRAL_DEVICE"})
		this.searchPairedUnit(this.device)
	}

	getBootloaderInfo(){
		WRITE_COMMAND(this.device.id,[COMMAND_GET_BOOTLOADER_INFO]) // should get a 0x07 
	}

	getAllVersion(){
		WRITE_COMMAND(this.device.id,[COMMAND_GET_ALL_VERSIONS]) // should get a 0x1E
	}

	searchPairedUnit(device){
		console.log("searchPairedUnit()")
		let state = device.manufactured_data.device_state.slice(-2)

		if(state == "03" || state == "04"){
			this.createSecondInterval()
		}
	}

	createSecondInterval(){
		if(second_interval == 0){
			second_interval = setInterval(() => this.scanByFiveSeconds(this.device),10000)
		}else{
			console.log("thesecond interval can't be created it was created previosly")	
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
		//console.log("stopScanByFiveSeconds()")
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
	}

	startDeviceScan(device){
		//console.log("startDeviceScan()");
		this.fast_manager.startDeviceScan(['98bf000a-0ec5-2536-2143-2d155783ce78'],null,(error,found_device) => {
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
		console.log("switchUnit()",this.other_guy.manufactured_data);
		this.changing_time = true
        

	    this.props.dispatch({
	    	type: "HIDE_SWITCH_BUTTON"
	    })

	    var id = this.device.id
		this.device = this.other_guy
		
		this.manufactured_device_id = this.device.manufactured_data.device_id.toUpperCase()

    	this.props.dispatch({
            type: "CENTRAL_DEVICE_MATCHED",
            central_device: this.other_guy,
        });
    	
    	this.props.dispatch({
    		type:"SET_PAIR_DISCONNECT",
    		pair_disconnect:false
    	})

    	this.props.dispatch({
    		type:"SET_UNPAIR_DISCONNECT",
    		unpair_disconnect:false
    	})

    	this.props.dispatch({
    		type:"SET_DEPLOY_DISCONNECT",
    		deploy_disconnect:false
    	})	    	

    	this.props.dispatch({
    		type:"SET_MANUAL_DISCONNECT",
    		manual_disconnect: false
    	})

    	this.fetchDeviceName(this.device.manufactured_data.device_id.toUpperCase(),this.device.manufactured_data.tx.toUpperCase());

        this.eraseSecondInterval()

        this.switchDisconnect(id,"switch_unit")
		this.other_guy = null
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

	fetchDeviceName(device_id,remote_device_id){
		console.log("fetchDeviceName()");
		fetch(GET_DEVICE_NAME_ROUTE,{
			method: "POST",
			headers: {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify({hardware_serial: device_id})
		})
		.then(response => {
			var data = JSON.parse(response._bodyInit).data

			this.props.dispatch({type: "UPDATE_DEVICE_NAME",device_name : data.name,original_name:data.name})
			fetch(GET_DEVICE_NAME_ROUTE,{
				method: "POST",
				headers: {
					'Accept' : 'application/json',
					'Content-Type' : 'application/json'
				},
				body: JSON.stringify({hardware_serial: remote_device_id})

			})
			.then(response => {
				var data = JSON.parse(response._bodyInit).data
				
				this.props.dispatch({type: "UPDATE_REMOTE_DEVICE_NAME",remote_device_name : data.name})

				this.checkPairOrUnPairResult()

			})
			.catch(error => console.log("error on fetchDeviceName 1",error))
		})
		.catch(error => console.log("error on fetchDeviceName 2",error))
	}

	checkPairOrUnPairResult(){
		if(this.props.write_pair_result || this.props.write_unpair_result){

			this.turnOnNotifications()
			
			if(this.props.write_pair_result){

				this.props.dispatch({type:"SET_WRITE_PAIR_RESULT",write_pair_result: false})
				this.writePairResult(this.device)

			}else{
				this.props.dispatch({type: "SET_WRITE_UNPAIR_RESULT",write_unpair_result: false})
				this.writeUnpairResult(this.device)
			}
		}
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
	device: state.scanCentralReducer.central_device,
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
  	user_status : state.mainScreenReducer.user_status,
  	debug_mode_status : state.setupCentralReducer.debug_mode_status,
  	app_board_version : state.setupCentralReducer.app_board_version,
  	radio_board_version : state.setupCentralReducer.radio_board_version,
  	register_board_1 : state.setupCentralReducer.register_board_1,
  	register_board_2 : state.setupCentralReducer.register_board_2,
  	show_switch_button : state.setupCentralReducer.show_switch_button,
  	user_data : state.loginReducer.user_data,
  	pair_disconnect: state.setupCentralReducer.pair_disconnect,
  	unpair_disconnect : state.setupCentralReducer.unpair_disconnect,
  	deploy_disconnect : state.setupCentralReducer.deploy_disconnect,
  	switch_disconnect : state.setupCentralReducer.switch_disconnect,
  	show_status_box : state.setupCentralReducer.show_status_box,
  	show_disconnect_notification : state.setupCentralReducer.show_disconnect_notification,
  	allow_notifications: state.setupCentralReducer.allow_notifications,
  	write_pair_result : state.setupCentralReducer.write_pair_result,
  	write_unpair_result: state.setupCentralReducer.write_unpair_result,

});


export default connect(mapStateToProps)(SetupCentral);