import React, {Component} from 'react'
import { connect } from 'react-redux';
import Background from '../../helpers/background'
import {
    option_blue,
    width,
    height,
    gray_background,
    success_green,
    first_color
} from '../../styles/index.js'
import {
	TouchableHighlight,
	View,
	Text,
	Alert,
    NativeModules,
    NativeEventEmitter,
    ScrollView,
    Image,
    Animated,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native'

import {
    HEADERS_FOR_POST,
    GET_HEADERS,
    prettyBytesToHex,
    bytesToHex,
    RADIO_FIRMWARE_UPDATE,
    APP_FIRMWARE_UDATE,
    BLUETOOTH_FIRMWARE_UPDATE,
    PRETY_VERSION,
    LOADING_VALUE
} from '../../constants.js'
import {WhiteRowLink,WhiteRowInfoLink,WhiteRowInfoButton} from '../../helpers/white_row_link'
import {
    IS_CONNECTED
} from '../../action_creators'

import {
    FIRMWARE_UPDATE_ACCIONS,
    fetchFirmwareFile
} from '../../action_creators/firmware_update'

import ProgressBar from 'react-native-progress/Bar';
import Icon from 'react-native-vector-icons/FontAwesome';
const check = (<Icon name="check" size={75} color="green"/>)

const FIRMWARE_UPDATE_AVAIBLE  = 0
const UPDATING_FIRMWARE = 1
const FINISHING_FIRMWARE_UDAPTE = 2
const SYSTEM_UPDATED = 3


var filling_interval = 0


class FirmwareUpdate extends Component{

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true,
    }   

	constructor(props) {
    	super(props);	
        this.device = this.props.device
        this.hardware_type = parseInt(this.props.device.manufactured_data.hardware_type) 
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    async componentWillMount(){
        console.log("componentWillMount()")
        this.resetVariables()
        await this.fetchFirmwareFiles()
    }

    async fetchFirmwareFiles(){
        const return_files_array = true
        const hardware_type = this.hardware_type
        const {dispatch} = this.props

        let app_files = await fetchFirmwareFile(APP_FIRMWARE_UDATE,hardware_type,return_files_array)
        let radio_files = await fetchFirmwareFile(RADIO_FIRMWARE_UPDATE,hardware_type,return_files_array)
        let bluetooth_files = await fetchFirmwareFile(BLUETOOTH_FIRMWARE_UPDATE,hardware_type,return_files_array)

        if(app_files.length && radio_files.length && bluetooth_files.length){
            dispatch({type: "SET_APP_FIRMWARE_FILES_ON_CLOUD",app_firwmare_files_on_cloud:app_files})
            dispatch({type: "SET_RADIO_FIRMWARE_FILES_ON_CLOUD",radio_firwmare_files_on_cloud:radio_files})
            dispatch({type: "SET_BLUETOOTH_FIRMWARE_ON_CLOUD",bluetooth_firwmare_files_on_cloud:bluetooth_files})
        }else{
            console.error("Error getting the major versions from the cloud")
        }

        return new Promise.resolve()
    }

    resetVariables(){
        var {dispatch} = this.props
        
        dispatch({type: "RESET_ANIMATIONS"})
        dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage: 0})
        dispatch({type: "SET_SHOW_FIRMWARE_UPDATE_DETAILS",show_firmware_update_details:false})
        dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status:0 })
        dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: 0})
        dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect : true})
    }


    componentWillUnMount(){
        var {dispatch} = this.props
        dispatch({type: "SET_MANUAL_DISCONNECT",manual_disconnect : false})   
    }

    startAllFirmwareUpdate(){
        this.props.dispatch({type: "SET_COMPLETE_FIRMWARE_UPDATE_ON_COURSE",complete_firmware_update_on_course: true})
        this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE)
    }

    startRadioAndAplicationFirmwareUpdate(){
        this.props.dispatch({type: "SET_RADIO_AND_APLICATION_FIRMWARE_UPDATE",radio_and_aplication_firmware_update: true})
        this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE)
    }

    startRadioBluetoothFirmwareUpdate(){
        this.props.dispatch({type: "SET_RADIO_AND_BLUETOOTH_FIRMWARE_UPDATE",radio_and_bluetooth_firmware_update: true})
        this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE)   
    }

    startApplicationAndBluetoothFirmwareUpdate(){
        this.props.dispatch({type: "SET_APPLICATION_AND_BLUETOOTH_FIRMWARE_UPDATE",application_and_bluetooth_firmware_update:true})
        this.props.startFirmwareUpdate(APP_FIRMWARE_UDATE)
    }


    addToSliderPorcentage(){
        if(this.props.filling_porcentage < 1){
            var new_porcentage = this.props.filling_porcentage + 0.20
            this.props.dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage:new_porcentage})
        }else {
            this.deletePorcentageInteval()
            
            const type = this.props.current_firmware_update

            if(type == RADIO_FIRMWARE_UPDATE){
                this.finishRadioFirmwareUpdate()
            }

            if(type == APP_FIRMWARE_UDATE){
                this.finishAppFirmwareUpdate()
            }

            if(type == BLUETOOTH_FIRMWARE_UPDATE){
                this.finishBluetoothFirmwareUpdate()
            }
        }
    }

    showDetails(){
        this.props.dispatch({type: "SET_SHOW_FIRMWARE_UPDATE_DETAILS",show_firmware_update_details:true})
    }

    hideDetails(){

        this.props.dispatch({type: "SET_SHOW_FIRMWARE_UPDATE_DETAILS",show_firmware_update_details:false})  

    }

    renderFirmwareUpdateBox(){

        if(this.props.firmware_update_status == FIRMWARE_UPDATE_AVAIBLE){
            return ( this.props.current_firmware_update == 0 && (
                    <View style={{alignItems:"center",justifyContent:"center",borderWidth:1,padding:30,width:300,height:300,backgroundColor:"white"}}>
                        <Text style={{fontSize:30,marginVertical:5,color:"black"}}>
                            Current Version  
                        </Text>
                        <Text style={{fontSize:28,color:"black",fontWeight:'bold'}}>
                            {PRETY_VERSION(parseFloat(this.props.app_info[0]) + "." + this.props.app_info[1])}
                        </Text>
                    
                        <Text style={{fontSize:30,borderTopWidth:1,marginVertical:5,color:"black"}}>
                            Available Version
                        </Text>
                        <Text style={{fontSize:28,color:"black",fontWeight:'bold'}}>
                            {this.props.major_general_version ? PRETY_VERSION(this.props.major_general_version) : LOADING_VALUE}
                        </Text>
                        <View style={{alignItems:"center",marginVertical:10}}>
                            <Text style={{color:"black",fontSize:15}}>
                                The system can be updated.
                            </Text>
                        </View>                            
                    </View>
                    )
                )       
        }

        if(this.props.firmware_update_status == SYSTEM_UPDATED){
            return (
                <View style={{width:300,height:300,backgroundColor:"white",borderRadius:5,borderWidth:1,alignItems:"center",justifyContent:"center"}}>
                    <Text style={{fontSize:32}}>
                        Current Version  
                    </Text>
                
                    <Text style={{marginBottom:5,fontSize:24,color:"black",fontWeight:'bold'}}>
                        Version 2.0
                    </Text>

                    <View style={{marginVertical:10}}>
                        {check}
                    </View>
                    <View style={{alignItems:"center",paddingHorizontal:25}}>
                        <Text style={{color:"black",fontSize:15}}>
                            The system has the latest firmware version.
                        </Text>
                    </View>
                </View>         
            )
        }

        return null
    }


    uselessButtons(){
        const backgroundColor = "#f5faff"
        const text_style = {
            color: "black",
            fontSize:18
        } 

        return(
            <View>
                <Text style={{margin:20}}>
                    APPLICATION VERSION
                </Text>
                

                <WhiteRowInfoButton name="Start App update" value="something" callback={() =>  this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE) } />
                
                <FlatList data={this.props.app_firwmare_files_on_cloud} renderItem={item => this.renderFirmwareFile(item)} keyExtractor={(item, index) => index}/>
                
                <FlatList data={this.props.radio_firwmare_files_on_cloud} renderItem={item => this.renderFirmwareFile(item)} keyExtractor={(item, index) => index}/>
                
                <FlatList data={this.props.bluetooth_firwmare_files_on_cloud} renderItem={item => this.renderFirmwareFile(item)} keyExtractor={(item, index) => index}/>


                <TouchableHighlight style={{padding:10,backgroundColor:backgroundColor,padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(APP_FIRMWARE_UDATE)}>
                    <Text style={text_style}>
                        Start App
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{padding:10,backgroundColor:backgroundColor,padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(BLUETOOTH_FIRMWARE_UPDATE)}>
                    <Text style={text_style}>
                        Start Bluetooth
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{padding:10,backgroundColor:backgroundColor,padding:20,alignItems:"center",margin:20}} onPress={() => this.startAllFirmwareUpdate()}>
                    <Text style={text_style}>
                        Start All FirmwareUpdate
                    </Text>
                </TouchableHighlight>            
            </View>
        )
    }

    renderFirmwareFile(item){
            
    }

    firmwareUpdateLoader(){
        var porcentage = this.props.filling_porcentage
        return(
            <Animated.View style={{width:width,height:100,borderWidth:1,backgroundColor:"white"}}>
                <Animated.Image />
            </Animated.View>
        )    
    }

    renderRadioBox(){
        if(this.props.firmware_update_status == UPDATING_FIRMWARE || this.props.current_firmware_update == APP_FIRMWARE_UDATE || this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE){
            var text = "R"
            var box_color = success_green
            var text_color = "white"
            var little_check = <Icon name="check" size={15} color="white"/>
            if(this.props.current_firmware_update == RADIO_FIRMWARE_UPDATE){
                text = "Updating Radio Firmware"
                box_color = "white"
                text_color = "black"                
                little_check = null
            }

            return(
              <Animated.View style={{
                width:this.props.radioFirmwareUpdateBoxShape.x,
                height:this.props.radioFirmwareUpdateBoxShape.y,
                top:this.props.radioFirmwareUpdateBoxPosition.x,
                left:this.props.radioFirmwareUpdateBoxPosition.y,
                borderRadius:this.props.radioFirmwareUpdateBoxRadius,
                alignItems:"center",
                justifyContent:"center",
                borderWidth:1,
                position:"absolute",
                backgroundColor:box_color,
                borderColor:box_color
              }}>            

                    <View style={{width:300,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5}}>
                        <Text style={{fontSize:20,color:text_color}}>
                            {text}
                        </Text>
                        {little_check}
                        {this.props.current_firmware_update == RADIO_FIRMWARE_UPDATE && this.renderInfo()} 
                    </View>
              </Animated.View>
            )
        }
        return null
    }

    renderAppBox(){
        if(this.props.current_firmware_update == APP_FIRMWARE_UDATE || this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE){
            var text = "A"
            var box_color = success_green
            var text_color = "white"
            var little_check = <Icon name="check" size={15} color="white"/>
            if(this.props.current_firmware_update == APP_FIRMWARE_UDATE){
                text = "Updating App Firmware"
                box_color = "white"
                text_color = "black"
                little_check = null
            }

            return(
                <Animated.View style={{
                    width:this.props.appFirmwareUpdateBoxShape.x,
                    height:this.props.appFirmwareUpdateBoxShape.y,
                    top:this.props.appFirmwareUpdateBoxPosition.x,
                    left:this.props.appFirmwareUpdateBoxPosition.y,
                    borderRadius:this.props.appFirmwareUpdateBoxRadius,
                    alignItems:"center",
                    justifyContent:"center",
                    borderWidth:1,
                    position:"absolute",
                    backgroundColor:box_color,
                    borderColor:box_color
                  }}>            
                        <View style={{width:300,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5}}>
                            <Text style={{fontSize:20,color:text_color}}>
                                {text}
                            </Text>
                            {little_check}
                            {this.props.current_firmware_update == APP_FIRMWARE_UDATE && this.renderInfo()}
                        </View>
                  </Animated.View>
            )
        }

        return null
    }

    renderBluetoothBox(){
        if(this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE ){
            let text = "Updating Bluetooth Firmware"
            let backgroundColor = "white"
            let text_color = "black"
            if(this.props.firmware_update_status == FINISHING_FIRMWARE_UDAPTE ){
                text = "B"
                backgroundColor = success_green
                text_color = "white"
            }

            return(
                <Animated.View style={{
                    width:this.props.bluetoothFirmwareUpdateBoxShape.x,
                    height:this.props.bluetoothFirmwareUpdateBoxShape.y,
                    top:this.props.bluetoothFirmwareUpdateBoxPosition.x,
                    left:this.props.bluetoothFirmwareUpdateBoxPosition.y,
                    borderRadius:this.props.bluetoothFirmwareUpdateBoxRadius,
                    alignItems:"center",
                    justifyContent:"center",
                    borderWidth:1,
                    position:"absolute",
                    backgroundColor:backgroundColor,
                    borderColor: backgroundColor
                  }}>            
                        <View style={{width:300,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5}}>
                            <Text style={{fontSize:18,color:text_color}}>
                                {text}
                            </Text>
                            {(this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE) && (this.props.firmware_update_status != FINISHING_FIRMWARE_UDAPTE) && this.renderInfo()}
                        </View>
                </Animated.View>
            )
        }
    }


    chooseMajorVersion(type){
        let major_version = 0
        let app_version = 0
        let radio_version = 0
        let bluetooth_version = 0

        if(type == "MAJOR_VERSION_ON_CLOUD"){
            app_version = this.props.app_major_version_on_cloud
            radio_version = this.props.radio_major_version_on_cloud
            bluetooth_version = this.props.bluetooth_major_version_on_cloud

        }else if(type == "MAJOR_VERSION_ON_BRIDGE"){
            app_version = parseFloat(this.props.app_info[0] + "." + this.props.app_info[1]) 
            radio_version = parseFloat(this.props.radio_info[0] + "." + this.props.radio_info[1]) 
            bluetooth_version = parseFloat(this.props.bluetooth_info[0] + "." + this.props.bluetooth_info[1])

        }else{
            console.error("ChooseeMajor Version has an incorrect type")
        }

        /*
            console.log("app_version 1",app_version)
            console.log("radio_version 1",radio_version)
            console.log("bluetooth_version 1",bluetooth_version)
        */

        if(app_version >= radio_version){
            major_version = app_version
            if(bluetooth_version > app_version){
                major_version = bluetooth_version
            }
        }else{
            major_version = radio_version
            if(radio_version > bluetooth_version){
                major_version = bluetooth_version
            }
        }

        return major_version
    }


    startFirmwareUpdate(){
        this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE)
        setTimeout(() => {
            this.props.navigator.setButtons({rightButtons:[
                {
                    title: "SHOW DETAILS",
                    id: "show_details"
                }                                
            ]})
        },3000)
    }

    renderInfo(){

        return(
            <View style={{alignItems:"center",marginBottom:20}}>
                <View style={{marginVertical:20,alignItems:"center"}}>
                    <Text>
                        Updating Version 2.0 
                    </Text>
                    <Text>
                        To
                    </Text>
                    <Text>
                        Version 2.1
                    </Text>
                </View>
                <ProgressBar progress={this.props.filling_porcentage} width={width-200} height={5} borderRadius={5} color={option_blue}/>
                <Text>
                    {parseInt(this.props.filling_porcentage  * 100)} %
                </Text>
            </View>
        )        
    }


    renderDetails(){
        if(this.props.firmware_update_status == UPDATING_FIRMWARE && this.props.show_firmware_update_details){
            return(
                <ScrollView style={{height:height,width:width - 100,backgroundColor:"white",top:(30),borderRadius:10 }}>
                    <View style={{width:width - 100,alignItems:"center"}}>
                        <View style={{width:width - 100,padding:20,alignItems:"center"}}>
                            <FlatList data={this.props.firmware_update_logs} renderItem={item => this.renderItem(item)} keyExtractor={(item, index) => index}/>
                        </View>
                    </View>
                </ScrollView>
            )
        }
        return null
    }

    renderItem(item){
        
        var command = FIRMWARE_UPDATE_ACCIONS.get(item.item.command) 
        var extra_data = item.item.extra_data

        return (
            <View>
                <Text>
                    {command}
                </Text>
                {extra_data ? (
                    <Text>
                        {"page count: "  + extra_data.page_count + " total_pages " + extra_data.total_pages}
                    </Text>
                ) : null} 
            </View>
        )
    }

    renderFinishingFirmwareUpdate(){
        if(this.props.firmware_update_status == FINISHING_FIRMWARE_UDAPTE){
            return(
                <View style={{width:300,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5,backgroundColor:"white"}}>
                    <Text style={{fontSize:18,color:"black"}}>
                        FINISHING FIRMWARE UPDATE
                    </Text>
                    <ActivityIndicator />
                </View>        
            )            
        }
    }

	render(){
        //console.log("this.props.radio_board_version",this.props.radio_board_version)

        if(this.props.radio_info.length == 0){
            return (
                <View style={{backgroundColor:gray_background,height:height}}> 
                    <ActivityIndicator /> 
                </View>
            )
        }

		return(
            <View style={{backgroundColor:gray_background,height:height}}>
                {this.uselessButtons()}
            </View> 
		)
	}
}

const mapStateToProps = state => ({
	device : state.scanCentralReducer.central_device,
	app_info : state.setupCentralReducer.app_info,
  	radio_info : state.setupCentralReducer.radio_info,
    bluetooth_info: state.setupCentralReducer.bluetooth_info,
    bluetooth_version : state.setupCentralReducer.bluetooth_version,
    complete_firmware_update_on_course: state.updateFirmwareCentralReducer.complete_firmware_update_on_course,
    radio_and_aplication_firmware_update: state.updateFirmwareCentralReducer.radio_and_aplication_firmware_update,
    radio_and_bluetooth_firmware_update: state.updateFirmwareCentralReducer.radio_and_bluetooth_firmware_update,
    application_and_bluetooth_firmware_update: state.updateFirmwareCentralReducer.application_and_bluetooth_firmware_update,
    app_version : state.setupCentralReducer.app_version,
    radio_version : state.setupCentralReducer.radio_version,
    filling_porcentage : state.updateFirmwareCentralReducer.filling_porcentage,
    show_firmware_update_details : state.updateFirmwareCentralReducer.show_firmware_update_details,
    firmware_update_status : state.updateFirmwareCentralReducer.firmware_update_status,
    current_firmware_update: state.updateFirmwareCentralReducer.current_firmware_update,
    firmareButtonAnimation: state.updateFirmwareCentralReducer.firmareButtonAnimation,
    radioFirmwareUpdateBoxRadius: state.updateFirmwareCentralReducer.radioFirmwareUpdateBoxRadius,
    radioFirmwareUpdateBoxPosition: state.updateFirmwareCentralReducer.radioFirmwareUpdateBoxPosition,
    radioFirmwareUpdateBoxShape: state.updateFirmwareCentralReducer.radioFirmwareUpdateBoxShape,
    appFirmwareUpdateBoxRadius: state.updateFirmwareCentralReducer.appFirmwareUpdateBoxRadius,
    appFirmwareUpdateBoxPosition: state.updateFirmwareCentralReducer.appFirmwareUpdateBoxPosition,
    appFirmwareUpdateBoxShape: state.updateFirmwareCentralReducer.appFirmwareUpdateBoxShape,
    bluetoothFirmwareUpdateBoxRadius: state.updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxRadius,
    bluetoothFirmwareUpdateBoxPosition: state.updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxPosition,
    bluetoothFirmwareUpdateBoxShape: state.updateFirmwareCentralReducer.bluetoothFirmwareUpdateBoxShape,
    firmware_update_logs: state.firmwareUpdateReducer.firmware_update_logs,
    app_major_version_on_cloud : state.updateFirmwareCentralReducer.app_major_version_on_cloud,
    radio_major_version_on_cloud: state.updateFirmwareCentralReducer.radio_major_version_on_cloud,
    bluetooth_major_version_on_cloud: state.updateFirmwareCentralReducer.bluetooth_major_version_on_cloud,
    major_general_version: state.updateFirmwareCentralReducer.major_general_version,
    app_firwmare_files_on_cloud: state.updateFirmwareCentralReducer.app_firwmare_files_on_cloud,
    radio_firwmare_files_on_cloud: state.updateFirmwareCentralReducer.radio_firwmare_files_on_cloud,
    bluetooth_firwmare_files_on_cloud: state.updateFirmwareCentralReducer.bluetooth_firwmare_files_on_cloud
});

export default connect(mapStateToProps)(FirmwareUpdate);