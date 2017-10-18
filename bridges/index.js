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
    Modal,
    ActivityIndicator
    } from 'react-native';

import {styles,first_color,width,option_blue,height} from '../styles/index.js'
import  {connect} from 'react-redux';
import ScanCentralUnits from './scan_central_units'
import ScannedDevicesList from '../helpers/scanned_devices_list'
import Background from '../helpers/background'
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation'
import { BleManager,Service,Characteristic,Navigation } from 'react-native-ble-plx';

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
const fab_buttons_background = 'white'

class Bridges extends Component{
    
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        title : "Scan Device",
    }
    
    constructor(props) {
        super(props);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        //console.log("event",event)
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "devices":
                    var { dispatch } = this.props;
                    dispatch({type:"HIDE_SERIAL_INPUT"})
                    this.toggleShowDeviceList()
                break
                default:
                break
            }
        }
    }


    componentWillMount() {  
        
        this.props.dispatch({type: "RESET_CENTRAL_REDUCER"})
        this.props.dispatch({type: "RESET_SCANNED_DEVICE_LIST"})
        this.props.dispatch({type: "RESET_PAIR_REDUCER"})
        this.props.dispatch({type: "SAVE_BLE_MANAGER",manager: this.manager})
        this.createScan()
        //this.startScanning()
    }

    componentWillUnmount() {
        this.deleteScan()
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

    deleteScan(){
        console.log("deleteScan()")
        if(this.manager != null){
            this.stopScan()
            this.manager.destroy()
            this.manager = null;                        
        }else{
            console.log("Delete scan can't delete the scan because it is null.")
        }
    }

    stopScan(){
        if(this.manager){
            this.manager.stopDeviceScan()
        }else{
            console.log("stopScan() can't stop the scan because the scan object is null",text)
        }
    }

    createScan(){
        console.log("createScan()")
        if(!this.manager){
            this.manager = new BleManager();
        }else{
            console.log("createScan can't create a new scan previous exits")
        }
    }

    stopWithoutDestroy(){
        this.manager.stopDeviceScan()
    }
    
    toggleShowDeviceList(){
        var {dispatch} = this.props
        if(this.props.list_status == "showed"){
            dispatch({type:"HIDE_DEVICES_LIST"})
        }else{
            dispatch({type:"SHOW_DEVICES_LIST"})
        }
    }

    continueToBluetoothState(){
        console.log("continueToBluetoothState()")
        this.props.dispatch({type: "HIDE_PERMISSIONS_MODAL"})
        this.props.dispatch({type: "NO_DEVICE_FOUND"})
        this.props.dispatch({type: "SHOW_CAMERA",show_camera:true})
        
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
                this.props.dispatch({type :"SHOW_CAMERA",show_camera: true})
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
            "1. Please make sure your Sure-Fi device is powered on. You must use a 9V battery if Pairing and 12V DV if deploying or configuring. \n\n "+
            "2. Locate the QR Code found on your Sure-Fi Device. \n\n" +
            "3. Using the viewfinder on this screen brring the QR Code into focus. You may have to move the bridge closer or farther away from your device. \n\n" +
            "4. When the code has been scanned,select \"Continue\" to connect the Sure-Fi Bridge."
        )
    }

    goToDeviceControl(device){
        
        this.stopScan()
        this.hideCamera()

        console.log("this.props.user_data",this.props.user_data);

        if(this.props.user_data){
            this.props.navigator.push({
                screen: "DeviceControlPanel",
                title : "Device Details",
                appStyle: {
                  orientation: 'portrait',
                },
                passProps:{
                    restartAll: () => this.restartAll()
                },
            })            
        }else{
            this.props.navigator.push({
                screen: "DeviceControlPanel",
                title : "Device Details",
                navigatorButtons: {
                    rightButtons: [
                        {
                            id: "pin_number",
                            icon: require('../images/settings_bar_icon.imageset/settings_bar_icon.png'), 
                        }
                    ],
                },
                appStyle: {
                  orientation: 'portrait',
                },
                passProps: {
                    restartAll: () => this.restartAll()
                }                
            })            
        }   
    }

    restartAll(){
        console.log("restartAll()")
        var {dispatch} = this.props 
        dispatch({type: "RESET_CENTRAL_REDUCER"})
        dispatch({type: "RESET_SCANNED_DEVICE_LIST"})
        dispatch({type: "RESET_PAIR_REDUCER"})
        dispatch({type: "NO_DEVICE_FOUND"})

        this.showCamera()

        setTimeout(() => this.startScanning(),2000) 
        //setInterval(() this.reviewDevices(),1000)

    }

    reviewDevices(){
        var devices = this.props.devices;
        var copy_devices = this.props.devices;

        for (var i = devices.length - 1; i >= 0; i--) {
            var device = devices[i]
            if(device.time > -10){
                copy_devices[i].time = copy_devices.time -1
            }else{
                copy_devices.splice(i,1) //delete de element from the array
            }
        }

    }

    startScanning(){
        console.log("startScanning(1)")
        
        var devices = this.props.devices
        

        if(this.manager){
            this.manager.startDeviceScan(['98bf000a-0ec5-2536-2143-2d155783ce78'],null,(error,device) => {
                
                if(error){
                    Alert.alert("Error",error.message)
                    return
                }
                if (device.name == "Sure-Fi Brid" || device.name == "SF Bridge") {
                    //console.log("device",device.id);
                    if (!FIND_ID(devices, device.id)) {
                        
                        var data = this.getManufacturedData(device)
                        devices.push(data)

                        this.devices = devices
                        this.remote_devices = this.filterRemoteDevices(devices)
                        this.props.dispatch({type: "UPDATE_DEVICES",devices: this.devices,remote_devices: this.remote_devices})
                    }                
                }
            })            
        }else{
            console.log("startScanning() can't start the scann the scan object its empty")
        }
    }    

    showCamera(){
        console.log("showCamera()")
        this.props.dispatch({type:"SHOW_CAMERA",show_camera: true})
    }

    hideCamera(){
         this.props.dispatch({type: "SHOW_CAMERA",show_camera:false})
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

    filterRemoteDevices(devices){
        let remote_revices = devices.filter(device => {
            return device.manufactured_data.hardware_type == "02"
        })
        return remote_revices
    }

    getManufacturedData(device) {
        if (device) {
            device.manufactured_data = DIVIDE_MANUFACTURED_DATA(device.CORRECT_DATA.substring(14), device.id);
            device.time = 10
            delete device.manufacturerData
            delete device.CORRECT_DATA;
        }else{
          console.log("error on getManufacturedData device is null or 0")
        }
        return device;
    }


    renderDeviceList(list_status){

        if(list_status == "showed"){
            if(this.props.scanning_status != ""){
                return <ScannedDevicesList manager={this.manager} devices={this.devices}/>
            }else{
                return <ActivityIndicator/>
            }
        }
        return null
    }


    renderSerialInput(show_serial_input){
        if(show_serial_input)
            return(
                <ScrollView contentContainerStyle={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                    <View style={{width:width-200,height:50,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
                        <View style={{alignItems:"center",justifyContent:"center",height:50,width:width-200,borderWidth:1}}>
                            <TextInput 
                                maxLength={6}
                                style={{flex:1,justifyContent:"center",fontSize:25,width:width-200,textAlign: 'center'}} 
                                underlineColorAndroid="transparent" 
                                onChangeText={(t) => this.searchDeviceBySerial(t)}
                                placeholder ="XXXXXX"
                            />
                        </View>
                    </View>
                </ScrollView>
            )

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
                    this.goToDeviceNotMatched(device_id)
                }
            }   
        }   
    }

    closeModalAndRequestPermissions(){
        this.props.dispatch({type: "HIDE_PERMISSIONS_MODAL"})
        this.requestMultiplePermissions()
    }

    toggleSerialInput(){
        var {dispatch} = this.props
        dispatch({type : "HIDE_DEVICES_LIST"})
    
        if(this.props.show_serial_input){
            console.log("54321");
            this.showCamera()
            dispatch({type:"HIDE_SERIAL_INPUT"})
        }else{
            console.log("12345");
            this.hideCamera()
            dispatch({type:"SHOW_SERIAL_INPUT"})
        }
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

    goToDeviceNotMatched(device_id){
        console.log("goToDeviceNotMatched()");
        //this.stared_scanning = false
        //this.props.dispatch({type:"UPDATE_DEVICES",devices:[]})
        //this.stopWithoutDestroy();

        this.props.navigator.push({
            screen: "DeviceNotMatched",
            title : device_id,
            passProps: {
                device_id : device_id,
                showAlert: true,
                startScanning : () => this.startScanning(),
                goToDeviceControl : (matched_device) => this.goToDeviceControl(matched_device)
            },
            appStyle: {
              orientation: 'portrait',
            }            
        })      
    }

    render(){
        if(this.props.show_serial_input) {
            var camera_style = {}
            var touchable_icon = (
                <TouchableHighlight onPress={() => this.toggleSerialInput()}>
                    <Image source={require('../images/camera_icon.imageset/camera_icon.png')} />
                </TouchableHighlight>
            )
        }else{
            var camera_style = {height:height * 0.6}
            var touchable_icon = (
                <TouchableHighlight onPress={() => this.toggleSerialInput()}>
                    <Image source={require('../images/keyboard_icon.imageset/keyboard_icon.png')} />
                </TouchableHighlight>
            )
        }

        if(this.props.show_permissions_modal){
            return this.renderModal()
        }else{
            
            console.log("this.props.show_camera",this.props.show_camera);

            return(
                <Background>
                    <View style={{justifyContent:'space-between',height:height-150}}>
                        <View style={camera_style}>
                            {this.props.show_camera && ( 
                                <ScanCentralUnits
                                    navigation={this.props.navigation} 
                                    goToDeviceControl={(device)=> this.goToDeviceControl(device)}
                                    scanResult = {this.scan_result}
                                    manager = {this.manager}
                                    requestMultiplePermissions = {() => this.requestMultiplePermissions()}
                                    stopScan = {() => this.stopScan()}
                                    goToDeviceNotMatched = {(device_id) => this.goToDeviceNotMatched(device_id)}
                                />
                                )
                            }
                        </View>
                        <View style={{alignItems:"center",flex:1,marginTop:20}}>
                            {this.renderSerialInput(this.props.show_serial_input)}
                        </View> 
                        <View>
                            <ScrollView>
                                {this.renderDeviceList(this.props.list_status) } 
                            </ScrollView>
                        </View>
                    </View>
                    <View style={{height:150}}>
                        {this.props.list_status != "showed" &&
                            <View style={{flexDirection:"row",flex:1,justifyContent: 'space-between',marginHorizontal:10}}>
                                <View >
                                    {touchable_icon}
                                </View>
                                <View style={{alignItems:"center"}}>
                                    <Text style={{fontSize:18,fontWeight:"900"}}>
                                        Scan QR Code
                                    </Text>
                                </View>
                                <View>
                                    <TouchableHighlight onPress={() => this.showHelpAlert()}>
                                        <Image source={require('../images/info_icon.imageset/info_icon.png')} />
                                    </TouchableHighlight>                                
                                </View>
                            </View>                    
                        }
                    </View>
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
    show_permissions_modal : state.scanCentralReducer.show_permissions_modal,
    user_data : state.loginReducer.user_data,
    show_camera : state.scanCentralReducer.show_camera
})

export default connect(mapStateToProps)(Bridges)