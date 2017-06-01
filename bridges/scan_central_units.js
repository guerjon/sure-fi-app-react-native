'use strict';
 
import React, { Component } from 'react'
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

import {connect} from 'react-redux'
import * as constants from '../constants'
import {scan_styles} from '../styles/scan.js'
import {styles} from '../styles/index'
import Camera from 'react-native-camera';
import BleManager from 'react-native-ble-manager';

class ScanCentralUnits extends Component {
  
  static navigationOptions = {
    title: "Scan Central Unit"
  }

  componentDidMount() {
    var {dispatch} = this.props;
    dispatch({type: "RESET_CENTRAL_REDUCER"})
    dispatch({type: "RESET_PAIR_REDUCER"})

    BleManager.start({showAlert: false});
        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

        NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );      
        var scanning = this.toggleScanning()
        dispatch({type: constants.SCANNING_CENTRAL_UNITS})
        setTimeout(() => this.stopScanning(scanning),10000)
        
  }

  hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2){
      var sub = hex.substr(c, 2);
      
      var parse_int = parseInt(sub, 16)
      bytes.push(parse_int);
    }
    return bytes;
  }

  uint8ToString(u8a){
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
      c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
    }
    return c.join("");
  }

  findId(data, idToLookFor) {
    if(data){
      for (var i = 0; i < data.length; i++) {
          if (data[i].id == idToLookFor) {
              return true
          }
      }      
    }
    return false;
  }  


  getManufacturedData(devices){
    var new_devices = [];
    if(devices){
      for (var i = 0; i < devices.length; i++) {
          var device = devices[i];
          
          device.manufactured_data = this.divideManufacturedData(device.new_representation,device.id);
          delete device.manufacturerData;
          new_devices.push(device);
        }
    }
    
    return new_devices;
  }

  /*
  * manufacturedData its an string 
  */
  divideManufacturedData(manufacturedData,address){
    
    var divide_manufactured_data = {}
    manufacturedData = constants.TO_HEX_STRING(manufacturedData)
    divide_manufactured_data.hardware_type = manufacturedData.substr(0,2) // 01 or 02
    divide_manufactured_data.firmware_version = manufacturedData.substr(2,2) //all four bytes combinations
    divide_manufactured_data.device_state = manufacturedData.substr(4,4)
    divide_manufactured_data.device_id = manufacturedData.substr(8,6);
    divide_manufactured_data.paired_id = manufacturedData.substr(14,6)
    divide_manufactured_data.address = address;
    
    return divide_manufactured_data;
  }


  toggleScanning(){
    var {dispatch} = this.props;
    dispatch({type: constants.TURN_ON_SCANNING})
    dispatch({type: "RESET_DEVICES"})
    var scanning = setInterval( ()=> this.handleScan(), 3000);  
    return scanning
  }

  stopScanning(scanning){
    var {dispatch,devices} = this.props;
    var new_bridges = this.getManufacturedData(devices)
    clearInterval(scanning)
    
    if(devices.length > 0){
      dispatch({type: constants.DEVICES_FOUNDED})
    }
    else  
      dispatch({type: constants.DEVICES_NOT_FOUNDED})
    
  }

  handleDiscoverPeripheral(data){
    var {devices,dispatch} = this.props;

    var new_bridges = [];

    
    if(data.name == "SF Bridge"){
      if(!this.findId(devices,data.id)){
        devices.push(data)
        dispatch({type: constants.ADD_DEVICES, devices : devices})

      }
    }
  }

  handleScan() {
    BleManager.scan([], 3, true)
            .then((results) => {console.log('Scanning...'); });
  }

  onSuccess(scan_result) {
    Vibration.vibrate()
  
    var device_id = scan_result.data;
    var {devices, dispatch, navigation} = this.props;

    var central_devices = devices.filter(function(device){
      if(!device.manufactured_data)
        return false
      return device.manufactured_data.hardware_type == "01"
    });   

    
    var matched_device = central_devices.filter(function(device){
      
      if(!device)
        return false
      if(!device.manufactured_data)
        return false
      if(!device.manufactured_data.device_id)
        return false

      var data_upper_case = device.manufactured_data.device_id.toUpperCase();

      return data_upper_case == device_id; 
    });
    

    if(matched_device.length > 0){
        var flag = false;

        if(navigation)
          if(navigation.state)
            if(navigation.state.params)
              if(navigation.state.params.screenBefore == "configure-bridge"){
                  flag = true;
              }

        if(flag){
          if(matched_device[0].manufactured_data.device_state != '0203' ){
            dispatch({type: "CENTRAL_DEVICE_IS_NOT_ON_PAIRING_MODE" })
          }else{
            dispatch({type: constants.CENTRAL_DEVICE_MATCHED,central_device : matched_device[0]});
          }
        }else{
          dispatch({type: constants.CENTRAL_DEVICE_MATCHED,central_device : matched_device[0]});    
        }

    }else{
      dispatch({type: constants.CENTRAL_DEVICE_NOT_MATCHED})
    }

  }

  resetQrState(){
    var {dispatch} = this.props;
    dispatch({type: constants.RESET_QR_CENTRAL_STATE})
  }

  smartGoBack(){
    var {navigation} = this.props;
    
    if(navigation)
      if(navigation.state)
        if(navigation.state.params)
          if(navigation.state.params.screenBefore == "configure-bridge"){
              this.connect()
              
          }
              

    navigation.goBack()
  }

  connect(){
    var {central_device,dispatch} = this.props
    dispatch({type: "LOADING"})
    BleManager.connect(central_device.id)
      .then((peripheralInfo) => {
        dispatch({type: "CONNECTED_CENTRAL_UNIT"})
        dispatch({type: "LOADED"})
    })
    .catch((error) => {
      dispatch({type: ERROR_ON_CENTRAL_SCANNING})
      console.log(error);
    });

  }

  render() {
    
    var {manufactured_data,central_device_matched,central_device,writing_on_device,error_on_wrote,dispatch,scanning_central_units,devices_founded,navigation,bluetooth_error,scanned_central_units,central_device_is_not_on_pairing_mode} = this.props

    if(bluetooth_error){
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
        
    if(scanning_central_units){
      return (
        <View style={styles.mainContainer}>
          <View style={{alignItems:"center",justifyContent:"center",flex:1}}>
            <Text>
              Scanning central devices ...
            </Text>
            <ActivityIndicator />
          </View>
        </View>
      )
    }

    
    if(devices_founded){
      if(central_device_is_not_on_pairing_mode){
        return(
            <View style={styles.mainContainer}>
                <View>
                  <View>
                    <Text style={{fontSize:16, color:"red"}}>Device is not on pairing mode</Text>
                  </View>
                </View>                    
 
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
                  <TouchableHighlight style={{backgroundColor: "red",flex:1,alignItems:"center",justifyContent:"center"}}>
                    <Text style={{color:"white"}}>
                      Clear
                    </Text>
                  </TouchableHighlight>
                </View>  
              </View>
        )
      }
      if(central_device_matched){
          return(
            <View style={styles.mainContainer}>
                <View>
                  <View>
                    <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({central_device.manufactured_data.device_id.toUpperCase()})</Text>
                  </View>
                </View>                    
 
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
                  <TouchableHighlight style={{backgroundColor: "#00DD00",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() => this.smartGoBack()}>
                    <Text style={{color: "white"}}>
                      Confirm Device
                    </Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={{backgroundColor: "red",flex:1,alignItems:"center",justifyContent:"center"}}>
                    <Text style={{color:"white"}}>
                      Clear
                    </Text>
                  </TouchableHighlight>
                </View>  
              </View>
          )

      }else{
        return(
            <View style={styles.mainContainer}>
              <View><Text>Plese scan the QR Code of your Sure-Fi Central Device</Text></View>
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
                <TouchableHighlight style={{backgroundColor: "red",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() => this.resetQrState()}>
                  <Text style={{color:"white"}}>
                    Clear
                  </Text>
                </TouchableHighlight>
              </View>                    
              
            </View>          
        );        
      }
    }else{
      return(
        <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
          <Text style={{fontSize:40,margin:20}}>
            Error
          </Text>
          <Text style={{margin:20}}>
            There is not Sure-Fi Bridge in range or bluetooth is turned off.
          </Text>
        </View>
      );
    }      
  }
}


const mapStateToProps = state => ({
  devices : state.pairReducer.devices,
  devices_founded : state.pairReducer.devices_founded,
  scanning_central_units: state.pairReducer.scanning_central_units,
  scanned_central_units : state.scanCentralReducer.scanned_central_units,
  central_device_matched : state.scanCentralReducer.central_device_matched,
  central_device: state.scanCentralReducer.central_device,
  bluetooth_error : state.scanCentralReducer.bluetooth_error,
  manufactured_data : state.scanCentralReducer.manufactured_data,
  central_device_is_not_on_pairing_mode : state.scanCentralReducer.central_device_is_not_on_pairing_mode
})

export default connect(mapStateToProps)(ScanCentralUnits);
