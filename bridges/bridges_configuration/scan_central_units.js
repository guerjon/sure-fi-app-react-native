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
    Image
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
import BleManager from 'react-native-ble-manager';


//var md5 = require('md5');
md5 = require('js-md5');

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
            type: "CONFIGURATION_RESET_CENTRAL_REDUCER"
        })
        dispatch({
            type: "RESET_PAIR_REDUCER"
        })

        BleManager.start({
            showAlert: false
        });

        NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral',(data) => this.handleDiscoverPeripheral(data));

        this.scanning = this.startScanning()
        	this.devices = []
        //dispatch({type: "CONFIGURATION_SCANNING_CENTRAL_UNITS"})

        setTimeout(() => this.stopScanning(),60000) 
    }


    hexToBytes(hex) {
        for (var bytes = [], c = 0; c < hex.length; c += 2) {
            var sub = hex.substr(c, 2);

            var parse_int = parseInt(sub, 16)
            bytes.push(parse_int);
        }
        return bytes;
    }

    uint8ToString(u8a) {
        var CHUNK_SZ = 0x8000;
        var c = [];
        for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
            c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
        }
        return c.join("");
    }

    findId(data, idToLookFor) {
        if (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].id == idToLookFor) {
                    return true
                }
            }
        }
        return false;
    }


    getManufacturedData(device) {
        if (device) {
            device.manufactured_data = this.divideManufacturedData(device.new_representation, device.id);
            delete device.manufacturerData;
        }else{
        	console.log("error on getManufacturedData device is null or 0")
        }
        return device;
    }

    /*
     * manufacturedData its an string 
     */
    divideManufacturedData(manufacturedData, address) {
        var divide_manufactured_data = {}
        //manufacturedData = constants.TO_HEX_STRING(manufacturedData)
        console.log("manufacturedData",manufacturedData)
        divide_manufactured_data.hardware_type = manufacturedData.substr(0, 2) // 01 or 02
        divide_manufactured_data.firmware_version = manufacturedData.substr(2, 2) //all four bytes combinations
        divide_manufactured_data.device_state = manufacturedData.substr(4, 4)
        divide_manufactured_data.device_id = manufacturedData.substr(8, 6);
        divide_manufactured_data.address = address;
        divide_manufactured_data.security_string = this.getSecurityString(manufacturedData.substr(8, 6),manufacturedData.substr(14, 6))
        return divide_manufactured_data;
    }

    startScanning() {
        var {
            dispatch
        } = this.props;
        var scanning = setInterval(() => this.handleScan(), 1000);
        return scanning
    }

    stopScanning() {
    	var scanning = this.scanning

    	if(scanning)
        	clearInterval(scanning)
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
        return md5(string)
    }

    onSuccess(scan_result) {
        Vibration.vibrate()
        //console.log("scan_Result",scan_result)
        var device_id = scan_result.data;

        var {
            dispatch,
            navigation
        } = this.props;

        var devices = this.devices
        var matched_device = []
        
        //console.log("devuce 0",devices)
        if(devices){

	        var central_devices = devices.filter(function(device) {
	            
	            if (!device.manufactured_data)
	                return false
	            return device.manufactured_data.hardware_type == "01"
	        });
	        //console.log("devuce 2",devices)

	        var matched_device = central_devices.filter(function(device) {

	            if (!device)
	                return false
	            if (!device.manufactured_data)
	                return false
	            if (!device.manufactured_data.device_id)
	                return false

	            var data_upper_case = device.manufactured_data.device_id.toUpperCase()
	            device_id = device_id.toUpperCase()
	            return data_upper_case == device_id;
	        });
		}

        if (matched_device.length > 0) {
            var flag = false;

            if (navigation)
                if (navigation.state)
                    if (navigation.state.params)
                        if (navigation.state.params.screenBefore == "configure-bridge") {
                            flag = true;
                        }

            var state = matched_device[0].manufactured_data.device_state
            
            if (flag) {
                if ((state == '0203') || (state == '0003')) {
                	this.stopScanning()
                    dispatch({
                        type: "CONFIGURATION_CENTRAL_DEVICE_MATCHED",
                        central_device: matched_device[0]
                    });
                } else {
                    dispatch({
                        type: "CONFIGURATION_CENTRAL_DEVICE_IS_NOT_ON_PAIRING_MODE"
                    })
                }

            } else {
            	this.stopScanning()
                dispatch({
                    type: "CONFIGURATION_CENTRAL_DEVICE_MATCHED",
                    central_device: matched_device[0]
                });
            }

        } else {
            dispatch({
                type: "CONFIGURATION_CENTRAL_DEVICE_NOT_MATCHED",
            })
        }

    }

    smartGoBack() {
        var {
            navigation
        } = this.props;

        if (navigation)
            if (navigation.state)
                if (navigation.state.params)
                    if (navigation.state.params.screenBefore == "configure-bridge") {
                        this.connect()
                    }

        this. stopScanning()
        navigation.goBack()
    }

    connect() {
        var {
            central_device,
            dispatch
        } = this.props
        dispatch({
            type: "LOADING"
        })
        BleManager.connect(central_device.id)
            .then((peripheralInfo) => {
                console.log("security_string",central_device.manufactured_data.security_string)
                console.log("security_string 1",constants.BASE64.btoa(central_device.manufactured_data.security_string))
                dispatch({
                    type: "CONNECTED_CENTRAL_UNIT"
                })
                dispatch({
                    type: "LOADED"
                })
            })
            .catch((error) => {
                dispatch({
                    type: ERROR_ON_CENTRAL_SCANNING
                })
                console.log(error);
            });

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
				<TouchableHighlight style={{flex:1,backgroundColor: "#00DD00",alignItems:"center",justifyContent:"center"}} onPress={() => this.smartGoBack()}>
				  <Text style={{color: "white",fontSize:16}}>
					Confirm Device
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
                var message = <Text style={{fontSize:16, color:"red"}}>Device not found </Text>
                return this.renderCamera(message,clear_button)
            case "device_scanned_and_matched":
                var message = <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({central_device.manufactured_data.device_id.toUpperCase()})</Text>
                return this.renderCamera(message,confirm_buttons)
                break
            case "device_is_not_on_paring_mode":
                var message = <Text style={{fontSize:16, color:"red"}}>Device is not on pairing mode</Text>
                return this.renderCamera(message,clear_button)
                break
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
    central_device: state.configurationScanCentralReducer.central_device,
    manufactured_data: state.configurationScanCentralReducer.manufactured_data,
    scanning_status: state.configurationScanCentralReducer.scanning_status
})

export default connect(mapStateToProps)(ScanCentralUnits);