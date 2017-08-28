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
    first_color,
    width
} from '../styles/index'
import Camera from 'react-native-camera';
import {IS_CONNECTED} from '../action_creators'
import BleManager from 'react-native-ble-manager'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


const RTCamera = NativeModules.RCTCameraModule

var md5 = require('md5');
//md5 = require('js-md5');

class ScanRemoteUnits extends Component {

    constructor(props) {
        super(props);
        this.devices = []
        this.fast_manager = props.manager
        //bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => this.handleDiscoverPeripheral(data));
        this.current_device = this.props.current_device // this device was matched could be a central or a remote one
        //this.searchDevices()
        this.scanDevices()
    }

    componentDidMount() {
        this.props.dispatch({type: "SHOW_REMOTE_CAMERA"})
    }

    /*handleDiscoverPeripheral(data) {
      
      var devices = this.devices;

        if (data.name == "Sure-Fi Brid" || data.name == "SF Bridge") {
            
            if (!constants.FIND_ID(devices, data.id)) {              

                var data = this.getManufacturedData(data)
                devices.push(data)
                this.devices = devices

            }
        }
    }*/

    getManufacturedData(device) {
        if (device) {
            device.manufactured_data = constants.DIVIDE_MANUFACTURED_DATA(device.CORRECT_DATA.substring(14), device.id);
            delete device.manufacturerData
            delete device.CORRECT_DATA;
        }else{
          console.log("error on getManufacturedData device is null or 0")
        }
        return device;
    }

    scanDevices(){
        console.log("scanRemoteDevices()")
        var devices = this.devices
        this.fast_manager.startDeviceScan(null,null,(error,device) => {
            if(error){
                return
            }
            if (device.name == "Sure-Fi Brid" || device.name == "SF Bridge") {
                
                if (!constants.FIND_ID(devices, device.id)) {       
                    var data = this.getManufacturedData(device)
                    console.log("device",data.manufactured_data)   
                    devices.push(data)
                    this.devices = devices
                }                
            }
        })
    }

    /*   
    searchDevices(){

        BleManager.scan([], 600, true).then(() => {
            console.log('handleScan()');
        })
    }
    */

    matchDevice(device_id){
        
        var {
            dispatch,
            navigation
        } = this.props;

        var devices = this.devices
        var matched_device = []

        if(devices){// the scanner should found some devices at this moment, if not just keep looking 
                
            var matched_devices = constants.MATCH_DEVICE(devices,device_id) //MATCH_DEVICE_CONSTANT looks for devices with the same qr scanned id 
            if (matched_devices.length > 0) {  //if we found devices, now we need be sure that the matched devices are REMOTE i.e hardware_type == 01 return true
                
                if(this.current_device.manufactured_data.hardware_type == "01"){ // THE PREVIOUS MATCHED DEVICE IS A CENTRAL SO WE NEED FIGURE OUT A REMOTE ONE
                    matched_devices = constants.GET_REMOTE_DEVICES(matched_devices)
                    
                    if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a REMOTE _device
                        matched_devices = constants.GET_DEVICES_ON_PAIRING_MODE(matched_devices) // now we need check the state of the device
                        if(matched_devices.length > 0){

                            let device = matched_devices[0]
                            dispatch({
                                type: "REMOTE_DEVICE_MATCHED",
                                remote_device: device
                            });
                            this.props.showAlertConfirmation()
                            
                        }else{
                           Alert.alert("Pairing Error","Device \n" + device_id.toUpperCase() +"  \n is not on pairing mode.");                    
                        }
                    }else{
                        Alert.alert("Pairing Error","Device \n" + device_id.toUpperCase() + "  \n is a Sure-Fi Central Unit. You need to pair to a Sure-Fi Remote Unit.");
                    }
            
                }else{
                    matched_devices = constants.GET_CENTRAL_DEVICES(matched_devices)
                    
                    if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a REMOTE _device
                        matched_devices = constants.GET_DEVICES_ON_PAIRING_MODE(matched_devices) // now we need check the state of the device
                        if(matched_devices.length > 0){

                            let device = matched_devices[0]
                            dispatch({
                                type: "REMOTE_DEVICE_MATCHED",
                                remote_device: device
                            });
                            console.log("this.scanning",this.scanning)
                            this.props.showAlertConfirmation()
                            
                        }else{
                           Alert.alert("Pairing Error","Device \n" + device_id.toUpperCase() +"  \n is not on pairing mode.");                    
                        }
                    }else{
                        Alert.alert("Pairing Error","Device \n" + device_id.toUpperCase() + "  \n is a Sure-Fi Remote Unit. You need to pair to a Sure-Fi Remote Unit.");
                    }

                }
            }else{
                
                dispatch({
                    type: "REMOTE_DEVICE_NOT_MATCHED",
                    scan_result_id : this.scan_result_id
                })
            }
        }
    }

    onSuccess(scan_result) {
        //Vibration.vibrate()
        var device_id = scan_result.data.substr(-6).toUpperCase();
        this.scan_result_id = device_id
        this.matchDevice(device_id)

    }

    stopScanning(scanning){
        if(scanning)
            clearInterval(scanning)
    }

    clearQr(){
      this.props.dispatch({type: "RESET_REMOTE_REDUCER"})
    }

    renderCamera(message,button) {
        if(this.props.camera_status == "showed"){
            return(
                <View>
                    <View>
                        <Camera
                            style={styles.preview_remote}
                            aspect={Camera.constants.Aspect.fill}
                            ref={(cam) => {
                                this.camera = cam;
                            }}
                            onBarCodeRead={(e) => this.onSuccess(e)}
                        >
                        </Camera>
                    </View>
                </View>
            )            
        }

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


    render() {
        var {
            remote_device,
            scanning_status
        } = this.props

        var clear_button = this.getClearButton()
        

        switch (scanning_status) {
            case "no_device_found":
                var message = <Text></Text>
            return this.renderCamera(message,clear_button)
            case "device_scanned_not_matched":
                var message = <Text style={{fontSize:16, color:"red"}}>Device not found ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"})</Text>
                return this.renderCamera(message,clear_button)
            case "device_scanned_and_matched":
                return   <View style={{paddingVertical:40}}><Text>Connecting </Text><ActivityIndicator /></View>
            case "device_is_not_on_paring_mode":
                var message = <Text style={{fontSize:16, color:"red"}}>Device ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not on pairing mode</Text>
                return this.renderCamera(message,clear_button)
            case "is_not_remote_device":
                var message = <Text style={{fontSize:16, color:"red"}}>This Sure-Fi bridge ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not a remote device</Text>
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
    remote_device: state.scanRemoteReducer.remote_device,
    remote_device_status : state.scanRemoteReducer.remote_device_status,
    manufactured_data: state.scanRemoteReducer.manufactured_data,
    scanning_status: state.scanRemoteReducer.scanning_status,
    camera_status : state.scanRemoteReducer.camera_status,
    scanner : state.pairReducer.scanner,
    manager : state.scanCentralReducer.manager,
    scan_result_id : state.scanRemoteReducer.scan_result_id
})

export default connect(mapStateToProps)(ScanRemoteUnits);