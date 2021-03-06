import React, {
    Component
} from 'react'
import {
    View,
    Text,
    Image,
    StyleSheets,
    ScrollView,
    TouchableHighlight,
    NativeEventEmitter,
    NativeModules,
    ActivityIndicator,
    Dimensions,
    Alert,
    FlatList
} from 'react-native'
import {
    styles,
    success_green,
    option_blue,
    first_color
} from '../styles/index'
import {
    TabNavigator
} from 'react-navigation'
import {
    GET_HEADERS,
    SUREFI_CMD_SERVICE_UUID,
    SUREFI_CMD_WRITE_UUID,
    SUREFI_CMD_READ_UUID,
    UINT8TOSTRING,
    HEX_TO_BYTES,
    BYTES_TO_HEX,
    FIRMWARE_CENTRAL_ROUTE,
    IS_EMPTY,
    GET_LARGEST,
    PRETY_VERSION,
    HEADERS_FOR_POST,
    WIEGAND_CENTRAL,
    WIEGAND_REMOTE,
    HARDWARE_CENTRAL_TYPE,
    HARDWARE_REMOTE_TYPE
} from '../constants.js'

import {
    POST_LOG
} from '../action_creators'

import {
    connect
} from 'react-redux'
import {
    NavigationActions
} from 'react-navigation'
import Background from '../helpers/background'
import RNFetchBlob from 'react-native-fetch-blob'
import ProgressBar from 'react-native-progress/Bar';
import BleManager from 'react-native-ble-manager';
import AppFirmwareUpdate from './app_firmware_update'
import RadioFirmwareUpdate from './radio_firmware_update'
import BluetoothFirmwareUpdate from './bluetooth_firmware_update'
import Icon from 'react-native-vector-icons/FontAwesome';
import co from 'co'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const window = Dimensions.get('window');
var {
    height,
    width
} = window
var rows_to_write = 0

var Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

    return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
}


class UpdateFirmwareCentral extends Component {

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true,
    }   

    constructor(props) {
    	super(props);
    	this.device = props.device
        application_firmware_files = {}
        radio_firmware_files = {}
        bluetooth_firmware_files = {}
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.showing_normal_view = true;
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "advanced":
                    this.changeView()
                break
                default:
                break
            }
        } 
    }

    componentWillMount() {
        let props = this.props
        let dispatch = this.props.dispatch
        dispatch({type: "RESET_FIRMWARE_UPDATE_REDUCER"})
        dispatch({type:"HIDE_FIRMWARE_UPDATE_LIST"})
        
    }

    componentDidMount() {
        if(this.device){
            //console.log("this.device",this.device)
            this.props.dispatch({type: "CHANGE_PROGRESS", new_progress: 0}) 
            if(this.device.manufactured_data)
                this.fetchFirmwareFiles()
            else
                Alert.alert("Error","Device not found, restart bluetooth.")
        }
    }

    async fetchFirmwareFiles(){
        console.log("fetchFirmwareFiles()")

        const dispatch = this.props.dispatch;
        let hardware_type = HARDWARE_CENTRAL_TYPE
        var application_body = {firmware_type: "application"}
        var radio_body = {firmware_type:"radio"}
        var bluetooth_body = {firmware_type: "bluetooth"}

        //console.log("device on firmware",this.device.manufactured_data);

        if(this.device.manufactured_data.hardware_type == WIEGAND_REMOTE)
            hardware_type = HARDWARE_REMOTE_TYPE

    
            this.application_files = await this.fetchFirmwareFile(hardware_type,"application")
            this.radio_files = await this.fetchFirmwareFile(hardware_type,"radio")
            this.bt_files = await this.fetchFirmwareFile(hardware_type,"bluetooth")
            
/*
            console.log("this.application_files",this.application_files)
            console.log("this.radio_files",this.radio_files)
            console.log("this.bt_files",this.bt_files)
*/


            let app_version = this.application_files[0]
            let radio_version = this.radio_files[0]
            let bt_version = this.bt_files[0]
            
            let app_float_value = parseFloat(app_version.firmware_version)
            let radio_float_value = parseFloat(radio_version.firmware_version)
            let bt_float_value = parseFloat(bt_version.firmware_version)

            
            if(app_float_value == radio_float_value && radio_float_value == bt_float_value){
                
                this.largest_version = app_float_value
            }else{
                
                this.largest_version = GET_LARGEST(app_float_value,radio_float_value,bt_float_value)    
            }
            
            var versions_objects = [app_version,radio_version,bt_version]

            this.update_requires = this.checkRequireUpdates(app_version.firmware_version,radio_version.firmware_version,bt_version.firmware_version)
            this.require_update = this.dispatchRequireUpdates(this.update_requires)
            this.require_update = this.blockDevelopmentUpdate(this.require_update,versions_objects,this.largest_version) // if the user is not admin we should block the update if the next update its only for developers

            dispatch({type: "UPDATE_LARGEST_VERSION",largest_version: this.largest_version})
            dispatch({type: "UPDATE_SELECTED_VERSION",selected_version : this.largest_version})
            dispatch({type: "UPDATE_SELECTED_FILES",selected_files : {app_files : this.application_files[0],radio_files : this.radio_files[0], bt_files : this.bt_files[0] }})
            
            //dispatch({type: "CHANGE_TAB",active_tab: "app"})

    }


    async fetchFirmwareFile(hardware_type_key,firmware_type){
        var body = {
            firmware_type: firmware_type,
            hardware_type_key: hardware_type_key
        }

        let response = await fetch(FIRMWARE_CENTRAL_ROUTE, {
            headers: HEADERS_FOR_POST,
            method: 'POST',
            body : JSON.stringify(body)
        })
        const clean_files = this.sortByFirmwareVersion(JSON.parse(response._bodyInit).data.files)
        return new Promise((fulfill,reject) => {
            return fulfill(clean_files)
        }) 
    }

    blockDevelopmentUpdate(require_update,versions_objects,largest_version){
        //console.log("blockDevelopmentUpdate()",require_update,versions_objects,largest_version)
        if(!this.props.user_data){ // true if normal user, we only have information in this.props.user_data if its an admin
            
            for (var i = versions_objects.length - 1; i >= 0; i--) { //we need check every firmware file to check the largest  
                            
                let version_object = versions_objects[i]
                let firmware_version = parseFloat(version_object.firmware_version) 
                let firmware_status = version_object.firmware_status

                if(largest_version == firmware_version){
                    if(firmware_status == 1){
                        require_update = false
                        break
                    }
                }
            }                
        }

        return require_update
    }

    changeView(){
        let view_kind = this.props.view_kind
        if(view_kind == "normal"){
            this.props.navigator.setButtons({
                rightButtons:[
                    {
                        title: 'Normal', // for a textual button, provide the button title (label)
                        id: 'advanced', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                    },
                ]
            })
            console.log("this.props.active_tab",this.props.active_tab)
            if(this.props.active_tab == "charging")
                this.props.dispatch({type: "CHANGE_TAB",active_tab:"app"})

            this.showAdvanceView()
        }
        if(view_kind == "advanced"){
            this.props.navigator.setButtons({
                rightButtons:[
                    {
                        title: 'Advanced', // for a textual button, provide the button title (label)
                        id: 'advanced', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
                    },
                ]
            })

           this.props.dispatch({type: "CHANGE_PROGRESS", new_progress: 0}) 
            this.showNormalView()
        }
    }

    showAdvanceView(){
        this.props.dispatch({type: "SHOW_ADVANCED_VIEW"})
    }

    showNormalView(){
        this.props.dispatch({type: "SHOW_NORMAL_VIEW"})
    }

    /*
    * @app_version is the app_version that we got from the cloud,  
    * @radio_version is the radio_version that we got from the cloud,  
    * @bt_version is the bt_version that we got from the cloud,  
    */
    checkRequireUpdates(app_version,radio_version,bt_version){
        console.log("checkRequireUpdates()",app_version,radio_version,bt_version)
        app_version = parseFloat(app_version)
        radio_version = parseFloat(radio_version)
        bt_version = parseFloat(bt_version)

        let {app_info,radio_info,bluetooth_info} = this.props
        let require_app = false
        let require_radio = false
        let require_bt = false

        

        require_app = app_info < app_version // props.app_version is the version that we got from the bridge
        require_radio = radio_info < radio_version // same for props.radio_version
        require_bt = bluetooth_info < bt_version // same for props.bluetooth_version
        
        var result = [require_app,require_radio,require_bt]
        //var result = [true,true,true]
        return result
    }

    dispatchRequireUpdates(updates){
        //console.log("dispatchRequireUpdates()",updates)
        let props = this.props
        let dispatch = props.dispatch
        let require_update = false
        console.log("updates",updates)

        if(updates[0]){
            dispatch({type: "APP_UPDATE_STATUS",app_update_status:"update_required"})
            require_update = true
        }else{
            dispatch({type: "APP_UPDATE_STATUS",app_update_status:"no_update_required"})
        }

        if(updates[1]){
            dispatch({type: "RADIO_UPDATE_STATUS",radio_update_status:"update_required"})
            require_update = true
        }else{
            dispatch({type: "RADIO_UPDATE_STATUS",radio_update_status:"no_update_required"})
        }

        if(updates[2]){
            dispatch({type: "BT_UPDATE_STATUS",bt_update_status:"update_required"})
            require_update = true
        }else{
            dispatch({type: "BT_UPDATE_STATUS",bt_update_status:"no_update_required"})
        }

        return require_update
    }

    sortByFirmwareVersion(files){
        const order_files = files.sort((a,b) => {
            return b.firmware_version.localeCompare(a.firmware_version)
        })
        return order_files;
    }

    handleDisconnectedPeripheral(){
       this.closeModal()
    }

    closeModal(){
       this.props.navigator.pop() 
    }

    closeAndConnect(){
        console.log("closeAndConnect()")
        this.props.fastTryToConnect(this.device)
        this.closeModal()
    }

    appUpdateSuccess(){
        Alert.alert("Success","The firmware is updated.")
    }

    radioUpdateSuccess(){
        Alert.alert("Success","The firmware is updated.")
    }

    btUpdateSuccess(){
        Alert.alert("Success","The firmware is updated.")
    }

    saveOnCloudLog(version,type){
        console.log("saveOnCloudLog()",version,type);
        var log_value = Base64.encode(version.toString())
        
        var body = {
            log_type : type,
            log_value : log_value,
            device_id : this.device.id, //this looks wrong but is correct the name its bad on the sistem
            hardware_serial : this.device.manufactured_data.device_id //this looks wrong but is correct the name its bad on the sistem
        }

        POST_LOG(body)
    }

    getTabInfo(tab){

        let device = this.device    
        // [TODO] change the time on the startNextUpdate
        switch(tab){
            case "charging":
                return(
                    <View style={{backgroundColor:"white",width:width,height:200,alignItems:"center"}}>
                        <ActivityIndicator />
                    </View>
                )    
            case "app":
            return (
                <AppFirmwareUpdate 
                    device={device}  
                    firmware_files = {this.application_files}
                    startNextUpdate = {() => this.appUpdateSuccess()}
                    closeModal = {() => this.closeModal()}
                    saveOnCloudLog = {(version,type) => this.saveOnCloudLog(version,type)}
                    version = {this.props.selected_version}
                />)
            case "radio":
            return (
                <RadioFirmwareUpdate 
                    device={device}
                    firmware_files = {this.radio_files}
                    startNextUpdate = {() => this.radioUpdateSuccess()}
                    closeModal = {() => this.closeModal()}
                    saveOnCloudLog = {(version,type) => this.saveOnCloudLog(version,type)}
                    version = {this.props.selected_version}
                />
            )
            case "bluetooth":
            return (
                <BluetoothFirmwareUpdate 
                    device={device}  
                    closeModal={() => this.closeModal()}
                    firmware_files = {this.bt_files}
                    startNextUpdate = {() => this.btUpdateSuccess()}
                    saveOnCloudLog = {(version,type) => this.saveOnCloudLog(version,type)}
                    version = {this.props.selected_version}
                    closeAndConnect = {() => this.closeAndConnect()}
                />
            )
            default:
                return(
                    <View style={{backgroundColor:"white",width:width,height:200,alignItems:"center"}}>
                        <ActivityIndicator />
                    </View>
                )    
                
        }
    }

    getTextVersionAndStyleStatus(status){
        switch(status){
            case "no_started":
                return {text:"NOT STARTED",style:{color:"#000099",fontSize:9}}
            case "update_required":
                return {text:"UPDATE REQUIRED",style:{color: "#000099",fontSize:9}}
            case "no_update_required":
                return {text:"NO UPDATE REQUIRED",style:{color: "#009900",fontSize:9}}
            case "updating":
                return {text:"UPDATING",style:{color: "orange",fontSize:9}}
            case "updated":
                return {text:"COMPLETED",style:{color:"#009900",fontSize:9}}
            default:
                return {text:"NO STATUS FOUND",style:{fontSize:9}}
        }
    }

    startFirmwareUpdate(){
        console.log("startFirmwareUpdate()",this.require_update);
        let dispatch = this.props.dispatch

        if(this.require_update){
            dispatch({type: "HIDE_FIRMWARE_UPDATE_LIST"})
            if(this.props.radio_update_status == "update_required"){
                dispatch({type: "RADIO_UPDATE_STATUS",radio_update_status:"updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE",current_update : "radio"}) // this mount the component <RadioFirmwareUpdate> and this component start the update automatically
                
            }else if(this.props.app_update_status == "update_required"){
                
                dispatch({type: "APP_UPDATE_STATUS",app_update_status:"updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE",current_update : "app"}) // this mount the component <AppFirmwareUpdate> and this component start the update automatically
                
            }else if (this.props.bt_update_status == "update_required"){
                
                dispatch({type: "BT_UPDATE_STATUS",bt_update_status:"updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE",current_update : "bt"}) // this mount the component <BluetoothFirmwareUpdate> and this component start the update automatically  
            }   
        }
    }

    forceUpdate(){
        var {dispatch} =this.props
        
        this.require_update = true

        dispatch({type: "APP_UPDATE_STATUS",app_update_status:"update_required"})
        dispatch({type: "RADIO_UPDATE_STATUS",radio_update_status:"update_required"})
        dispatch({type: "BT_UPDATE_STATUS",bt_update_status:"update_required"})

        this.startFirmwareUpdate()

    }

    startNextUpdate(current){
        let props = this.props
        let dispatch = props.dispatch

        if(current == "radio"){
            dispatch({type: "RADIO_UPDATE_STATUS",radio_update_status : "updated"})
            
            if(props.app_update_status == "update_required"){    
                this.props.dispatch({type: "CHANGE_PROGRESS", new_progress: 0.01})

                dispatch({type: "APP_UPDATE_STATUS",app_update_status : "updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE", current_update:"app"})

            }else if(props.bt_update_status == "update_required"){
                this.props.dispatch({type: "CHANGE_PROGRESS", new_progress: 0.01})
                dispatch({type: "BT_UPDATE_STATUS",bt_update_status : "updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE", current_update: "bt"})
                
            }else{
                Alert.alert("Update Complete","All Firmware has been updated to the selected firmware version(s)")
                this.closeModal()
            }
        }

        if(current == "app"){
            dispatch({type: "APP_UPDATE_STATUS",app_update_status : "updated"})
            if(props.bt_update_status == "update_required"){
                this.props.dispatch({type: "CHANGE_PROGRESS", new_progress: 0.01})
                dispatch({type: "BT_UPDATE_STATUS",bt_update_status : "updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE",current_update: "bt"})
            }
        }
    }

    showOrHideList(){
        if(this.props.show_firmware_update_list)
            this.props.dispatch({type:"HIDE_FIRMWARE_UPDATE_LIST"})
        else
            this.props.dispatch({type:"SHOW_FIRMWARE_UPDATE_LIST"})
    }

    getFirmwareList(){
        let application_files = this.application_files
        let radio_files = this.radio_files
        let bt_files = this.bt_files
        var items = []
        
        if(this.props.show_firmware_update_list){
            if(application_files.length == radio_files.length && radio_files.length == bt_files.length){
                
                for (var i = 0; i < application_files.length; i++) {
                    items.push({application_files: application_files[i],radio_files: radio_files[i], bt_files: bt_files[i]})
                }
            }else{
                items.push({application_files: application_files[0],radio_files: radio_files[0],bt_files:bt_files[0]})
            }          

            return (
                <View style={{}}> 
                    <ScrollView style={{height:200}}>
                        <FlatList data={items} renderItem={({item}) => this.renderItem(item)} keyExtractor={(item,index) => index}/>
                    </ScrollView>
                </View>
            )

        }else{
            return null
        }
    }

    renderItem(item){
        console.log("renderItem()")
        let app_version = parseFloat(item.application_files.firmware_version)
        let radio_version = parseFloat(item.radio_files.firmware_version)
        let bt_version = parseFloat(item.bt_files.firmware_version)
        let largest_version = GET_LARGEST(app_version,radio_version,bt_version)
        let user_type = this.props.user_data ?  this.props.user_data.user_type : false

        if(item.application_files.firmware_status == 1 || item.application_files.firmware_status == 3){
            console.log("renderItem()",item.application_files)
            console.log("user_type",user_type)
            if(user_type){
                return(
                    <TouchableHighlight onPress={() => this.changeSelectedFirmware(largest_version,item,app_version,radio_version,bt_version)} style={{backgroundColor:"white",padding:15,borderBottomWidth:0.2}}>
                        <Text>
                            App : {PRETY_VERSION(app_version)}  Radio : {PRETY_VERSION(radio_version)}  Bluetooth : {PRETY_VERSION(bt_version)}
                        </Text>
                    </TouchableHighlight>                
                )
            }
        }else{
            return (
                <TouchableHighlight onPress={() => this.changeSelectedFirmware(largest_version,item,app_version,radio_version,bt_version)} style={{backgroundColor:"white",padding:15,borderBottomWidth:0.2}}>
                    <Text>
                        App : {PRETY_VERSION(app_version)}  Radio : {PRETY_VERSION(radio_version)}  Bluetooth : {PRETY_VERSION(bt_version)}
                    </Text>
                </TouchableHighlight>
            )
        }
    }

    changeSelectedFirmware(largest_version,selected_files,app_version,radio_version,bt_version){
        console.log("changeSelectedFirmware()",)
        this.update_requires =  this.checkRequireUpdates(app_version.firmware_version,radio_version.firmware_version,bt_version.firmware_version)
        this.require_update = this.dispatchRequireUpdates(this.update_requires)
        this.props.dispatch({type: "UPDATE_SELECTED_VERSION",selected_version : largest_version,selected_files:selected_files})
    }

    getSelectedFiles(){
        var selected_files = this.props.selected_files
        //console.log("getSelectedFiles()",this.props.selected_version)

        var selected_app_file = null
        var selected_radio_file = null
        var selected_bluetooth_file = null
        
        if(this.application_files){
            this.application_files.map(application_file => {
                if(application_file.firmware_version == this.props.selected_version ){
                    selected_app_file = application_file.firmware_path
                }
            })
            if(!selected_app_file){
                selected_app_file = this.application_files[0].firmware_path // we got the mayor the are already in order
            }
        }

        if(this.radio_files){
            this.radio_files.map(radio_file => {
                if(radio_file.firmware_version == this.props.selected_version){
                    selected_radio_file = radio_file.firmware_path
                }   
            })
            if(!selected_radio_file){
                selected_radio_file = this.radio_files[0].firmware_path
            }
        }
        if(this.bt_files){
            this.bt_files.map(bt_file => {
                if(bt_file.firmware_version == this.props.selected_version)
                    selected_bluetooth_file = bt_file.firmware_path
            })

            if(!selected_bluetooth_file){
                selected_bluetooth_file = this.bt_files[0].firmware_path
            }
        }

        var paths = [selected_radio_file,selected_app_file,selected_bluetooth_file]

        return paths
    }

   

    renderUpdateComponent(){
        //console.log("renderUpdateComponent()",this.props.selected_version);
        let current_update = this.props.current_update
        let device = this.device
        let selected_version = this.props.selected_version
        let content = null

        var selected_files = this.getSelectedFiles()
        
        switch(current_update){

            case "app":

                return(
                    <AppFirmwareUpdate 
                        device={device}  
                        closeModal={() => this.closeModal()}
                        viewKind = {this.props.view_kind} 
                        firmwareFile = {selected_files[1]}
                        startNextUpdate = {kind => this.startNextUpdate(kind)}
                        version = {this.props.selected_version}
                        saveOnCloudLog = {(version,type) => this.saveOnCloudLog(version,type)}
                    />
                )
                case "radio":
                let radio_firmware_file = this.props.selected_files.radio_files
                
                return (
                    <RadioFirmwareUpdate
                        device={device}  
                        closeModal={() => this.closeModal()}
                        viewKind = {this.props.view_kind}
                        firmwareFile = {selected_files[0]}
                        startNextUpdate = {kind => this.startNextUpdate(kind)}
                        version = {this.props.selected_version}
                        saveOnCloudLog = {(version,type) => this.saveOnCloudLog(version,type)}
                    />
                )
                break
            case "bt":
                let bt_firmware_file = this.props.selected_files.bt_files
                return (
                    <BluetoothFirmwareUpdate 
                        device={device}  
                        closeAndConnect={() => this.closeAndConnect()}
                        viewKind = {this.props.view_kind}
                        firmwareFile = {selected_files[2]}
                        startNextUpdate = {kind => this.startNextUpdate(kind)}
                        version = {this.props.selected_version}
                        saveOnCloudLog = {(version,type) => this.saveOnCloudLog(version,type)}
                    />
                )
                break
            default:
                return null
        }
    }

    renderStartUpdateBtn(){
        //console.log("renderStartUpdateBtn()",this.largest_version,this.require_update)
        if(this.largest_version){
            if(this.require_update){
                if(this.props.progress == 0)
                    return (
                        <View style={{alignItems:"center"}}>
                            <TouchableHighlight 
                                onPress={() => this.startFirmwareUpdate()} 
                                style={{
                                    width:width-20,
                                    backgroundColor:"#009900",
                                    borderRadius:10,
                                    alignItems:"center",
                                    padding:10,
                                    marginHorizontal: 10,
                                    marginVertical:20
                                }}>
                                <Text style={{color:"white",fontSize:16,fontWeight:"900"}}>
                                    Start Firmware Update
                                </Text>
                            </TouchableHighlight>
                            
                        </View>
                    )
                else 
                    return null
            }else{
                return (
                    <View 
                        style={{
                            width:width-20,
                            backgroundColor:"gray",
                            borderRadius:10,
                            alignItems:"center",
                            padding:10,
                            marginHorizontal: 10,
                            marginVertical:20
                        }}
                    >
                        <Text style={{color:"white",fontSize:16,fontWeight:"900"}}>
                           No update required
                        </Text>
                    </View>
                )
            }
        }

        return(
            <View style={{backgroundColor:"white",width:width,height:200,alignItems:"center"}}>
                <ActivityIndicator />
            </View>
        )      
    }

    renderNormalView(){
        //console.log("renderNormalView()")
        var flag = null
        let {
            admin,
            progress,
            radio_info,
            app_info,
            bluetooth_info,
            selected_version,
            radio_update_status,
            app_update_status,
            bt_update_status
        } = this.props

        if(admin && (progress  == 0) )
            var flag = (
                <View style={{alignItems:"flex-end"}}>
                    <TouchableHighlight style={{backgroundColor:"#009900",marginHorizontal:10}} onPress={() => this.forceUpdate()}>
                        <Text style={{fontSize:10,color:"white",paddingHorizontal:7,paddingVertical:5}}>
                            Force
                        </Text>
                    </TouchableHighlight>
                </View>
            )        

        return (
            <View>
                <View style={{backgroundColor:"white"}}>
                    <View style={{alignItems:"center"}}>
                        <View style={{backgroundColor:"gray",width:width,padding:5}}>
                            <View style={{marginLeft:10}}>
                                <Text style={{fontWeight:"900",color:"white",textAlign:"center"}}>
                                    Current Device Firmware Version
                                </Text>
                            </View>
                        </View>
                        <Text style={{fontWeight:"900",fontSize:22,color:"black",padding:5}}>
                            Please Continue Firmware Update
                        </Text>
                    </View>
                    <View style={{flexDirection:"row",justifyContent:"center"}}>
                        <View style={{alignItems:"center",padding:5}}>
                            <Text style={{fontWeight:"900",color:"black"}}>
                                Radio Firmware
                            </Text>
                            <Text>
                                {PRETY_VERSION(radio_info)}
                            </Text>
                        </View>
                        <View style={{alignItems:"center",padding:5}}>
                            <Text style={{fontWeight:"900",marginHorizontal:10,color:"black"}}>
                                App Firmware
                            </Text>
                            <Text>
                                {PRETY_VERSION(app_info)}
                            </Text>
                        </View>
                        <View style={{alignItems:"center",padding:5}}>
                            <Text style={{fontWeight:"900",marginHorizontal:10,color:"black"}}>
                                BT Firmware
                            </Text>
                            <Text>
                                {PRETY_VERSION(bluetooth_info)}
                            </Text>
                        </View>
                    </View>
                    <View style={{backgroundColor:"gray",padding:5,justifyContent:"center",flexDirection:"row"}}>
                        <View style={{flex:0.7,marginLeft:10}}>
                            {this.require_update && (
                                <Text style={{color:"white",textAlign:"center"}}>
                                    Latest firmware update : {PRETY_VERSION(selected_version)}
                                </Text>
                                )
                            } 
                        </View>
                    </View>
                    <View style={{marginHorizontal:20,padding:5,flexDirection:"row", justifyContent: 'space-between'}}>  
                        <View>
                            <Text style={{color:"black"}}>
                                Radio 
                            </Text>
                            <Text style={this.getTextVersionAndStyleStatus(radio_update_status).style}>
                                {this.getTextVersionAndStyleStatus(radio_update_status).text}
                            </Text>
                        </View>
                        <View>
                            <Text style={{color:"black"}}>
                                Application
                            </Text>
                            <Text style={this.getTextVersionAndStyleStatus(app_update_status).style}>
                                {this.getTextVersionAndStyleStatus(app_update_status).text}
                            </Text>
                        </View>
                        <View>
                            <Text style={{color:"black"}}>
                                Bluetooth
                            </Text>
                            <Text style={this.getTextVersionAndStyleStatus(bt_update_status).style}>
                                 {this.getTextVersionAndStyleStatus(bt_update_status).text}
                            </Text>
                        </View>
                    </View>
                    {flag}
                    <View>
                        {this.renderStartUpdateBtn()}
                    </View>
                </View>
                <View>
                    {this.application_files ?  this.getFirmwareList() : null}
                </View>
                <View>
                    {this.renderUpdateComponent()}
                </View>
            </View>
        )
    }

    renderAdvancedView(){
        let props = this.props
        let normal_style = {color:"gray"}
        let selected_style = {color:"black",fontWeight: "900",fontSize:16 }
        let active_tab = props.active_tab
        let app_text_style = active_tab == "app" ? selected_style  : normal_style
        let radio_text_style = active_tab == "radio" ? selected_style  : normal_style
        let bluetooth_text_style = active_tab == "bluetooth" ? selected_style : normal_style
        let dispatch = props.dispatch

        return (
            <View>
                <View style={{flexDirection:"row",alignItems:"center"}}>
                    <TouchableHighlight onPress={() => dispatch({type: "CHANGE_TAB",active_tab:"app"})} style={styles.tab}>
                        <View style={{alignItems:"center"}}>
                        <Text style={app_text_style}>
                            APP 
                        </Text>
                        <Text style={app_text_style}>
                            {PRETY_VERSION(props.app_info)}
                        </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => dispatch({type: "CHANGE_TAB",active_tab:"radio"})} style={styles.tab}>
                        <View style={{alignItems:"center"}}>
                        <Text style={radio_text_style}>
                            RADIO 
                        </Text>
                        <Text style={radio_text_style}>
                            {PRETY_VERSION(props.radio_info)}
                        </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => dispatch({type: "CHANGE_TAB",active_tab:"bluetooth"})} style={styles.tab}>
                        <View style={{alignItems:"center"}}>
                        <Text style={bluetooth_text_style}>
                            BLUETOOTH 
                        </Text>
                        <Text style={bluetooth_text_style}>
                            {PRETY_VERSION(props.bluetooth_info)}
                        </Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <View>
                    {this.getTabInfo(active_tab)}
                </View>
            </View>
        )
    }

    render() {
        //console.log("this.props.view_kind",this.props.view_kind)
        if(this.props.view_kind == "normal")
            var content = this.renderNormalView()
        else
            var content = this.renderAdvancedView()

        return (
            <Background>
				<View style={{flex:1}}>
                    {content}
				</View>
			</Background>
        )
    }
}

const mapStateToProps = state => ({
    firmware_file: state.updateFirmwareCentralReducer.firmware_file,
    active_tab : state.updateFirmwareCentralReducer.active_tab,
    firmware_update_state: state.firmwareUpdateReducer.firmware_update_state,
    progress: state.firmwareUpdateReducer.progress,
    app_info : state.setupCentralReducer.app_info,
    radio_info : state.setupCentralReducer.radio_info,
    bluetooth_info : state.setupCentralReducer.bluetooth_info,
    application_firmware_files : state.firmwareUpdateReducer.application_firmware_files,
    radio_firmware_files : state.firmwareUpdateReducer.radio_firmware_files,
    bluetooth_firmware_files : state.firmwareUpdateReducer.radio_firmware_files,
    largest_version : state.firmwareUpdateReducer.largest_version,
    view_kind : state.firmwareUpdateReducer.view_kind,
    app_update_status : state.firmwareUpdateReducer.app_update_status,
    radio_update_status : state.firmwareUpdateReducer.radio_update_status,
    bt_update_status : state.firmwareUpdateReducer.bt_update_status,
    current_update : state.firmwareUpdateReducer.current_update,
    show_firmware_update_list : state.firmwareUpdateReducer.show_firmware_update_list,
    selected_version : state.firmwareUpdateReducer.selected_version,
    selected_files: state.firmwareUpdateReducer.selected_files,
    device : state.scanCentralReducer.central_device,
    user_data : state.loginReducer.user_data,
});

export default connect(mapStateToProps)(UpdateFirmwareCentral)