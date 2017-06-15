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
  NativeAppEventEmitter
} from 'react-native'
import {connect} from 'react-redux'
import * as constants from '../constants'
import {scan_styles} from '../styles/scan.js'
import {styles,first_color} from '../styles/index'
import modules from '../CustomModules.js'
import Camera from 'react-native-camera';
import BleManager from 'react-native-ble-manager';

class ScanRemoteUnits extends Component {
  
  static navigationOptions = {
    title : "Scan Remote Unit",
    headerStyle: {backgroundColor: first_color},
    headerTitleStyle : {color :"white"},
    headerBackTitleStyle : {color : "white",alignSelf:"center"},
    headerTintColor: 'white',
  }

  componentDidMount() {
    var {dispatch} = this.props;
    BleManager.start({showAlert: false});
        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

        NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );      
        var scanning = this.toggleScanning()
        dispatch({type: constants.SCANNING_REMOTE_UNITS})
        setTimeout(() => this.stopScanning(scanning),10000)
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
    var scanning = setInterval( ()=> this.handleScan(), 3000);  
    return scanning
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

      }else{
        console.log("repetido",data.id)
      }
    }
  }

  handleScan() {
    BleManager.scan([], 3, true)
            .then((results) => {console.log('Scanning...'); });
  }

  onSuccess(scan_result) {
    Vibration.vibrate();
    var device_id = scan_result.data;
    var {devices, dispatch, navigation} = this.props;
    
    var remote_devices = devices.filter(function(device){
      if(!device.manufactured_data)
          return false;
      return device.manufactured_data.hardware_type == "02"
    });
    
    var matched_device = remote_devices.filter(function(device){
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
     
      dispatch({type: constants.REMOTE_DEVICE_MATCHED, remote_device: matched_device[0]});

    }else{
     
      dispatch({type: constants.REMOTE_DEVICE_NOT_MATCHED})
    }

  }


  resetQrState(){
    var {dispatch} = this.props;
    dispatch({type: constants.RESET_QR_STATE})
  }


  render() {
    
    var {manufactured_data,remote_device_matched,remote_device,writing_on_device,error_on_wrote,dispatch,scanning_remote_units,devices_founded,navigation} = this.props

    if(scanning_remote_units){
      return (
        <View style={styles.mainContainer}>
          <View style={{alignItems:"center",justifyContent:"center",flex:1}}>
            <Text>
              Scanning remote devices ...
            </Text>
            <ActivityIndicator />
          </View>
        </View>
      )
    }


    if(devices_founded){
      if(remote_device_matched){
          return(
            <View style={styles.mainContainer}>
              <View>
                <View>
                  <Text style={{fontSize:16, color:"#00DD00"}}>Device found ({remote_device.manufactured_data.device_id.toUpperCase()})</Text>
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
                <TouchableHighlight style={{backgroundColor: "#00DD00",flex:1,alignItems:"center",justifyContent:"center"}} onPress={() => navigation.navigate("PairBridge")}>
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
              <View><Text>Plese scan the QR Code of your Sure-Fi Remote Device</Text></View>
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
        <View>
          <Text>
            There is not Sure-Fi Bridge in range
          </Text>
        </View>
      );
    }
  }
}

const mapStateToProps = state => ({
  devices : state.pairReducer.devices,
  devices_founded : state.pairReducer.devices_founded,
  scanning_remote_units: state.pairReducer.scanning_remote_units,
  remote_device_matched : state.scanRemoteReducer.remote_device_matched,
  remote_device: state.scanRemoteReducer.remote_device
})

export default connect(mapStateToProps)(ScanRemoteUnits);