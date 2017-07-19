//Third part libraries
import React, {Component} from 'react'
import BleManager from 'react-native-ble-manager'
import Icon from 'react-native-vector-icons/FontAwesome';
import Camera from 'react-native-camera';
import { connect } from 'react-redux';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	StyleSheet,
  	TouchableHighlight,
  	Dimensions,
  	TextInput,
  	ActivityIndicator,
  	NativeModules,
  	NativeEventEmitter
} from 'react-native'


import { 
	LOADING,
	IS_EMPTY,
	SUREFI_SEC_SERVICE_UUID,
	SUREFI_SEC_HASH_UUID,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_READ_UUID,
	byteArrayToLong,
	CALCULATE_VOLTAGE
} from '../constants'

import CameraHelper from '../helpers/camera';
import StatusBox from './status_box'
import Background from "../helpers/background"
import Options from './options';
import {styles,first_color,option_blue,success_green} from '../styles/index.js'
import {IS_CONNECTED} from '../action_creators'
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

const helpIcon = (<Icon name="info-circle" size={30} color="black" />)
const backIcon = (<Icon name="arrow-left" size={30} color="white"/> )

var {width,height} = Dimensions.get('window')

function WhiteRow(params){
	return (
		<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center",borderBottomWidth:0.3}}>
			<View style={{padding:15,flexDirection:"row"}}>
				<View style={{flex:0.7}}>
					<Text style={{fontSize:16}}>
						{params.name}
					</Text>
				</View>
				<View style={{flex:1}}>
					<Text style={{fontSize:16}}>
						{params.value}
					</Text>
				</View>				
			</View>
		</TouchableHighlight>
	)
}


class SetupCentral extends Component{
	
	static navigationOptions = ({ navigation, screenProps }) => ({
		title : "Device Control Panel",
		headerLeft :( 
			<TouchableHighlight 
				onPress={
			 		() => {
			 			navigation.state.params.dispatch({type: "SHOW_CAMERA"})
			 			navigation.goBack()
			 		}
			 	}
			 	style={{marginLeft:20}}
			>
				<Icon name="arrow-left" size={25} color="white"/>
			</TouchableHighlight>
		),	
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',  	
	});

	constructor(props) {
		super(props);
		this.connected = false
		console.log("props",props)
		this.device = props.navigation.state.device
		BleManager.start().then(response => {})
		bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',() =>  this.handleDisconnectedPeripheral() );
		bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicNotification(data) );
	}

	componentDidMount() {
		//this.device = this.props.device
        this.tryToConnect(this.device)
	}

    tryToConnect(device){
        var {
            navigation
        } = this.props;
        this.props.dispatch({
           type: "CONNECTING_CENTRAL_DEVICE",
        })
        this.interval = setInterval(() => this.connect(device),500);
    }

    connect(device) {
        var {
            dispatch
        } = this.props
                
        IS_CONNECTED(device.id).then(response => {
        	
        	if(!response){
	            BleManager.connect(device.id)
	            	.then((peripheralInfo) => {
	                this.writeSecondService(device)
	            })
	            .catch((error) => {
	                //Alert.alert("Error",error)
	            });
        	}else{ //IF IS ALREADY CONNECTED
        		if(this.interval){
        			clearInterval(this.interval)
        			this.connected = true
        		}
        		this.props.dispatch({
        			type: "CONNECTED_CENTRAL_DEVICE"
        		})
        		this.getDeviceData(device) 
        	}
        }).catch(error => console.log(error))
    }

    writeSecondService(device){       
        if(!this.connected){
            BleManagerModule.retrieveServices(device.id,() => {
                BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,device.manufactured_data.security_string,20).then((response) => {
       	
                    if(this.interval){
                        clearInterval(this.interval)
                        this.connected = true;
                    }
                    this.props.dispatch({
                        type: "CONNECTED_CENTRAL_DEVICE"
                    })
                    this.startNotification(device)
                    

                }).catch(error => console.log("Error",error));
            })
        }
    }	

	startNotification(device){
		this.props.dispatch({type:"STARING_FIRMWARE_UPDATE"})
       
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
								this.getDeviceData(device)
							}
						)
					}
				)        		
        	}
        )
	}

    getDeviceData(device){
    	this.readStatusCharacteristic(device)
    }

    readStatusCharacteristic(device){
    	BleManager.read(device.id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_READ_UUID).then(response => {
    		this.props.dispatch(
    			{
    				type: "UPDATE_OPTIONS",
    				device_status : response[0]
    			}
    		)
    		this.getAppFirmwareVersion(device)
    		
    	}).catch(error => console.log("error",error))
    }


    getAppFirmwareVersion(device){
    	BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[COMMAND_GET_FIRMWARE_VERSION],20)
    	.then(response => {
    		
    	})
    	.catch(error => console.log("error",error))
    }

    getRadioFirmwareVersion(device){
    	BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[COMMAND_GET_RADIO_FIRMWARE_VERSION],20)
    	.then(response => {
    	})
    	.catch(error => console.log("error",error))
    }


    getBluetoothFirmwareVersion(device){
    	BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[COMMAND_GET_BLUETOOTH_FIRMWARE_VERSION],20)
		.then(response => {
		})
    	.catch(error => console.log("error",error))
    }

    getRadioSettings(device){
    	BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[COMMAND_GET_RADIO_SETTINGS],20).then(response => {
    	}).catch(error => console.log("error",error))
    }

    getPowerVoltage(device){
    	BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[COMMAND_GET_VOLTAGE],20).then(response => {
    	}).catch(error => console.log("error",error))
    }

	handleCharacteristicNotification(data){
		
		let value = data.value[0]

		switch(value){
			case 1 : //app firmware version
				if(data.value[1]){
					let version = "v" + data.value[1].toString() +"." + data.value[2].toString()	
					this.props.dispatch({type: "UPDATE_APP_VERSION",version : version })
					this.getRadioFirmwareVersion(this.device)
				}
				break
			case 9 : // radio firmware version
				this.props.dispatch({type: "UPDATE_RADIO_VERSION",version : "v" + data.value[1].toString() +"." + data.value[2].toString()})
				this.getBluetoothFirmwareVersion(this.device)
				break
			case 8 : //radio settings
				let spreading_factor = spreadingFactor.get(data.value[2])
				let band_width = bandWidth.get(data.value[1])
				let power = powerOptions.get(data.value[3])

				this.props.dispatch({type: "UPDATE_RADIO_SETTINGS",spreading_factor : spreading_factor,band_width : band_width, power: power })
				this.getPowerVoltage(this.device)
				break
			case 18 : //bluetooth firmware version
				this.props.dispatch({type: "UPDATE_BLUETOOTH_VERSION",version : "v" + data.value[1].toString() +"." + data.value[2].toString()})
				this.getRadioSettings(this.device)
				break
			case 20:
				let power_voltage = CALCULATE_VOLTAGE(byteArrayToLong([data.value[1],data.value[2]])).toFixed(2)
				let battery_voltage = byteArrayToLong([data.value[3],data.value[4]])
				this.props.dispatch({type : "UPDATE_POWER_VALUES",battery_voltage: battery_voltage, power_voltage : power_voltage})
			default:
			return
		}		
	}

	handleDisconnectedPeripheral(){
		this.connected = false
		this.props.dispatch({
			type : "DISCONNECT_CENTRAL_DEVICE"
		})
	}

	renderInfo(){

		if(this.props.central_device_status == "connected"){
			return (
				<View style={{alignItems:"center"}}>
					<View>
						<Text style={styles.device_control_title}>
							CURRENT VERSION
						</Text>
						<WhiteRow name="Application" value={this.props.app_version}/>
						<WhiteRow name="Radio" value={this.props.radio_version}/>
						<WhiteRow name="Bluetooth" value ={this.props.bluetooth_version}/>
					</View>
					<View>
						<Text style={styles.device_control_title}>
							CURRENT RADIO SETTINGS
						</Text>
						<WhiteRow name="Spreading Factor" value ={this.props.spreading_factor}/>
						<WhiteRow name="Bandwidth" value ={this.props.band_width}/>
						<WhiteRow name="Power" value ={this.props.power}/>
					</View>
					<View style={{marginBottom:80}}>
						<Text style={styles.device_control_title}>
							CURRENT POWER VALUES
						</Text>
						<WhiteRow name="Power Voltage" value={this.props.power_voltage}/>
						<WhiteRow name="Battery Voltage" value={this.props.battery_voltage}/>
					</View>
				</View>	
			)
		}
		return null
	}

	renderOptions(){
		if(this.props.central_device_status == "connected"){
			return <Options 
				device={this.device} 
				device_status = {this.props.central_device_status} 
				navigation={this.props.navigation}
			/>
		}
		return null
	}

	render(){
		return (
			<Background>
				<ScrollView>
					<View>
						<StatusBox 
							device = {this.device} 
							device_status = {this.props.central_device_status}
							readStatusCharacteristic={(device) => this.readStatusCharacteristic(device)}
							tryToConnect={(device) => this.tryToConnect(device)}
						/>
					</View>
					<View>
						{this.renderOptions()}
					</View>
					{this.renderInfo()}
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
	/*device:       {
        new_representation: '01021303FF0FF0FF1FF1',
        rssi: -54,
        name: 'Sure-Fi Brid',
        id: 'C1:BC:40:D9:93:B9',
        advertising: {
          CDVType: 'ArrayBuffer',
          data: 'AgEGDf///wECEwP/D/D/H/ENCFN1cmUtRmkgQnJpZBEHeM6DVxUtQyE2JcUOCgC/mAAAAAAAAAAAAAAAAAA='
        },
        manufactured_data: {
          hardware_type: '01',
          firmware_version: '02',
          device_state: '1303',
          device_id: 'FF0FF0',
          tx: 'FF1FF1',
          address: 'C1:BC:40:D9:93:B9',
          security_string: [
            178,
            206,
            206,
            71,
            196,
            39,
            44,
            165,
            158,
            178,
            226,
            19,
            111,
            234,
            113,
            180
          ]
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
  	power_voltage : state.setupCentralReducer.power_voltage,
  	device_status : state.setupCentralReducer.device_status
});


export default connect(mapStateToProps)(SetupCentral);