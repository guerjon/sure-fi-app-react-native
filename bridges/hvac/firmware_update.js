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
    LOADING_VALUE,
    THERMOSTAT_TYPE,
    EQUIPMENT_TYPE,
    RELAY_WIEGAND_CENTRAL,
    RELAY_WIEGAND_REMOTE,
    
} from '../../constants.js'

import {
    IS_CONNECTED
} from '../../action_creators'

import {
    FIRMWARE_UPDATE_ACCIONS,
    fetchFirmwareFile,
    FIRMWARE_LOG_CREATOR
} from '../../action_creators/firmware_update'

import ProgressBar from 'react-native-progress/Bar';
import Icon from 'react-native-vector-icons/FontAwesome';
const check = (<Icon name="check" size={75} color="green"/>)

const FIRMWARE_UPDATE_AVAIBLE  = 0
const UPDATING_FIRMWARE = 1
const FINISHING_FIRMWARE_UPDATE = 2
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
        if(this.hardware_type == 0)
            this.hardware_type = parseInt(this.props.device.manufactured_data.hardware_type,16)

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    async componentWillMount(){
        console.log("componentWillMount()")
        this.resetVariables()
        await this.fetchMajorVersion()
        const major_version_on_cloud = this.chooseMajorVersion("MAJOR_VERSION_ON_CLOUD")
        const major_version_on_bridge = this.chooseMajorVersion("MAJOR_VERSION_ON_BRIDGE")

        console.log("major_version_on_cloud",major_version_on_cloud)
        console.log("major_version_on_bridge",major_version_on_bridge)
        

        if(major_version_on_cloud > major_version_on_bridge){
            this.props.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: FIRMWARE_UPDATE_AVAIBLE})
            this.props.dispatch({type: "SET_MAJOR_GENERAL_VERSION",major_general_version: major_version_on_cloud})
        }
        else 
            this.props.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: SYSTEM_UPDATED})
        
    }

    onNavigatorEvent(event){
        if(event.type == 'NavBarButtonPress'){
            switch(event.id){
                case "show_details":
                    //console.log("this.props.show_firmware_update_details",this.props.show_firmware_update_details)
                    if(this.props.show_firmware_update_details){
                        this.hideDetails()
                        this.props.navigator.setButtons({rightButtons:[
                            {
                                title: "show info",
                                id: "show_details"
                            }                                
                        ]})
                    }else{
                        this.showDetails()
                        this.props.navigator.setButtons({rightButtons:[

                            {
                                title: "hide info",
                                id: "show_details"
                            }                                
                        ]})                        
                    }
                break
                default:
                break
            }
        }
    }

    isThermostat(){
        //console.log("isThermostat()")
        if(this.hardware_type == THERMOSTAT_TYPE || this.hardware_type == parseInt(THERMOSTAT_TYPE))
            return true

        return false
    }

    isEquipment(){
        //console.log("isEquipment()")
        if(this.hardware_type == EQUIPMENT_TYPE || this.hardware_type == parseInt(EQUIPMENT_TYPE))
            return true
        return false
    }



    async fetchMajorVersion(){
        console.log("fetchMajorVersion()",this.hardware_type)
        const return_files_array = true
        const hardware_type = this.hardware_type
        const {dispatch} = this.props

        let app_files = await fetchFirmwareFile(APP_FIRMWARE_UDATE,hardware_type,return_files_array)
        let radio_files = await fetchFirmwareFile(RADIO_FIRMWARE_UPDATE,hardware_type,return_files_array)
        let bluetooth_files = await fetchFirmwareFile(BLUETOOTH_FIRMWARE_UPDATE,hardware_type,return_files_array)

        console.log("app_files",app_files)
        console.log("radio_files",radio_files)
        console.log("bluetooth_files",bluetooth_files)


        if(this.isThermostat()){
            if(app_files.length && bluetooth_files.length){
                dispatch({type: "SET_APP_MAJOR_VERSION_ON_CLOUD",app_major_version_on_cloud: parseFloat(app_files[0].firmware_version)})
                dispatch({type: "SET_BLUETOOTH_MAJOR_VERSION_ON_CLOUD",bluetooth_major_version_on_cloud: parseFloat( bluetooth_files[0].firmware_version)})
            }else{
                this.showErrorGettingTheVersions()
            }
        }else{
            if(app_files.length && radio_files.length && bluetooth_files.length){

                dispatch({type: "SET_APP_MAJOR_VERSION_ON_CLOUD",app_major_version_on_cloud: parseFloat(app_files[0].firmware_version)})    
                dispatch({type: "SET_RADIO_MAJOR_VERSION_ON_CLOUD",radio_major_version_on_cloud: parseFloat(radio_files[0].firmware_version )})    
                dispatch({type: "SET_BLUETOOTH_MAJOR_VERSION_ON_CLOUD",bluetooth_major_version_on_cloud: parseFloat( bluetooth_files[0].firmware_version )})    

            }else{
                this.showErrorGettingTheVersions()
            }            
        }

        return new Promise.resolve()
    }

    showErrorGettingTheVersions(){
        Alert.alert("Error","Error downloading the firmware from the server.")
    }

    resetVariables(){
        console.log("resetVariables()")
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
        //console.log("showDetails()")
        this.props.dispatch({type: "SET_SHOW_FIRMWARE_UPDATE_DETAILS",show_firmware_update_details:true})
    }

    hideDetails(){
        console.log("hideDetails()")
        this.props.dispatch({type: "SET_SHOW_FIRMWARE_UPDATE_DETAILS",show_firmware_update_details:false})  

    }

    renderFirmwareUpdateBox(){

        if(this.props.firmware_update_status == FIRMWARE_UPDATE_AVAIBLE){
            return ( this.props.current_firmware_update == 0 && (
                    <View style={{alignItems:"center",justifyContent:"center",borderWidth:1,padding:30,width:width - 60,height:300,backgroundColor:"white",marginTop:30}}>
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
                <View style={{alignItems:"center",justifyContent:"center",borderWidth:1,padding:30,width:width - 60,height:300,backgroundColor:"white",marginTop:30}}>
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

                    <View style={{width:width - 60,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5}}>
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
            if(this.props.firmware_update_status == FINISHING_FIRMWARE_UPDATE ){
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
                            {(this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE) && (this.props.firmware_update_status != FINISHING_FIRMWARE_UPDATE) && this.renderInfo()}
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
            if(this.isThermostat()){
                app_version = this.props.app_major_version_on_cloud
                bluetooth_version = this.props.bluetooth_major_version_on_cloud
            }else{
                app_version = this.props.app_major_version_on_cloud
                radio_version = this.props.radio_major_version_on_cloud
                bluetooth_version = this.props.bluetooth_major_version_on_cloud                
            }

        }else if(type == "MAJOR_VERSION_ON_BRIDGE"){
            if(this.isThermostat()){            
                app_version = parseFloat(this.props.app_info[0] + "." + this.props.app_info[1]) 
                bluetooth_version = parseFloat(this.props.bluetooth_info[0] + "." + this.props.bluetooth_info[1])
            }else{
                app_version = parseFloat(this.props.app_info[0] + "." + this.props.app_info[1]) 
                radio_version = parseFloat(this.props.radio_info[0] + "." + this.props.radio_info[1]) 
                bluetooth_version = parseFloat(this.props.bluetooth_info[0] + "." + this.props.bluetooth_info[1])                
            }

        }else{
            console.error("ChooseeMajor Version has an incorrect type")
        }

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
        if(!this.isThermostat())
            this.props.startFirmwareUpdate(RADIO_FIRMWARE_UPDATE)
        else
            this.props.startFirmwareUpdate(APP_FIRMWARE_UDATE)

        setTimeout(() => {
            this.props.navigator.setButtons({rightButtons:[
                {
                    title: "show info",
                    id: "show_details"
                }                                
            ]})
        },3000)
    }

    renderInfo(){
        const porcentage_number = parseInt(this.props.filling_porcentage  * 100)
        var porcentage = (<Text> {porcentage_number} %</Text>)
        
        if(this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE && (porcentage_number == 0 )){
            porcentage = (
                <View style={{marginTop:5}}>  
                    <ActivityIndicator/>
                    <Text>
                        Searching for device ...
                    </Text>
                </View>
            )
        }


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
                <View>
                    {porcentage}
                </View>
            </View>
        )        
    }


    renderDetails(){
        //console.log("renderDetails()",this.props.firmware_update_status,this.props.show_firmware_update_details)
        if(this.props.show_firmware_update_details){
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

    getHeader(){
        const {firmware_update_status} = this.props

        if(firmware_update_status == FIRMWARE_UPDATE_AVAIBLE){
            return this.getFirmwareStatusBox("A firmware update is available",option_blue)
        }

        if(firmware_update_status == UPDATING_FIRMWARE){
            return this.getFirmwareStatusBox("Updating system ...","#F1C40F")
        }

        if(firmware_update_status == SYSTEM_UPDATED){
            return this.getFirmwareStatusBox("The system is updated",success_green) 
        }
                                                            
        return null
    }    

    getFirmwareStatusBox(text,color){
        const container_style = 
        {
            width:width,
            alignItems:"center",
            justifyContent:"center"
        }        

        let box_style = {
            width:300,
            height:30,
            backgroundColor:"white",
            alignItems:"center",
            justifyContent:"center",
            borderColor:color,
            borderWidth:3,
            marginTop:5,
            borderRadius:5
        }     
           
        return(
            <View style={container_style}>
                <View style={box_style}>
                    <Text style={{color:"black",padding:2,fontSize:18}}>
                        {text}
                    </Text>
                </View>                                 
            </View>
        )        
    }

    renderFirmwareUpdateButton(){
        var text = "Start Firmware Update"
        let action = () => this.startFirmwareUpdate()

        if(this.props.firmware_update_status == UPDATING_FIRMWARE){
            text = "Staring Firmware Update"
            action = () => console.log("System system updating")
        }

        if(this.props.firmware_update_status == SYSTEM_UPDATED){
            text = "System updated"
            action = () => console.log("System updated.")
        }

        return(
            <Animated.View style={{width:250,height:50,top:this.props.firmareButtonAnimation.x,left:this.props.firmareButtonAnimation.y,borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:success_green,marginTop:20,position:"absolute"}}>
                <TouchableOpacity onPress={action} style={{width:250,height:50,alignItems:"center",justifyContent:"center"}}> 
                    <Text style={{color:"white",alignItems:"center",justifyContent:"center"}}>
                        {text}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        )

        return null
    }

    renderFinishingFirmwareUpdate(){
        if(this.props.firmware_update_status == FINISHING_FIRMWARE_UPDATE){
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



        if(this.props.app_info.length == 0){
            return (
                <View style={{backgroundColor:gray_background,height:height}}> 
                    <ActivityIndicator /> 
                </View>
            )
        }

		return(
            <View style={{backgroundColor:gray_background,height:height}}>
                
                {this.getHeader()}

                <View style={{width:width,height:height - 30,alignItems:"center"}}>
                    {this.renderFirmwareUpdateBox()}
                    {this.renderRadioBox()}
                    {this.renderAppBox()}
                    {this.renderBluetoothBox()}
                    {this.renderFirmwareUpdateButton()}
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
    major_general_version: state.updateFirmwareCentralReducer.major_general_version
});

export default connect(mapStateToProps)(FirmwareUpdate);