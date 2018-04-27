//Third part libraries
import React, {Component} from 'react'
import SlowBleManager from 'react-native-ble-manager'
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';
import moment from 'moment'
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
	BASE64,
	GET_DEVICE_NAME_ROUTE,
	NOTIFICATION,
	CONNECTED,
	DISCONNECTED,
	HEX_TO_BYTES,
	HVAC_TYPE,
	HVAC_SUREFI_THERMOSTAT_SERVICE,
	RX_DATA_CHAR_SHORT_UUID,
	prettyBytesToHex,
	EQUIPMENT_TYPE,
	THERMOSTAT_TYPE,
	BYTES_TO_INT_LITTLE_ENDIANG
} from '../constants'

import StatusBox from './status_box'
import Background from "../helpers/background"
import Options from './hvac/options';
import {
	styles,
	first_color,
	height,
	width,
	option_blue
} from '../styles/index.js'
import {
	IS_CONNECTED,
	HVAC_WRITE_COMMAND,
	PUSH_CLOUD_STATUS,
	READ_STATUS,
	WRITE_HASH,
	DISCONNECT,
	POST_LOG,
	LOG_CREATOR,
	READ_TX,
	WRITE_UNPAIR,
	LOG_INFO,
	parseSecondsToHumanReadable
} from '../action_creators'
import Notification from '../helpers/notification'
import {
	COMMAND_GET_DEVICE_DATA,
	COMMAND_GET_FIRMWARE_VERSION,
	COMMAND_GET_RADIO_FIRMWARE_VERSION,
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
	COMMAND_RESET_RUN_TIME,
	COMMAND_GET_DEMO_TIME
} from '../commands'
import {
	PhoneCmd_GetDemoModeTime,
	PhoneRsp_DemoModeTime,
	PhoneCmd_GetRegistration,
	PhoneRsp_AppVersion,
	PhoneCmd_GetRadioVersion,
	PhoneCmd_GetAppVersion,
	PhoneRsp_RadioVersion,
	PhoneRsp_BootloaderInfo,
	PhoneRsp_Registration,
	PhoneRsp_VoltageLevels,
	PhoneRsp_OperatingValues,
	PhoneRsp_ResetCauses,
	PhoneRsp_LastPacketTime,
	PhoneRsp_RadioUpdateStatus,
	PhoneRsp_HoppingTable,
	PhoneRsp_RunTime,
	PhoneCmd_GetOperatingValues,
	PhoneCmd_GetResetCauses,
	PhoneCmd_GetRadioUpdateStatus,
	PhoneCmd_GetHoppingTable,
	PhoneCmd_GetRunTime,
	PhoneCmd_GetPairingInfo,
	PhoneCmd_GetActivated,
	PhoneCmd_GetRadioSettings,
	PhoneCmd_GetLedsEnabled,
	PhoneCmd_GetFailSafeOption,
	PhoneCmd_GetDebugModeEnabled,
	PhoneCmd_GetQuietMode,
	PhoneRsp_BluetoothVersion,
	PhoneRsp_Success,
	PhoneRsp_Failure,
	PhoneRsp_UartTimeout,
	PhoneError_ValueTooLow,
	PhoneError_ValueTooHigh,
	PhoneError_InvalidValue,
	PhoneError_PayloadTooLarge,
	PhoneError_PayloadTooSmall,
	PhoneError_Busy,
	PhoneError_InvalidSettings,
	PhoneError_NotFccApproved,
	PhoneError_AlreadyStarted,
	PhoneError_Unsupported,
	PhoneError_NotStarted,
	PhoneError_Security,
	PhoneError_TooMany,
	PhoneCmd_GetPowerOnTime,
	error_codes,
	get_codes,
	PhoneCmd_GetBluetoothVersion,
	PhoneRsp_PowerOnTime,
	PhoneCmd_SetDebugModeEnabled,
	PhoneCmd_ClearResetCauses,
	PhoneRsp_PairingInfo,
	PhoneCmd_GetLastPacketTime,
	PhoneCmd_SetRunTime,
	PhoneRsp_Activated,
	PhoneCmd_SetActivated,
	PhoneCmd_SetDemoModeTime,
	PhoneCmd_Unpair,
	PhoneRsp_RadioSettings
} from '../hvac_commands_and_responses';
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


const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const MAX_NUMBER_OF_RETRIES = 5
var interval = 0;
var second_interval = 0;
var general_interval = 0;
var getAllEventActivate = false;
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
    	},
    	navBarTitleTextCentered: true,
    }

	constructor(props) {
		super(props);
		
		this.device = props.device
	
		//console.log("props.device",props.device)
		this.hardware_type = props.device.manufactured_data.hardware_type
		this.manufactured_device_id = props.device.manufactured_data

		//console.log("props wtf-------------------------------	",props.device)
	
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
		this.getAllCommandsEvent = this.getAllCommandsEvent.bind(this)
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
			this.deployConnection(device,0)
		}
	}

	onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        switch(event.id){
            case "pin_number":
                this.showPINModal()
            break
            case "backPress":
            	
            	console.log("Back Press Has been press.")
            	this.props.dispatch({
		    		type:"SET_DEPLOY_DISCONNECT",
		    		deploy_disconnect:true
		    	})	 

            	this.props.dispatch({type:"SET_GETTING_COMMANDS",getting_commands:false})
				this.changing_time = true
				this.props.navigator.pop()
				this.disconnect() // don't chante this order (disconnect() and removeListeners()) or the device won't disconnect
				
				setTimeout(() => this.removeListeners(),3000)
				
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
		this.props.dispatch({type: "CONNECTING_CENTRAL_DEVICE"})
	
		this.activateListeners()
		this.fetchDeviceName(this.device.manufactured_data.device_id.toUpperCase(),this.device.manufactured_data.tx.toUpperCase())  
		this.checkDeviceState(this.device) //enter point for all the connections    

    }

    componentWillUnmount() {
		this.eraseSecondInterval()
		this.eraseInterval()
		this.fast_manager.stopDeviceScan()
		this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: false})
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
		this.activateGetAllCommandsListener()
	}

	removeListeners(){
		console.log("removeListenerss()")
		this.removeHandleCharacteristic()
		this.removeHandleConnectDevice()
		this.removeHandleDisconnectedPeripheral()
		this.removeGetAllCommandsListener()
	}

	disconnect(){
		console.log("disconnect() -------")
		this.fast_manager.stopDeviceScan()

		IS_CONNECTED(this.device.id)
		.then(response => {
			console.log("response",response)
			if(response){
				SlowBleManager.disconnect(this.device.id)
				.then(response => {
				}).catch(error => console.log("error",error))
			}else{
				SlowBleManager.disconnect(this.device.id)
				.then(response => {
				}).catch(error => console.log("error",error))				
			}
		})
	}

    unPair() {
    	console.log("unPair()",this.device.manufactured_data.device_id)
	    if(!this.props.debug_mode_status){
		    this.props.dispatch({
		    	type: "SET_UNPAIR_DISCONNECT",
		    	unpair_disconnect: true
		    })
		}

		this.props.dispatch({type:"ALLOW_NOTIFICATIONS",allow_notifications:false})

		/*POST_LOG({
			log_type : "UNPAIR",
			device_id : this.device.id, 
			log_value: " ",
			hardware_serial : this.device.manufactured_data.device_id.toUpperCase()
		})*/
		var hardware_type = this.device.manufactured_data.hardware_type
		
		console.log("hardware_type",hardware_type)

		if(hardware_type == "04"){
			this.writeUnpairForEquipment()
		}

		if(this.device == "03"){
			this.writeUnpairForThermostat()
		}
    }

    writeUnpairForEquipment(){
    	var unpair = 0
    	this.write([PhoneCmd_Unpair,unpair])
    }

    writeUnpairForThermostat(uuids){
    	let unpair = 0
    	var data = [PhoneCmd_Unpair,unpair]
    	this.write(data.concat(uuids))
    }


	showPINModal(){
		this.props.navigator.showLightBox({
            screen: "PINCodeModal",
            style: {
            	flex:1,
                backgroundBlur: "none", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.7)'" // tint color for the background, you can specify alpha here (optional)
            },
            passProps: {
            	hideRightButton: () => this.hideRightButton()
            }
        });
	}

	showDemoUnitTimeModal(){
		console.log("showDemoUnitTimeModal()")
		this.props.navigator.showLightBox({
            screen: "SetDemoModeTimeModal",
            style: {
            	flex:1,
                backgroundBlur: "none", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.7)'" // tint color for the background, you can specify alpha here (optional)
            },
            passProps: {
            	setDemoModeTime: (value) => this.setDemoModeTime(value),
            	getDemoModeTime: () => this.getDemoModeTime()
            }
        });
	}


	showRunTimeModal(){
		this.props.navigator.showLightBox({
            screen: "SetRuntimeModal",
            style: {
            	flex:1,
                backgroundBlur: "none", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.7)'" // tint color for the background, you can specify alpha here (optional)
            },
            passProps: {
            	setRunTime: (value)  => this.setRunTime(value),
            	getRunTime: (value) => this.getRunTime(value)
            }
        });

	}

	hideRightButton(){
		this.props.navigator.setButtons({
			rightButtons: []
		})
	}

	activateGetAllCommandsListener(){
		console.log("activateGetAllCommandsListener()")	
		if(this.props.getAllCommands){
			console.log("getAllCommand listener is alreay active")
		}else{
			this.props.dispatch({
				type:"SET_GET_ALL_COMMANDS",
				getAllCommands: true
			})	 
			this.getAllCommands = bleManagerEmitter.addListener('GetAllCommandsEvent',this.getAllCommandsEvent)		
		}
	}

	removeGetAllCommandsListener(){
		console.log("removeGetAllCommandsListener()")
		if(this.props.getAllCommands){
			this.props.dispatch({
				type:"SET_GET_ALL_COMMANDS",
				getAllCommands: false
			})				
			this.getAllCommands.remove()
		}else{
			console.log("getAllCommand listener was remove previosly")
		}
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
			this.deployConnection(device,0)
		}else{
			this.renderNormalConnecting()

			IS_CONNECTED(device.id)
			.then(response => {
				if(!response){
					/*SlowBleManager.connect(device.id)
					.then(response => {})
					.catch(error => console.log("Error on fastTryToConnect()",error))*/
					this.deployConnection(device,0)
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

	deployConnection(device,type){
		console.log("deployConnection()",type)
		this.props.dispatch({type: "SET_DEPLOY_DISCONNECT",deploy_disconnect:true})
		if(!type)
			type = 0
		if(interval == 0){
			interval = setInterval(() => this.createConnectionInterval(device,type),2000)
			setTimeout(() => this.eraseInterval(),50000)
		}else{
			console.log("the interval can't be created it was created previosly")
		}
	}
	
	createConnectionInterval(device,type){
		console.log("createConnectionInterval()",type)
		var data = GET_SECURITY_STRING(device.manufactured_data.device_id,device.manufactured_data.tx)
		var device_type = HVAC_TYPE
		SlowBleManager.controllHVACConnect(device.id,data,type,device_type,device.manufactured_data.device_id,device.manufactured_data.tx)
		.then(response => console.log("response connect()",response))
		.catch(error => {
			console.log("error on connect()",error)
			clearInterval(interval)
			this.renderConnectedStatus()
		} )

	}

	connect(device){
		console.log("connect()",device.manufactured_data.device_id)
		let manufactured_data = device.manufactured_data.security_string
		IS_CONNECTED(device.id)
		.then(response => {
			if(!response){
				SlowBleManager.connect(device.id)
				.then(response => console.log("response connect()",response))
				.catch(error => {
					console.log("error on connect()",error)
					this.eraseInterval();
				} )
			}else{
				this.handleConnectedDevice()
			}

		})
		.catch(error => console.log("error on connect()",error))
	}

	eraseInterval(){
		//console.log("eraseInterval()")
		if(interval){
			clearInterval(interval)
			interval = 0
		}else{
			//console.log("interval was clear previously")
		}	
	}

	eraseSecondInterval(){
		//console.log("eraseSecondInterval()");
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
			SlowBleManager.simpleConnect(device.id)
			.then(response => {})
			.catch(error => console.log("Error on Simple connect"))
		
		}).catch(error =>  console.log("Error on simpleConnect()2",error))

		/*
			SlowBleManager.connect(device.id)
			.then(response => {})
			.catch(error => console.log("Error on simpleConnect()1",error))
		*/
	}

    handleConnectedDevice(data){
    	console.log("handleConnectedDevice()",data)
    	LOG_INFO([0xA1],CONNECTED,this.device.manufactured_data.device_id) // 0xA1 ITS DEFINED ON commands.js
    	SlowBleManager.startHVACNotifications(this.device.id);
    	this.status_on_bridge = parseInt(data.device_status)
    	clearInterval()
		this.eraseInterval()
		this.setConnectionEstablished(this.props.device)		
    }

    retrieveServices(){
    	var state = this.device.manufactured_data.device_state.slice(-2)
    	console.log("retrieveServices()",state)

    	BleManagerModule.retrieveServices(this.device.id,() => {
	    	if(this.props.pair_disconnect || this.props.unpair_disconnect){
				setTimeout(() => {
		    		this.eraseInterval()
		    		this.setConnectionEstablished(this.props.device)		
				},200)	    		
	    	}else if(state != "04"){
	    		setTimeout(() => {
		    		this.changing_time = false
		    		this.eraseInterval()
		    		this.setConnectionEstablished(this.props.device)		
	    		})
	    	}else{	
	    		setTimeout(() => {
	    			this.deployConnected()	
	    		},200)
	    		
	    	}		    		
    	})
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
    	this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: indicator})
    }

	setConnectionEstablished(){
    	//console.log("setConnectionEstablished()")
    	//this.props.dispatch({type:"SET_CONNECTION_ESTABLISHED",connection_established:true})
    	//this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})
    	this.renderConnectedStatus()
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
    	this.readStatusOnDevice(this.device)	
    }


	readStatusOnDevice(device){
		//console.log("readStatusOnDevice()",device.id);
		BleManager.getHVACDeviceStatus(device.id).then(response => {
			
			 //this is the internal status on the bridge
			if(this.status_on_bridge == 2){
				this.readStatusOnDevice(device)
			}else{
				device.manufactured_data.device_state = this.setCorrectStatusToDevice(this.status_on_bridge,device);
				this.getCloudStatus(device)
			}
		})
		.catch(error => console.log("Error readStatusOnDevice",error))
	}

	readCharacteristic(device){
		//console.log("readCharacteristic()")
		BleManager.read(this.device.id,HVAC_SUREFI_THERMOSTAT_SERVICE,RX_DATA_CHAR_SHORT_UUID).then(response => {
			//console.log("response",response)
			var data = Array.from(response)
			var attention_character = data.shift()
			var command = data.shift()
			var length = data.shift()
			this.handleResponse(command,data)
		})
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
		//var status = this.device.manufactured_data.device_state.slice(-2)
		
		//this.getStatus(device,this.c_status,this.c_expected_status)
		fetch(GET_STATUS_CLOUD_ROUTE,data)
		.then(response => {
			//console.log("response on cloud",response);
			let status = JSON.parse(response._bodyInit).data.status
			this.props.dispatch({type: "SET_HARDWARE_STATUS",hardware_status:status}) //this will be necesary on another component

			let current_status_on_cloud = status.split("|")[0] //last know status on the device
			let expected_status = status.split("|")[1] // current expected status the sure_fi should have this state
			let current_status_on_bridge = this.status_on_bridge


			this.choseNextStep(current_status_on_cloud,expected_status,current_status_on_bridge,device)

		}).catch(error => console.log("error",error))
	}

	choseNextStep(current_status_on_cloud,expected_status,current_status_on_bridge,device){
		console.log("choseNextStep()",current_status_on_cloud,expected_status,current_status_on_bridge)
		current_status_on_cloud = parseInt(current_status_on_cloud,10)
		expected_status = parseInt(expected_status,10)
		current_status_on_bridge = parseInt(current_status_on_bridge,10)

		//if(current_status_on_cloud != "" && expected_status){
		if(false){
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
    	this.getAllInfo(device)
    }

    handleDisconnectedPeripheral(info){		
    	//console.log("handleDisconnectedPeripheral",info)
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
    		setTimeout(() => this.deployConnection(this.device,1),3000)
			//this.simpleConnect(this.device)
    		

    	}else if(this.props.unpair_disconnect){
    		console.log("entra aqui - 2");
    		this.renderNormalConnecting()
			
			this.eraseSecondInterval()
			this.props.dispatch({type: "HIDE_SWITCH_BUTTON"})
			setTimeout(() => this.deployConnection(this.device,1),3000)
			//this.simpleConnect(this.props.device)
			
    		
    	}else if(this.props.manual_disconnect){
    		console.log("entra aqui 3 - manual");

     		this.props.navigator.screenIsCurrentlyVisible().then(response => {
    			
     			if(!response){
     				this.props.navigator.pop()
					Alert.alert("Alert","Bluetooth Device Disconnect. 1")
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

    		if(this.props.show_disconnect_notification){
    			this.props.navigator.screenIsCurrentlyVisible().then(response => {
    				if(!response){
    					Alert.alert("Alert","Bluetooth Device Disconnect.")
    				}
    			})
    		}

			this.props.dispatch({
				type : "DISCONNECT_CENTRAL_DEVICE"
			})    

			this.fastTryToConnect(this.device)
    	}
	}

	writePairResult(device){
		console.log("writePairResult()",device.id)
		var data = [PhoneCmd_GetPairResult]
		this.write(data)
	}

	writeUnpairResult(device){
		console.log("writeUnpairResult()",device.id)
		var data = [PhoneCmd_GetUnpairResult]
		this.write(data)
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
			this.write([PhoneCmd_SetDebugModeEnabled,0x00])
		} else{
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: true})
			this.write([PhoneCmd_SetDebugModeEnabled,0x01])
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

	udpateResetCauses(values){
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
		var data = [PhoneCmd_ClearResetCauses]
		this.write(data)
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
		console.log("simpleDisconnect",id)
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
					SlowBleManager.disconnect(id)
					.then(response => {
					}).catch(error => console.log("error",error))
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
		var data = [PhoneCmd_ResetApplication]
		this.write(data)
	}

	parsePairInfo(info){
		if(info.length > 25){
			var data = {}
			data.pair_status = info.slice(0,1)
			data.number_of_pairs = info.slice(1,2)
			data.first_equipment_pair = info.slice(2,5)
			data.second_equipment_pair = info.slice(5,8)
			data.third_equipment_pair = info.slice(8,11)
			data.fourth_equipment_pair = info.slice(11,14)
			data.fifth_equipment_pair = info.slice(14,17)
			data.sixth_equipment_pair = info.slice(17,20)
			data.seventh_equipment_pair = info.slice(20,23)
			data.eighth_equipment_pair = info.slice(23,26)
			return data

		}else{
			return false
		}
	}

	getResetCauses(){
		console.log("getResetCauses()");
		let data = [PhoneCmd_GetResetCauses]
		this.write(data)
	}

	setBoardVersion(setAppBoardVersion){
		Alert.alert("Needs API Call, setBoardVersion()")
	}

	isThermostat(){
		if(this.hardware_type == THERMOSTAT_TYPE || this.hardware_type == parseInt(THERMOSTAT_TYPE))
			return true

		return false
	}

	isEquipment(){
		if(this.hardware_type == EQUIPMENT_TYPE || this.hardware_type == parseInt(EQUIPMENT_TYPE))
			return true
		return false
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
						{this.isEquipment() && <WhiteRow name="Radio" value={PRETY_VERSION(this.props.radio_version) }/>}
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

	goToDebugLog(){
		this.props.navigator.push(
			{
				screen:"BluetoothDebugLog",
				title: "Bluetooth Debug Log",
			}
		)
	}

	getOtherCommands(user_type){
		var name = "Set Demo Time (" + parseSecondsToHumanReadable(this.props.demo_mode_time)+ ")";
		var run_time_name = "Set Run Time (" + parseSecondsToHumanReadable(this.props.run_time)+ ")"; 
		var activated_name = this.props.activated[0] ? "Deactivate" : "Activate"
		var activated_value = this.props.activated[0] ? 0 : 1
		if(user_type){
			return (
				<View>
					<WhiteRowLink name="Restart Application Board" callback={() => this.resetBoard()}/>
					<WhiteRowLink name={this.props.debug_mode_status ? "Disable Debug Mode" : "Enable Debug Mode"}  callback={() => this.setDebugModeStatus()}/>
					<WhiteRowLink name="View Reset Counts" callback={() => this.getResetCauses()}/>
					<WhiteRowLink name="Bluetooth Debug Log" callback={() => this.goToDebugLog()}/>
					<WhiteRowLink name={name} callback={() => this.showDemoUnitTimeModal()}/>
					<WhiteRowLink name={run_time_name} callback={() => this.showRunTimeModal()}/>
					<WhiteRowLink name={activated_name} callback={() => this.setActivate(activated_value)}/>

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
			goToOperationValues = {(activate_operating_values_wait) => this.goToOperationValues(activate_operating_values_wait)}
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
			saveOnCloudLog = { (bytes,type) => this.saveOnCloudLog(bytes,type)}
			showModalToResetDemoUnits = {() => this.goToPayMentOptions() }
			unPair = {() => this.unPair()}
		/>
	}

	goToPayMentOptions(){
		console.log("goToPaymentOptions()")
		this.props.navigator.push({
			screen : 'PaymentOptions',
			title: "Activate Product",
			passProps: {
				paymentResponse: (values) => this.paymentResponse(values),
				getDemoModeTime: () => this.getDemoModeTime(),
				setDemoModeTime : (value) => this.setDemoModeTime(value)
			}
		})
	}

	setRunTime(value){
		var data = [PhoneCmd_SetRunTime].concat(value)
		this.write(data)
	}

	setDemoModeTime(value){
		var data = [PhoneCmd_SetDemoModeTime].concat(value)
		this.write(data)
	}

	write(data){
		console.log("write()",data)
		HVAC_WRITE_COMMAND(this.device.id,data)
		.then(response => {

		})
		.catch(error => console.log("error",error))
	}

	setActivate(value){
		console.log("setActivate()",value)
		var data = [PhoneCmd_SetActivated,value]
		this.write(data)
		setTimeout(() => this.getActivated(),2000)
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
				screen:"HVACPair",
				title : "Pair HVAC Sure-Fi",
				passProps:{
					checkDeviceState : (device) => this.checkDeviceState(device),
					readStatusOnDevice : (device) => this.readStatusOnDevice(device),
					getCloudStatus : (device) => this.getCloudStatus(device),
					searchPairedUnit : (device) => this.searchPairedUnit(device),
					saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
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

	paymentResponse(values){
		console.log("paymentResponse",values)
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
		Alert.alert(
			"Warning",
			"In order to do a firmware update, you must be instructed by a support call, this action can't be undone.",
			[
				{text:"Cancel" },
				{text:"Continue",onPress:() => this.showUpdateTwoSitesAlert()}
			]
		)
	}

	showUpdateTwoSitesAlert(){
		Alert.alert(
			"Warning",
			"In order to work the firmware update must be done in both sides, remote and central, this action can't be undone.",
			[
				{text: "Cancel"},
				{text: "Continue",onPress: () => this.doGoToFirmwareUpdate() }
			]
		)
	}

	doGoToFirmwareUpdate(){
		this.removeHandleCharacteristic()
		this.activateHandleDisconnectedPeripheral()

		let user_type = this.props.user_data ?  this.props.user_data.user_type : false
		//console.log("getOptions()",this.props.indicatorNumber,this.props.user_data);
		var admin_options = ["SYS_ADMIN","PROD_ADMIN","CLIENT_DEV"]

		this.eraseSecondInterval()

		if(admin_options.lastIndexOf(user_type) !== -1){
		//if(true){
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
		console.log("goToConfigureRadio()");
		this.props.dispatch({type: "UPDATE_PAGE_STATUS",page_status:"loading"})
		this.getRadioSettings()

		this.props.navigator.push(
			{
				screen:"HVACConfigureRadio",
				title: "Configure Radio",
				passProps: {
					saveOnCloudLog : (data,type)  => this.saveOnCloudLog(data,type),
					selectHoppingTable : (hopping_table,data) => this.selectHoppingTable(hopping_table,data),
					getHoppingTable:  () => this.getHoppingTable(),
					getRadioSettings: () => this.getRadioSettings()
				},
				navigatorButtons : {
					rightButtons: [
					  {
					    title: 'Update',
					    id: 'update',
					    color:"red",
					    buttonColor: "blue"
					  }
					]
				}				
			}
		)
	}


	goToRelay(){
		console.log("goToRelay()");
		
		this.props.navigator.push({
			screen: "Relay",
			title: "Configuration",
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
				fetchDeviceName: (device_id,remote_device_id) => this.fetchDeviceName(device_id,remote_device_id),
				saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type)	
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
		console.log("goToOperationValues()")
		this.props.navigator.push({
			screen : "HVACOperatingValues",
			title : "Operating Values",
			animated: false,
			passProps: {
				getOperatingValues : () => this.getOperatingValues(),
				getPowerOnTime: () => this.getPowerOnTime(),
				saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
				isEquipment: () => this.isEquipment(),
				isThermostat: () => this.isThermostat(),
			}			
		})
	}

	getLastPackageTime(){
		console.log("getLastPackageTime()")
		if(this.isEquipment()){
			
			var data = [PhoneCmd_GetLastPacketTime]
			this.write(data)

		}else if(this.isThermostat()){
			if(this.props.pairing_info.length > 0){				
				console.log("this.props.pairing_info.length",this.props.pairing_info)

				var pair_info = this.props.pairing_info
				var pair_status = pair_info.slice(0,1)
				var number_pairs = pair_info.slice(1,2)
				var equipment_pairs = pair_info.slice(2,pair_info.length - 1)

				for(let i = 0; i < number_pairs; i++){
					var first = i * 3
					var second = (i * 3) + 1
					var third = (i * 3) + 2
					var id = [equipment_pairs[first],equipment_pairs[second],equipment_pairs[third]]
					
					this.props.dispatch({
						type:"SET_LAST_PACKAGE_TIME_THERMOSTAT",
						last_package_time_thermostat: []
					})	 
						
					this.writeLastPackageTimeCommand(id)
				}

			}else{
				console.error("Error","Can't get last packet time to the termostat because there are not pairing_info")
			}
		}else{
			console.error("Error","Error on getLastaPackageTime")
		}
	}

	writeLastPackageTimeCommand(id){
		var data = [PhoneCmd_GetLastPacketTime].concat(id)
		console.log("writeLastPackageTimeCommand",data)
		this.write(data)
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

	

	
	/* --------------------------------------------------------------------------------------------------- End Go To Seccion ---------------------------------------------------------------*/	



	/* --------------------------------------------------------------------------------------------------- update commands Seccion ---------------------------------------------------------------*/	

	updateAppVersion(values){
		console.log("updateAppVersion()")
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
		console.log("updateBluetoothVersion()",values)
		this.saveOnCloudLog(values,"BLUETOOTHFIRMWARE")
		var bluetooth_version = parseFloat(values[0].toString() + "." + values[1].toString())
		this.props.dispatch({type: "UPDATE_BLUETOOTH_VERSION",version : bluetooth_version })
	}

	updateRegistration(values){
		//console.log("updateRegistration()")
		this.props.dispatch({
			type:"UPDATE_REGISTRATION_INFO",
			registration_info : values 
		})	 
		if(values.length > 62){
			var name = values.slice(3,23)
			var register_board_1_values = values.slice(23,43)
			var register_board_2_values = values.slice(43,63)			
			this.updateRegisterBoard1(register_board_1_values)
			this.updateRegisterBoard2(register_board_2_values)

		}else{
			console.error("Error!","Update registration can't be finished, the format isn't correct.")
		}
	}

	updateLastPackageTime(values){
		console.log("updateLastPackageTime",values)
		if(this.isEquipment()){
			this.props.dispatch({
				type:"SET_LAST_PACKAGE_TIME",
				last_package_time : values
			})			
		}else if(this.isThermostat()){
			var last_package_time_thermostat = this.props.last_package_time_thermostat
			var id = values.slice(0,3)
			var time = values.slice(3,7)
			last_package_time_thermostat.push([id,time])
			console.log("last_package_time_thermostat__	",last_package_time_thermostat)
			this.props.dispatch({
				type:"SET_LAST_PACKAGE_TIME_THERMOSTAT",
				last_package_time_thermostat: last_package_time_thermostat
			})	 	
		}
	}

	updateOperatingValues(values){
		console.log("updateOperatingValues()")	
		this.props.dispatch({
			type:"SET_OPERATING_VALUES",
			operating_values : values
		})	 
		this.props.dispatch({type:"LOADING_OPERATION_VALUES",loading_operation_values:false})
	}

	updatePowerOnTime(values){
		//console.log("updatePowerOnTime",values)
		this.props.dispatch({
			type:"SET_POWER_ON_TIME",
			power_on_time: values
		})
	}

	updatePairingInfo(values){
		this.props.dispatch({
			type:"SET_PAIRING_INFO",
			pairing_info : values
		})
	}

	updateRadioSettings(values){
		console.log("updateRadioSettings()",values)
		this.props.dispatch(
			{
				type: "SET_RADIO_SETTINGS_HVAC",
				radio_settings: values
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
		console.log("updateHoppingTable()",values)
		this.props.dispatch({"type" : "SET_HOPPING_TABLE",hopping_table: values})
	}

	updateDebugModeStatus(values){
		console.log("updateDebugModeStatus()")
		if(values[0]){
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: true})
		}else{
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: false})
		}		
	}

	updateRunTime(values){
		console.log("updateRunTime()",values)
		if(values){
			if(values.length){
				this.props.dispatch({type: "SET_RUN_TIME",run_time:values})
			}else{
				console.log("the array on updateRunTime its empty")
			}
		}else{
			console.log("the array on updateRunTime its undefined or null")
		}
	}

	updateDemoModeTime(values){
		console.log("updateDemoModeTime()",values)
		this.props.dispatch({type: "SET_DEMO_MODE_TIME",demo_mode_time: values})	 
	}

	updateActivated(values){
		console.log("updateActivated()",values)
		this.props.dispatch({type: "SET_ACTIVATED",activated:values})	
	}

	clearGeneralInterval(){
		//console.log("clearGeneralInterval()",general_interval)
		if(general_interval != 0){
			clearInterval(general_interval)
			general_interval = 0
		}else{
			//console.log("general_interval previosly cleaned")
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
		//console.log("renderConnectedStatus()")
		this.props.dispatch({type:"CONNECTED_CENTRAL_DEVICE"})
	}

	tryAgaing(methodToTry){
		try{
			methodToTry()
		}catch(error){
			console.log("error on Try Againg",error)
		}
	}

	/* --------------------------------------------------------------------------------------------------- get commands Seccion ---------------------------------------------------------------*/	

	getAllInfo(device){
		console.log("getAllInfo()")
		SlowBleManager.getAllInfo(this.props.device.id)
	}

	getPairingInfo(){
		console.log("getPairingInfo()")
		var data = [PhoneCmd_GetPairingInfo]
		this.write(data)
	}

	getPowerOnTime(){
		console.log("getPowerOnTime()")
		var data = [PhoneCmd_GetPowerOnTime]
		this.write(data)
	}

	getFirmwareVersion(){
		console.log("getFirmwareVersion()")
		var data = [PhoneCmd_GetAppVersion]
		this.write(data)
	}

	getRadioFirmwareVersion(){
		console.log("getRadioFirmwareVersion()")
		var data = [PhoneCmd_GetRadioVersion]
		this.write(data)
	}

	getBluetoothFirmwareVersion(){
		console.log("getBluetoothFirmwareVersion()")
		var data = [PhoneCmd_GetBluetoothVersion]
		this.write(data)
	}

	getRegistration(){
		console.log("getRegistration()")
		var data = [PhoneCmd_GetRegistration]
		this.write(data)
	}

	getRadioSettings(){
		console.log("getRadioSettings()")
		var data = [PhoneCmd_GetRadioSettings]
		this.write(data)
	}

	getVoltage(){
		console.log("getVoltage()")
		var data = [PhoneCmd_GetVoltageLevels]
		this.write(data)
	}

	getHoppingTable(){
		console.log("getHoppingTable()")
		var data = [PhoneCmd_GetHoppingTable]
		this.write(data)
	}

	getDebugModeStatus(){
		console.log("getDebugModeStatus()")
		var data = [PhoneCmd_GetDebugModeEnabled]
		this.write(data)
	}


	getOperatingValues(activate_operating_values_wait){
		console.log("getOperatingValues()");
		if(activate_operating_values_wait){
			this.props.dispatch({type:"LOADING_OPERATION_VALUES",loading_operation_values:false})
		}
		var data = [PhoneCmd_GetOperatingValues]
		this.write(data)
	}

	getRunTime(){
		console.log("getRunTime()")
		var data = [PhoneCmd_GetRunTime]
		this.write(data)
	}

	getDemoModeTime(){
		console.log("getDemoModeTime");
		var data = [PhoneCmd_GetDemoModeTime]
		this.write(data)
	}

	getActivated(){
		console.log("getActivated");
		var data = [PhoneCmd_GetActivated]
		this.write(data)
	}

	getBootloaderInfo(){
		console.log("getBootloaderInfo()")
		var data = [COMMAND_GET_BOOTLOADER_INFO]
		this.write(data)
	}

	/* --------------------------------------------------------------------------------------------------- End commands Seccion ---------------------------------------------------------------*/	


	getAllCommandsEvent(data){
		//console.log("getAllCommandsEvent()",data)
		var hardware_type = data.hardware_type
		setTimeout(() => {
			if(hardware_type == 3){
				this.checkInitValues()
				this.getLastPackageTime()
			}else if(hardware_type == 4){
				this.checkInitValues()
			}else{
				console.log("error","Error on get All commands.")
			}				
		},3000)
	}

	checkInitValues(){
		var {
			app_version,
			bluetooth_version,
			registration_info,
			operating_values,
			power_on_time,
			power_voltage,
			radio_version,
			hopping_table,
			radio_settings
		} = this.props
		var commands = []

		//console.log("checkEquipmentInitValues()",app_version,bluetooth_version,registration_info,operating_values,power_on_time)
		console.log("checkEquipmentInitValues()")

		if(app_version == 0){
			commands.push(PhoneCmd_GetAppVersion)
		}

		if(bluetooth_version == 0){
			commands.push(PhoneCmd_GetBluetoothVersion)
		}

		if(this.isEquipment()){
			if(radio_version == 0){
				commands.push(PhoneCmd_GetRadioVersion)
			}			
		}

		if(registration_info.length == 0){
			commands.push(PhoneCmd_GetRegistration)
		}

		if(operating_values.length == 0){
			commands.push(PhoneCmd_GetOperatingValues)
		}

		if(power_on_time.length == 0){
			commands.push(PhoneCmd_GetPowerOnTime)
		}

		if(hopping_table.length == 0){
			commands.push(PhoneCmd_GetHoppingTable)
		}

		if(radio_settings.length == 0){
			commands.push(PhoneCmd_GetRadioSettings)
		}

		console.log("commands",prettyBytesToHex(commands) ,"MAX_NUMBER_OF_RETRIES",MAX_NUMBER_OF_RETRIES)

		if(commands.length > 0 && MAX_NUMBER_OF_RETRIES > 0){
			MAX_NUMBER_OF_RETRIES--;
			SlowBleManager.getSomeInfo(this.props.device.id,commands)
		}	
	}


	handleCharacteristicNotification(data){
		var characteristic = data.characteristic
		var value = data.value

		if(data.value.length > 2){
			var attention_character = value.shift()
			var command = value.shift()
			var length = value.shift()
			if(length != value.length){

				this.readCharacteristic()
			}else{
				//handle the other cases
				this.handleResponse(command,value)
			}
		}else{
			Alert.alert("Error","Error getting the value on the notification the notification length is less than 2.")
		}
	}


	handleResponse(command,data){
		console.log("handleResponse()","0x" + command.toString(16) ,prettyBytesToHex(data))
		switch(command){
			case PhoneRsp_AppVersion: //0x21
				this.updateAppVersion(data)
			break
			case PhoneRsp_RadioVersion: //0x20
				this.updateRadioVersion(data)
			break
			case PhoneRsp_BluetoothVersion: //0x22
				this.updateBluetoothVersion(data)
			break
			case PhoneRsp_Registration: //0x24
				this.updateRegistration(data)
			break
			case PhoneRsp_Success: //0x80
				console.log("Success",data)
				//Alert.alert("Success");
			break
			case PhoneRsp_Failure: //0x81
				var writed_command = data[0]
				var response_code = data[1]
				this.handleFailure(writed_command,response_code)
			break
			case PhoneRsp_OperatingValues: //0x26
				this.updateOperatingValues(data)
			break			
			case PhoneRsp_PowerOnTime: //0x2D
				this.updatePowerOnTime(data)
				this.props.dispatch({type:"LOADING_OPERATION_VALUES",loading_operation_values:false})
			break
			case PhoneRsp_PairingInfo: // 2C
				this.updatePairingInfo(data)			
			break

			case PhoneRsp_ResetCauses: 
				this.udpateResetCauses(data)
			break
			case PhoneRsp_LastPacketTime:
				this.updateLastPackageTime(data)
			break
			case PhoneRsp_RunTime:
				this.updateRunTime(data)
			break
			case PhoneRsp_Activated:
				this.updateActivated(data)
			break
			case PhoneRsp_DemoModeTime:
				this.updateDemoModeTime(data)
			break
			case PhoneRsp_RadioSettings:
				this.updateRadioSettings(data)
				this.props.dispatch({type: "UPDATE_PAGE_STATUS",page_status:"loaded"})
			break
			case PhoneRsp_HoppingTable:
				this.updateHoppingTable(data)
			break
			case PhoneRsp_UartTimeout: //0x82
				Alert.alert("Failure", "PhoneRsp_UartTimeout (" + command.toString(16) + ") data: ( " + prettyBytesToHex(data) + ")")
			break
			default:
				console.log("No options found to: (" + command.toString(16) + ") with data: (" + prettyBytesToHex(data) + ")");
			break
		}
	}

	handleFailure(writed_command,error_code){
		console.log("handleFailure",writed_command + " " + error_code)
		var error_name = this.searchName(error_codes,error_code);
		Alert.alert("Phone Response Failure","Command 0x" +  writed_command.toString(16) + " | " + error_name)
	}

	searchName(array,code){
		var name = ""
		array.map((internal_code) => {
			console.log("code",code)
			console.log("internal_code",internal_code)
			if(internal_code[0] == code){
				name = internal_code[1]
			}
		})
		return name;
	}



	searchResponse(command){
		switch(command){
			case 0x1E:
				this.getRegisteredBoard1()
			break
			default:
				Alert.alert("Error","Error catching UnsupportedCMD")
			return
		}
	}

	closeModal(){
		this.props.dispatch({type: "HIDE_MODAL"})
	}

	openModal(){
		this.props.dispatch({type: "SHOW_MODAL"})
	}

	startOperationsAfterConnect(device){
		console.log("startOperationsAfterConnect()")
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
			//second_interval = setInterval(() => this.scanByFiveSeconds(this.device),10000)
		}else{
			console.log("thesecond interval can't be created it was created previosly")	
		}
	}

	scanByFiveSeconds(device){
		//console.log("scanByFiveSeconds() on Device Controller")
		this.devices_found = []
		this.is_in = false
		this.startDeviceScan(device)
		setTimeout(() => this.stopScanByFiveSeconds(device),5000)
	}

	stopScanByFiveSeconds(device){
		//console.log("stopScanByFiveSeconds() on DeviceController")
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

        this.switchDisconnect(id,"switch_unit") // The id here is the  id on the connected device and now this.device is the device to what we are going to change.
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

	choseNameIfNameNull(name){
		console.log("choseNameIfNameNull",name)
		var new_name = "Sure-Fi HVAC"
		var hardware_type = this.hardware_type
		if(name == "" || name == " " || name == null){
			if(hardware_type == EQUIPMENT_TYPE || hardware_type == parseInt(EQUIPMENT_TYPE)){
				new_name = "Sure-FI Equipment interface."
			}else if(hardware_type == THERMOSTAT_TYPE || hardware_type == parseInt(THERMOSTAT_TYPE)){
				new_name = "Sure-Fi Thersmostat interface"
			}
		}
		return new_name
	}

	fetchDeviceName(device_id,remote_device_id){
		console.log("fetchDeviceName()",device_id,remote_device_id);
		var hardware_type = this.hardware_type;
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
			let new_name = this.choseNameIfNameNull(data.name)
			this.props.dispatch({type: "UPDATE_DEVICE_NAME",device_name : new_name,original_name:new_name})
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
				let new_name = this.choseNameIfNameNull(data.name)
				this.props.dispatch({type: "UPDATE_REMOTE_DEVICE_NAME",remote_device_name : new_name})
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
		console.log("run_time",this.props.run_time)
		if(this.props.run_time.length == 0)
			return null

		var time = BYTES_TO_INT_LITTLE_ENDIANG(this.props.run_time)

		var warranty_days = Math.round(((time / 60) / 60) / 24) 
		var number_of_day  = 365
		var warranty_remainin_days = number_of_day - warranty_days
		var porcentage = (warranty_days / (number_of_day) )

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
		
		console.log("this.props --------------------------");
		
		console.log(
			"data: ",
			" { App Version: "+ this.props.app_version + 
			" Radio version: " + this.props.radio_version +
			" Bluetooth Version: "+ this.props.bluetooth_version +
			" Pairing Info: " + this.props.pairing_info +
			" Last Package time " + this.props.last_package_time +  
			" Registration: "+this.props.registration_info +" } ");
		
		console.log("Operating values:" + this.props.operating_values)
		console.log("this.props --------------------------");
		

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
  	registration_info : state.setupCentralReducer.registration_info,

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
	getAllCommands: state.setupCentralReducer.getAllCommands,
	radio_settings : state.setupCentralReducer.radio_settings,
	commands : state.bluetoothDebugLog.commands,
	warranty_information : state.scanCentralReducer.warranty_information,
	demo_unit_time : state.scanCentralReducer.demo_unit_time,
	operating_values: state.operationValuesReducer.operating_values,
	power_on_time: state.operationValuesReducer.power_on_time,
	pairing_info: state.scanCentralReducer.pairing_info,
	last_package_time : state.scanCentralReducer.last_package_time,
	last_package_time_thermostat : state.scanCentralReducer.last_package_time_thermostat,
	run_time: state.scanCentralReducer.run_time,
	activated : state.scanCentralReducer.activated,
	demo_mode_time: state.scanCentralReducer.demo_mode_time,
	
});


export default connect(mapStateToProps)(SetupCentral);