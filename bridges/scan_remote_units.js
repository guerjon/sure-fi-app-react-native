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
    width,
    height
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
        //bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => this.handleDiscoverPeripheral(data));
        this.master_device = this.props.master_device // this device was matched could be a central or a remote one
        //this.searchDevices()
       
    }

    clearQr(){
      this.props.dispatch({type: "RESET_REMOTE_REDUCER"})
    }

    renderCamera(message,button) {
        if(this.props.camera_status == "showed"){
            return(
                <View style={{alignItems:"center"}}>
                        <Camera
                            style={{
                                width: width-100,
                                height: width-100, 
                                borderRadius:10,                           
                            }}
                            aspect={Camera.constants.Aspect.fill}
                            ref={(cam) => {
                                this.camera = cam;
                            }}
                            onBarCodeRead={(e) => this.props.onSuccess(e)}
                        >
                            <Image 
                                source={require('../images/scanner_background.imageset/scanner_background.png')}
                                style={{
                                    width: width-100,
                                    height: width-100, 
                                }}
                            >
                            </Image>
                        </Camera>                    
                </View>

            )           
        }else{
            return (
                <View style={styles.preview_remote}>
                    
                </View>
            )
        }

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
            scanning_status
        } = this.props

        var clear_button = this.getClearButton()
        

        switch (scanning_status) {
            case "no_device_found":
                var message = <Text>No Device Found</Text>
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
    scanning_status: state.scanRemoteReducer.scanning_status,
    camera_status : state.scanRemoteReducer.camera_status,
    manager : state.scanCentralReducer.manager,
    scan_result_id : state.scanRemoteReducer.scan_result_id
})

export default connect(mapStateToProps)(ScanRemoteUnits);