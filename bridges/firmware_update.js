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
    HEADERS_FOR_POST
} from '../constants.js'

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

const hardware_central_type = "eaa4c810-e477-489c-8ae8-c86387b1c62e"
const hardware_remote_type = "0ef2c2a6-ef1f-43e3-be3a-e69628f5c7bf"


class UpdateFirmwareCentral extends Component {


    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
    }   

    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Advanced', // for a textual button, provide the button title (label)
                id: 'advanced', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
            },
        ]
    };

    constructor(props) {
    	super(props);
    	this.device = props.central_device
        application_firmware_files = {}
        radio_firmware_files = {}
        bluetooth_firmware_files = {}
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "advanced":
                    this.showAdvanceView()
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
    }

    componentDidMount() {
        this.fetchFirmwareFiles()
    }

    changeView(){
        let view_kind = this.props.view_kind
        if(view_kind == "normal")
            this.showAdvanceView()
        if(view_kind == "advanced")
            this.showNormalView()
    }

    showAdvanceView(){
        this.props.dispatch({type: "SHOW_ADVANCED_VIEW"})
    }

    showNormalView(){
        this.props.dispatch({type: "SHOW_NORMAL_VIEW"})
    }

    fetchFirmwareFiles(){
        console.log("fetchFirmwareFiles()")

        var dispatch = this.props.dispatch;
        let hardware_central_type = "eaa4c810-e477-489c-8ae8-c86387b1c62e"
        let hardware_remote_type = "0ef2c2a6-ef1f-43e3-be3a-e69628f5c7bf"
        var application_body = {firmware_type: "application"}
        var radio_body = {firmware_type:"radio"}
        var bluetooth_body = {firmware_type: "bluetooth"}


        if(this.device.manufactured_data.hardware_type == "01"){
            
            application_body.hardware_type_key = hardware_central_type
            radio_body.hardware_type_key = hardware_central_type
            bluetooth_body.hardware_type_key = hardware_central_type

        }else{

            application_body.hardware_type_key = hardware_remote_type
            radio_body.hardware_type_key = hardware_remote_type
            bluetooth_body.hardware_type_key = hardware_remote_type
        }


        fetch(FIRMWARE_CENTRAL_ROUTE, {
            headers: HEADERS_FOR_POST,
            method: 'POST',
            body : JSON.stringify(application_body)
        })
        .then(response_1 => {
            
            fetch(FIRMWARE_CENTRAL_ROUTE,{
                headers: HEADERS_FOR_POST,
                method: 'POST',
                body : JSON.stringify(radio_body)

            }).then(response_2 => {
                
                fetch(FIRMWARE_CENTRAL_ROUTE,{
                    headers: HEADERS_FOR_POST,
                    method: 'POST',
                    body: JSON.stringify(bluetooth_body)
                }).then(response_3 => {

                    this.application_files = this.sortByFirmwareVersion(JSON.parse(response_1._bodyInit).data.files)
                    this.radio_files = this.sortByFirmwareVersion(JSON.parse(response_2._bodyInit).data.files)
                    this.bt_files = this.sortByFirmwareVersion(JSON.parse(response_3._bodyInit).data.files)
                    
                    let app_version = parseFloat(this.application_files[0].firmware_version)
                    let radio_version = parseFloat(this.radio_files[0].firmware_version)
                    let bt_version = parseFloat(this.bt_files[0].firmware_version)
                    let dispatch = this.props.dispatch
                    
                    this.largest_version = GET_LARGEST(app_version,radio_version,bt_version)
                    this.update_requires = this.checkRequireUpdates(app_version,radio_version,bt_version)
                    this.require_update = this.dispatchRequireUpdates(this.update_requires)

                    dispatch({type: "UPDATE_LARGEST_VERSION",largest_version: this.largest_version})
                    dispatch({type: "UPDATE_SELECTED_VERSION",selected_version : this.largest_version})
                    dispatch({type: "UPDATE_SELECTED_FILES",selected_files : {app_files : this.application_files[0],radio_files : this.radio_files[0], bt_files : this.bt_files[0] }})
                    dispatch({type: "CHANGE_TAB",active_tab: "app"})
                })
            })
        })
        .catch((error) => {
          console.warn(error);
        });
    }

    checkRequireUpdates(app_version,radio_version,bt_version){
        let props = this.props
        let require_app = props.app_version != app_version
        let require_radio = props.radio_version != radio_version
        let require_bt = props.bluetooth_version != bt_version

        return [require_app,require_radio,require_bt]
    }

    dispatchRequireUpdates(updates){
        let props = this.props
        let dispatch = props.dispatch
        let require_update = false
        //console.log("updates",updates)

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
        var order_files = files.sort((a,b) => b.firmware_version.localeCompare(a.firmware_version))
        return order_files;
    }

    handleDisconnectedPeripheral(){
       this.closeModal()
       
    }

    closeModal(){
       this.props.navigator.dismissModal() 
    }

    closeAndConnect(){
        console.log("closeAndConnect()")
        this.props.fastTryToConnect(this.device)
        this.props.navigator.dismissModal() 
    }

    appUpdateSuccess(){
        Alert.alert("Success","The app firmware is updated.")
    }

    radioUpdateSuccess(){
        Alert.alert("Success","The radio firmware is updated.")
    }

    btUpdateSuccess(){
        Alert.alert("Success","The bluetooth firmware is updated.")
    }

    getTabInfo(tab){

        let device = this.device    
        // [TODO] change the time on the startNextUpdate
        switch(tab){
            case "charging":
                return <ActivityIndicator/>
            case "app":
            return (
                <AppFirmwareUpdate 
                    device={device}  
                    firmware_files = {this.application_files}
                    startNextUpdate = {() => this.appUpdateSuccess()}
                    closeModal = {() => this.closeModal()}
                />)
            case "radio":
            return (
                <RadioFirmwareUpdate 
                    device={device}
                    firmware_files = {this.radio_files}
                    startNextUpdate = {() => this.radioUpdateSuccess()}
                    closeModal = {() => this.closeModal()}
                />
            )
            case "bluetooth":
            return (
                <BluetoothFirmwareUpdate 
                    device={device}  
                    closeModal={() => this.closeModal()}
                    firmware_files = {this.bt_files}
                    startNextUpdate = {() => this.btUpdateSuccess()}
                />
            )
            default:
                <ActivityIndicator/>
        }
    }

    getTextVersionStatus(status){
        switch(status){
            case "no_started":
                return "NOT STARTED"
            case "update_required":
                return "UPDATE REQUIRED"
            case "no_update_required":
                return "NO UPDATE REQUIRED"
            case "updating":
                return "UPDATING"
            case "updated":
                return "UPDATED"
            default:
                return "NO STATUS FOUND"
        }
    }

    startFirmwareUpdate(){
        
        let props = this.props
        let dispatch = props.dispatch

        if(this.require_update){
            dispatch({type: "HIDE_FIRMWARE_UPDATE_LIST"})

            if(props.radio_update_status == "update_required"){
                dispatch({type: "RADIO_UPDATE_STATUS",radio_update_status:"updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE",current_update : "radio"}) // this mount the component <AppFirmwareUpdate> and this component start the update automatically
                
            }else if(props.app_update_status == "update_required"){
                dispatch({type: "APP_UPDATE_STATUS",app_update_status:"updating"})
                
                dispatch({type: "UPDATE_CURRENT_UPDATE",current_update : "app"}) // this mount the component <RadioFirmwareUpdate> and this component start the update automatically
                
            }else if (props.bt_update_status == "update_required"){
                dispatch({type: "BT_UPDATE_STATUS",bt_update_status:"updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE",current_update : "bt"}) // this mount the component <BluetoothFirmwareUpdate> and this component start the update automatically  
            }

        }
    }

    startNextUpdate(current){
        let props = this.props
        let dispatch = props.dispatch

        if(current == "radio"){
            dispatch({type: "RADIO_UPDATE_STATUS",radio_update_status : "updated"})

            if(props.app_update_status == "update_required"){
                dispatch({type: "APP_UPDATE_STATUS",app_update_status : "updating"})
                dispatch({type: "UPDATE_CURRENT_UPDATE", current_update:"app"})
            }else if(props.bt_update_status == "update_required"){
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
        let app_files = this.application_files
        let radio_files = this.radio_files
        let bt_files = this.bt_files
        
        if(this.props.show_firmware_update_list){
            if(app_files.length == radio_files.length && radio_files.length == bt_files.length){
                var items = []
                for (var i = 0; i < app_files.length; i++) {
                    items.push({app_files: app_files[i],radio_files: radio_files[i], bt_files: bt_files[i]})
                }
            }else{
                items.push({app_files: app_files[0],radio_files: radio_files[0],bt_files:bt_files[0]})
            }          

            return ( 
                <FlatList data={items} renderItem={({item}) => this.renderItem(item)} keyExtractor={(item,index) => index}/>
            )

        }else{
            return null
        }
    }

    renderItem(item){
        let app_version = parseFloat(item.app_files.firmware_version)
        let radio_version = parseFloat(item.radio_files.firmware_version)
        let bt_version = parseFloat(item.bt_files.firmware_version)
        let largest_version = GET_LARGEST(app_version,radio_version,bt_version)

        return (
            <TouchableHighlight onPress={() => this.changeSelectedFirmware(largest_version,item,app_version,radio_version,bt_version)} style={{backgroundColor:"white",padding:15,borderBottomWidth:0.2}}>
                <Text>
                    App : {PRETY_VERSION(app_version)}  Radio : {PRETY_VERSION(radio_version)}  Bluetooth : {PRETY_VERSION(bt_version)}
                </Text>
            </TouchableHighlight>
        )
    }

    changeSelectedFirmware(largest_version,selected_files,app_version,radio_version,bt_version){
        this.update_requires =  this.checkRequireUpdates(app_version,radio_version,bt_version)
        this.require_update = this.dispatchRequireUpdates(this.update_requires)
        this.props.dispatch({type: "UPDATE_SELECTED_VERSION",selected_version : largest_version,selected_files:selected_files})
    }

    renderUpdateComponent(){
        let current_update = this.props.current_update
        let device = this.device
        let selected_version = this.props.selected_version
        let content = null

        switch(current_update){

            case "app":

                content = (
                    <AppFirmwareUpdate 
                        device={device}  
                        closeModal={() => this.closeModal()}
                        viewKind = {this.props.view_kind} 
                        firmwareFile = {this.application_files}
                        startNextUpdate = {kind => this.startNextUpdate(kind)}
                    />
                )
                break
                case "radio":
                let radio_firmware_file = this.props.selected_files.radio_files
                
                content = (
                    <RadioFirmwareUpdate
                        device={device}  
                        closeModal={() => this.closeModal()}
                        viewKind = {this.props.view_kind}
                        firmwareFile = {this.radio_files}
                        startNextUpdate = {kind => this.startNextUpdate(kind)}
                    />
                )
                break
            case "bt":
                let bt_firmware_file = this.props.selected_files.bt_files
                content = (
                    <BluetoothFirmwareUpdate 
                        device={device}  
                        closeAndConnect={() => this.closeAndConnect()}
                        viewKind = {this.props.view_kind}
                        firmwareFile = {this.bt_files}
                        startNextUpdate = {kind => this.startNextUpdate(kind)}
                    />
                )
                break
            default:
                content = null
        }

        return content
    }

    renderStartUpdateBtn(){
        if(this.largest_version){
            
            if(this.require_update){
                return (
                    <View style={{alignItems:"center"}}>
                        <TouchableHighlight 
                            onPress={() => this.startFirmwareUpdate()} 
                            style={{
                                width:width-20,
                                backgroundColor:success_green,
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

        return <ActivityIndicator style={{margin:30}}/>
    }

    renderNormalView(){
        
        let props = this.props
        return (
            <View>
                <View style={{backgroundColor:"white",marginTop:40}}>
                    <View style={{alignItems:"center"}}>
                        <View style={{backgroundColor:"gray",width:width,padding:10}}>
                            <View style={{marginLeft:10}}>
                                <Text style={{fontWeight:"900",color:"white"}}>
                                    Current Device Firmware Version
                                </Text>
                            </View>
                        </View>
                        <Text style={{fontWeight:"900",fontSize:25}}>
                            Up To Date - {props.largest_version.length > 1 ? ("V" + props.largest_version) : ("V" + props.largest_version + ".0")}
                        </Text>
                    </View>
                    <View style={{flexDirection:"row",justifyContent:"center"}}>
                        <View style={{alignItems:"center"}}>
                            <Text style={{fontWeight:"900",marginHorizontal:10}}>
                                Radio Firmware
                            </Text>
                            <Text>
                                {PRETY_VERSION(props.radio_version)}
                            </Text>
                        </View>
                        <View style={{alignItems:"center"}}>
                            <Text style={{fontWeight:"900",marginHorizontal:10}}>
                                App Firmware
                            </Text>
                            <Text>
                                {PRETY_VERSION(props.app_version)}
                            </Text>
                        </View>
                        <View style={{alignItems:"center"}}>
                            <Text style={{fontWeight:"900",marginHorizontal:10}}>
                                BT Firmware
                            </Text>
                            <Text>
                                {PRETY_VERSION(props.bluetooth_version)}
                            </Text>
                        </View>
                    </View>
                    <View style={{backgroundColor:"gray",padding:10,justifyContent:"center",flexDirection:"row"}}>
                        <View style={{flex:0.7,marginLeft:10}}>
                            <Text style={{color:"white"}}>
                                Selected Firmware Version : {PRETY_VERSION(this.props.selected_version)}
                            </Text>
                        </View>
                        <TouchableHighlight style={{flex:0.3,alignItems:"flex-end"}} onPress={() => this.showOrHideList()}>
                            <Icon name="plus-square" size={20} color="white"/> 
                        </TouchableHighlight>
                    </View>
                    <View style={{marginHorizontal:20,padding:5}}>
                        <Text>
                            Update Firmware to Version: {PRETY_VERSION(this.props.selected_version)}
                        </Text>
                    </View>
                    <View style={{marginHorizontal:20,padding:5}}>  
                        <Text>
                            Radio - {this.getTextVersionStatus(props.radio_update_status)}
                        </Text>
                        <Text>
                            Application - {this.getTextVersionStatus(props.app_update_status)}
                        </Text>
                        <Text>
                            Bluetooth - {this.getTextVersionStatus(props.bt_update_status)}
                        </Text>
                    </View>
                    <View>
                        {this.renderStartUpdateBtn()}
                    </View>
                </View>
                <View>
                    {this.getFirmwareList()}
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
                            V.{props.app_version}
                        </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => dispatch({type: "CHANGE_TAB",active_tab:"radio"})} style={styles.tab}>
                        <View style={{alignItems:"center"}}>
                        <Text style={radio_text_style}>
                            RADIO 
                        </Text>
                        <Text style={radio_text_style}>
                            V.{props.radio_version}
                        </Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => dispatch({type: "CHANGE_TAB",active_tab:"bluetooth"})} style={styles.tab}>
                        <View style={{alignItems:"center"}}>
                        <Text style={bluetooth_text_style}>
                            BLUETOOTH 
                        </Text>
                        <Text style={bluetooth_text_style}>
                            V.{this.props.bluetooth_version}
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
    central_device: state.scanCentralReducer.central_device,
    firmware_update_state: state.firmwareUpdateReducer.firmware_update_state,
    progress: state.firmwareUpdateReducer.progress,
    app_version : state.setupCentralReducer.app_version,
    radio_version : state.setupCentralReducer.radio_version,
    bluetooth_version : state.setupCentralReducer.bluetooth_version,
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
    selected_files: state.firmwareUpdateReducer.selected_files
});

export default connect(mapStateToProps)(UpdateFirmwareCentral)