//Third part libraries
import React, {Component} from 'react'
import SlowBleManager from 'react-native-ble-manager'
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';
import moment from 'moment'
import RNFetchBlob from 'react-native-fetch-blob'

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
  	Modal,
  	Animated
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
	GET_SECURITY_STRING_WITH_EXTRA_BYTE,
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
	BYTES_TO_INT_LITTLE_ENDIANG,
	INT_TO_BYTE_ARRAY,
	CRC16,
	LONG_TO_BYTE_ARRAY,
	FIRMWARE_CENTRAL_ROUTE,
	MODULE_WIEGAND_CENTRAL,
	MODULE_WIEGAND_REMOTE,
	RADIO_FIRMWARE_UPDATE,
    APP_FIRMWARE_UDATE,
    BLUETOOTH_FIRMWARE_UPDATE,
    UNPAIR_STATUS,
    PAIR_STATUS,
    TWO_BYTES_TO_INT,
    LOADING_VALUE
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
	parseSecondsToHumanReadable,
	HVAC_WRITE_COMMAND_WRITE_OUT_RESPONSE,
	INIT_PERIPHERIAL,
	START_RADIO_FIRMWARE_UPDATE,
	WRITING_START_RADIO_UPDATE_COMMAND,
	WRITING_START_APP_UPDATE_COMMAND,
	WRITING_START_BLUETOOTH_UPDATE_COMMAND,
	WRITTED_START_RADIO_UPDATE_COMMAND,
	WRITTED_START_APP_UPDATE_COMMAND,
	WRITTED_START_BLUETOOTH_UPDATE_COMMAND,
	STARTING_WRITING_PAGES,
	STARTING_ROW,
	WRITING_ROW_PICE,
	RETRING_ROW_PIECE,
	ENDING_ROW_PIECE,
	ENDING_RADIO_FIRMWARE_UPDATE,
	ENDING_APP_FIRMWARE_UPDATE,
	START_APP_FIRMWARE_UPDATE,
	START_BLUETOOTH_FIRMWARE_UPDATE,
	FETCHING_RADIO_FIRMWARE_FILE,
	FETCHING_APP_FIRMWARE_FILE,
	FETCHING_BLUETOOTH_FIRMWARE_FILE,
	FETCHED_RADIO_FILE_FETCHED,
	FETCHED_APP_FILE_FETCHED,
	FETCHED_BLUETOOTH_FILE_FETCHED,

} from '../action_creators'

import{
	startFirmwareUpdate,
	fetchFirmwareFile,
	chooseCommand,
	FIRMWARE_LOG_CREATOR,

} from '../action_creators/firmware_update'


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
	PhoneCmd_GetRegistration ,
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
	PhoneRsp_LedsEnabled,
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
	PhoneRsp_RadioSettings,
	PhoneCmd_SetLedsEnabled,
	PhoneRsp_FailSafeOption,
	PhoneCmd_SetFailSafeOption,
	PhoneCmd_RadioStartFirmwareUpdate,
	PhoneCmd_RadioStartRow,
	PhoneCmd_RadioRowPiece,
	PhoneCmd_RadioEndRow,
	PhoneCmd_RadioFinishFirmwareUpdate,
	PhoneCmd_AppStartFirmwareUpdate,
	PhoneCmd_AppStartRow,
	PhoneCmd_AppRowPiece,
	bridgeResponseStrings,
	PhoneRsp_HeartbeatTime,
	PhoneCmd_SetHeartbeatTime,
	PhoneCmd_GetHeartbeatTime,
	PhoneCmd_StartBleBootloader,
	PhoneCmd_AppEndRow,
	PhoneCmd_AppFinishFirmwareUpdate,
	PhoneCmd_ResetApplication,
	PhoneCmd_SetWiegandLedMode,
	PhoneCmd_GetPairResult,
	PhoneCmd_GetUnpairResult,
	PhoneRsp_UnpairResult,
	PhoneRsp_PairResult,
    PhoneRsp_DebugModeEnabled,
	PhoneCmd_GetVoltageLevels
    
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

import {
	finishRadioFirmwareUpdate,
	finishAppFirmwareUpdate,
	finishBluetoothFirmwareUpdate,
	startBluetoothFirmwareUpdate,
	endDeployDisconnect,
	initDeployDisconnect
} from './animations'


import {BleManager as FastBleManager} from 'react-native-ble-plx';
import {WhiteRowLink,WhiteRowInfoLink} from '../helpers/white_row_link'
import {PIC_VERSIONS} from './pic_versions'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const BluetoothModule = NativeModules.BluetoothModule
const MAX_NUMBER_OF_RETRIES = 5
var connection_interval = 0;
var second_interval = 0;
var general_interval = 0;
var getAllEventActivate = false;
var scanning_status_interval = 0
var get_update_radio_status_inteval = 0
var get_app_version_interval = 0
const NUMBER_OF_ROW_RETRIES = 5
const NUMBER_OF_WRITES_RETRIES = 5

const FIRMWARE_UPDATE_AVAIBLE  = 0
const UPDATING_FIRMWARE = 1
const FINISHING_FIRMWARE_UDAPTE = 2
const SYSTEM_UPDATED = 3

const eraseInterval = () => {
		
	if(connection_interval){
		clearInterval(connection_interval)
		connection_interval = 0
	}else{
		console.log("interval was clear previously")
	}	
}


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
		this.hardware_type = props.device.manufactured_data.hardware_type
		this.manufactured_device_id = props.device.manufactured_data
		this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this)
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.getAllCommandsEvent = this.getAllCommandsEvent.bind(this)
		this.handleConnectedDevice = this.handleConnectedDevice.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this)
        this.dfuCompletedEvent = this.dfuCompletedEvent.bind(this);
        this.updateGraph = this.updateGraph.bind(this)		
        this.handleOnDFUAborted = this.handleOnDFUAborted.bind(this)
        this.handleOnDFUError =	this.handleOnDFUError.bind(this)
		this.fast_manager = new FastBleManager()
		this.devices_found = []
		this.is_in = false
		this.changing_time = false
		this.page_count = 0 // firmware update page count
		this.bytes_arrays = []
		this.current_page = []
	}


    updateGraph(data){
        var {dispatch} = this.props;
        dispatch({type: "CHANGE_PROGRESS", new_progress: (data.percent * 0.01)})
        dispatch({type: "SET_FILLING_PORCENTAGE", filling_porcentage: (data.percent * 0.01)})
    }

    dfuCompletedEvent(data){
    	console.log("dfuCompletedEvent()")
		finishBluetoothFirmwareUpdate()
        this.deleteScanningInterval()
        this.props.dispatch({type: "SET_FIRMWARE_UPDATE_DISCONNECT",firmware_update_disconnect:false})
        setTimeout(() => this.deployConnection(),2000)
    }   

	onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
		console.log("onNavigatorEvent()",event.id)
        switch(event.id){
            case "pin_number":
                this.showPINModal()
            break
            case "backPress":
                endDeployDisconnect()
        		eraseInterval()

        	
        		this.props.dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect: false})
            	this.props.dispatch({type:"SHOW_GOING_BACK_SCREEN",show_going_back_screen:true})
            	this.props.dispatch({type:"SET_ON_BACK_DISCONNECT",on_back_disconnect:true})	 

            	this.fast_manager.stopDeviceScan()

				this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: false})
				
				this.props.showCamera()

				this.changing_time = true

				this.disconnect() // don't chante this order (disconnect() and removeListeners()) or the device won't disconnect
            
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

		this.deployConnection()

		MAX_NUMBER_OF_RETRIES = 5
    }

    componentWillUnmount(){
    	this.props.dispatch({type:"SHOW_GOING_BACK_SCREEN",show_going_back_screen:false})
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
		
		this.discoverPeripheral = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
        this.completedEvent = bleManagerEmitter.addListener("DFUCompletedEvent",this.dfuCompletedEvent)
        this.uGraph = bleManagerEmitter.addListener("DFUUpdateGraph",this.updateGraph)
        this.onDFUAborted = bleManagerEmitter.addListener("DFUOnDfuAborted",this.handleOnDFUAborted)
        this.onDFUError = bleManagerEmitter.addListener("DFUOnError",this.handleOnDFUError)
	}

	removeListeners(){
		console.log("removeListenerss()")
		this.removeHandleCharacteristic()
		this.removeHandleConnectDevice()
		this.removeHandleDisconnectedPeripheral()
		this.removeGetAllCommandsListener()
        this.discoverPeripheral.remove()
        this.completedEvent.remove()
        this.uGraph.remove()		
	}

	disconnect(){
		console.log("disconnect() -------")
		this.fast_manager.stopDeviceScan()

		IS_CONNECTED(this.device.id)
		.then(response => {
			if(response){
				SlowBleManager.disconnect(this.device.id)
				.then(response => {
				}).catch(error => console.log("error",error))
			}else{
				this.props.navigator.pop()
				this.handleDisconnected()
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
		this.setBridgeStatus(UNPAIR_STATUS)
		this.writeUnpair()

    }

    writeUnpair(){
    	var unpair = 0
    	this.write([PhoneCmd_Unpair,unpair])
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
		//console.log("activateHandleCharacteristic()",this.props.handleCharacteristic)
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
		//console.log("activateHandleConnectDevice()",this.props.handleConnected)
		if(this.props.handleConnected){
			console.log("Handle connected device its already active")
		}else{
			this.props.dispatch({type:"SET_HANDLE_CONNECT",handleConnected:true})
			this.handleConnected = bleManagerEmitter.addListener('BleManagerConnectPeripheral',this.handleConnectedDevice)
		}
	}

	removeHandleConnectDevice(){
		//console.log("removeHandleConnectDevice()",this.props.handleConnected)
		if(this.props.handleConnected){
			this.props.dispatch({type:"SET_HANDLE_CONNECT",handleConnected:false})
			this.handleConnected.remove()	
		}else{
			console.log("Handle disconnect was remove previosly")
		}
	}

	activateHandleDisconnectedPeripheral(){
		//console.log("activateHandleDisconnectedPeripheral()",this.props.handleDisconnected)
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

	async deployConnection(){
		console.log("deployConnection()")

		var device = this.props.device
			
		if(device){
			const manufactured_data_status = device.manufactured_data.device_state 
			const status = this.getDeviceStatus()

			
			this.setBridgeStatus(status)

			if(status == PAIR_STATUS){
				this.renderConnectingStatus()
			}else if(status == UNPAIR_STATUS){
				this.renderNormalConnecting()
			}

			let is_connected = await IS_CONNECTED(device.id)
			

			if(is_connected){
				this.handleConnectedDevice()
			}else{
				initDeployDisconnect()
				
				console.log("connection_interval",connection_interval)

				if(connection_interval == 0){
					connection_interval = setInterval(() => this.connect(device),1000)
				}else{
					console.log("the connection_interval can't be created it was created previosly")
				}
			}
		}else{
			console.log("Error","Device not found.")
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

	connect(){
		const device = this.device
		
		var data = GET_SECURITY_STRING_WITH_EXTRA_BYTE(device.manufactured_data.device_id,device.manufactured_data.tx,device.manufactured_data.extra_byte)
		
		var device_type = parseInt(this.hardware_type)
		
		SlowBleManager.controllHVACConnect(device.id,data,device_type,device.manufactured_data.device_id,device.manufactured_data.tx)
		.then(response => console.log("response connect()",response))
		.catch(error => {
			console.log("error on connect()",error)
			clearInterval(connection_interval)
			this.setConnectionEstablished()
			this.renderConnectedStatus()
		} )
	}

    handleConnectedDevice(){
    	console.log("handleConnectedDevice()")
    	if(this.props.current_screen != "ModuleOperatingValues"){
    		LOG_INFO([0xA1],CONNECTED,this.device.manufactured_data.device_id) // 0xA1 ITS DEFINED ON commands.js

	    	SlowBleManager.startHVACNotifications(this.device.id);
	    	this.status_on_bridge = this.props.bridge_status
			eraseInterval()
		
			if(this.props.firmware_update_status != UPDATING_FIRMWARE)
				this.setConnectionEstablished(this.props.device)

    	}else{
    		//when the user is watching the operating values screen, the bridge will disconnected, this would be handle on handleDisconnected and it will connected againg,then we need update the operating values 
		    var send_notifications = true
			this.getOperatingValues(send_notifications)
    	}	
    }

	deployConnected(){
		console.log("deployConnected()")
		let device = this.device
		var id = device.id
		var data = GET_SECURITY_STRING_WITH_EXTRA_BYTE(device.manufactured_data.device_id,device.manufactured_data.tx,device.manufactured_data.extra_byte)
		if(this.props.setConnectionEstablished){
	        	this.setConnectionEstablished(device)
		}else{
		    SlowBleManager.write(id,SUREFI_SEC_SERVICE_UUID,SUREFI_SEC_HASH_UUID,data,20).then(response => {
	        	this.setConnectionEstablished()
	        }).catch(error => {
	        	console.log("Error",error)
	        })			
		}
	}

    setBridgeStatus(bridge_status){
    	console.log("setBridgeStatus()",bridge_status)
    	this.props.dispatch({type: "SET_BRIDGE_STATUS",bridge_status: bridge_status})
    }

	setConnectionEstablished(){
    	console.log("setConnectionEstablished()")
    	this.props.dispatch({type:"SET_CONNECTION_ESTABLISHED",connection_established:true})
    	
    	this.renderConnectedStatus()
    	eraseInterval()
    	
		if(this.props.pair_disconnect || this.props.unpair_disconnect){
			
    		if(this.props.pair_disconnect){

    			this.props.dispatch({type:"SET_PAIR_DISCONNECT",pair_disconnect: false})
    			this.writePairResult(this.device)

    		}else{

    			this.props.dispatch({type:"SET_UNPAIR_DISCONNECT",unpair_disconnect:false})
    			this.writeUnpairResult(this.device)

    		}
    	}
    	var state = this.getDeviceStatus()

    	this.setBridgeStatus(state)

    	this.props.dispatch({type: "SHOW_DISCONNECT_NOTIFICATION",show_disconnect_notification: true})
    	endDeployDisconnect()
    	

    	this.changing_time = false
    	if(this.isCentral()){
    		this.getAllInfo()
    	}else{
    		this.cleanPossibleDirtyValues()
    		this.readStatusOnDevice(this.device)	
    	}
    }


    getDeviceStatus(){
    	var status = this.props.device.manufactured_data.device_state
    	if(!status){
    		status = this.props.bridge_status
    	}
    	return status
    }


    cleanPossibleDirtyValues(){
    	this.updateHeartBeat([0,0,0,0,0])
    }

	readStatusOnDevice(device){
		console.log("readStatusOnDevice()",device.id);
		SlowBleManager.getHVACDeviceStatus(device.id).then(response => {
			
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
		SlowBleManager.read(this.device.id,HVAC_SUREFI_THERMOSTAT_SERVICE,RX_DATA_CHAR_SHORT_UUID).then(response => {
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
    			this.setBridgeStatus(current_status_on_bridge)
    		}

		}else{
			this.setBridgeStatus(current_status_on_bridge)
		}

    	this.clearGeneralInterval()
    	this.getAllInfo()
    }

 handleDisconnectedPeripheral(info){
    	
        var {props} = this
    	console.log("handleDisconnectedPeripheral()",
    		props.pair_disconnect,
    		props.unpair_disconnect,
    		props.manual_disconnect,
    		props.deploy_disconnect,
    		props.firmware_update_disconnect,
    		props.on_back_disconnect
    	)

    	props.dispatch({type:"SET_CONNECTION_ESTABLISHED",connection_established:false})
    	
    	LOG_INFO([0xA2],DISCONNECTED,props.device.manufactured_data.device_id)

    	if(props.pair_disconnect || props.unpair_disconnect){
    		console.log("entra aqui - 1");
    		this.renderNormalConnecting()
    		setTimeout(() => this.deployConnection(this.device),2000)
	
    	}else if(props.manual_disconnect){
    		console.log("this.props.firmware_update_status",this.props.firmware_update_status)
    		if(this.props.firmware_update_status == UPDATING_FIRMWARE){
    			this.deployConnection()
    		}

		}else if(props.deploy_disconnect){
			
			console.log("entra aqui 4 - deploy");

    	}else if(props.firmware_update_disconnect){
    		this.deployConnection()

    	}else if (props.on_back_disconnect){
				
				props.createScanInterval()
				this.removeListeners()
				setTimeout(() => props.navigator.pop(),1000)

    	}else{
    		console.log("this.props.current_screen",this.props.current_screen)
    		if(this.props.current_screen == "ModuleOperatingValues"){
    			this.connect()
    		}else{
				props.navigator.screenIsCurrentlyVisible().then(response => {
	    			console.log("response",response)
	    			if(!response){
	    				props.navigator.pop()
	    			}    			
	    		})

	    		if(props.show_disconnect_notification){
	    			props.navigator.screenIsCurrentlyVisible().then(response => {
	    				if(!response){
	    					Alert.alert("Alert","Bluetooth Device Disconnect.")
	    				}
	    			})
	    		}

				props.dispatch({
					type : "DISCONNECT_CENTRAL_DEVICE"
				})    

				this.deployConnection(this.device)
    		}
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
		console.log("setCorrectStatusToDevice",status_on_bridge)
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
				this.setBridgeStatus(0XEE)
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
    			this.setBridgeStatus(0XEE)
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
    			this.setBridgeStatus(0XEE)
    		break
    	}    	
    }

    handleDeployedFail(expected_status){ // device_state 4
    	switch(expected_status){
    		case 1:
    			this.setForceUnPairOption()
    		break
    		
    		case 3: //this shouldn never happend because you can't undeploy
    			this.setBridgeStatus(4)
    			//Alert.alert("Error","The expected status its 3 and the current status on the bridge its 4" )
    		break
    		default: //this shouldnt never happend
    			this.setBridgeStatus(0XEE)
    		break
    	}
    }

    setForcePairOption(){
    	this.setBridgeStatus(0xE0)
    }

    setForceDeployOption(){
    	this.setBridgeStatus(0xE1)
    }

    setForceUnPairOption(){
    	this.setBridgeStatus(0xE2)
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
		var current_version = BYTES_TO_HEX([values[3],values[2],values[1],values[0]]).toString().toUpperCase()
		//console.log("current_version()",current_version)
		return current_version
	}

	getCorrectStringVerison(current_version){
		console.log("getCorrectStringVerison()",current_version)
		var versions = new Map(PIC_VERSIONS) 
		var app_board_version = versions.get(current_version)
		console.log("app_board_version()",app_board_version)
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

	isCentral(){
		//console.log("isCentral()")
		if(this.hardware_type == MODULE_WIEGAND_CENTRAL || this.hardware_type == parseInt(MODULE_WIEGAND_CENTRAL))
			return true

		return false
	}

	isRemote(){
		//console.log("isRemote()")
		if(this.hardware_type == MODULE_WIEGAND_REMOTE || this.hardware_type == parseInt(MODULE_WIEGAND_REMOTE))
			return true
		return false
	}

	parseInfo(values){
		let info = {
			version : LOADING_VALUE,
			build_number : "",
			pic_number: LOADING_VALUE
		}

		if(values.length > 10){
			info = {}
			info.version = PRETY_VERSION(parseFloat(values[0]) + "." + parseFloat(values[1])) 
			info.build_number = parseInt(BYTES_TO_HEX([values[2],values[3]].reverse()),16) 
			info.pic_number = this.getCorrectHexVersion(values.slice(6,10)) 
		}

		return info
	}


	renderInfo(){

		let user_type = this.props.user_data ?  this.props.user_data.user_type : false
		
		let app_info = this.parseInfo(this.props.app_info)
		let radio_info = this.parseInfo(this.props.radio_info)
		let bluetooth_info = this.props.bluetooth_info 
		const spreading_factor = this.props.spreading_factor ? this.props.spreading_factor : LOADING_VALUE
		const band_width = this.props.band_width ? this.props.band_width : LOADING_VALUE
		const power = this.props.power ? this.props.power : LOADING_VALUE
		const hopping_table = this.props.hopping_table ? this.props.hopping_table : LOADING_VALUE

		let show_loading_values = true
		bluetooth_version = 0.0
		bluetooth_build_number = 0.0

		if(bluetooth_info.length > 3){
			bluetooth_version = parseFloat(bluetooth_info[0].toString() + "." + bluetooth_info[1].toString())
			bluetooth_build_number = parseInt(BYTES_TO_HEX([bluetooth_info[2],bluetooth_info[3]].reverse()),16) 
		}

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
						<WhiteRow name="Application" value={app_info.version   + " (" + app_info.build_number  + ")"}/>
						{this.isRemote() && <WhiteRow name="Radio" value={radio_info.version   + " (" + radio_info.build_number  + ")"}/>}
						<WhiteRow name="Bluetooth" value ={bluetooth_version   + " (" + bluetooth_build_number  + ")"}/>
					</View>
					<View>
						<View style={styles.device_control_title_container}>
							<Text style={{color:"gray",fontSize:20,marginVertical:5}}>
								RADIO SETTINGS
							</Text>
						</View>
						<WhiteRow name="Spreading Factor" value ={spreading_factor}/>
						<WhiteRow name="Bandwidth" value ={band_width}/>
						<WhiteRow name="Hopping table" value ={hopping_table}/>

					</View>
										
				</View>
			)
		else
			var admin_values = null
			const power_voltage = this.props.power_voltage ? this.props.power_voltage + " volts" : LOADING_VALUE
			const battery_voltage = this.props.battery_voltage ? this.props.battery_voltage + " volts" : LOADING_VALUE

			return (
				<View style={{alignItems:"center"}}>
					{admin_values}
					<View>
						<View style={styles.device_control_title_container}>
							<Text style={styles.device_control_title}>
								POWER VALUES
							</Text>
						</View>
						<WhiteRow name="Power Voltage" value={power_voltage}/>
						<WhiteRow name="Battery Voltage" value={battery_voltage}/>
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
		let name = "Set Demo Time (" + parseSecondsToHumanReadable(this.props.demo_mode_time)+ ")";
		let run_time_name = "Set Run Time (" + parseSecondsToHumanReadable(this.props.run_time)+ ")"; 
		let activated_name = this.props.activated[0] ? "Deactivate" : "Activate"
		let activated_value = this.props.activated[0] ? 0 : 1
		//console.log("this.props.debug_mode_status",this.props.debug_mode_status)
		

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
			goToPair={() => this.goToPair()}
			goToDeploy={() => this.goToDeploy()}
			goToFirmwareUpdate={() => this.goToFirmwareUpdate()}
			goToConfigureRadio={() => this.goToConfigureRadio()}
			goToForcePair={() => this.goToForcePair()}
			goToInstructionalVideos = {() => this.goToInstructionalVideos()}
			goToOperationValues = {(activate_operating_values_wait) => this.goToOperationValues(activate_operating_values_wait)}
			device_status = {this.props.central_device_status}
			deployConnection = {(device) => this.deployConnection(device)}
			getCloudStatus = {(device) => this.getCloudStatus(device)}
			goToConfiguration = {() => this.goToConfiguration()}
			goToChat={() => this.goToChat()}
			goToDocumentation = {() => this.goToDocumentation()}
			activateHandleCharacteristic = {() => this.activateHandleCharacteristic()}
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

	setActivateLed(value){
		console.log("setActivateLed()",value)
		var data = [PhoneCmd_SetLedsEnabled].concat(value)
		this.write(data)
		setTimeout(() => this.getActivatedLed(),2000)
	}




	setFailSafeOption(value){
		console.log("setFailSafeOption()",value)
		if(value){
			var data = [PhoneCmd_SetFailSafeOption].concat(value)
			this.write(data)
			setTimeout(() => this.getFailSafeOption(),2000)			
		}else{
			console.log("Error","The value on setFailSafeOption is null.")
		}
	}

	setHeartbeat(value){
		console.log("setHeartbeat",value)
		if(value){
			var data = [PhoneCmd_SetHeartbeatTime].concat(value)
			this.write(data)
			setTimeout(() => this.getHeartBeatTime(),2000)
		}else{
			Alert.alert("Error","The Heartbeat value")
		}
	}

	getHeartBeatTime(){
		console.log("getHeartBeatTime()")
		this.write([PhoneCmd_GetHeartbeatTime])
	}

	getFailSafeOption(){
		console.log("getFailSafeOption()")
		this.write([PhoneCmd_GetFailSafeOption])
	}

	getRadioUpdateStatus(){
		console.log("getRadioUpdateStatus()")
		console.log("get_update_radio_status_inteval",get_update_radio_status_inteval)
		this.write([PhoneCmd_GetRadioUpdateStatus])
	}

	getActivatedLed(){
		console.log("getActivatedLed()")
		this.write([PhoneCmd_GetLedsEnabled])
	}

	write(data){
		//console.log("write()",prettyBytesToHex(data))
		HVAC_WRITE_COMMAND(this.device.id,data)
		.then(response => {

		})
		.catch(error => {
			console.log("error",error)
			if(Array.isArray(error)){
				if(error.length > 2){
					if(this.props.firmware_update_status == UPDATING_FIRMWARE){
						if(NUMBER_OF_WRITES_RETRIES > 0){
							NUMBER_OF_WRITES_RETRIES = NUMBER_OF_WRITES_RETRIES - 1
							this.write(this.device.id,data)
						}
					}									
				}
			}
		})
	}

	setActivate(value){
		console.log("setActivate()",value)
		var data = [PhoneCmd_SetActivated,value]
		this.write(data)
		setTimeout(() => this.getActivated(),2000)
	}


	/* --------------------------------------------------------------------------------------------------- Go To Seccion ---------------------------------------------------------------*/

	goToPair(){
		
		this.fast_manager.stopDeviceScan()
		this.props.navigator.push(
			{
			screen:"ModulePair",
				title : "Pair Wiegand Sure-Fi",
				passProps:{
					readStatusOnDevice : (device) => this.readStatusOnDevice(device),
					getCloudStatus : (device) => this.getCloudStatus(device),
					searchPairedUnit : (device) => this.searchPairedUnit(device),
					saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
					isCentral: () => this.isCentral(),
					isRemote: () => this.isRemote(),
					setBridgeStatus: (value) => this.setBridgeStatus(value)
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
		let user_type = this.props.user_data ?  this.props.user_data.user_type : false
		//console.log("getOptions()",this.props.indicatorNumber,this.props.user_data);
		var admin_options = ["SYS_ADMIN","PROD_ADMIN","CLIENT_DEV"]


		if(admin_options.lastIndexOf(user_type) !== -1){
		//if(true){
			this.props.navigator.push({
				screen: "HVACFirmwareUpdate",
				title : "Firmware Update",
				rightButtons: [
		            {
		                title: 'Advanced', // for a textual button, provide the button title (label)
		                id: 'advanced', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
		            },
		        ],
		        passProps: {
		        	startFirmwareUpdate: type => this.startFirmwareUpdate(type),
		        	animated: false,
		        	admin : true
		        	//device : this.device
		        }
			})			
		}else{
			this.props.navigator.push({
				screen: "HVACFirmwareUpdate",
				title : "Firmware Update",
				animated: false,
				passProps: {
		        	startFirmwareUpdate: type => this.startFirmwareUpdate(type),
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
					getHoppingTable:  () => this.getHoppingTable(),
					getRadioSettings: () => this.getRadioSettings(),
					setFailSafeOption: (values) => this.setFailSafeOption(values),
					setActivateLed: (values) => this.setActivateLed(values)
				},
				navigatorButtons : {
					rightButtons: [
					  {
					    title: 'Update',
					    id: 'update',
					    color:"red",
					    buttonColor: "white"
					  }
					]
				}				
			}
		)
	}

	goToConfiguration(){
		console.log("goToConfiguration()");
		this.getActivatedLed()
		if(this.isRemote()){
			setTimeout(() => this.getFailSafeOption(),1000)	
		}

		this.props.navigator.push({
			screen: "ModuleConfiguration",
			title: "Configuration",
			animated: false,
			passProps: {
				saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
				updateLedsEnabled: values => this.updateLedsEnabled(values),
				updateFailSafeOption: values => this.updateFailSafeOption(values),
				updateSliderValue: () => this.updateSliderValue(),
				setFailSafeOption: (value) => this.setFailSafeOption(value),
				write: values => this.write(values),
				isRemote : () => this.isRemote(),
				isCentral : () => this.isCentral(),
				setActivateLed: (values) => this.setActivateLed(values),
				setHeartbeat: (values) => this.setHeartbeat(values),
				updateHeartBeat: (values) => this.updateHeartBeat(values)
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
		var to_subscribe = true

		this.getOperatingValues(to_subscribe)

		this.props.navigator.push({
			screen : "ModuleOperatingValues",
			title : "Operating Values",
			animated: false,
			passProps: {
				getOperatingValues : () => this.getOperatingValues(),
				getPowerOnTime: () => this.getPowerOnTime(),
				saveOnCloudLog : (bytes,type) => this.saveOnCloudLog(bytes,type),
				isRemote: () => this.isRemote(),
				isCentral: () => this.isCentral(),
			}			
		})
	}

	getLastPackageTime(){
		//console.log("getLastPackageTime()")
		if(this.isRemote()){
			var data = [PhoneCmd_GetLastPacketTime]
			this.write(data)
		}else if(this.isCentral()){
			if(this.props.pairing_info.length > 0){				

				var pair_info = this.props.pairing_info
				var pair_status = pair_info.slice(0,1)
				var number_pairs = pair_info.slice(1,2)
				var equipment_pairs = pair_info.slice(2,pair_info.length)
				let equipments_ids = []

				for(let i = 0; i < number_pairs; i++){
					var first = i * 3
					var second = (i * 3) + 1
					var third = (i * 3) + 2
					var id = [equipment_pairs[first],equipment_pairs[second],equipment_pairs[third]]

					this.props.dispatch({
						type:"SET_LAST_PACKAGE_TIME_THERMOSTAT",
						last_package_time_thermostat: []
					})	 
					equipments_ids.push(id)
				}
				
				this.props.dispatch({type: "SET_EQUIPMENTS_PAIRED_WITH",equipments_paired_with: equipments_ids})

				var data = [PhoneCmd_GetLastPacketTime]
				this.write(data)

			}else{
				console.log("Error","Can't get last packet time to the termostat because there are not pairing_info")
			}
		}else{
			console.log("Error","Error on getLastaPackageTime")
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

	/*
	* values is a 11 length array, it has the next structure
	* 1 byte to mayor version, 1 byte to minor version
	* 2 bytes to the build number
	* 1 byte to the hardware major number
	* 1 byte to the hardware 
	* 4 bytes to the App pic version
	* 1 byte to the revision
	*/
	updateAppVersion(values){
		//this.saveOnCloudLog(values,"APPFIRMWARE")
		console.log("updateAppVersion",values)
		
		if(values.length > 1){
			this.props.dispatch({type: "SET_APP_INFO",app_info : values})
			
			var pic_version = values.slice(6,10)
			console.log("pic version",pic_version)
			
			this.updateAppPicVersion(pic_version)

			if(this.props.app_firmware_update_on_course){
				
				this.props.dispatch({type: "SET_APP_FIRMWARE_UPDATE_ON_COURSE",app_firmware_update_on_course: false})

				this.deleteGetAppVersionInterval()
				finishAppFirmwareUpdate()

				startBluetoothFirmwareUpdate()
				this.props.dispatch({type: "SET_FIRMWARE_UPDATE_DISCONNECT",firmware_update_disconnect: true})
				this.startFirmwareUpdate(BLUETOOTH_FIRMWARE_UPDATE)
			}
		}
	}

	updateAppPicVersion(values){
		console.log("updateAppPicVersion()",values)
		if(values.length > 3){					
			
			this.app_hex_board_version = this.getCorrectHexVersion(values)
			let app_board_version = this.getCorrectStringVerison(this.app_hex_board_version)
			this.props.dispatch({type: "SET_APP_BOARD",app_board_version: app_board_version})

		}else{
			Alert.alert("Error","Something is wrong with the app pic version values.")
		}		
	}





	updateRadioVersion(values){
		console.log("updateRadioVersion()",values)
		if(values.length > 1){
			this.props.dispatch({type: "SET_RADIO_INFO",radio_info : values})
			this.updateRadioPicVersion(values.slice(6,10))
		}
	}


	updateRadioPicVersion(values){
		console.log("updateRadioPicVersion()",values)
		if(values.length > 3){
			
			this.radio_hex_board_version = this.getCorrectHexVersion(values)
			let radio_board_version = this.getCorrectStringVerison(this.radio_hex_board_version)
			this.props.dispatch({type: "SET_RADIO_BOARD",radio_board_version: radio_board_version})

		}else{
			Alert.alert("Error","Something is wrong with the radio pic version values.")
		}		
	}
	
	updateBluetoothVersion(values){
		console.log("updateBluetoothVersion()",values)
		
		this.props.dispatch({type: "SET_BLUETOOTH_INFO",bluetooth_info : values })
	}

	updateRegistration(values){
		//console.log("updateRegistration()",values)
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
			console.log("Error!","Update registration can't be finished, the format isn't correct.")
		}
	}

	updateLastPackageTime(values){
		//console.log("updateLastPackageTime",values)
		if(this.isRemote()){
			this.props.dispatch({
				type:"SET_LAST_PACKAGE_TIME",
				last_package_time : values
			})			
		}else if(this.isCentral()){
			var last_package_time_thermostat = this.props.last_package_time_thermostat
			var id = values.slice(0,3)
			var time = values.slice(3,7)
			last_package_time_thermostat.push([id,time])

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
		//console.log("updateRadioSettings()",values)
		this.props.dispatch(
			{
				type: "SET_RADIO_SETTINGS_HVAC",
				radio_settings: values
			}
		)		
	}

	updateVoltage(values){
		//console.log("updateVoltage()",values)
		//this.saveOnCloudLog(values,"POWERLEVELS")
		let v1 = parseInt( BYTES_TO_HEX( [values[0] , values[1] ].reverse() ),16)
		let v2 = parseInt( BYTES_TO_HEX(  [values[8] , values[9] ].reverse() ),16)

		let power_voltage = CALCULATE_VOLTAGE(v1).toFixed(2)
		let battery_voltage = CALCULATE_VOLTAGE(v2).toFixed(2) 

		this.props.dispatch({type : "UPDATE_POWER_VALUES",battery_voltage: battery_voltage, power_voltage : power_voltage})
		this.props.dispatch({type: "OPTIONS_LOADED",options_loaded: true})		
		
	}

	updateRegisterBoard1(values){
		//console.log("updateRegisterBoard1()")
		let register_board_1 = stringFromUTF8Array(values) 
		

		this.props.dispatch({type: "SET_REGISTER_BOARD_1",register_board_1: register_board_1})		
	}

	updateRegisterBoard2(values){
		//console.log("updateRegisterBoard2()")
		let register_board_2 = stringFromUTF8Array(values) 
		this.props.dispatch({type: "SET_REGISTER_BOARD_2",register_board_2: register_board_2})		
	}

	updateHoppingTable(values){
		
		
	}

	updateHoppingTable(values){
		console.log("updateHoppingTable()",values)
		this.props.dispatch({"type" : "SET_HOPPING_TABLE",hopping_table: values})
		
		var selectedDeviceHoppingTable = values[0]
		selectedDeviceHoppingTable = parseInt(selectedDeviceHoppingTable,16)
		
		this.selectHoppingTable(selectedDeviceHoppingTable,values[0])

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

        option = option % 3

        switch (option) {

	        case 0:

	            selectedDeviceSF = "SF11"

	            selectedDeviceBandwidth = "500 kHz"

	            break

	        case 1:

	            selectedDeviceSF = "SF10"

	            selectedDeviceBandwidth = "250 kHz"

	            break

	        default:

	            selectedDeviceSF = "SF9"
	            selectedDeviceBandwidth = "125 kHz"
	            break
        }

        this.props.dispatch({type: "UPDATE_HOPPING_TABLE",hopping_table:normal_hopping_table})
        this.props.dispatch({type: "UPDATE_SPREADING_FACTOR",spreading_factor:selectedDeviceSF})
        this.props.dispatch({type: "UPDATE_BAND_WIDTH",band_width:selectedDeviceBandwidth})
	}


	updateLedsEnabled(values){
		console.log("updateLedsEnabled()",values)
		this.props.dispatch({type: "SET_ACTIVATED_LED",activated_led: values})
	}

	updateFailSafeOption(values){
		console.log("updateFailSafeOption()",values)
		this.props.dispatch({type: "SET_FAIL_SAFE_OPTION",fail_safe_option: values})
	}

	updateHeartBeat(values){
		//console.log("updateHeartBeat()",values)
		this.props.dispatch({type: "SET_HEART_BEAT",heart_beat: values})	
	}

	updateDebugModeStatus(values){
		console.log("updateDebugModeStatus()",values)
		if(values[0]){
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: true})
		}else{
			this.props.dispatch({type: "SET_DEBUG_MODE_STATUS",debug_mode_status: false})
		}		
	}

	updateRunTime(values){
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

	updateRadioUpdateStatus(values){
		console.log("updateRadioUpdateStatus()",values)

		this.props.dispatch({type: "SET_RADIO_UPDATE_STATUS",radio_update_status: values})

		if(values.length > 7){
			let current_progress = BYTES_TO_INT_LITTLE_ENDIANG(values.slice(0,4))
			let total_progress = BYTES_TO_INT_LITTLE_ENDIANG(values.slice(4,8))
			
			if(current_progress == 0 && total_progress == 0){
				this.deleteGetUpdateRadioStatusInterval()
				finishRadioFirmwareUpdate()
				this.startFirmwareUpdate(APP_FIRMWARE_UDATE)
			}
		}
	}

	async startFirmwareUpdate(firmware_type){
		console.log("startFirmwareUpdate",firmware_type)

	    if((firmware_type == RADIO_FIRMWARE_UPDATE) || (firmware_type == APP_FIRMWARE_UDATE) ){
			
	        const response = await startFirmwareUpdate(firmware_type,this.hardware_type)

	        this.initFirmwareUpdate(response.total_bytes,response.bytes_arrays,firmware_type)

	    }else if(firmware_type == BLUETOOTH_FIRMWARE_UPDATE){

	       const response = await startFirmwareUpdate(firmware_type,this.hardware_type)
	       this.filePath = response.path()
	       this.initBluetoothUpdate()
	    } 			
	}

    initBluetoothUpdate(byteCharacters){
        initDeployDisconnect()
		this.props.dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect: false})
        this.writeDFUCommand()
        this.searchDevices()        
    }

    searchDevices(){
        this.createScanningInterval()
        setTimeout(() => {
            this.scanning_status = "stopped"
            this.deleteScanningInterval()
        },60000)
    }

    createScanningInterval(){
        console.log("createScanningInterval()")
        if(scanning_status_interval == 0){
            this.scanning_status = "scanning"
            scanning_status_interval = setInterval(() => {
                this.scan()              
            } , 5000)  

        }else{
            console.log("Error","The scanning_status_interval is already set.")
        }
    }

    deleteScanningInterval(){
        clearInterval(scanning_status_interval)
        scanning_status_interval = 0
    }    

    scan(){
        console.log("scan()")
        SlowBleManager.scan([], 3, true).then(() => {
        })        
    }

    handleDiscoverPeripheral(device){

        this.dfu_device = device;
        if(device.name){
        	
            if (device.name.toUpperCase().indexOf("DFUTA") !== -1){
        				
                let short_id = this.device.manufactured_data.device_id.substring(2,6)

                //console.log("this.device",this.device)

                this.DFUDeviceFound(device)
                
            }
        }
    }

    DFUDeviceFound(device){
        if(scanning_status_interval){
            if(this.scanning_status != "stopped"){
                this.scanning_status = "stopped"; //just should be in one time
                
                this.deleteScanningInterval()
                endDeployDisconnect()
                
                //this.props.dispatch({type: "START_UPDATE"})
                
                console.log("Founded Device  Name ",device.name.toUpperCase())

                SlowBleManager.stopScan()

                setTimeout(() => BluetoothModule.initService(device.id,device.name.toUpperCase(),this.filePath),2000)
            }
        }
    }

	handleOnDFUAborted(data){
		//console.log("handleOnDFUAborted",data)
	}   

	handleOnDFUError(data){
		//console.log("handleOnDFUError()",data)

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

	createGetUpdateRadioStatusInterval(){
		console.log("createGetUpdateRadioStatusInterval()",)
		if(get_update_radio_status_inteval == 0){
			get_update_radio_status_inteval = setInterval(() => this.getRadioUpdateStatus(),2000);
		}else{
			console.log("Error","get_update_radio_status_inteval was set before")
		}
	}

	deleteGetUpdateRadioStatusInterval(){
		console.log("deleteGetUpdateRadioStatusInterval()",get_update_radio_status_inteval)
		
		if(get_update_radio_status_inteval != 0){
			clearInterval(get_update_radio_status_inteval)
			get_update_radio_status_inteval = 0
		}else{
			console.log("Error","get_update_radio_status_interval was delete before")
		}
	}

	createGetAppVersionInterval(){
		if(get_app_version_interval == 0){
			this.props.dispatch({type: "SET_APP_FIRMWARE_UPDATE_ON_COURSE",app_firmware_update_on_course: true})
			get_app_version_interval = setInterval(() => this.getFirmwareVersion(),2000);
		}else{
			console.log("Error","get_app_version_interval was set before")
		}
	}

	deleteGetAppVersionInterval(){
		console.log("deleteGetAppVersionInterval()")
		clearInterval(get_app_version_interval)
		if(get_app_version_interval != 0){
			clearInterval(get_app_version_interval)
			get_app_version_interval = 0
		}else{
			console.log("Error","get_app_version_inteval was delete before")
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

	getAllInfo(){
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

	/*
	* @to_subscribe is variable to activate the notifications, that coming from the operating values
	*/
	getOperatingValues(to_subscribe){
		console.log("getOperatingValues()",to_subscribe);
		var data = [PhoneCmd_GetOperatingValues]
		if(to_subscribe){
			data.push(1)
		}else{
			data.push(0)
		}

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
		console.log("getAllCommandsEvent()",data)
		setTimeout(() => {
			this.checkInitValues()
		},3000)
	}

	checkInitValues(){
		var {
			app_info,
			bluetooth_info,
			registration_info,
			operating_values,
			power_on_time,
			radio_info,
			hopping_table,
			radio_settings,
			activated_led,
			fail_safe_option,
			heart_beat,
			debug_mode_status,
			power_voltage,
		} = this.props
		var commands = []


		if(app_info.length == 0){
			commands.push(PhoneCmd_GetAppVersion)
		}

		if(bluetooth_info.length == 0){
			commands.push(PhoneCmd_GetBluetoothVersion)
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

		if(activated_led.length == 0){
			commands.push(PhoneCmd_GetLedsEnabled)
		}		

		if(debug_mode_status == null){
			commands.push(PhoneCmd_GetDebugModeEnabled)
		}

		if(power_voltage == null){
			commands.push(PhoneCmd_GetVoltageLevels)
		}

		if(this.isRemote()){ // the thermostat isn't support this commands, so we need filter for equiment
			if(radio_info.length == 0){
				commands.push(PhoneRsp_RadioVersion)
			}		
			if(fail_safe_option.length == 0){
				commands.push(PhoneRsp_FailSafeOption)
			}				
		}

		if(this.isCentral()){ // The equipment is not support it this commands so we need filter for thermostat
			if(heart_beat.length == 0){
				commands.push(PhoneRsp_HeartbeatTime)
			}
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
				this.logCommandToCloud(command,value)
			}
		}else{
			Alert.alert("Error","Error getting the value on the notification the notification length is less than 2.")
		}
	}


	logCommandToCloud(command,value){
		let command_name = bridgeResponseStrings.get(command)

		if(command_name){
			var body = LOG_CREATOR(value,this.device.manufactured_data.device_id,this.device.id,command_name)
			POST_LOG(body)
		}else{
			console.log("Error","No name found for the command : 0x" + command.toString(16).toUpperCase())
		}
	}

	handleResponse(command,data){
		//console.log("handleResponse()","Command  0x" + command.toString(16) ,"Data : " + prettyBytesToHex(data))

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

			case PhoneRsp_OperatingValues: //0x26
				this.updateOperatingValues(data)
			break			
			case PhoneRsp_PowerOnTime: //0x2D
				this.updatePowerOnTime(data)
				this.props.dispatch({type:"LOADING_OPERATION_VALUES",loading_operation_values:false})
			break
			case PhoneRsp_PairingInfo: // 2C
				this.updatePairingInfo(data)
				this.getLastPackageTime()
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
			case PhoneRsp_LedsEnabled:
				this.updateLedsEnabled(data)
			break
			case PhoneRsp_FailSafeOption:
				this.updateFailSafeOption(data)
			break
			case PhoneRsp_UartTimeout: //0x82
				Alert.alert("Failure", "PhoneRsp_UartTimeout (" + command.toString(16) + ") data: ( " + prettyBytesToHex(data) + ")")
			break
			case PhoneRsp_VoltageLevels:
				this.updateVoltage(data)
			break
			case PhoneRsp_Success: //0x80
				this.handleSuccess(data)
			break
			case PhoneRsp_HeartbeatTime:
				this.updateHeartBeat(data)
			break
			case PhoneRsp_Failure: //0x81
				var writed_command = data[0]
				var response_code = data[1]
				this.handleFailure(writed_command,response_code)
			break
			case PhoneRsp_RadioUpdateStatus: //0x29
				this.updateRadioUpdateStatus(data)
			break
    
			case PhoneRsp_DebugModeEnabled:
				this.updateDebugModeStatus(data)
			break
			case PhoneRsp_PairResult: //0x45
				const pair_result = data[0]
				if(pair_result){
					Alert.alert("Success","The pair was successfully.")
				}else{
					Alert.alert("Error","The pair process fail, connect to the other Sure-Fi Wiegand to Force Pair.")
				}
			break
			case PhoneRsp_UnpairResult: // 0x47
				const unpair_result = data[0]
				if(unpair_result){
					Alert.alert("Success","The un-pair was successfully.")
				}else{
					Alert.alert("Error","The pair process fail, connect to the other Sure-Fi Wiegand to Force the UnPair.")
				}
			break

			default:
				console.log("No options found to: (" + command.toString(16) + ") with data: (" + prettyBytesToHex(data) + ")");
			break
		}
	}

	handleSuccess(data){
		//console.log("handleSuccess()",data.toString(16))
		if(data == PhoneCmd_RadioStartFirmwareUpdate){
			FIRMWARE_LOG_CREATOR(WRITTED_START_RADIO_UPDATE_COMMAND)
			this.writePages()
		}
		else if(data == PhoneCmd_RadioStartRow){

			this.writeRows()
		}

		else if(data == PhoneCmd_RadioEndRow){
			
			this.page_count++;
			this.writePages()

		}else if(data == PhoneCmd_RadioFinishFirmwareUpdate){ //0x64
			
			setTimeout(() => this.createGetUpdateRadioStatusInterval(),2000)

		}else if(data == PhoneCmd_AppStartFirmwareUpdate){
			FIRMWARE_LOG_CREATOR(WRITTED_START_APP_UPDATE_COMMAND)
			this.writePages()

		}else if(data == PhoneCmd_AppStartRow){

			this.writeRows()

		}else if(data == PhoneCmd_AppEndRow){

			this.page_count++;
			this.writePages()

		}else if(data == PhoneCmd_AppFinishFirmwareUpdate){
			
			this.createGetAppVersionInterval()

		}else if(data == PhoneCmd_SetLedsEnabled){

		}else if(data == PhoneCmd_SetWiegandLedMode){



		}else if(data == PhoneCmd_SetFailSafeOption){

		}else{
			console.log("data",data)
			Alert.alert("Success.","All changes are saved correctly.")
		}

	}

	writeDFUCommand(){
		this.write([PhoneCmd_StartBleBootloader])
	}

	/*
		total_byte_size is a decimal number
		bytes_arrays is an array of 20 bytes arrays -> [ [0x1,0x2,...,0x20],....,[0x01,0x2,....,0x20]] 
	*/
	initFirmwareUpdate(total_byte_size,bytes_arrays,type){
		console.log("initFirmwareUpdate()","total_byte_size: ",total_byte_size)
		let bytes = INT_TO_BYTE_ARRAY(total_byte_size)
		const option_commands = [
			PhoneCmd_AppStartFirmwareUpdate,
			PhoneCmd_RadioStartFirmwareUpdate
		]

		this.firmware_type = type
		this.bytes_arrays = bytes_arrays
		this.total_bytes_length = bytes_arrays.length // we need save this value because this would be our 100 % in order to calculate the porcentage at the app
		this.page_count = 0
		
		const command = chooseCommand(option_commands,this.firmware_type)
		
		if(type == APP_FIRMWARE_UDATE)
			FIRMWARE_LOG_CREATOR(WRITING_START_APP_UPDATE_COMMAND)

		if(type == RADIO_FIRMWARE_UPDATE)
			FIRMWARE_LOG_CREATOR(WRITING_START_RADIO_UPDATE_COMMAND)

		if(command){
			bytes.unshift(command)

			this.write(bytes)	

		}else{
			Alert.alert("Error","Error chossing a command [initFirmwareUpdate()]")
			return;
		}
	}


	/*
	* writePages, take a page from this.byte_arrays and try to writed unless repeat_pages is true, in this case
	* try to write the last column.
	*/
	writePages(repeat_pages){
		
		const porcentage = (this.page_count / this.total_bytes_length)
		this.props.dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage: porcentage})

		
		
		if(this.bytes_arrays.length > 0){
			
			FIRMWARE_LOG_CREATOR(STARTING_WRITING_PAGES,{page_count:this.page_count ,total_pages:this.total_bytes_length})

			if(!repeat_pages)
				this.current_page = this.bytes_arrays.shift() // a write fails, repeat_pages is defined only if the handleFailure method is call
			else{
				NUMBER_OF_ROW_RETRIES = 5 //this means it comes from a success writing
				NUMBER_OF_WRITES_RETRIES = 5
			}
			
			//console.log("NUMBER_OF_ROW_RETRIES",NUMBER_OF_ROW_RETRIES)

			const crc = LONG_TO_BYTE_ARRAY(CRC16(this.current_page)) 
			const page_count = LONG_TO_BYTE_ARRAY(this.page_count)
			const page_size = LONG_TO_BYTE_ARRAY(this.current_page.length)
			const command_options = [PhoneCmd_AppStartRow,PhoneCmd_RadioStartRow]

			if(crc.length > 1){
				let command = chooseCommand(command_options,this.firmware_type) 
				if(command){
					const data = [command,page_count[1],page_count[0],page_size[1],page_size[0],crc[1],crc[0]]
					this.write(data)					
				}else{
					Alert.alert("Error","Error chossing a command [initFirmwareUpdate()]")
					return;
				}
			}else{
				Alert.alert("Error","The crc is incorrect.")
			}
		}else{
			this.endFirmwareUpdate()
		}				
	}

	writeRows(){
		var cut_size = 55
		INIT_PERIPHERIAL(this.device.id)
		const command_options = [PhoneCmd_AppRowPiece,PhoneCmd_RadioRowPiece]
		const command = chooseCommand(command_options,this.firmware_type)
		if(command_options){

			for(var i = 0;i < this.current_page.length ;i += cut_size){
				let piece = this.current_page.slice(i,cut_size + i)

				piece.unshift(command)
				HVAC_WRITE_COMMAND_WRITE_OUT_RESPONSE(piece)
			}

			setTimeout(() => this.endRow(),200)
		}else{
			Alert.alert("Error","Error chossing a command [writeRows()]")
			return;			
		}
	}

	endRow(){
		const command_options = [PhoneCmd_AppEndRow,PhoneCmd_RadioEndRow]
		const command = chooseCommand(command_options,this.firmware_type)
		this.write([command])
	}

	endFirmwareUpdate(){
		const command_options = [PhoneCmd_AppFinishFirmwareUpdate,PhoneCmd_RadioFinishFirmwareUpdate]
		const command = chooseCommand(command_options,this.firmware_type)
		if(this.firmware_type == APP_FIRMWARE_UDATE)
			FIRMWARE_LOG_CREATOR(ENDING_RADIO_FIRMWARE_UPDATE)

		if(this.firmware_type == RADIO_FIRMWARE_UPDATE)
			FIRMWARE_LOG_CREATOR(ENDING_APP_FIRMWARE_UPDATE)

		this.write([command])
	}	

	handleFailure(writed_command,error_code){
		const error_name = this.searchName(error_codes,error_code);
		if(writed_command ==  PhoneCmd_RadioEndRow || writed_command == PhoneCmd_AppEndRow){
			this.tryToResendRowTimes(writed_command,error_name)
		}else{
			Alert.alert("Phone Response Failure","Command 0x" +  writed_command.toString(16) + " | " + error_name)	
		}
	}


	tryToResendRowTimes(writed_command,error_name){
		console.log("tryToResendRowTimes()",NUMBER_OF_ROW_RETRIES)
		var repeat_pages = true;

		if(NUMBER_OF_ROW_RETRIES > 0){
			NUMBER_OF_ROW_RETRIES = NUMBER_OF_ROW_RETRIES - 1;	
			this.writePages(repeat_pages)
		}else{
			Alert.alert("Phone Response Failure","Command 0x" +  writed_command.toString(16) + " | Row failed." )		
		}
	}

	searchName(array,code){
		var name = ""
		array.map((internal_code) => {
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
		console.log("name",name)

		var hardware_type = this.hardware_type
		if(name == "" || name == " " || name == null){
			if(hardware_type == MODULE_WIEGAND_REMOTE || hardware_type == parseInt(MODULE_WIEGAND_REMOTE)){
				return "WIEGAND REMOTE"
			}else if(hardware_type == MODULE_WIEGAND_CENTRAL || hardware_type == parseInt(MODULE_WIEGAND_CENTRAL)){
				return "WIEGAND CONTROLLER"
			}
		}
		return name
	}

	async fetchDeviceName(device_id,remote_device_id){
		console.log("fetchDeviceName()",device_id,remote_device_id);
		var hardware_type = this.hardware_type;
		var body = {
			method: "POST",
			headers: HEADERS_FOR_POST,
			body: JSON.stringify({hardware_serial: device_id})
		}

		const response = await fetch(GET_DEVICE_NAME_ROUTE,body)
		
		var data = JSON.parse(response._bodyInit).data
		var new_name = this.choseNameIfNameNull(data.name)
		
		body.body = JSON.stringify({hardware_serial: remote_device_id})

		const response_remote = await fetch(GET_DEVICE_NAME_ROUTE,body)
		
		var data = JSON.parse(response_remote._bodyInit).data
		let new_name_remote = this.choseNameIfNameNull(data.name)
		
		this.props.dispatch({type: "UPDATE_DEVICE_NAME",device_name : new_name,original_name:new_name})
		this.props.dispatch({type: "UPDATE_REMOTE_DEVICE_NAME",remote_device_name : new_name_remote})
		
	}


	renderWarrantyInformation(){
		//console.log("run_time",this.props.run_time)

		if(this.props.run_time.length == 0 || typeof this.props.run_time == undefined)
			return null

		var time = BYTES_TO_INT_LITTLE_ENDIANG(this.props.run_time)

		var warranty_days = Math.floor(((time / 60) / 60) / 24) 
		var number_of_day  = 365
		var warranty_remainin_days = number_of_day - warranty_days
		var porcentage = 1 - (warranty_days / (number_of_day) )
		
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

	renderResetDemoOption(){
		if(this.props.demo_unit_time != 0){
	    	return (
				<View style={{marginBottom:20}}>		
					<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.showModalToResetDemoUnits()}>
						<View style={{
							flexDirection:"row",
							alignItems:"center",						
							justifyContent:"center"
	  					}}>
							<View style={{alignItems:"center",justifyContent:"center",backgroundColor:"red",padding:10,width:width}}>
								<Text style={styles.white_touchable_text}>
									0 hours remaining
								</Text>
								<Text style={{fontSize:22,color:"white"}}>
									Touch to Activate now!
								</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			)   	
    	}

    	return null
	}

	render(){
		var props = this.props
	
		if(props.show_going_back_screen){
			return (
				<Background>
					<ScrollView>
						<View style={{alignItems:"center",justifyContent:"center",height:height-120}}>
							<Text style={{color:"black"}}>
								Disconnecting the Device...
							</Text>
							<ActivityIndicator />
						</View>					
					</ScrollView>
				</Background>
			)
		}

		return(
			<Background>
				<ScrollView>
					<View>
						<StatusBox
							device = {this.device} 
							device_status = {props.central_device_status}
							power_voltage = {props.power_voltage}
							readStatusCharacteristic={(device) => this.getStatus(device)}
							tryToConnect={(device) => this.tryToConnect(device)}
						/>
					</View>
					<View>
						{!IS_EMPTY(this.device) &&  props.central_device_status == "connected" && (
							<View>
								<View>
									{this.renderResetDemoOption()}
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
						)}
					</View>			
				</ScrollView>		
			</Background>		
		)
	}
}

const mapStateToProps = state => ({
	app_info : state.setupCentralReducer.app_info,
	radio_info : state.setupCentralReducer.radio_info,
	bluetooth_info : state.setupCentralReducer.bluetooth_info,
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
  	firmware_update_disconnect : state.setupCentralReducer.firmware_update_disconnect,
  	on_back_disconnect: state.setupCentralReducer.on_back_disconnect,
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
  	bridge_status : state.scanCentralReducer.bridge_status,
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
	activated_led: state.scanCentralReducer.activated_led,
	fail_safe_option : state.scanCentralReducer.fail_safe_option,
	heart_beat : state.scanCentralReducer.heart_beat,
	equipments_paired_with : state.scanCentralReducer.equipments_paired_with,
	radio_update_status : state.scanCentralReducer.radio_update_status,
	app_firmware_update_on_course : state.scanCentralReducer.app_firmware_update_on_course,
	complete_firmware_update_on_course: state.updateFirmwareCentralReducer.complete_firmware_update_on_course,
	radio_and_aplication_firmware_update: state.updateFirmwareCentralReducer.radio_and_aplication_firmware_update,
	radio_and_bluetooth_firmware_update: state.updateFirmwareCentralReducer.radio_and_bluetooth_firmware_update,
	application_and_bluetooth_firmware_update: state.updateFirmwareCentralReducer.application_and_bluetooth_firmware_update,
	show_going_back_screen: state.setupCentralReducer.show_going_back_screen,
	firmareButtonAnimation: state.updateFirmwareCentralReducer.firmareButtonAnimation,
	radioFirmwareUpdateBoxRadius: state.updateFirmwareCentralReducer.radioFirmwareUpdateBoxRadius,
	radioFirmwareUpdateBoxPosition: state.updateFirmwareCentralReducer.radioFirmwareUpdateBoxPosition,
	radioFirmwareUpdateBoxShape: state.updateFirmwareCentralReducer.radioFirmwareUpdateBoxShape,
	appFirmwareUpdateBoxRadius: state.updateFirmwareCentralReducer.appFirmwareUpdateBoxRadius,
	appFirmwareUpdateBoxPosition: state.updateFirmwareCentralReducer.appFirmwareUpdateBoxPosition,
	appFirmwareUpdateBoxShape: state.updateFirmwareCentralReducer.appFirmwareUpdateBoxShape,
	bluetoothFirmwareUpdateBoxRadius: state.updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxRadius,
	bluetoothFirmwareUpdateBoxPosition: state.updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxPosition,
	bluetoothFirmwareUpdateBoxShape: state.updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxShape,
	firmware_update_status: state.updateFirmwareCentralReducer.firmware_update_status,
	current_screen: state.screenReducer.current_screen,

});


export default connect(mapStateToProps)(SetupCentral);