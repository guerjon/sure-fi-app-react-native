'use strict';

import React, {
    Component
} from 'react'
import {
    Text,
    TouchableOpacity,
    TouchableHighlight,
    Linking,
    View,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Vibration,
    Platform,
    PermissionsAndroid,
    NativeAppEventEmitter,
    Image,
    NativeModules,
    NativeEventEmitter
} from 'react-native'

import {
    connect
} from 'react-redux'
import * as constants from '../../constants'
import {
    scan_styles
} from '../../styles/scan.js'
import {
    styles,
    first_color
} from '../../styles/index'
import Camera from 'react-native-camera';
import BleManager from 'react-native-ble-manager'
const BleManagerModule = NativeModules.BleManager;
const RTCamera = NativeModules.RCTCameraModule

var md5 = require('md5');
//md5 = require('js-md5');

class ScanCentralUnits extends Component {

    static navigationOptions = {
        title: "Scan Central Unit",
        headerStyle: {
            backgroundColor: first_color
        },
        headerTitleStyle: {
            color: "white"
        },
        headerBackTitleStyle: {
            color: "white",
            alignSelf: "center"
        },
        headerTintColor: 'white',
    }

    componentDidMount() {
        var {
            dispatch
        } = this.props;
       dispatch({
            type: "RESET_CENTRAL_REDUCER"
        })
        this.manager = this.props.navigation.state.params.manager
        var bleManagerEmitter = new NativeEventEmitter(this.manager)
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',(data) => this.handleDisconnectedPeripheral(data) )
        this.connected = false;
    }

    handleDisconnectedPeripheral(data){
        //this.props.dispatch({type : "DISCONNECT_CENTRAL_DEVICE"})
    }


    stopScanning() {
        //console.log(this.props.navigation.state.params.scan)
    	if(this.props.navigation.state.params.scan)
        	clearInterval(this.props.navigation.state.params.scan)
        
        this.tryToConnect()
    }

    handleDiscoverPeripheral(data) {
    	var devices = this.devices;
        if (data.name == "Sure-Fi Brid") {
            if (!this.findId(devices, data.id)) {
            	
            	var data = this.getManufacturedData(data)
                devices.push(data)
                this.devices = devices
            }
        }
    }

    handleScan() {
        BleManager.scan([], 3, true)
            .then((results) => {
                console.log('Scanning...');
            });
    }

    getSecurityString(peripheralRXUUID,peripheralTXUUID){

        peripheralRXUUID = constants.REVERSE_STRING(peripheralRXUUID.toUpperCase())
        peripheralTXUUID = peripheralTXUUID.toUpperCase() + "x~sW5-C\"6fu>!!~X"
        let string = peripheralRXUUID + peripheralTXUUID
        let md5_string  = md5(string)
        let hex_string = constants.HEX_TO_BYTES(md5_string)
        return hex_string
    }

    onSuccess(scan_result) {
        //Vibration.vibrate()
        //console.log("scan_Result",scan_result)
        var device_id = scan_result.data;
        this.scan_result_id = device_id
        var {
            dispatch,
            navigation
        } = this.props;

        var devices = this.props.devices
        var matched_device = []
        
        if(devices){// the scanner should found some devices at this moment, if not just keep looking 
        
            var matched_devices = constants.MATCH_DEVICE(devices,device_id) //MATCH_DEVICE_CONSTANT looks for devices with the same qr scanned id 
            if (matched_devices.length > 0) {  //if we found devices, now we need be sure that the matched devices are central i.e hardware_type == 01 return true
        
                matched_devices = constants.GET_CENTRAL_DEVICES(matched_devices)
                
                if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a central _device
        
                    matched_devices = constants.GET_DEVICES_ON_CONFIGURE_MODE(matched_devices) // now we need check the state of the device
                    if(matched_devices.length > 0){
        
                        var matched_device = matched_devices[0]
                        dispatch({
                            type: "CENTRAL_DEVICE_MATCHED",
                            central_device: matched_devices[0]
                        });

                    }else{
        
                        dispatch({
                            type: "CENTRAL_DEVICE_IS_NOT_ON_PAIRING_MODE"
                        })                        
                    
                    }
                }else{
        
                    dispatch({
                        type : "IS_NOT_CENTRAL_DEVICE"
                    })

                }
            }else{
                
                dispatch({
                    type: "CENTRAL_DEVICE_NOT_MATCHED",
                })

            }
        }
    }

    writeSecondService(data){
        
        var {central_device,dispatch} = this.props
        if(!this.connected){
            BleManagerModule.retrieveServices(central_device.id,() => {
                BleManager.write(central_device.id,constants.SUREFI_SEC_SERVICE_UUID,constants.SUREFI_SEC_HASH_UUID,data,20).then((response) => {
                    if(this.interval){
                        clearInterval(this.interval)
                        this.connected = true;
                    }
                    dispatch({
                        type: "CONNECTED_CENTRAL_DEVICE"
                    })
                }).catch(error => console.log("Error",error));
            })
        }
    }

    connect() {
        var {
            central_device,
            dispatch
        } = this.props
        dispatch({
            type: "CONNECTING_CENTRAL_DEVICE"
        })

        BleManager.connect(central_device.id)
            .then((peripheralInfo) => {

                this.writeSecondService(central_device.manufactured_data.security_string)
                               
            })
            .catch((error) => {
                console.log(error)
                //Alert.alert("Error",error)
            });
    }

    tryToConnect(){
        var {
            navigation
        } = this.props;
        
        this.interval = setInterval(() => this.connect(),3000);
        navigation.goBack()
    }


    clearQr(){
    	this.props.dispatch({type: "CONFIGURATION_RESET_CENTRAL_REDUCER"})
    }

    renderCamera(message,button) {

        return (
            <View style={styles.mainContainer}>
				<View style={{margin:5}}>{message}</View>
					<Camera
						ref={(cam) => {
						this.camera = cam;
						}}
						style={styles.preview}
						aspect={Camera.constants.Aspect.fill}
						onBarCodeRead={(e) => this.onSuccess(e)}
						>
		  				<View/>
					</Camera>
				<View style={{flexDirection:"row",height:40}}>
					{button}
				</View>                    
	  		</View>
        )
    }

    getClearButton(){
    	return (
  			<TouchableHighlight style={{backgroundColor: "red",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() =>  this.clearQr()}>
				<Text style={{color:"white"}}>
	  				Clear
				</Text>
  			</TouchableHighlight>
        )
    }

    getConfirmButtons(){
    	return (
    		<View style={{flex:1,flexDirection:"row",height:50}}>
	  			<TouchableHighlight style={{flex:1,backgroundColor: "red",alignItems:"center",justifyContent:"center"}} onPress={() =>  this.clearQr()}>
					<Text style={{color:"white",fontSize:16}}>
		  				Clear
					</Text>
	  			</TouchableHighlight>
				<TouchableHighlight style={{flex:1,backgroundColor: "#00DD00",alignItems:"center",justifyContent:"center"}} onPress={() => this.stopScanning()}>
				  <Text style={{color: "white",fontSize:16}}>
					Confirm
				  </Text>
				</TouchableHighlight>
			</View>
    	)
    }

    render() {
        var {
            central_device,
            scanning_status
        } = this.props

        var clear_button = this.getClearButton()
        var confirm_buttons = this.getConfirmButtons()

        switch (scanning_status) {
            case "no_device_found":
                var message = <Text>Plese scan the QR Code of your Sure-Fi Central Device</Text>
            return this.renderCamera(message,clear_button)
            case "device_scanned_not_matched":
                var message = <Text style={{fontSize:16, color:"red"}}>Device not found ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) </Text>
                return this.renderCamera(message,clear_button)
            case "device_scanned_and_matched":
                var message = <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({central_device.manufactured_data.device_id.toUpperCase()})</Text>
                return this.renderCamera(message,confirm_buttons)
                break
            case "device_is_not_on_paring_mode":
                var message = <Text style={{fontSize:16, color:"red"}}>Device is not on pairing mode</Text>
                return this.renderCamera(message,clear_button)
                break
            case "is_not_central_device":
                var message = <Text style={{fontSize:16, color:"red"}}>Device ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not a central device.</Text>
                return this.renderCamera(message,clear_button)
            default:
                return (
                    <View style={{flex:1,alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
			  			<View>
							<Text style={{fontSize:30}}>
				  				Bluetooth Error
							</Text>
							<Text>
				  				Bluetooth is not turned off
							</Text>
			  			</View>
		  			</View>
                );
        }
    }
}


const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    manufactured_data: state.scanCentralReducer.manufactured_data,
    scanning_status: state.scanCentralReducer.scanning_status,
    devices : state.pairReducer.devices
})

export default connect(mapStateToProps)(ScanCentralUnits);