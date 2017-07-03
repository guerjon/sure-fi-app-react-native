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



var md5 = require('md5');
//md5 = require('js-md5');

class ScanRemoteUnits extends Component {

    static navigationOptions = {
        title: "Scan Remote Unit",
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
            type: "RESET_REMOTE_REDUCER"
        })
        
        this.manager = this.props.navigation.state.params.manager
        var bleManagerEmitter = new NativeEventEmitter(this.manager)

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
            if (matched_devices.length > 0) {  //if we found devices, now we need be sure that the matched devices are remote i.e hardware_type == 01 return true
                matched_devices = constants.GET_REMOTE_DEVICES(matched_devices)
                
                if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a remote _device
                    
                    matched_devices = constants.GET_DEVICES_ON_PAIRING_MODE(matched_devices) // now we need check the state of the device
                    
                    if(matched_devices.length > 0){
                        var matched_device = matched_devices[0]
                        dispatch({
                            type: "REMOTE_DEVICE_MATCHED",
                            remote_device: matched_devices[0]
                        });

                    }else{
                    
                        dispatch({
                            type: "REMOTE_DEVICE_IS_NOT_ON_PAIRING_MODE"
                        })                        
                    
                    }
                }else{
                    
                    dispatch({
                        type : "IS_NOT_REMOTE_DEVICE"
                    })

                }
            }else{
                
                dispatch({
                    type: "REMOTE_DEVICE_NOT_MATCHED",
                })

            }
        }

    }

    smartGoBack() {
        var {
            navigation,
            dispatch
        } = this.props;
        
        
        /*if(this.camera)
            this.camera.release()
        */
        dispatch({type: "CLEAN_REMOTE_CAMERA"})
        navigation.navigate("SetupRemote",{scan : this.props.navigation.state.params.scan})
    }

    clearQr(){
      this.props.dispatch({type: "RESET_REMOTE_REDUCER"})
    }


    renderCamera(message,button) {
        return(
            <View style={styles.mainContainer}>
                <View style={{margin:5}}>{message}</View>
                <Camera
                    style={styles.preview}
                    aspect={Camera.constants.Aspect.fill}
                    ref={(cam) => {
                        this.camera = cam;
                    }}
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
                Confirm
            </Text>
        </TouchableHighlight>
      </View>
      )
    }

    render() {
        var {
            remote_device,
            scanning_status
        } = this.props

        var clear_button = this.getClearButton()
        var confirm_buttons = this.getConfirmButtons()

        switch (scanning_status) {
            case "no_device_found":
                var message = <Text>Plese scan the QR Code of your Sure-Fi Remote Device</Text>
            return this.renderCamera(message,clear_button)
            case "device_scanned_not_matched":
                var message = <Text style={{fontSize:16, color:"red"}}>Device not found ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"})</Text>
                return this.renderCamera(message,clear_button)
            case "device_scanned_and_matched":
                var message = <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({remote_device.manufactured_data.device_id.toUpperCase()})</Text>
                return this.renderCamera(message,confirm_buttons)
            case "device_is_not_on_paring_mode":
                var message = <Text style={{fontSize:16, color:"red"}}>Device is not on pairing mode</Text>
                return this.renderCamera(message,clear_button)
            case "is_not_remote_device":
                var message = <Text style={{fontSize:16, color:"red"}}>This Sure-Fi bridge ({this.scan_result_id ? this.scan_result_id : "ID UNDEFINED"}) is not a remote device</Text>
                return this.renderCamera(message,clear_button)
            case "clean_camera":
                return (<View><Text>Chargin ...</Text></View>)
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
    remote_device: state.scanRemoteReducer.remote_device,
    manufactured_data: state.scanRemoteReducer.manufactured_data,
    scanning_status: state.scanRemoteReducer.scanning_status,
    devices : state.pairReducer.devices
})

export default connect(mapStateToProps)(ScanRemoteUnits);