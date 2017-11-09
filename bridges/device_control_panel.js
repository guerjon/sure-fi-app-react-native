//Third part libraries
import React, {Component} from 'react'
import SlowBleManager from 'react-native-ble-manager'
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';
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
	NOTIFICATION,
	CONNECTED,
	DISCONNECTED
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
	LOG_CREATOR,
	READ_TX,
	WRITE_UNPAIR,
	LOG_INFO
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
	COMMAND_GET_ALL_VERSIONS,
	COMMAND_GET_DEBUG_MODE_STATUS,
	COMMAND_GET_RUN_TIME,
	COMMAND_RESET_RUN_TIME
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
var general_interval = 0;
/*var app_firmware_version_interval = 0
var radio_firmware_version_interval = 0
var bluetooth_firmware_version_interval = 0
var radio_settings_interval = 0
var voltage_interval = 0
var register_board_1 = 0
var register_board_2 = 0
var app_pic_version = 0
var radio_pic_version = 0
var hopping_table_interval = 0
var debug_mode_status_interval = 0
*/
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
	
		console.log("props.device",props.device)
		this.manufactured_device_id = props.device.manufactured_data

		//console.log("props wtf-------------------------------	",props.device)
	

		console.log("id",this.device.id);
		console.log("name",this.device.name);
		console.log("address",this.device.manufactured_data.address);
		console.log("device_id",this.manufactured_device_id);
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
		this.allow_go_to_operation_values = true
		this.something = 0

	}

	checkDeviceState(device){
		
		var state = device.manufactured_data.device_state.slice(-2)
		console.log("checkDeviceState()",state)

		if(state != "04"){
			this.renderNormalConnecting()
			this.fastTryToConnect(device)
		}else{
			this.renderConnectingStatus()
			this.deployConnection(device)
		}
	}

	onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        switch(event.id){
            case "pin_number":
                this.showPINModal()
            break
            case "backPress":

            	this.props.dispatch({
		    		type:"SET_DEPLOY_DISCONNECT",
		    		deploy_disconnect:true
		    	})	 
		    	
				SlowBleManager.disconnect(this.device.id)
				.then(response => {	

					this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: false})

				}).catch(error => console.log("error",error))

            	this.removeListeners()


            	
            	this.props.dispatch({type:"SET_GETTING_COMMANDS",getting_commands:false})
				this.changing_time = true
				this.props.navigator.pop()
            break
            default:
            break
        }
    }

    componentWillMount() {
		this.startSlowBleManager()
		
		
		this.props.dispatch({type: "RESET_SETUP_CENTRAL_REDUCER"}) //something its wrong when the user push back after connect to another device, with this we reset all the state.
		this.props.dispatch({type: "SET_FAST_MANAGER",fast_manager: this.fast_manager})
		this.props.dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect: false})
		
		this.activateListeners()
		this.fetchDeviceName(this.device.manufactured_data.device_id.toUpperCase(),this.device.manufactured_data.tx.toUpperCase())  
		this.checkDeviceState(this.device) //enter point for all the connections    
    }


    componentWillUnmount() {
		this.eraseSecondInterval()
		this.eraseInterval()
		this.fast_manager.stopDeviceScan()
		
		this.props.dispatch({type:"HIDE_DEVICES_LIST"})
		this.props.dispatch({type:"HIDE_SERIAL_INPUT"})

		//this.destroyFastManager()
    }

    destroyFastManager(){
		console.log("destroyFastManager()")
        if(this.fast_manager != null){
            this.fast_manager.stopDeviceScan()
            this.fast_manager.destroy()
            this.fast_manager = null;                        
        }else{
            console.log("Delete scan can't delete the scan because it is null.")
        }
    }
   
	startSlowBleManager(){
		console.log("startSlowBleManager()");
		SlowBleManager.start().then(response => {}).catch(error => console.log(error))
	}


	activateListeners(){
		console.log("activateListeners()");
		this.activateHandleDisconnectedPeripheral()		
		this.activateHandleConnectDevice()
		this.activateHandleCharacteristic()
	}

	removeListeners(){
		console.log("removeListenerss()")
		
		this.removeHandleCharacteristic()
		this.removeHandleConnectDevice()
		this.removeHandleDisconnectedPeripheral()

	}

	disconnect(){
		console.log("disconnect()")
		
		this.fast_manager.stopDeviceScan()

		IS_CONNECTED(this.device.id)
		.then(response => {
			if(response){
				SlowBleManager.disconnect(this.device.id)
				.then(response => {
				}).catch(error => console.log("error",error))
			}
		})
	}

    unPair() {
    	console.log("unPair123",this.device.manufactured_data.device_id)

	    if(!this.props.debug_mode_status){
		    this.props.dispatch({
		    	type: "SET_UNPAIR_DISCONNECT",
		    	unpair_disconnect: true
		    })
		}

		this.props.dispatch({type:"ALLOW_NOTIFICATIONS",allow_notifications:false})

		WRITE_UNPAIR(this.device.id).then(response => {
			var state = "01|01|"+this.device.manufactured_data.device_id+"|000000"
			
			var remote_state = "01|01|"+this.device.manufactured_data.tx+"|000000"

			PUSH_CLOUD_STATUS(this.device.manufactured_data.device_id,state)
			.then(response => {
				PUSH_CLOUD_STATUS(this.device.manufactured_data.tx,remote_state)
				
				

				this.device.manufactured_data.tx = "000000"
				this.device.manufactured_data.device_state = "0001"
				this.device.writeUnpairResult = true

		    	this.props.dispatch({type: "CENTRAL_DEVICE_MATCHED",central_device: this.device});
		    	this.props.dispatch({type: "SET_WRITE_UNPAIR_RESULT",write_unpair_result: true})
		    	this.props.dispatch({type: "UPDATE_REMOTE_DEVICE_NAME",remote_device_name : ""})


                if(this.props.debug_mode_status){
                	this.renderNormalConnecting()
                	this.readStatusAfterUnpair(this.device)
                }
			})
			.catch(error => console.log("error on unPair() 1",error))

		}).catch(error => console.log("error on Unpair 2",error ))
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
		console.log("activateHandleCharacteristic()",this.props.handleCharacteristic)
		if(this.props.handleCharacteristic){
			console.log("Handle characteristic notification its already active")
		}else{
			this.props.dispatch({type:"SET_HANDLE_CHARACTERISTIC",handleCharacteristic:true})
			this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',this.handleCharacteristicNotification)	
		}	
	}

	removeHandleCharacteristic(){
		console.log("removeHandleCharacteristic()",this.props.handleCharacteristic)
		if(this.props.handleCharacteristic){
			this.props.dispatch({type:"SET_HANDLE_CHARACTERISTIC",handleCharacteristic:false})
			this.handleCharacteristic.remove()
		}else{
			console.log("Handle characteristic was remove previosly")
		}
	}

	activateHandleConnectDevice(){
		console.log("activateHandleConnectDevice()",this.props.handleConnected)
		if(this.props.handleConnected){
			console.log("Handle connected device its already active")
		}else{
			this.props.dispatch({type:"SET_HANDLE_CONNECT",handleConnected:true})
			this.handleConnected = bleManagerEmitter.addListener('BleManagerConnectPeripheral',this.handleConnectedDevice)
		}
	}

	removeHandleConnectDevice(){
		console.log("removeHandleConnectDevice()",this.props.handleConnected)
		if(this.props.handleConnected){
			this.props.dispatch({type:"SET_HANDLE_CONNECT",handleConnected:false})
			this.handleConnected.remove()	
		}else{
			console.log("Handle disconnect was remove previosly")
		}
	}

	activateHandleDisconnectedPeripheral(){
		console.log("activateHandleDisconnectedPeripheral()",this.props.handleDisconnected)
		if(this.props.handleDisconnected){
			console.log("Handle disconnect listener its already active")
		}else{
			this.props.dispatch({type:"SET_HANDLE_DISCONNECT",handleDisconnected:true})
			this.handleDisconnected = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectedPeripheral);
		}
		
	}
	
	removeHandleDisconnectedPeripheral(){
		console.log("removeHandleDisconnectedPeripheral()",this.props.handleDisconnected)
		if(this.props.handleDisconnected){
			this.props.dispatch({type:"SET_HANDLE_DISCONNECT",handleDisconnected:false})
			this.handleDisconnected.remove()
		}else{
			console.log("Handle disconnect was remove previosly")
		}
	}	

	fastTryToConnect(device){
		console.log("fastTryToConnect()")
	    
	    var device = device ? device : this.device

		if(this.props.device.manufactured_data.device_state.slice(-2) == "04"){
			this.renderConnectingStatus()
			this.deployConnection(device)
		}else{
			this.renderNormalConnecting()

			IS_CONNECTED(device.id)
			.then(response => {
				
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
			interval = setInterval(() => this.connect(device),1000)
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
		console.log("eraseSecondInterval()");
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

    handleConnectedDevice(){
    	console.log("handleConnectedDevice()")
    	LOG_INFO([0xA1],CONNECTED,this.device.manufactured_data.device_id) // 0xA1 ITS DEFINED ON commands.js
    	this.retrieveServices()
    }

    retrieveServices(){
    	var state = this.device.manufactured_data.device_state.slice(-2)
    	console.log("retrieveServices()",state)

    	BleManagerModule.retrieveServices(this.device.id,() => {
	    	if(this.props.pair_disconnect || this.props.unpair_disconnect){
				setTimeout(() => {
					this.normalConnected()	
				},200)	    		
	    	}else if(state != "04"){
	    		setTimeout(() => {
		    		this.changing_time = false
		    		this.normalConnected()	    			
	    		})
	    	}else{	
	    		setTimeout(() => {
	    			this.deployConnected()	
	    		},200)
	    		
	    	}		    		
    	})
    }

	normalConnected(){
		console.log("normalConnected()")

		var device = this.props.device
		var id = this.props.device.id
		var data = GET_SECURITY_STRING(device.manufactured_data.device_id,device.manufactured_data.tx)
		if(this.props.setConnectionEstablished){
	        	this.eraseInterval()
	        	this.setConnectionEstablished(device)
		}else{
		    BleManager.write(id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then(response => {
	        	this.setConnectionEstablished(device)
	        }).catch(error => {
	        	console.log("Error",error)
	        });			
		}
		
	}

	deployConnected(){
		console.log("deployConnected()")
		let device = this.device
		var id = device.id
		var data = GET_SECURITY_STRING(device.manufactured_data.device_id,device.manufactured_data.tx)
		if(this.props.setConnectionEstablished){
	        	this.setConnectionEstablished(device)
		}else{
		    BleManager.write(id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then(response => {
	        	this.setConnectionEstablished()
	        }).catch(error => {
	        	console.log("Error",error)
	        })			
		}
	}

    setIndicatorNumber(indicator){
    	console.log("setIndicatorNumber()",indicator)
    	this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: indicator})	
    }

	setConnectionEstablished(){
    	console.log("setConnectionEstablished()")
    	
    	this.props.dispatch({type:"SET_CONNECTION_ESTABLISHED",connection_established:true})
    	this.eraseInterval()

		if(this.props.pair_disconnect || this.props.unpair_disconnect){
    		if(this.props.pair_disconnect){
    			this.props.dispatch({type:"SET_PAIR_DISCONNECT",pair_disconnect: false})	
    			this.searchPairedUnit(this.device)

    		}else{
    			this.props.dispatch({type:"SET_UNPAIR_DISCONNECT",unpair_disconnect:false})
    			this.eraseSecondInterval()
    		}
    	}
    	var state = this.device.manufactured_data.device_state.slice(-2)

    	this.setIndicatorNumber(state)

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
				this.getCloudStatus(device)
	    		

			}
		})
		.catch(error => console.log("Error readStatusOnDevice",error))
	}

	getCloudStatus(device){
		//console.log("getCloudStatus()")
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
			//console.log("getStatus()",current_status_on_cloud,expected_status,current_status_on_bridge)
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
    			this.setIndicatorNumber(current_status_on_bridge)
    		}

		}else{
			this.setIndicatorNumber(current_status_on_bridge)
		}

    	this.clearGeneralInterval()
		this.getAllInfo(this.device)		
    }

    handleDisconnectedPeripheral(info){		
    	console.log("handleDisconnectedPeripheral",info)
    	console.log("handleDisconnectedPeripheral()",
    		this.props.pair_disconnect,
    		this.props.unpair_disconnect,
    		this.props.manual_disconnect,
    		this.props.deploy_disconnect,
    		this.props.switch_disconnect
    	)

    	this.props.dispatch({type:"SET_CONNECTION_ESTABLISHED",connection_established:false})
    	LOG_INFO([0xA2],DISCONNECTED,this.props.device.manufactured_data.device_id)

    	if(this.props.pair_disconnect){
    		console.log("entra aqui - 1");
    		this.renderNormalConnecting()

    		setTimeout(() => this.simpleConnect(this.device),3000)
    		

    	}else if(this.props.unpair_disconnect){
    		console.log("entra aqui - 2");
    		this.renderNormalConnecting()
			
			this.eraseSecondInterval()
			this.props.dispatch({type: "HIDE_SWITCH_BUTTON"})
			console.log("this.props.device on handleDisconnected()",this.props.device.manufactured_data.device_id);
			setTimeout(() => this.simpleConnect(this.props.device),3000)
    		
    	}else if(this.props.manual_disconnect){
    		console.log("entra aqui 3 - manual");

     		this.props.navigator.screenIsCurrentlyVisible().then(response => {
    			
     			if(!response){
     				this.props.navigator.pop()
					Alert.alert("Alert","Bluetooth Device Disconnect.")
					this.props.dispatch({
						type : "DISCONNECT_CENTRAL_DEVICE"
					})
     			}
     		})

		}else if(this.props.deploy_disconnect){
			console.log("entra aqui 4 - deploy");

    	}
    	else if(this.props.switch_disconnect){
    		console.log("entra aqui - 5");
    		this.renderConnectingStatus()
    		
    		if(this.props.debug_mode_status)
    			this.simpleConnect(this.device)
    		else{
    			this.props.dispatch({type: "SET_SWITCH_DISCONNECT",switch_disconnect:false})
    			this.deployConnection(this.device)
    		}

    	}else{
    		
    		console.log("this.props.show_disconnect_notification",this.props.show_disconnect_notification);
			
			this.props.navigator.screenIsCurrentlyVisible().then(response => {
    			console.log("response",response)
    			if(!response){
    				this.props.navigator.pop()
    			}    			
    		})

    		if(this.props.show_disconnect_notification)
    			Alert.alert("Alert","Bluetooth Device Disconnect.")

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
				this.setIndicatorNumber(0XEE)
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
    			this.setIndicatorNumber(0XEE)
    		break
    	}
    }

    handlePairedFail(expected_status){ // device_state 3
    	switch(expected_status){
    		case 1:
    			this.setForceUnPairOption()
    		break
    	
    		case 4:
    			this.setForceDeployOption()
    		break
    		default: //this shouldnt never happend
    			this.setIndicatorNumber(0XEE)
    		break
    	}    	
    }

    handleDeployedFail(expected_status){ // device_state 4
    	switch(expected_status){
    		case 1:
    			this.setForceUnPairOption()
    		break
    		
    		case 3: //this shouldn never happend because you can't undeploy
    			this.setIndicatorNumber(4)
    			//Alert.alert("Error","The expected status its 3 and the current status on the bridge its 4" )
    		break
    		default: //this shouldnt never happend
    			this.setIndicatorNumber(0XEE)
    		break
    	}
    }

    setForcePairOption(){
    	this.setIndicatorNumber(0xE0)
    }

    setForceDeployOption(){
    	this.setIndicatorNumber(0xE1)
    }

    setForceUnPairOption(){
    	this.setIndicatorNumber(0xE2)
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
	
	saveOnCloudLog(value,log_type){
		var body = LOG_CREATOR(value,this.device.manufactured_data.device_id,this.device.id,log_type)
		POST_LOG(body)
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

	getCorrectHexVersion(values){
		var current_version = [values[0],values[1],values[2],values[3]]
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

	clearRunTime(){
		WRITE_COMMAND(this.device.id,[COMMAND_RESET_RUN_TIME])
		.then(response => {	
			setTimeout(() => this.getWarrantyInformation(),2000)
		})
		.catch(error => console.log("Error on resetBoard()",error))		
	}

	getLastPackageTime(){
		WRITE_COMMAND(this.device.id,[0x2A])
		.then(response => {
		})
		.catch(error =>  console.log("Error on getLastPackageTime()",error))		
	}

	getResetCauses(){
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

	writeRandomCommand(){
		this.allow_random_commands = true
		
		var commands = [
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
			COMMAND_GET_DEBUG_MODE_STATUS,
			COMMAND_GET_ALL_VERSIONS,
			COMMAND_GET_BOOTLOADER_INFO
		]

		var item = commands[8];

		WRITE_COMMAND(this.device.id,[item])
		this.something = this.something + 1

	}

	goToDebugLog(){
		this.props.navigator.push(
			{
				screen:"BluetoothDebugLog",
				title: "Bluetooth Debug Log",
			}
		)
	}

	getOtherCommands(user_type){

		if(user_type){
		//if(true){
			return (
				<View>
					<WhiteRowLink name="Restart Application Board" callback={() => this.resetBoard()}/>
					<WhiteRowLink name={this.props.debug_mode_status ? "Disable Debug Mode" : "Enable Debug Mode"}  callback={() => this.setDebugModeStatus()}/>
					<WhiteRowLink name="Get Last Packet Time" callback={() => this.getLastPackageTime()}/>
					<WhiteRowLink name="View Reset Counts" callback={() => this.getResetCauses()}/>
					<WhiteRowLink name="Bluetooth Debug Log" callback={() => this.goToDebugLog()}/>
					<WhiteRowLink name="Clear Runtime" callback={() => this.clearRunTime()}/>
				</View>
			)
		}else{
			return (
				<View style={{marginBottom:20}}>
					<WhiteRowLink name="Restart Application Board" callback={() => this.resetBoard()}/>
				</View>
			)
		}
		//<WhiteRowLink name="Test button" callback={() => this.writeRandomCommand()}/>
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
			goToRsSettings = {() => this.goToRsSettings()}
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
			unPair = {() => this.unPair()}
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
		this.props.navigator.push(
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
		this.removeHandleCharacteristic()
		var getCloudStatus = (device) => this.getCloudStatus(device)
		
		/*this.props.navigator.push({
		  	screen: 'Deploy', // unique ID registered with Navigation.registerScreen
		  	title: "Deploy Sure-Fi Bridge",
			passProps:
			{
				getCloudStatus:getCloudStatus
			}
		});*/
	}

	goToFirmwareUpdate(){
		this.removeHandleCharacteristic()
		this.activateHandleDisconnectedPeripheral()

		let user_type = this.props.user_data ?  this.props.user_data.user_type : false
		//console.log("getOptions()",this.props.indicatorNumber,this.props.user_data);
		var admin_options = ["SYS_ADMIN","PROD_ADMIN","CLIENT_DEV"]

		this.eraseSecondInterval()

		//if(admin_options.lastIndexOf(user_type) !== -1){
		if(true){
			this.props.navigator.push({
				screen: "FirmwareUpdate",
				title : "Firmware Update",
				rightButtons: [
		            {
		                title: 'Advanced', // for a textual button, provide the button title (label)
		                id: 'advanced', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
		            },
		        ],
		        passProps: {
		        	fastTryToConnect: (device) => this.fastTryToConnect(device),
		        	saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
		        	activateHandleCharacteristic : () => this.activateHandleCharacteristic(),
		        	activateHandleDisconnectedPeripheral : () => this.activateHandleDisconnectedPeripheral(),
		        	animated: false,
		        	admin : true
		        	//device : this.device
		        }
			})			
		}else{
			this.props.navigator.push({
				screen: "FirmwareUpdate",
				title : "Firmware Update",
				animated: false,
				passProps: {
					fastTryToConnect: (device) => this.fastTryToConnect(device),
					saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
					activateHandleCharacteristic : () => this.activateHandleCharacteristic(),
					activateHandleDisconnectedPeripheral : () => this.activateHandleDisconnectedPeripheral(),
					//device : this.device
				}
			})			
		}
	}

	goToConfigureRadio(){
		this.removeHandleCharacteristic()
		this.props.navigator.push(
			{
				screen:"ConfigureRadio",
				title: "Configure Radio",
				passProps: {
					activateHandleCharacteristic : () => this.activateHandleCharacteristic(),
					saveOnCloudLog : (data,type)  => this.saveOnCloudLog(data,type),
					selectHoppingTable : (hopping_table,data) => this.selectHoppingTable(hopping_table,data)
				}
			}
		)
	}



	goToRelay(){
		console.log("goToRelay()");
		
		this.props.navigator.push({
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
		this.removeHandleCharacteristic()

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
		this.removeHandleCharacteristic()
		
		var getCloudStatus = (device) => this.getCloudStatus(device)
		
		this.props.navigator.push(
		{
			screen:"ForcePair",
			title: "Force Pair",
			animated: false,
			passProps:
			{
				getCloudStatus:getCloudStatus,
				setConnectionEstablished : () => this.setConnectionEstablished(),
				fetchDeviceName: (device_id,remote_device_id) => this.fetchDeviceName(device_id,remote_device_id) 
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
		this.removeHandleCharacteristic()
		this.props.navigator.push({
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
				cancel_scan: true,
				device_id: this.props.device.manufactured_data.device_id
			}
		})
	}

	goToRsSettings(){
        console.log("goToRsSettings()");
		this.removeHandleCharacteristic()
        this.props.navigator.push({
        	screen: "RSSettings",
        	title: "RS-485 Settings",
        	passProps:{
        		activateHandleCharacteristic : () => this.activateHandleCharacteristic(),
        		saveOnCloudLog : (data,type)  => this.saveOnCloudLog(data,type),
        	},
			navigatorButtons: {
				righButtons: [
					{
						id: "update",
						title: "UPDATE"
					}
				]
			}
        })
    }

	
	/* --------------------------------------------------------------------------------------------------- End Go To Seccion ---------------------------------------------------------------*/	



	/* --------------------------------------------------------------------------------------------------- update commands Seccion ---------------------------------------------------------------*/	

	updateAppVersion(values){

		this.saveOnCloudLog(values,"APPFIRMWARE")
		if(values.length > 1)
			this.props.dispatch({type: "UPDATE_APP_VERSION",version : parseFloat(values[0].toString() +"." + values[1].toString())  })

	}

	updateRadioVersion(values){
		this.saveOnCloudLog(values,"RADIOFIRMWARE")
		if(values.length > 1)
			this.props.dispatch({type: "UPDATE_RADIO_VERSION",version : parseFloat(values[0].toString() +"." + values[1].toString())  })		
	}

	updateBluetoothVersion(values){
		this.saveOnCloudLog(values,"BLUETOOTHFIRMWARE")
		this.props.dispatch({type: "UPDATE_BLUETOOTH_VERSION",version : parseFloat(values[0].toString() + "." + values[1].toString()) })		
	}


	updateRadioSettings(values){
		this.saveOnCloudLog(values,"RADIOSETTINGS")

		let spreading_factor = spreadingFactor.get(values[0]) 
		let band_width = bandWidth.get(values[1])
		let power = powerOptions.get(values[2])
		let hopping_table = values[6]
		
		let retry_count = values[3]
		let heartbeat_period = heartbeatPeriod.get(values[4]) 
		let acknowledments =  values[5] ? "Enabled" : "Disabled"
		

		this.props.dispatch(
			{
				type: "UPDATE_RADIO_SETTINGS",
				power : power,
				retry_count : retry_count,
				heartbeat_period: heartbeat_period,
				acknowledments : acknowledments,
			}
		)		
	}

	updateVoltage(values){
		console.log("updateVoltage()")
		this.saveOnCloudLog(values,"POWERLEVELS")
		let v1 = ((values[0] & 0xff) << 8) | (values[1] & 0xff);  
		let v2 = ((values[2] & 0xff) << 8) | (values[3] & 0xff);
		let power_voltage = CALCULATE_VOLTAGE(v1).toFixed(2)
		let battery_voltage = CALCULATE_VOLTAGE(v2).toFixed(2) 
		this.props.dispatch({type : "UPDATE_POWER_VALUES",battery_voltage: battery_voltage, power_voltage : power_voltage})
		this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: true})		
	}

	updateRegisterBoard1(values){
		console.log("updateRegisterBoard1()")
		let register_board_1 = stringFromUTF8Array(values) 
		console.log("register_board_1",register_board_1);

		this.props.dispatch({type: "SET_REGISTER_BOARD_1",register_board_1: register_board_1})		
	}

	updateRegisterBoard2(values){
		console.log("updateRegisterBoard2()")
		let register_board_2 = stringFromUTF8Array(values) 
		this.props.dispatch({type: "SET_REGISTER_BOARD_2",register_board_2: register_board_2})		
	}

	updateAppPicVersion(values){
		console.log("updateAppPicVersion()")
		if(values.length > 3){					
			
			this.app_hex_board_version = this.getCorrectHexVersion(values)
			let app_board_version = this.getCorrectStringVerison(this.app_hex_board_version)
			this.props.dispatch({type: "SET_APP_BOARD",app_board_version: app_board_version})

		}else{
			Alert.alert("Error","Something is wrong with the app pic version values.")
		}		
	}

	updateRadioPicVersion(values){
		console.log("updateRadioPicVersion()")
		if(values.length > 3){
			
			this.radio_hex_board_version = this.getCorrectHexVersion(values)
			let radio_board_version = this.getCorrectStringVerison(this.radio_hex_board_version)
			this.props.dispatch({type: "SET_RADIO_BOARD",radio_board_version: radio_board_version})

		}else{
			Alert.alert("Error","Something is wrong with the radio pic version values.")
		}		
	}

	updateHoppingTable(values){
		console.log("updateHoppingTable()")
		var selectedDeviceHoppingTable = values[0]
		selectedDeviceHoppingTable = parseInt(selectedDeviceHoppingTable,16)
		
		this.saveOnCloudLog(values,"HOPPINGTABLE")

		this.selectHoppingTable(selectedDeviceHoppingTable,values[0])

	}

	updateDebugModeStatus(values){
		console.log("updateDebugModeStatus()")
		if(values[0]){
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: true})
		}else{
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: false})
		}		
	}

	bytesToHex(bytes) {
	    for (var hex = [], i = 0; i < bytes.length; i++) {
	        hex.push((bytes[i] >>> 4).toString(16));
	        hex.push((bytes[i] & 0xF).toString(16));
	    }
	    return hex.join("");
	}


	updateWarrantyInformation(values){
		console.log("updateWarrantyInformation()",values)
		if(values){
			if(values.length){
				var hex_values =  BYTES_TO_HEX(values)
				console.log("hex_values",hex_values)
				var decimal_values = parseInt(hex_values,16)
				this.props.dispatch({type: "SET_WARRANTY_INFORMATION",warranty_information:decimal_values})
			}else{
				console.log("the array on updateWarranty() its empty")
			}
		}else{
			console.log("the array on updateWarranty() its undefined or null")
		}
	}

	clearGeneralInterval(){
		//console.log("clearGeneralInterval()",general_interval)
		if(general_interval != 0){
			clearInterval(general_interval)
			general_interval = 0
		}else{
			console.log("general_interval previosly cleaned")
		}
	}

	createGeneralInterval(callback){
		//console.log("createGeneralInterval()",general_interval)
		if(this.allow_random_commands){
		}else{
			callback()
			/*if(general_interval == 0){
				general_interval = setInterval(callback,100)
			}else{
				console.log("general_interval previosly created")
			}*/			
		}
	}

	/* --------------------------------------------------------------------------------------------------- END update commands Seccion ---------------------------------------------------------------*/	


	renderNormalConnecting(){
		console.log("renderNormalConnecting()")
		this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})
	}

	renderConnectingStatus(){
		console.log("renderConnectingStatus()")
		this.props.dispatch({type: "CONNECTING_CENTRAL_DEVICE"})

	}

	renderConnectedStatus(){
		console.log("renderConnectedStatus()")
		this.props.dispatch({type:"CONNECTED_CENTRAL_DEVICE"})
	}

	/* --------------------------------------------------------------------------------------------------- get commands Seccion ---------------------------------------------------------------*/	

	getAllInfo(device){
		console.log("getAllInfo()")
		
		if(!this.props.getting_commands){
			
			setTimeout(() => this.renderConnectedStatus(),5000)

			this.props.dispatch({type: "SET_GETTING_COMMANDS",getting_commands:true})
			this.getFirmwareVersion()	
		}else{
			console.log("write commands was stoped by this.props.getting_commands")
		}
	}

	getFirmwareVersion(){
		console.log("getFirmwareVersion()")
		this.createGeneralInterval(() => {
	    	WRITE_COMMAND(this.device.id,[COMMAND_GET_FIRMWARE_VERSION])
	    	.then(response => {		    		
	    	})
	    	.catch(error => console.log("error",error))						
		})
	}

	getRadioFirmwareVersion(){
		console.log("getRadioFirmwareVersion()")
		this.createGeneralInterval(() => {			
			WRITE_COMMAND(this.device.id,[COMMAND_GET_RADIO_FIRMWARE_VERSION])
	    	.then(response => {

			})
	    	.catch(error => console.log("error getting App firmware version",error)) 			
		})
	}

	getBluetoothFirmwareVersion(){
		console.log("getBluetoothFirmwareVersion()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_BLUETOOTH_FIRMWARE_VERSION])
			.then(response => {
			})
			.catch(error => console.log("error getting Radio firmware version",error))				
		})
	}

	getRadioSettings(){
		console.log("getRadioSettings()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_RADIO_SETTINGS])
			.then(response => {
				
			}).catch(error => console.log("error",error))				
		})
	}

	getVoltage(){
		console.log("getVoltage()")
		this.createGeneralInterval(() => {			
	    	WRITE_COMMAND(this.device.id,[COMMAND_GET_VOLTAGE])
	    	.then(response => {

			}).catch(error => console.log("error",error))			
		})
	}

	getRegisteredBoard1(){
		console.log("getRegisteredBoard1()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_REGISTERED_BOARD_1])
			.then(response => {
				
			}).catch(error => console.log("error",error))							
		})
	}

	getRegisteredBoard2(){
		console.log("getRegisteredBoard2()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_REGISTERED_BOARD_2])
			.then(response => {
			}).catch(error => console.log("error",error))							
		})
	}

	getAppPicVersion(){
		console.log("getAppPicVersion()")
		this.createGeneralInterval(() => {			
			WRITE_COMMAND(this.device.id,[COMMAND_GET_APP_PIC_VERSION])
	    	.then(response => {
			}).catch(error => console.log("error",error))			
		})
	}

	getRadioPicVersion(){
		console.log("getRadioPicVersion()")
		this.createGeneralInterval(() => {
	    	WRITE_COMMAND(this.device.id,[COMMAND_GET_RADIO_PIC_VERSION])
	    	.then(response => {
	    	}).catch(error => console.log("error",error))				
		})
	}

	getHoppingTable(){
		console.log("getHoppingTable()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_HOPPING_TABLE])
    		.then(response => {
    		})
    		.catch(error => console.log("error",error))							
		})
	}


	getDebugModeStatus(){
		console.log("getDebugModeStatus()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_DEBUG_MODE_STATUS]) // response with 0x1B
			.then(response => {
			})
			.catch(error => console.log("Error on getDebugModeStatus()",error));				
		})
	}

	getWarrantyInformation(){
		WRITE_COMMAND(this.device.id,[COMMAND_GET_RUN_TIME]) // should return 0x28
		.then(response => {

		})
		.catch(error => console.log("Error on getWarrantyInformation()"))
	}


	getAllVersion(){
		console.log("getAllVersion()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_ALL_VERSIONS]) // should get a 0x1E	
		})
	}

	getBootloaderInfo(){
		console.log("getBootloaderInfo()")
		this.createGeneralInterval(() => {
			WRITE_COMMAND(this.device.id,[COMMAND_GET_BOOTLOADER_INFO]) 	
		})
	}		


	/* --------------------------------------------------------------------------------------------------- End commands Seccion ---------------------------------------------------------------*/	

	handleCharacteristicNotification(data){
		console.log("handleCharacteristicNotification",data)
		//console.log("handleCharacteristicNotification()")
		if(data.characteristic.toUpperCase() == SUREFI_CMD_READ_UUID.toUpperCase()){
			var values = data.value;
			var value = values[0]
			var device = this.device;
			//console.log("handleCharacteristicNotification on device ()",value);
			LOG_INFO(values,NOTIFICATION)

			var commands = [0x01,0x07,0x08,0x09,0x10,0x11,0x12,0x14,0x16,0x17,0x1E,0x1B,0x1C,0x1A,0x20,0x25,0x26,0x28]

			if(commands.indexOf(values[0]) !== -1)
				values.shift()


			switch(value){
				
				/* --------------------------------------------------------------  --------------------------------------------------------------  --------------------------------------------------------------*/				
				case 0x01 : //app firmware version
						//this.clearGeneralInterval()
						console.log("get 0x01 app firmware_version")
						this.updateAppVersion(values)
						this.getRadioFirmwareVersion()
					break

				case 0x09 : // radio firmware version
						console.log("get 0x09 radio firmware_version")
						this.updateRadioVersion(values)
						this.getBluetoothFirmwareVersion()
					break					

				case 0x12 : //bluetooth firmware version
						console.log("get 0x12 bluetooth firmware_version")
						this.updateBluetoothVersion(values)
						this.getRadioSettings()
					break

				case 0x08 : //radio settings
						console.log("get 0x08 radio settings")
						this.updateRadioSettings(values)
						this.getVoltage()

					break
					
					case 0x14: //Voltage
						console.log("get 0x14 voltage")
						this.updateVoltage(values)
						this.getRegisteredBoard1()

					break					

				case 0x10: //Register Board name 1
						console.log("get 0x10 register board name 1")
						this.updateRegisterBoard1(values)
						this.getRegisteredBoard2()

					break

				case 0x11: // Register Board name 2
						console.log("get 0x11 register board name 2")
						this.updateRegisterBoard2(values)
						this.getAppPicVersion()
					break


				case 0x25: // App pic Version
						console.log("get 0x25 app pic version")
						this.updateAppPicVersion(values)
						this.getRadioPicVersion()
					break
				case 0x26: // Radio Pic Version
						console.log("get 0x26 radio pic version")
						this.updateRadioPicVersion(values)
						this.getHoppingTable()
					break					


				case 0x20: //get hopping table
						console.log("get 0x20 hopping_table")
						this.updateHoppingTable(values)
						this.getDebugModeStatus()
					break					

				case 0x1B: //get debug mode status
						//this.clearGeneralInterval()
						console.log("get 0x1B debug mode status")
						this.getWarrantyInformation()
					break

				case 0x28:
					console.log("get 0x28 warranty_information",)
					this.updateWarrantyInformation(values)
					this.getAllVersion()
				break
				case 0x1E: // all versions
					console.log("get 0x1E all versions")
					this.saveOnCloudLog(values,"FIRMWAREVERSIONS")
					this.getBootloaderInfo()
					break


				case 0x07: //Bootloader info
					//this.clearGeneralInterval()
					console.log("get 0x07 bootloader info")
					this.saveOnCloudLog(values,"BOOTLOADERINFO")
					this.startOperationsAfterConnect(this.device)
					break

				/* --------------------------------------------------------------  --------------------------------------------------------------  --------------------------------------------------------------*/

				case 0x16: // pair result
					console.log("getting pair result");
					
					if(values[0] == 2){
						Alert.alert(
							"Pairing Complete",
							"The pairing command has been successfully sent. Please test your Bridge and Confirm that it is functioning correctly.",
						)
					}else{
						Alert.alert(
							"Error","Pairing on the other device failed. Please connect to the other device to finish the pairing process."
						)
					}
					
					

					break
				case 0x17: // un-pair result
					console.log("getting unpair result");
					if(this.props.force){ //this comes from the file options method resetStacktoForce
						Alert.alert(
			    			"Success", "Un-Pair successfully sent"    		
		    			)		
		    			break
					}

					if(values[0] == 2){
						Alert.alert(
			    			"Success", "Un-Pair successfully sent"    		
		    			)		

					}else{
						Alert.alert(
							"Error","Un-pair on the other unit failed. Please connect to the other unit to complete the un-pair process."
						)
					}
					break


				case 0x1C: // last packet
					console.log("get last packet")
					this.saveOnCloudLog(values,"LASTPACKET") 
					var miliseconds = BYTES_TO_INT(values)
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

					this.saveOnCloudLog(values,"RESETCAUSES")
					this.handleResetCauseNotification(values)

				break;					

				default:
					//console.log("No options found to: " + value)
				return
			}					
		}
	}

	closeModal(){
		this.props.dispatch({type: "HIDE_MODAL"})
	}

	openModal(){
		this.props.dispatch({type: "SHOW_MODAL"})
	}

	startOperationsAfterConnect(device){
		if(this.props.getting_commands)
			this.props.dispatch({type: "SET_GETTING_COMMANDS",getting_commands:false})

		this.renderConnectedStatus()
		
		this.checkPairOrUnPairResult()
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
		//console.log("scanByFiveSeconds()")
		this.devices_found = []
		this.is_in = false
		this.startDeviceScan(device)
		setTimeout(() => this.stopScanByFiveSeconds(device),5000)
	}


	stopScanByFiveSeconds(device){
		//console.log("stopScanByFiveSeconds()")
		if(this.fast_manager)
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
		if(this.fast_manager)
			this.fast_manager.startDeviceScan(['98bf000a-0ec5-2536-2143-2d155783ce78'],null,(error,found_device) => {
	            //console.log("device",device)
	            if(error){
	                console.log("error",error.message)
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
		console.log("fetchDeviceName()",device_id,remote_device_id);
		fetch(GET_DEVICE_NAME_ROUTE,{
			method: "POST",
			headers: {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify({hardware_serial: device_id})
		})
		.then(response => {
			console.log("response 1",response)
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
				console.log("response 2",response)
				var data = JSON.parse(response._bodyInit).data
				
				this.props.dispatch({type: "UPDATE_REMOTE_DEVICE_NAME",remote_device_name : data.name})

			})
			.catch(error => console.log("error on fetchDeviceName 1",error))
		})
		.catch(error => console.log("error on fetchDeviceName 2",error))
	}

	checkPairOrUnPairResult(){
		console.log("checkPairOrUnPairResult()",this.props.write_pair_result,this.props.write_unpair_result)

		if(this.props.write_pair_result || this.props.write_unpair_result){
			
			if(this.props.write_pair_result){

				this.props.dispatch({type:"SET_WRITE_PAIR_RESULT",write_pair_result: false})
				this.writePairResult(this.device)

			}else{
				this.props.dispatch({type: "SET_WRITE_UNPAIR_RESULT",write_unpair_result: false})
				this.writeUnpairResult(this.device)
			}

		}

		this.fetchDeviceName(this.device.manufactured_data.device_id.toUpperCase(),this.device.manufactured_data.tx.toUpperCase());
		this.searchPairedUnit(this.device)
	}

	renderWarrantyInformation(){
		var warranty_days = Math.round(((this.props.warranty_information / 60) / 60) / 24) 
		var number_of_day  = 365
		var warranty_remainin_days = number_of_day - warranty_days
		var porcentage = (warranty_days / (number_of_day) )

		console.log("porcentage",porcentage) 
		return(
			<View style={{marginVertical:10,height:140,width:width}}>
				<View style={{position: 'absolute',zIndex:0}}>
					<View style={{alignItems:"center"}}>
						<Text style={{color:"gray",fontSize:20,marginBottom:5}}>
							WARRANTY INFORMATION
						</Text>
					</View>
					<View style={{height:70,backgroundColor:"white",width:width,alignItems:"center",justifyContent:"center",zIndex:1}}>
							<View style={{zIndex:3,position: 'absolute'}}>
								<Text style={{color:"white",fontSize:20}}> 
									{warranty_remainin_days} days remaining
								</Text>
							</View>
							<View style={{zIndex:2,position:'absolute'}}>						
								<ProgressBar 
									progress={porcentage} 
									width={width-60} 
									height={30} 
									borderRadius={5} 
									color="green" 
									unfilledColor="black"
								/>
							</View>
					</View>
					<View style={{justifyContent:"center",alignItems:"center",backgroundColor:"white"}}>
						<Text style={{color:"black"}}>
							Run Time : {warranty_days} Days
						</Text>						
					</View>					
				</View>
			</View>
		)
	}

	render(){
		//console.log("datos aca",this.props.central_device_status,this.props.indicator_number,this.props.power_voltage)
		
		/*
		console.log("this.props --------------------------")
		
		console.log("this.props --------------------------")
		*/

		var props = this.props
		if(!IS_EMPTY(this.device) &&  props.central_device_status == "connected"){
			var content = (
				<View>
					<View>
						{this.renderNotification(this.show_notification,props.indicator_number)}
					</View>
					<View>
						{this.renderOptions()}
					</View>
					<View>
						{this.renderWarrantyInformation()}
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

  	debug_mode_status : state.setupCentralReducer.debug_mode_status,
  	app_board_version : state.setupCentralReducer.app_board_version,
  	radio_board_version : state.setupCentralReducer.radio_board_version,
  	register_board_1 : state.setupCentralReducer.register_board_1,
  	register_board_2 : state.setupCentralReducer.register_board_2,
  	show_switch_button : state.setupCentralReducer.show_switch_button,
  	
  	pair_disconnect: state.setupCentralReducer.pair_disconnect,
  	unpair_disconnect : state.setupCentralReducer.unpair_disconnect,
  	deploy_disconnect : state.setupCentralReducer.deploy_disconnect,
  	manual_disconnect : state.setupCentralReducer.manual_disconnect,
  	switch_disconnect : state.setupCentralReducer.switch_disconnect,
  	show_status_box : state.setupCentralReducer.show_status_box,
  	show_disconnect_notification : state.setupCentralReducer.show_disconnect_notification,
  	allow_notifications: state.setupCentralReducer.allow_notifications,
  	write_pair_result : state.setupCentralReducer.write_pair_result,
  	write_unpair_result: state.setupCentralReducer.write_unpair_result,
  	connection_established : state.setupCentralReducer.connection_established,

  	manager : state.scanCentralReducer.manager,
  	just_deploy : state.scanCentralReducer.just_deploy,
  	should_connect : state.scanCentralReducer.should_connect,
  	interval : state.scanCentralReducer.interval,
  	indicator_number : state.scanCentralReducer.indicator_number,
  	device: state.scanCentralReducer.central_device,
	checkDeviceState: state.scanCentralReducer.central_checkDeviceState,
	central_device_status: state.configurationScanCentralReducer.central_device_status,
  	user_status : state.mainScreenReducer.user_status,  	
  	user_data : state.loginReducer.user_data,
  	handleDisconnected : state.setupCentralReducer.handleDisconnected,
	handleConnected : state.setupCentralReducer.handleConnected,
	handleCharacteristic : state.setupCentralReducer.handleCharacteristic,
	commands : state.bluetoothDebugLog.commands,
	warranty_information : state.scanCentralReducer.warranty_information
});


export default connect(mapStateToProps)(SetupCentral);