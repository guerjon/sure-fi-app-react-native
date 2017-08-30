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
    NativeEventEmitter,
    Modal
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
    first_color,
    width,
    height,
    option_blue
} from '../styles/index'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import Camera from 'react-native-camera';
const RTCamera = NativeModules.RCTCameraModule
const bandIcon = (<Icon name="times-circle-o" size={30} color="red" />)
import BleManager from 'react-native-ble-manager'

var md5 = require('md5');
//md5 = require('js-md5');

class ScanCentralUnits extends Component {

    constructor(props) {
        super(props);
        this.scan_result = props.scanResult
        this.manager = props.manager
    }

    componentDidMount() {
        var {
            dispatch
        } = this.props;
        
        this.scanning = true
        this.scan_result = this.props.scan_result
    }

    onSuccess(scan_result) {

        if(this.scanning){
            this.scanning = false;          
            var device_id = scan_result.data.substr(-6).toUpperCase();
            
            this.scan_result_id = device_id
            
            var { dispatch,navigation} = this.props;
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
                            this.props.goToDeviceControl(matched_device)
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
            this.props.dispatch({type: "SHOW_SCANNED_IMAGE",photo_data : null })
            
        }       
    }


    clearQr(){
        this.scanning = true
        this.props.dispatch({type: "RESET_CAMERA"})
        this.props.dispatch({type :"SHOW_CAMERA"})

    }

    renderCamera(message,button) {
        if(this.props.id_input)
            message = this.props.id_input

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


    renderImage(message,button){
        
        var {photo_data} = this.props
        //console.log("photo_data",photo_data)
        return (
            <View>
                <View>
                <View>
                    <View style={{margin:5,width:styles.width,height:40,alignItems:"center",justifyContent:"center",borderRadius:10}}></View>
                </View> 
                </View> 
                <View style={{width: width -20 , height: height-490,backgroundColor:"white",alignItems:"center",justifyContent:"center"}}>
                    <View style={{margin:5,alignItems:"center",justifyContent:"center",borderRadius:10}}>{message}</View>
                </View>
                <View style={{flexDirection:"row",height:40}}>
                    {button}
                </View>  
            </View>
        )
    }
    
    getClearButton(){
        return (
            <TouchableHighlight style={{backgroundColor: "green",flex:1,alignItems:"center",justifyContent:"center",borderRadius:10,marginTop:10,height:50}} onPress={() =>  this.clearQr()}>
                <Text style={{color:"white"}}>
                    Scan Again
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

    getModal(){
        return(
            <View style={styles.preview}>
                <View>
                    <Text>In order to scan the QR code you need allow the camera, locations  and storage permitions to this app.</Text>
                </View>
            </View>           
        )
    }

    getSearchingBox(){
        return (
            <View>
                <View>
                    <View style={{margin:5,backgroundColor:"white",width:styles.width,height:40,alignItems:"center",justifyContent:"center",borderRadius:10}}>Searching</View>
                </View>    
                <View style={styles.preview}>
                    <ActivityIndicator />
                </View>
                <View style={{flexDirection:"row",height:40}}>
                    {button}
                </View>                    
            </View>
        )
    }





    render() {
        var {
            central_device,
            scanning_status,
            show_permissions_modal
        } = this.props

        var clear_button = this.getClearButton()
        var confirm_buttons = this.getConfirmButtons()
        let scan_result = this.props.scanResult ? this.props.scanResult : this.scan_result_id

        switch (scanning_status) {
            case "no_device_found":
                var message = <Text>Plese scan the QR Code of your Sure-Fi Device</Text>
            return this.renderCamera(message,null)
            case "device_scanned_not_matched":
                var message = (
                    <View style={{alignItems:"center",justifyContent:"center"}}>
                        {bandIcon}
                        <Text style={{fontSize:16, color:"red"}}>Device not found ({scan_result ? scan_result : "ID UNDEFINED"})</Text>
                        <Text> Scan again to find the Sure-Fi Device </Text>
                    </View>
                )
                return this.renderImage(message,clear_button)
            case "device_scanned_and_matched":
                var message = <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({central_device.manufactured_data.device_id.toUpperCase()})</Text>
                return this.renderCamera(message,confirm_buttons)
            case "device_is_not_on_paring_mode":
                var message = <Text style={{fontSize:16, color:"red"}}>Device ({scan_result ? scan_result: "ID UNDEFINED"}) is not on pairing mode</Text>
                 return this.renderCamera(message,confirm_buttons)
            case "is_not_central_device":
                var message = <Text style={{fontSize:16, color:"red"}}>This Sure-Fi bridge ({scan_result ? scan_result : "ID UNDEFINED"}) is not a central device</Text>
                return this.renderCamera(message,clear_button)
            case "clean_camera":
                return (<View><Text>Charging ... </Text></View>)
            case "searching":
                return this.getSearchingBox()
            case "show_modal":
                return this.getModal()
            default:
               return <View style={{flex:1,alignItems:"center",justifyContent:"center"}}><ActivityIndicator/></View>
        }
    }
}


const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    manufactured_data: state.scanCentralReducer.manufactured_data,
    scanning_status: state.scanCentralReducer.scanning_status,
    devices : state.pairReducer.devices,
    camera_status : state.scanCentralReducer.camera_status,
    scanner : state.pairReducer.scanner,
    photo_data : state.scanCentralReducer.photo_data,
    manager : state.scanCentralReducer.manager

})

export default connect(mapStateToProps)(ScanCentralUnits);