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
    height
} from '../styles/index'
import Camera from 'react-native-camera';
import { NavigationActions } from 'react-navigation'
//import {IS_CONNECTED} from '../action_creators'
const RTCamera = NativeModules.RCTCameraModule
//const Permissions = require('react-native-permissions')


var md5 = require('md5');
//md5 = require('js-md5');

class ScanCentralUnits extends Component {

    componentWillMount() 
    {

        let permissions = PermissionsAndroid.PERMISSIONS

        PermissionsAndroid.check('android.permission.READ_EXTERNAL_STORAGE')
        .then(response => {
            if(response){
                PermissionsAndroid.check('android.permission.ACCESS_COARSE_LOCATION')
                .then(response => {
                    if(response){
                        PermissionsAndroid.check('android.permission.CAMERA')
                        .then(response => {
                            if(!response){
                                this.requestMultiplePermissions()
                            }
                        })
                    }else{
                        this.requestMultiplePermissions()
                    }
                })
                .catch(error => console.log("Error",error))
            }else{
                this.requestMultiplePermissions()
            }
        })
        .catch(error => console.log("Error",error))


    }

    requestMultiplePermissions(){
        let permissions = PermissionsAndroid.PERMISSIONS
        PermissionsAndroid.requestMultiple([
            permissions.CAMERA,
            permissions.READ_EXTERNAL_STORAGE,
            permissions.ACCESS_COARSE_LOCATION,
            permissions.ACCESS_FINE_LOCATION
        ])
        .then(response => {
            if(
                (response['android.permission.READ_EXTERNAL_STORAGE'] == "granted") && 
                (response['android.permission.ACCESS_COARSE_LOCATION']  == "granted") && 
                (response['android.permission.CAMERA'] == "granted")
            ){
                this.resetStack()
            }else{
                this.props.dispatch({type: "SHOW_ACCEPT_PERMITIONS_MODAL"})
            }
        })
    }

    requireCameraPermission(response){
        console.log("requireCameraPermission()",response)
        Permissions.request('camera')
        .then(response => {
            console.log("second_response",response)
            if(response == "denied"){
                this.showCameraAlert(response)
            }else if (response == "restricted"){
                this.cameraActivateFromSettingsAlert(response)
            }else{
                this.requireStoragePermission(response)
            }
        })
    }

    requireStoragePermission(response) {
        Permissions.request('storage')
        .then(response => {
            if(response == "denied"){
                this.showStorageAlert()
            }else if (response == "restricted"){
                this.storageActivateFromSettingsAlert()
            }else{
                this.resetStack()
            }
        })
    }

    resetStack(){
        console.log("resetStack()")
        const resetActions = NavigationActions.reset({
            index: 1,
            actions : [
                NavigationActions.navigate({routeName: "Main"}),
                NavigationActions.navigate({routeName: "Bridges"})
            ]
        })

        this.props.navigation.dispatch(resetActions)
    }    

    showCameraAlert(response){
        console.log("showCameraAlert()")
        Alert.alert(
            "Camera Permission",
            "In order to scan the QR code on the Sure-Fi device you need allow the access to the camera.",
            [
                {text : "Cancel", onPress: () => this.props.dispatch({type : "SHOW_ACCEPT_PERMITIONS_MODAL"}) },
                {text : "Accept", onPress: () => this.requireCameraPermission(response) }
            ]
        )
    }

    showStorageAlert(response){
        console.log("showStorageAlert()")
        Alert.alert(
            "Storage Permissions",
            "In order to save the QR code you need allow access to the storage.",
            [
                {text : "Cancel", onPress: () => this.props.dispatch({type: "SHOW_ACCEPT_PERMITIONS_MODAL"})},
                {text : "Accept", onPress: () => this.requireStoragePermission(response)}
            ]
        )
    }

    cameraActivateFromSettingsAlert(response){
        Alert.alert("Upps!","Looks like you has chosen the don't show anymore option, to activate the camera permissions you should do it since configuration.")
    }

    storageActivateFromSettingsAlert(response){
        Alert.alert("Upps!","Looks like you has chosen the don't show anymore option, to activate the storage permissions you should do it since configuration.")
    }

    componentDidMount() {
        var {
            dispatch
        } = this.props;
        dispatch({ 
            type: "RESET_CENTRAL_REDUCER"
        })
        dispatch({type :"SHOW_CAMERA"})
        this.scanning = true
    }

    onSuccess(scan_result) {
        Vibration.vibrate()

        if(this.scanning){
            this.scanning = false;

            this.camera.capture()
            .then(photo_data => {

                //console.log("first_photo_data",photo_data)
                var device_id = scan_result.data;
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
                this.props.dispatch({type: "SHOW_SCANNED_IMAGE",photo_data : photo_data })
            }).catch(err => console.error(err));
        }       
    }

    goToPanelDevice(device) {
        var {
            navigation,
            dispatch
        } = this.props;
        

        this.props.stopScanning()
        //we need do this because if we don't unmount the Bridges interface the camera will keep turn on and this will make everting more so much slow
        //and we wont can use this on deploy
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
        this.scanning = true
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


    renderImage(message,button){
        
        var {photo_data} = this.props
        //console.log("photo_data",photo_data)
        return (
            <View>
                <View>
                    <View style={{margin:5,backgroundColor:"white",width:styles.width,height:40,alignItems:"center",justifyContent:"center",borderRadius:10}}>{message}</View>
                </View> 
                <View>
                    <Image
                      style={{width: width -20 , height: height-490}}
                      source={{uri: photo_data.path}}
                    >
                    </Image>
                </View>
                <View style={{flexDirection:"row",height:40}}>
                    {button}
                </View>  
            </View>
        )
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

    getModal(){
        return(
            <View style={styles.preview}>
                <View>
                    <Text>In order to scan the QR code you need allow the camera, locations  and storage permitions to this app.</Text>
                </View>
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

        //console.log("scanning_status",scanning_status)
        
        switch (scanning_status) {
            case "no_device_found":
                var message = <Text>Plese scan the QR Code of your Sure-Fi Device</Text>
            return this.renderCamera(message,clear_button)
            case "device_scanned_not_matched":
                var message = <Text style={{fontSize:16, color:"red"}}>Device not found ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"})</Text>
                return this.renderImage(message,clear_button)
            case "device_scanned_and_matched":
                var message = <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({central_device.manufactured_data.device_id.toUpperCase()})</Text>
                return this.renderCamera(message,confirm_buttons)
            case "device_is_not_on_paring_mode":
                var message = <Text style={{fontSize:16, color:"red"}}>Device ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not on pairing mode</Text>
                 return this.renderCamera(message,confirm_buttons)
            case "is_not_central_device":
                var message = <Text style={{fontSize:16, color:"red"}}>This Sure-Fi bridge ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not a central device</Text>
                return this.renderCamera(message,clear_button)
            case "clean_camera":
                return (<View><Text>Charging ... </Text></View>)
            case "show_modal":
                return this.getModal()
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
    scanner : state.pairReducer.scanner,
    photo_data : state.scanCentralReducer.photo_data
})

export default connect(mapStateToProps)(ScanCentralUnits);