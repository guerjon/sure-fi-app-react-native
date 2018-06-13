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
    PRETY_VERSION
} from '../../constants.js'

import {
    IS_CONNECTED
} from '../../action_creators'

import {
    COMMAND_NAME
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
    }

    componentWillMount(){
        this.resetVariables()
    }

    resetVariables(){
        var {dispatch} = this.props
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
                this.startAppFirmwareUpdate()
            }

            if(type == APP_FIRMWARE_UDATE){
                this.finishAppFirmwareUpdate()
                this.startBluetoothFirmwareUpdate()
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

    firmwareUpdateBox(){
        if(this.props.firmware_update_status == FIRMWARE_UPDATE_AVAIBLE){
            return ( this.props.current_firmware_update == 0 && (
                    <View style={{alignItems:"center",justifyContent:"center",borderWidth:1,padding:30,width:300,height:300,backgroundColor:"white"}}>
                        <Text style={{fontSize:30,marginVertical:5}}>
                            Current Version  
                        </Text>
                        <Text style={{fontSize:28,color:"black",fontWeight:'bold'}}>
                            {PRETY_VERSION(this.props.app_version)}
                        </Text>
                    
                        <Text style={{fontSize:30,borderTopWidth:1,marginVertical:5}}>
                            Available Version
                        </Text>
                        <Text style={{fontSize:28,color:"black",fontWeight:'bold'}}>
                            2.1
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
        return(
            <View>
                <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE)}>
                    <Text style={{color:"white"}}>
                        Start Radio
                    </Text>
                </TouchableHighlight>
                <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(APP_FIRMWARE_UDATE)}>
                    <Text style={{color:"white"}}>
                        Start App
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(BLUETOOTH_FIRMWARE_UPDATE)}>
                    <Text style={{color:"white"}}>
                        Start Bluetooth
                    </Text>
                </TouchableHighlight>


                <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startRadioAndAplicationFirmwareUpdate()}>
                    <Text style={{color:"white"}}>
                        Start Radio and Aplication
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startRadioBluetoothFirmwareUpdate()}>
                    <Text style={{color:"white"}}>
                        Start Radio and Bluetooth Firmware Update
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startApplicationAndBluetoothFirmwareUpdate()}>
                    <Text style={{color:"white"}}>
                        Start Application and Bluetooth Firmware Update
                    </Text>
                </TouchableHighlight>

                <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startAllFirmwareUpdate()}>
                    <Text style={{color:"white"}}>
                        Start All FirmwareUpdate
                    </Text>
                </TouchableHighlight>            
            </View>
        )
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

    renderShowLogsButton(){
        let action = () => this.showDetails()
        var details_text = "Show Details"

        if(this.props.show_firmware_update_details){
            details_text = "Hide Details"
            action = () => this.hideDetails()
        }

        if(this.props.firmware_update_status == UPDATING_FIRMWARE){
            return(
                <View style={{width:250,height:50,top:(height/2 + 50),left:((width/2) - 125),borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:gray_background,marginTop:20,position:"absolute"}}>
                    <TouchableOpacity onPress={action} style={{width:250,height:50,alignItems:"center",justifyContent:"center"}}> 
                        <Text style={{color:"blue",alignItems:"center",justifyContent:"center"}}>
                            {details_text}
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return null
    }


    renderDetails(){
        if(this.props.firmware_update_status == UPDATING_FIRMWARE && this.props.show_firmware_update_details){
            return(
                <ScrollView style={{height:height,width:width,backgroundColor:"white",top:((height - 200))}}>
                    <FlatList data={this.props.firmware_update_logs} renderItem={item => renderItem(item)}/>
                </ScrollView>
            )
        }
        return null
    }

    renderItem(item){
        console.log("item",item)
        return (
            <View>
                <Text>
                    {item.index}
                </Text>
            </View>
        )
    }

    getHeader(){
        if(this.props.firmware_update_status == FIRMWARE_UPDATE_AVAIBLE){
            return(
                <View style={{width:width,backgroundColor:option_blue,alignItems:"center",justifyContent:"center"}}>    
                    <Text style={{color:"black",padding:10,fontSize:18,color:"white"}}>
                        A firmware update is available
                    </Text>
                </View>
            )
        }

        if(this.props.firmware_update_status == UPDATING_FIRMWARE){
            return(
                <View style={{width:width,backgroundColor:"#F1C40F",alignItems:"center",justifyContent:"center"}}>  
                    <Text style={{color:"white",padding:10,fontSize:18,color:"white"}}>
                        Updating system ...
                    </Text>
                </View>     
            )
        }

        if(this.props.firmware_update_status == SYSTEM_UPDATED){
            return(
                <View style={{width:width,backgroundColor:success_green,alignItems:"center",justifyContent:"center"}}>  
                    <Text style={{color:"black",padding:10,fontSize:18,color:"white"}}>
                        The system is updated
                    </Text>
                </View>                                 
            )
        }
                                                            
        return null
    }    

    renderFirmwareUpdateButton(){
        var text = "Start Firmware Update"
        
        if(this.props.firmware_update_status == UPDATING_FIRMWARE){
            text = "Staring Firmware Update"
        }

        if(this.props.firmware_update_status == SYSTEM_UPDATED){
            text = "System updated"
        }

        return(
            <Animated.View style={{width:250,height:50,top:this.props.firmareButtonAnimation.x,left:this.props.firmareButtonAnimation.y,borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:success_green,marginTop:20,position:"absolute"}}>
                <TouchableOpacity onPress={() => this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE)} style={{width:250,height:50,alignItems:"center",justifyContent:"center"}}> 
                    <Text style={{color:"white",alignItems:"center",justifyContent:"center"}}>
                        {text}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        )

        return null
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
        //return this.uselessButtons()
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
                {this.getHeader()}
                <View style={{width:width,height:(height - 200),alignItems:"center",justifyContent:"center"}}>
                    {this.firmwareUpdateBox()}
                    {this.renderRadioBox()}
                    {this.renderAppBox()}
                    {this.renderBluetoothBox()}
                    {this.renderFirmwareUpdateButton()}
                    {this.renderShowLogsButton()}
                    {this.renderDetails()}
                    {this.renderFinishingFirmwareUpdate()}
                </View>
            </View> 
		)
	}
}

const mapStateToProps = state => ({
	device : state.scanCentralReducer.central_device,
	app_info : state.setupCentralReducer.app_info,
  	radio_info : state.setupCentralReducer.radio_info,
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
    firmware_update_logs: state.updateFirmwareCentralReducer.firmware_update_logs
});

export default connect(mapStateToProps)(FirmwareUpdate);