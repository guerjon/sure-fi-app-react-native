import React, {Component} from 'react'
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableHighlight,
    FlatList,
    Alert,
    NativeModules,
    NativeEventEmitter,
    TextInput,
    PermissionsAndroid,
    Modal
    } from 'react-native';

import {styles,first_color,width,option_blue} from '../styles/index.js'
import  {connect} from 'react-redux';
import ScanCentralUnits from './scan_central_units'
import ScannedDevicesList from '../helpers/scanned_devices_list'
import Background from '../helpers/background'
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation'
import { BleManager,Service,Characteristic } from 'react-native-ble-plx';
import SlowBleManager from 'react-native-ble-manager'
import {
    SUREFI_SEC_SERVICE_UUID,
    SUREFI_SEC_HASH_UUID,
    ARRAY_BUFFER_TO_BASE64,
    MATCH_DEVICE,
    FIND_ID,
    DIVIDE_MANUFACTURED_DATA,
 } from '../constants' 

const helpIcon = (<Icon name="info-circle" size={40} color="black" />)
const bluetoothIcon = (<Icon name="bluetooth" size={30} color="black" />)
const refreshIcon = (<Icon name="refresh" size={30} color="black"/>)
const serialIcon = (<Icon name="keyboard-o" size={40} color="black"/>)
const cameraIcon = (<Icon name="camera" size={40} color="white" />)
class Bridges extends Component{
    
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        title : "Scan Device"
    }
    
    constructor(props) {
        super(props);
        this.manager = new BleManager();
        this.stared_scanning = false
    }

    componentWillMount() {  
        
        this.props.dispatch({type: "RESET_CENTRAL_REDUCER"})
        this.props.dispatch({type: "RESET_SCANNED_DEVICE_LIST"})
        this.props.dispatch({type: "RESET_PAIR_REDUCER"})
        this.props.dispatch({type: "SAVE_BLE_MANAGER",manager: this.manager})
        this.props.dispatch({type :"SHOW_CAMERA"})

    }

    componentWillUnmount() {
        this.stopScan()
    }

    stopScan(){
        this.manager.stopDeviceScan();
    }

    componentDidMount() {
        this.checkMultiplePermissions() 
    }
    
    checkMultiplePermissions(){
        console.log("checkMultiplePermissions()")
        let permissions = PermissionsAndroid.PERMISSIONS
        var { dispatch } = this.props;
        

        PermissionsAndroid.check('android.permission.READ_EXTERNAL_STORAGE')
        .then(response => {
            if(response){
                PermissionsAndroid.check('android.permission.ACCESS_COARSE_LOCATION')
                .then(response => {
                    if(response){
                        PermissionsAndroid.check('android.permission.CAMERA')
                        .then(response => {
                            if(response){ 
                                this.continueToBluetoothState()
                            }else{
                                this.props.dispatch({type: "SHOW_PERMISSIONS_MODAL"})
                            }
                        })
                    }else{
                        this.props.dispatch({type: "SHOW_PERMISSIONS_MODAL"})
                    }
                })
                .catch(error => console.log("Error",error))
            }else{
                this.props.dispatch({type: "SHOW_PERMISSIONS_MODAL"})
            }
        })
        .catch(error => console.log("Error",error))        
    }

    continueToBluetoothState(){
        console.log("continueToBluetoothState()")
        this.props.dispatch({type: "HIDE_PERMISSIONS_MODAL"})
        this.props.dispatch({type: "NO_DEVICE_FOUND"})
        
        SlowBleManager.enableBluetooth()
          .then((response) => {
            // Success code 
            this.startScanning()
          })
          .catch((error) => {
            // Failure code 
            Alert.alert("You need turn on the bluetooth to connect the Sure-Fi Bridge.")
            
          });        
    }

    requireCameraPermission(response){
        //console.log("requireCameraPermission()",response)
        Permissions.request('camera')
        .then(response => {
            //console.log("second_response",response)
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
                this.props.dispatch({type: "RESET_CENTRAL_REDUCER"})
                this.props.dispatch({type: "RESET_SCANNED_DEVICE_LIST"})
                this.props.dispatch({type: "RESET_PAIR_REDUCER"})
                this.props.dispatch({type: "SAVE_BLE_MANAGER",manager: this.manager})
                this.props.dispatch({type :"SHOW_CAMERA"})
            }
        })
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

    showHelpAlert(){
        Alert.alert(
            "Instructions",
            "1. Locate the Qr Code found on your Sure-Fi Bridge \n\n "+
            "2. Using the viewfinder on this screen bring the CR Conde into focus. You may have to move the bridge closer or farther away from your device \n\n" +
            "3. When the code has been scanned,select \"Continue\" to connect the Sure-Fi Bridge."
        )
    }

    showOrHideDevicesList(){
        var {list_status,dispatch} = this.props;
        if(list_status == "showed"){
            dispatch({type : "HIDE_DEVICES_LIST"})
        }

        if(list_status == "hidden"){
            dispatch({type : "SHOW_DEVICES_LIST"})
        }
    }

    goToDeviceControl(device){
        console.log("goToDeviceControl()",device)
        this.stopScan()
        this.props.dispatch({type:"CURRENT_VIEW",current_view:"DeviceControlPanel"})
        this.props.navigator.dismissModal({
            animationType: 'slide-down'
        })

        this.props.navigator.push({
            screen: "DeviceControlPanel",
            title : "Device Details"
        })
    }

    requestMultiplePermissions(){
        let permissions = PermissionsAndroid.PERMISSIONS
        this.props.dispatch({type: "HIDE_PERMISSIONS_MODAL"})

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
                this.continueToBluetoothState()
            }else{
                this.props.dispatch({type: "SHOW_ACCEPT_PERMITIONS_MODAL"})
            }
        })
    }   

    startScanning(){
        console.log("startScanning()")
    
        var devices = this.props.devices
        this.stared_scanning = true
        this.manager.startDeviceScan(null,null,(error,device) => {
            
            if(error){
                return
            }

            if (device.name == "Sure-Fi Brid" || device.name == "SF Bridge") {
                if (!FIND_ID(devices, device.id)) {
                    var data = this.getManufacturedData(device)
                    devices.push(data)
                    this.devices = devices
                    this.remote_devices = this.filterRemoteDevices(devices)
                    this.props.dispatch({type: "UPDATE_DEVICES",devices: this.devices,remote_devices: this.remote_devices})
                }                
            }
        })
    }

    filterRemoteDevices(devices){
        let remote_revices = devices.filter(device => {
            return device.manufactured_data.hardware_type == "02"
        })
        return remote_revices
    }

    getManufacturedData(device) {
        if (device) {
            device.manufactured_data = DIVIDE_MANUFACTURED_DATA(device.CORRECT_DATA.substring(14), device.id);
            delete device.manufacturerData
            delete device.CORRECT_DATA;
        }else{
          console.log("error on getManufacturedData device is null or 0")
        }
        return device;
    }


    renderDeviceList(){
        if(this.props.scanning_status != "")
            return <ScannedDevicesList manager={this.manager} devices={this.devices}/>
        else
            return null 
    }

    searchDeviceBySerial(id){
        var device_id = id.toUpperCase();
        this.scan_result = device_id
        if(id.length == 6){
            var { dispatch,navigation} = this.props;
            
            var devices = this.props.devices
            var matched_device = []

            if(devices){// the scanner should found some devices at this moment, if not just keep looking 
                
                var matched_devices = MATCH_DEVICE(devices,device_id) //MATCH_DEVICE_CONSTANT looks for devices with the same qr scanned id 
                if (matched_devices.length > 0) {  //if we found devices, now we need be sure that the matched devices are central i.e hardware_type == 01 return true
                
                    //matched_devices = constants.GET_CENTRAL_DEVICES(matched_devices)

                    if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a central _device
                
                        
                        if(matched_devices.length > 0){
                
                            var matched_device = matched_devices[0]
                            dispatch({
                                type: "CENTRAL_DEVICE_MATCHED",
                                central_device: matched_device
                            });
                            this.goToDeviceControl(matched_device)
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


    showOrHideSerialInput(){
        if(this.props.show_serial_input){
            this.props.dispatch({type:"HIDE_SERIAL_INPUT"})
        }else{
            this.props.dispatch({type:"SHOW_SERIAL_INPUT"})
        }
    }

    closeModalAndRequestPermissions(){
        this.props.dispatch({type: "HIDE_PERMISSIONS_MODAL"})
        this.requestMultiplePermissions()
    }

    renderModal(){
        return (
            <Modal 
                animationType={"slide"}
                transparent={true}
                visible={this.props.show_contacts_modal}
                onRequestClose={() => null}

            >
                <View style={{backgroundColor: 'rgba(10,10,10,0.5)',flex:1,alignItems:"center",justifyContent:"center"}}>
                    
                    <View style={{backgroundColor:"white",width: width-80,height:300,alignSelf:'center',borderRadius:10,alignItems:"center"}}>
                        <View style={{width:width-80,backgroundColor:option_blue,height:100,borderTopLeftRadius:10,borderTopRightRadius:10,alignItems:"center",justifyContent:"center"}}>
                            {cameraIcon}
                        </View>
                        <View style={{marginHorizontal:20,marginVertical:15,height:100,alignItems:"center",justifyContent:"center"}}>
                            <Text style={{fontSize:17}}>
                                In order to Scan the Qr Code we need access to the camera and pictures. 
                            </Text>
                        </View>
                        
                        <TouchableHighlight 
                            onPress={() =>  this.closeModalAndRequestPermissions()}
                            style={{
                                marginTop:10,
                                borderTopWidth: 0.2,
                                width:width,
                                height: 60,
                                alignItems:"center",
                                justifyContent:"center",
                                borderRadius: 10
                            }}>
                            <Text style={{color:option_blue}}>
                                ACCEPT
                            </Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        )
    }

    render(){

        /*
            <TouchableHighlight style={{marginLeft:25}} onPress={() => this.researchDevices()}>
                {refreshIcon}
            </TouchableHighlight>
            <TouchableHighlight style={{marginLeft:25}} onPress={() => this.showOrHideDevicesList()}>
                {bluetoothIcon}
            </TouchableHighlight>
        */

        console.log("this.props.show_permissions_modal",this.props.show_permissions_modal)
        if(this.props.show_permissions_modal){
            return this.renderModal()
        }else{
            return(
                <Background>
                    <ScrollView style={{flex:1,marginHorizontal:10}}>

                        <View style={{height:250,alignItems:"center",marginBottom:120}}>
                            <ScanCentralUnits 
                                navigation={this.props.navigation} 
                                goToDeviceControl={(device)=> this.goToDeviceControl(device)}
                                scanResult = {this.scan_result}
                                manager = {this.manager}
                                requestMultiplePermissions = {() => this.requestMultiplePermissions()}
                                stopScan = {() => this.stopScan()}
                            />
                        </View>
                        <View style={{flexDirection:"row"}}>
                            <View style={{alignItems:"center",justifyContent:"center",flex:1,flexDirection:"row"}}> 
                                <View>
                                    <TouchableHighlight style={{marginRight: 30}} elevation={5} onPress={() => this.showOrHideSerialInput()} >
                                        {serialIcon}
                                    </TouchableHighlight>
                                </View>
                                <View>
                                    <Image  
                                        source={require('../images/instruction_image_1.imageset/instruction_image.png')} 
                                        style={{width:80,height:100}}
                                    />  
                                </View>
                                <View>
                                    <TouchableHighlight style={{marginLeft: 30}} elevation={5} onPress={() => this.showHelpAlert()} >
                                        {helpIcon}
                                    </TouchableHighlight>
                                </View>
                            </View>
                        </View>
                        <View>
                        { this.props.show_serial_input && (
                            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                                <View style={{width:width-200,height:50,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
                                    <View style={{alignItems:"center",justifyContent:"center",height:50,width:width-200}}>
                                        <TextInput 
                                            maxLength={6}
                                            style={{flex:1,justifyContent:"center",fontSize:25,width:width-200}} 
                                            underlineColorAndroid="transparent" 
                                            onChangeText={(t) => this.searchDeviceBySerial(t)}
                                            placeholder ="FFFFFF"
                                        />
                                    </View>
                                </View>
                            </View>
                        )
                        }
                        </View>
                         <ScrollView>
                            {this.renderDeviceList() } 
                        </ScrollView>
                    </ScrollView>
                </Background>

            );  
        }
    }
}

const mapStateToProps = state => ({
    scanning_status: state.scanCentralReducer.scanning_status,
    list_status : state.scannedDevicesListReducer.list_status,
    devices : state.pairReducer.devices,
    show_serial_input : state.scanCentralReducer.show_serial_input,
    current_view : state.scanCentralReducer.current_view,
    show_permissions_modal : state.scanCentralReducer.show_permissions_modal,
})

export default connect(mapStateToProps)(Bridges)