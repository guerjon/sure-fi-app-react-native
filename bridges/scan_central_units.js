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
import * as constants from '../constants'
import {
    scan_styles
} from '../styles/scan.js'
import {
    styles,
    first_color
} from '../styles/index'
import Camera from 'react-native-camera';
import { NavigationActions } from 'react-navigation'
//import {IS_CONNECTED} from '../action_creators'
const RTCamera = NativeModules.RCTCameraModule


var md5 = require('md5');
//md5 = require('js-md5');

class ScanCentralUnits extends Component {

    componentDidMount() {
        var {
            dispatch
        } = this.props;
        dispatch({
            type: "RESET_CENTRAL_REDUCER"
        })
        dispatch({type :"SHOW_CAMERA"})
        
    }

    onSuccess(scan_result) {
        //Vibration.vibrate()
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
            
                //matched_devices = constants.GET_CENTRAL_DEVICES(matched_devices)
                
                if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a central _device
            
                    
                    if(matched_devices.length > 0){
            
                        var matched_device = matched_devices[0]
                        dispatch({
                            type: "CENTRAL_DEVICE_MATCHED",
                            central_device: matched_device
                        });

                        this.goToPanelDevice(matched_device)
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


    stopScanning(scanning){
        if(scanning)
            clearInterval(scanning)
    }

    goToPanelDevice(device) {
        var {
            navigation,
            dispatch
        } = this.props;
        

        this.stopScanning(this.props.scanner)
        
        const reset_stack = NavigationActions.reset({
            index : 1,
            actions : [
                NavigationActions.navigate({routeName:"Main"}),
                NavigationActions.navigate({routeName:"DeviceControlPanel",device : device,dispatch: dispatch,tryToConnect:true})
            ]
        })
        this.props.navigation.dispatch(reset_stack)
    }

    clearQr(){
      this.props.dispatch({type: "RESET_CENTRAL_REDUCER"})
    }

    renderCamera(message,button) {
        if(this.props.camera_status == "showed")
        return(
            <View>
                <View>
                    <View style={{margin:5,backgroundColor:"white",width:styles.width,height:40,alignItems:"center",justifyContent:"center",borderRadius:10}}>{message}</View>
                </View>    
                <View>
                    <Camera
                        style={styles.preview}
                        aspect={Camera.constants.Aspect.fill}
                        ref={(cam) => {
                            this.camera = cam;
                        }}
                        onBarCodeRead={(e) => this.onSuccess(e)}
                    >
                    </Camera>
                </View>
                <View style={{flexDirection:"row",height:40}}>
                    {button}
                </View>                    
            </View>
        )
        
        return null
    }

    getClearButton(){
        return (
            <TouchableHighlight style={{backgroundColor: "red",flex:1,alignItems:"center",justifyContent:"center",borderRadius:10,marginTop:10,height:50}} onPress={() =>  this.clearQr()}>
                <Text style={{color:"white"}}>
                    Clear
                </Text>
            </TouchableHighlight>
        )
    }

    getConfirmButtons(){
        return null
      return (
        <View style={{flex:1,flexDirection:"row",height:50,marginTop:10}}>
            <TouchableHighlight style={{flex:1,backgroundColor: "red",alignItems:"center",justifyContent:"center",borderRadius:10,marginRight:10}} onPress={() =>  this.clearQr()}>
                <Text style={{color:"white",fontSize:16}}>
                    Clear
                </Text>
            </TouchableHighlight>
            <TouchableHighlight style={{flex:1,backgroundColor: "#00DD00",alignItems:"center",justifyContent:"center",borderRadius:10,marginLeft:10}} onPress={() => this.goToPanelDevice()}>
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
                var message = <Text>Plese scan the QR Code of your Sure-Fi Device</Text>
            return this.renderCamera(message,clear_button)
            case "device_scanned_not_matched":
                var message = <Text style={{fontSize:16, color:"red"}}>Device not found ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"})</Text>
                return this.renderCamera(message,clear_button)
            case "device_scanned_and_matched":
                
                var message = <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({central_device.manufactured_data.device_id.toUpperCase()})</Text>
                return this.renderCamera(message,confirm_buttons)
            case "device_is_not_on_paring_mode":
                var message = <Text style={{fontSize:16, color:"red"}}>Device ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not on pairing mode</Text>
                return this.renderCamera(message,clear_button)
            case "is_not_central_device":
                var message = <Text style={{fontSize:16, color:"red"}}>This Sure-Fi bridge ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not a central device</Text>
                return this.renderCamera(message,clear_button)
            case "clean_camera":
                return (<View><Text>Charging ... </Text></View>)
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
                )
        }
    }
}


const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    manufactured_data: state.scanCentralReducer.manufactured_data,
    scanning_status: state.scanCentralReducer.scanning_status,
    devices : state.pairReducer.devices,
    camera_status : state.scanCentralReducer.camera_status,
    scanner : state.pairReducer.scanner
})

export default connect(mapStateToProps)(ScanCentralUnits);