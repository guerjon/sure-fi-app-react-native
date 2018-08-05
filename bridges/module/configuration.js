import React, {Component} from 'react'
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableHighlight,
    Alert,
    ActivityIndicator,
    Slider,
    FlatList,
    TouchableOpacity,
    TouchableNativeFeedback
} from 'react-native'
import {styles,first_color,width,height,success_green,red_error,option_blue,gray_background} from '../../styles/index.js'
import { connect } from 'react-redux';
import { 
    DEC2BIN,
    NOTIFICATION,
    BYTES_VALUES,
    BYTES_TO_INT_LITTLE_ENDIANG,
    INT_TO_BYTE_ARRAY,
    GET_CONFIGURATION_LOG_URL,
    NO_ACTIVITY,
    LOADING,
    LOADED,
    HEADERS_FOR_POST,
    SUCCESS_STATUS,
    DECIMAL_TO_FOUR_BYTES,
    prettyBytesToHex,
    BYTES_TO_HEX,
    UPDATING
} from '../../constants'
import Background from '../../helpers/background'
import {SWITCH} from '../../helpers/switch'
import Button from '../../helpers/button'
import Icon from 'react-native-vector-icons/FontAwesome';
const exclamationTriangle = (<Icon name="exclamation-triangle" size={20} color="white"/>)
import {
    HVAC_WRITE_COMMAND,
    LOG_INFO,
    JOIN_JSONS,
    parserIntSecondsToHumanReadable,
    parseSecondsToHumanReadable,
    CHECK_GENERIC_RESPONSE,
    ADD_ZEROS_UNTIL_NUMBER
} from '../../action_creators'

var bytes_values = BYTES_VALUES
const row_style = {
    alignItems:"center",
    flexDirection:"row",
    borderBottomWidth:.5,
    width:width,
    borderBottomColor:"gray",
    padding:10
}
const image_width = (width/2) - 50
const image_height = (width/2) - 50
const relay_nc = <Image style={{width:image_width,height:image_height}} source={require('../../images/relay_nc.imageset/relay_nc.png')} />  
const relay_no = <Image style={{width:image_width,height:image_height}} source={require('../../images/relay_no.imageset/relay_no.png') }/>


export const RELAY_TIME = params => {
    const relay_time = params.relay_time
    const option_selected = params.option_selected
    var style = {
        width:45,
        height:35,
        marginHorizontal:3,
        borderColor:option_blue,
        alignItems:"center",
        justifyContent:"center",
        borderWidth:1,
        borderRadius:5,
        backgroundColor: "white"
    }
    var style_text = {
        color:"black"
    }

    if(option_selected == relay_time){
        style.backgroundColor = option_blue        
        style_text.color = "white"
    }

    return(
        <TouchableNativeFeedback onPress={() => params.onPress()}>
            <View style={style}>
                <Text style={style_text}>
                    {params.text}
                </Text>
            </View>
        </TouchableNativeFeedback>
    )   
}

const WIEGAND_LED_OPTION = params => {
    const wiegand_led_mode = params.wiegand_led_mode
    const text = params.text
    const position = params.position
    let style = {
        width:width/3 -10,
        height:35,
        marginHorizontal:3,
        borderColor:option_blue,
        alignItems:"center",
        justifyContent:"center",
        borderWidth:1,
        borderRadius:5,
        backgroundColor: "white"
    }
    let style_text = {
        color:"black"
    }

    if(wiegand_led_mode == position){
        style.backgroundColor = option_blue        
        style_text.color = "white"
    }

    return(
        <TouchableOpacity style={style} onPress={() => params.onPress()}>
            <Text style={style_text}>
                {text}
            </Text>
        </TouchableOpacity>
    )
}


var setFailSafeOptionBytesToJson = (fail_safe_options) => {
    var json = {}
    fail_safe_options = fail_safe_options.map(x => parseInt(x))
    
    let relay_states = fail_safe_options[4] 
    var relay_options = null

    relay_states = DEC2BIN(relay_states)
    
    if(relay_states.length < 8){
        relay_options = ADD_ZEROS_UNTIL_NUMBER(relay_states,8).split("")    
    }else{
        relay_options = relay_states.split("")
    }
    
    relay_options = relay_options.map(x => parseInt(x))

    let temp_time = BYTES_TO_INT_LITTLE_ENDIANG(fail_safe_options.slice(0,4)) 
    
    if(temp_time > 10){
        json.fail_safe_options_time = temp_time - 10 // we rid of the 10 seconds differences in order to match with our heartbeat times
    }else{
        json.fail_safe_options_time = 0 // if is menor than 10 then should be 0, because there ara not 10 seconds value on the screen
    }

    json.relay_state = relay_options
    return json
}

class Configuration extends Component{

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
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.updating = false
    }

    componentWillMount(){
        console.log("componentWillMount()",this.props.heart_beat)
        this.loadingConfigurationData()
        this.fetchCloudFailSafeOption()

        if(this.props.isRemote()){
            this.featchCloudHeartbeat()   
        }
    }

    setRelayOptionSelected(){
        console.log("setRelayOptionSelected()")
        const local_fail_safe_options = this.getLocalFailSafeOptions()
        //console.log("local_fail_safe_options",local_fail_safe_options)
        let seconds_heart_beat = BYTES_TO_INT_LITTLE_ENDIANG(this.getCurrentHeartbeat()) 
        //console.log("seconds_heart_beat()",seconds_heart_beat)
        let option_selected = parseInt(local_fail_safe_options.fail_safe_options_time/seconds_heart_beat)
        this.updateRelayTimesSelected(option_selected)
    }

    updateRelayTimesSelected(value){
        this.props.dispatch({type: "SET_RELAY_TIMES_SELECTED",relay_times_selected: value})         
    }

    async fetchCloudFailSafeOption(){
        console.log("fetchCloudFailSafeOption()")
        
        this.props.dispatch({type: "SET_CLOUD_EQUIPMENT_FAIL_SAFE_OPTIONS",cloud_equipment_fail_safe_options:[]})

        let id = this.props.device.manufactured_data.tx

        var response = await fetch(GET_CONFIGURATION_LOG_URL,{
            headers: HEADERS_FOR_POST,
            method: 'POST',            
            body: JSON.stringify({
                "hardware_serial":id,
                "log_field": "BridgeRsp_FailsafeOption"
            })            
        })
        const clean_response =  CHECK_GENERIC_RESPONSE(response)
        
        if(clean_response){
            if(clean_response.value){
                
                let int_bytes = clean_response.value.match(/.{2}/g) //split in chunks of 2
                let bytes =  int_bytes.map(x => parseInt(x,16))
                this.props.dispatch({type: "SET_CLOUD_FAIL_SAFE_OPTIONS",cloud_fail_safe_options:bytes})

            }else{
                Alert.alert("Error","Error the fails safe options on the equipments are incorrect.")
            }
        }else{
            Alert.alert("Error","Error the fails safe options on the equipments are incorrect.")
        }
        this.setRelayOptionSelected()
        setTimeout(() => this.loadedConfigurationData(),1000)
    }
    loadingConfigurationData(){
        console.log("loadingConfigurationData()")
        this.props.dispatch({type: "SET_CONFIGURATION_DATA_STATE", configuration_data_state : LOADING})
    }

    loadedConfigurationData(){
        this.props.dispatch({type: "SET_CONFIGURATION_DATA_STATE", configuration_data_state : LOADED})
    }

    async featchCloudHeartbeat(){
        if(this.props.device.manufactured_data.tx){

            let response = await fetch(GET_CONFIGURATION_LOG_URL,{
                headers: HEADERS_FOR_POST,
                method: 'POST',            
                body: JSON.stringify({
                    "hardware_serial":this.props.device.manufactured_data.tx.toUpperCase(),
                    "log_field": "BridgeRsp_HeartbeatTime"
                })
            })

            if(response.status == SUCCESS_STATUS){
                if(response._bodyInit){
                    const data = JSON.parse(response._bodyInit)
                    console.log("data",data)
                    if(data.status == "success"){
                        const internal_data = data.data
                        if(data){
                            const value = internal_data.value
                            
                            if(value && value != ''){
                                let int_bytes = value.match(/.{2}/g) //split in chunks of 2
                                this.props.dispatch({type: "SET_CLOUD_HEART_BEAT",cloud_heart_beat: int_bytes.map(x => parseInt(x,16))})
                                this.setRelayOptionSelected()
                                this.loadedConfigurationData()
                            }else{
                                Alert.alert("Error","No FailSafe options Found")
                            }
                        }else{
                            Alert.alert("Error","The data doesn't include any value.")
                        }
                    }else{
                        Alert.alert("Server Error",data.msg)
                    }
                }else{
                    Alert.alert("Server Error","There are no body on the response")
                }
            }else{
                Alert.alert("Server Error",response.statusText)
            }            
        }else{
            Alert.alert("Error","The equipment in not paried.")
        }        
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "update":
                    this.update()
                break
                default:
                break
            }
        } 
    }

    update(){
        this.props.dispatch({type: "SET_CONFIGURATION_UPDATE_STATUS",configuration_update_status: UPDATING})
        this.props.setFailSafeOption(this.props.fail_safe_option)
    }


    /**
    * @param pos is a decimal, it would be 0 if we want modify the normal leds, it would be 1 if we want modify the power leds
    * currently the PhoneRsp_LedsEnabled return two bytes so this.props.actived_led is a two bytes array.
    */
    handleLedsEnabledButton(pos){
        console.log("handleLedsEnabledButton()",this.props.activated_led,pos)
        let new_value = this.props.activated_led[pos] == 0 ? 1 : 0
        
        if(pos == 0){
            var power_led_value = this.props.activated_led[1]
            this.props.updateLedsEnabled([new_value,power_led_value])    
        }else{
            var led_value = this.props.activated_led[0]
            this.props.updateLedsEnabled([led_value,new_value])
        }   
    }

    handleSetFailOptionsEnabledButton(local_value){
        let new_value = local_value == 0 ? 1 : 0
        let current_heart_beat = this.getCurrentHeartbeat()
        let heart_beat = BYTES_TO_INT_LITTLE_ENDIANG(current_heart_beat)

        this.updateRelayFailSafe(new_value,heart_beat)
    }

    getCurrentHeartbeat(){
        if(this.props.isCentral()){
            return this.props.heart_beat
        }else{
            return this.props.cloud_heart_beat
        }
    }

    /*
        return true if the heart beat is differente of 0 
    */
    decideHeartBeatStatus(fail_safe_option){
        if(Array.isArray(fail_safe_option)){
            if(fail_safe_option.length > 4){
                let temp_array = fail_safe_option.slice(0,4)
                let result = temp_array.reduce((a,b) => a + b, 0)
                if(result == 0){
                    return false
                }else{
                    return true
                }
            }else{
                Alert.alert("Error","The Fail safe option format isn't correct, the size is small.")
            }
        }else{
            Alert.alert("Error","The Fail safe option format isn't an array.")
        }
    }


    changeSwitchStatus(value,pos){
        let incomplete_bytes_string = this.props.fail_safe_option[4].toString(2)
        let bytes_string = ADD_ZEROS_UNTIL_NUMBER(incomplete_bytes_string,8)
        var relay_state = bytes_string.split("")
        relay_state[pos] = value.toString()
        
        var relay_state = relay_state.reduce((acomulator,currentValue) =>  acomulator.toString() + currentValue.toString(),"")
        
        current_fail_safe_option = this.props.fail_safe_option.slice()
        current_fail_safe_option[4] = parseInt(relay_state,2) 

        this.props.updateFailSafeOption(current_fail_safe_option)
    }


    getTrueOrFalseFromByte(byte){
        let value = parseInt(byte)
        if(value == 1){
            return true
        }else{
            return false
        }
    }

    updateRelayFailSafe(relay_times_selected,new_seconds){
        new_seconds = relay_times_selected  * new_seconds
        const relay_options = this.props.fail_safe_option.slice(4,5)
        let new_seconds_bytes = DECIMAL_TO_FOUR_BYTES(new_seconds + 10) 
        new_seconds_bytes.push(relay_options[0])
        console.log("new_seconds_bytes",new_seconds_bytes)
        this.props.updateFailSafeOption(new_seconds_bytes)
        this.updateRelayTimesSelected(relay_times_selected)
        
    }
   
    updateHeartBeat(value){
      let bytes_time =  DECIMAL_TO_FOUR_BYTES(value)
      this.props.updateHeartBeat(bytes_time)
    }

    updateHeartBeatAndHeartBeatTimes(value){
        this.updateHeartBeat(value)        
        let current_heartbeat_times = this.props.relay_times_selected
        this.updateRelayFailSafe(current_heartbeat_times,value)
    }

    renderHeatBeatTime(){
        if(this.props.isCentral()){
            if(this.props.heart_beat && (this.props.heart_beat.length == 4)){    
                let time = BYTES_TO_INT_LITTLE_ENDIANG(this.props.heart_beat)

                return (
                    <View>
                        <View style={styles.device_control_title_container}>
                            <Text style={styles.device_control_title}>
                                HEARTBEAT TIME
                            </Text>
                        </View>   
                        <View style={{backgroundColor:"white"}}>
                            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center",height:50}}>
                                <Button text="Off" width={width/9} active={time == 0} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(0)}/>
                                <Button text="1m" width={width/9} active={time == 60} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(60)}/>
                                <Button text="2m" width={width/9} active={time == 120} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(120)}/>
                                <Button text="5m" width={width/9} active={time == 300} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(300)}/>
                                <Button text="10m" width={width/9} active={time == 600} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(600)}/>
                                <Button text="30m" width={width/9} active={time == 1800} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(1800)}/>
                                <Button text="1h" width={width/9} active={time == 3600} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(3600)}/>
                                <Button text="2h" width={width/9} active={time == 7200} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeatAndHeartBeatTimes(7200)}/>
                            </View>
                            <View>
                                {this.showHeartbeatToShortWarning()}
                            </View>
                        </View>
                    </View>
                )
            }
        }else if(this.props.isRemote()){
            if(this.props.cloud_heart_beat && (this.props.cloud_heart_beat.length  == 4)){
                console.log("this.props.cloud_heart_beat",this.props.cloud_heart_beat)
                let time = parseSecondsToHumanReadable(this.props.cloud_heart_beat) 

                return (
                    <View>
                        <View style={styles.device_control_title_container}>
                            <Text style={styles.device_control_title}>
                                HEARTBEAT TIME
                            </Text>
                        </View>                         
                        <View style={{flexDirection:"row",justifyContent:"space-between",height:50,backgroundColor:"white",width:width,alignItems:"center"}}>
                            <Text style={{marginLeft:20,fontSize:18,color:"black"}}>
                                Sey by Controller to 
                            </Text>
                            <Text style={{marginRight:20,fontSize:18,color:"black"}}>
                                {time}
                            </Text>
                        </View>
                        <View>
                            {this.showHeartbeatToShortWarning()}
                        </View>
                    </View>
                )
            }   
        }
        
        return null
    }

    showHeartbeatToShortWarning(){
        const local_heart_beat = this.getLocalHearbeat()
        const cloud_heart_beat = this.getCloudHeartbeat()        
        const local_fail_safe_options_time = this.getLocalFailSafeOptions().fail_safe_options_time
        const cloud_fail_safe_options_time = this.getCloudFailSafeOptions().fail_safe_options_time

        if(local_fail_safe_options_time != 0 && (local_heart_beat < local_fail_safe_options_time) ){
            return this.remoteHeartbeatTimeWarning()
        }

        if(local_fail_safe_options_time != 0 && (cloud_heart_beat < local_fail_safe_options_time) ) {
            return this.remoteHeartbeatTimeWarning()
        }

        return null
    }

    getLocalHearbeat(){
        const local_heart_beat = BYTES_TO_INT_LITTLE_ENDIANG(this.props.heart_beat)
        return local_heart_beat
    }

    getLocalFailSafeOptions(){
        const local_fail_safe_options = setFailSafeOptionBytesToJson(this.props.fail_safe_option)
        return local_fail_safe_options
    }

    getCloudFailSafeOptions(){
        const cloud_fail_safe_options = setFailSafeOptionBytesToJson(this.props.cloud_fail_safe_options)
        return cloud_fail_safe_options
    }

    getCloudHeartbeat(){
        const cloud_heart_beat = BYTES_TO_INT_LITTLE_ENDIANG(this.props.cloud_heart_beat)
        return cloud_heart_beat
    }

    centralHeartbeatTimeWarning(){
        const local_heart_beat = this.getLocalHearbeat()
        const cloud_fail_safe_options = this.getCloudFailSafeOptions().fail_safe_options_time
        
        if(local_heart_beat < cloud_fail_safe_options){
            return(
                <TouchableOpacity onPress={() => this.showFailsafeOptionToShort()} style={{backgroundColor:"red",padding:10,alignItems:"center",flexDirection:"row",justifyContent:"center"}}>
                    <Text style={{color:"white",fontSize:14,justifyContent:"center",marginHorizontal:20}}>
                        Remote FAIL SAFE TIME too short. 
                    </Text>
                    {exclamationTriangle}
                </TouchableOpacity>
            )
        }
        
        return null
    }

    remoteHeartbeatTimeWarning(){
        const local_fail_safe_options = setFailSafeOptionBytesToJson(this.props.fail_safe_option).fail_safe_options_time
        const cloud_heart_beat = BYTES_TO_INT_LITTLE_ENDIANG(this.props.cloud_heart_beat)
        console.log("local_fail_safe_options",local_fail_safe_options)
        console.log("cloud_heart_beat",cloud_heart_beat)
        if(local_fail_safe_options < cloud_heart_beat){
            return(
                <TouchableOpacity onPress={() => this.showFailsafeOptionToShort()} style={{backgroundColor:"red",padding:10,alignItems:"center",flexDirection:"row",justifyContent:"center"}}>
                    <Text style={{color:"white",fontSize:14,justifyContent:"center",marginHorizontal:20}}>
                        REMOTE FAILSAFE is too short.
                    </Text>
                    {exclamationTriangle}
                </TouchableOpacity>
            )
        }

        return null
    }

    renderPairedFailSafeTime(){
        const cloud_fail_safe_options = setFailSafeOptionBytesToJson(this.props.cloud_fail_safe_options)
        const seconds_string = parserIntSecondsToHumanReadable(cloud_fail_safe_options.fail_safe_options_time) 

        if(this.props.isCentral()){
            return(
                <View style={{flexDirection:"row",justifyContent:"space-between",height:50,width:width,alignItems:"center"}}>
                    <Text style={{fontSize:18,color:"black"}}>
                        Remote Failsafe Delay Time : 
                    </Text>
                    <Text style={{marginRight:40,fontSize:18,color:"black"}}>
                        {cloud_fail_safe_options.fail_safe_options_time == 0 ? "Disabled" : seconds_string }
                    </Text>
                </View>

            )
        }else{
            return(
                <View style={{flexDirection:"row",justifyContent:"space-between",height:50,width:width,alignItems:"center"}}>
                    <Text style={{marginLeft:20,fontSize:18,color:"black"}}>
                        Failsafe Delay Time : 
                    </Text>
                    <Text style={{marginRight:20,fontSize:18,color:"black"}}>
                        {cloud_fail_safe_options.fail_safe_options_time == 0 ? "Disabled" : seconds_string }
                    </Text>
                </View>            
            )
        }
    }

    showFailsafeOptionToShort(){
        Alert.alert("Warning","The failsafe timeout on the paried device is shorter than the heartbeat. In order for the failsafe options to work correctly, make the heartbeat longer or make the failsafe timeout shorter.")
    }

    showHeartbeatOptionToShort(){
        Alert.alert("Warning","The failsafe timeout on the paried device is shorter than the heartbeat. In order for the failsafe options to work correctly, make the heartbeat longer or make the failsafe timeout shorter.")   
    }

    renderLedsEnabled(){

        let led_value = this.props.activated_led[0]
        let power_led_value = this.props.activated_led[1]
        
        let led_enable_text = led_value == 0 ? "Disabled" : "Enabled"
        let power_led_enable_text = power_led_value == 0 ? "Disabled" : "Enabled"

        var led_button_style = {padding:10,borderRadius:10,marginLeft:10,width:80,padding:7,alignItems:"center",backgroundColor:success_green,marginRight:5}
        var power_led_button_style = {padding:10,borderRadius:10,marginLeft:10,width:80,padding:7,alignItems:"center",backgroundColor:success_green,marginRight:5}
        
        led_button_style.backgroundColor = led_value == 0 ? "gray" : success_green
        power_led_button_style.backgroundColor = power_led_value == 0 ? "gray" : success_green
        const wiegand_led_mode = this.props.wiegand_led_mode 
        console.log("wiegand_led_mode",wiegand_led_mode)
        return(     
            <View style={{marginVertical:20,width:width}}>
                <View style={styles.device_control_title_container}>
                    <Text style={styles.device_control_title}>
                    LEDS SETTINGS
                    </Text>
                </View>                         
                <View style={{backgroundColor:"white"}}>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",height:50,borderBottomWidth:0.3}}>
                        <Text style={{fontSize:18,color:"black",marginLeft:20}}>
                            LEDs
                        </Text>
                        <TouchableOpacity onPress={() => this.handleLedsEnabledButton(0)} style={led_button_style}>
                            <Text style={{color:"white"}}>
                                {led_enable_text}
                            </Text>
                        </TouchableOpacity>
                    </View>            
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",height:50,borderBottomWidth:0.3}}>
                        <Text style={{fontSize:18,color:"black",marginLeft:20}}>
                            Power LEDs Enabled
                        </Text>
                        <TouchableOpacity onPress={() => this.handleLedsEnabledButton(1)} style={power_led_button_style}>
                            <Text style={{color:"white"}}>
                                {power_led_enable_text}
                            </Text>
                        </TouchableOpacity>
                    </View>                    
                </View>
                {this.props.isRemote() && (
                    <View style={{backgroundColor:"white"}}>

                        <View style={{width:width,alignItems:"center"}}>
                            <Text style={{padding:5,color:"black"}}>
                                Wiegand LED Mode
                            </Text>
                            <View style={{flexDirection:"row",padding:5}}>
                                <WIEGAND_LED_OPTION text="LED - Input" position={1} wiegand_led_mode={wiegand_led_mode} onPress={() => this.props.dispatch({type: "SET_WIEGAND_LED_MODE",wiegand_led_mode:1})} />
                                <WIEGAND_LED_OPTION text="Follow R1" position={2} wiegand_led_mode={wiegand_led_mode} onPress={() => this.props.dispatch({type: "SET_WIEGAND_LED_MODE",wiegand_led_mode:2})} />
                                <WIEGAND_LED_OPTION text="Follow R2" position={3} wiegand_led_mode={wiegand_led_mode} onPress={() => this.props.dispatch({type: "SET_WIEGAND_LED_MODE",wiegand_led_mode:3})} />
                            </View>
                        </View>
                    </View>            
                )}
            </View>   
        )   
    }


    renderRelaysTimes(local_fail_safe_options,type){   

        if(type == "central" && this.props.isCentral()){
            return this.getRelayTimes(local_fail_safe_options)
        }else if(type == "remote"  && this.props.isCentral()){
            return this.renderPairedFailSafeTime()
        }else if(type == "central" && this.props.isRemote()){
            return this.renderPairedFailSafeTime()
        }else if(type == "remote" && this.props.isRemote()){
            return this.getRelayTimes(local_fail_safe_options)
        }
    }   

    getRelayTimes(local_fail_safe_options){
        let current_heart_beat = this.getCurrentHeartbeat()
        let seconds_heart_beat =  BYTES_TO_INT_LITTLE_ENDIANG(current_heart_beat)
        
        let option_selected = this.props.relay_times_selected
        let time = seconds_heart_beat * option_selected
        let select_text =  time ? parserIntSecondsToHumanReadable(time) : "Disabled"
        

        if(option_selected >= 0 && option_selected <= 5){
            
            return (
                <View>
                    <View style={{height:50,alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                        <View style={{flexDirection:"row"}}>
                            <RELAY_TIME option_selected={option_selected} relay_time={0} onPress={() => this.updateRelayFailSafe(0, seconds_heart_beat)} text="OFF"/>
                            <RELAY_TIME option_selected={option_selected} relay_time={1} onPress={() => this.updateRelayFailSafe(1, seconds_heart_beat)} text="1x"/>
                            <RELAY_TIME option_selected={option_selected} relay_time={2} onPress={() => this.updateRelayFailSafe(2, seconds_heart_beat)} text="2x"/>
                            <RELAY_TIME option_selected={option_selected} relay_time={3} onPress={() => this.updateRelayFailSafe(3, seconds_heart_beat)} text="3x"/>
                            <RELAY_TIME option_selected={option_selected} relay_time={4} onPress={() => this.updateRelayFailSafe(4, seconds_heart_beat)} text="4x"/>
                            <RELAY_TIME option_selected={option_selected} relay_time={5} onPress={() => this.updateRelayFailSafe(5, seconds_heart_beat)} text="5x"/>
                        </View>
                        <View style={{alignItems:"center",justifyContent:"center",marginTop:5}}>
                            <Text style={{fontSize:18,color:"black"}}>  
                                {select_text}
                            </Text>
                        </View>
                    </View>
                </View>
            )
        }
        
        return null        
    }

    renderCentralInfo(){
        const backgroundColor = this.props.isCentral() ? "white" : "white"

        var actived = this.props.isCentral()

        if(actived){
            var local_fail_safe_options = setFailSafeOptionBytesToJson(this.props.fail_safe_option)    
        }else{
            var local_fail_safe_options = setFailSafeOptionBytesToJson(this.props.cloud_fail_safe_options)    
        }

        return(
            <View style={{width:width}}>
                <View style={{marginTop:10}}>
                    <View style={{padding:10}}>
                        <Text style={{}}>
                            CONTROLLER RELAY FAILSAFE - PAIRED DEVICE
                        </Text>
                    </View>
                </View> 
                <View style={{width:width,padding:10,backgroundColor:backgroundColor,marginBottom:20,marginTop:10}}>                                   
                    <View>
                        {this.renderRelaysTimes(local_fail_safe_options,"central")}
                    </View>                        
                    <View>
                        {this.renderImagesRelays(local_fail_safe_options,3,4,actived)}
                    </View>
                </View>
            </View>
        )    
    }

    renderRemoteInfo(){
        const backgroundColor = this.props.isRemote() ? "white" : gray_background
        var actived = this.props.isRemote()

        if(actived){
            var local_fail_safe_options = this.getLocalFailSafeOptions()
        }else{
            var local_fail_safe_options = this.getCloudFailSafeOptions()
        }


        var text = "REMOTE RELAY FAILSAFES - THIS DEVICE"

        if(this.props.isCentral())
            text = "REMOTE RELAY FAILSAFES - THIS DEVICE"



        return(
            <View style={{width:width}}>
                <View>
                    <Text style={{padding:10}}>
                        {text}
                    </Text>
                </View>   
                <View style={{width:width,padding:20,backgroundColor:backgroundColor,marginBottom:20}}>                                 
                    <View>
                        {this.renderRelaysTimes(local_fail_safe_options,"remote")}
                    </View>
                    <View>
                        {this.renderImagesRelays(local_fail_safe_options,1,2,actived)}
                    </View>
                </View>
            </View>
        )
    }

    
    renderImagesRelays(local_fail_safe_options,pos_1,pos_2,actived){
        const fail_safe_options_time = local_fail_safe_options.fail_safe_options_time
        const relay_state = local_fail_safe_options.relay_state
        const first_pos = relay_state[pos_1 - 1]
        const second_pos = relay_state[pos_2 - 1]
        const first_value =  first_pos == 0 ? 1 : 0
        const second_value = second_pos == 0 ? 1 : 0
        var content = null
        
        if(this.props.relay_times_selected != 0){
            if(fail_safe_options_time){
                if(actived){
                    return(
                        content = (     
                            <View style={{flexDirection:"row",width:width,alignItems:"center",justifyContent:"center"}}>
                                <TouchableNativeFeedback  onPress={() => this.changeSwitchStatus(first_value,pos_1 - 1)} useForeground={true}>
                                    <View style={{marginHorizontal:5,alignItems:"center",justifyContent:"center"}}>
                                    <Text style={{marginVertical:10,fontSize:20,color:"black"}}> Relay {pos_1}</Text> 
                                    {first_pos == 0 && relay_nc}
                                    {first_pos == 1 && relay_no}
                                    </View>
                                </TouchableNativeFeedback>
                                <TouchableNativeFeedback  onPress={() => this.changeSwitchStatus(second_value,pos_2 - 1)} useForeground={false}>
                                    <View style={{marginHorizontal:5,alignItems:"center",justifyContent:"center"}}>
                                        <Text style={{marginVertical:10,fontSize:20,color:"black"}}> Relay {pos_2}</Text> 
                                        {second_pos == 0 && relay_nc}
                                        {second_pos == 1 && relay_no}
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        )
                    )
                }else{
                    content = (
                        <View style={{flexDirection:"row",width:width,alignItems:"center",justifyContent:"center"}}>
                            <View style={{marginHorizontal:5,alignItems:"center",justifyContent:"center"}} >
                                <Text style={{marginVertical:10,fontSize:20,color:"black"}}> Relay {pos_1}</Text> 
                                {first_pos == 0 && relay_nc}
                                {first_pos == 1 && relay_no}
                            </View>
                            <View style={{marginHorizontal:5,alignItems:"center",justifyContent:"center"}}>
                                <Text style={{marginVertical:10,fontSize:20,color:"black"}}> Relay {pos_2}</Text> 
                                {second_pos == 0 && relay_nc}
                                {second_pos == 1 && relay_no}
                            </View>
                        </View>
                    )
                }
            
                return(
                    <View>
                        <View style={{justifyContent:"center",alignItems:"center"}}>
                            {content}
                        </View>
                    </View>
                )    
            }
        }
        return null                
    }



    render(){   
        console.log("render()",this.props.configuration_data_state + " " + this.props.configuration_data_state + " " + this.props.fail_safe_option.length)
        if(this.props.configuration_data_state == NO_ACTIVITY || this.props.configuration_data_state == LOADING || (this.props.fail_safe_option.length == 0))
            return (
                <Background>
                    <View>
                        <ActivityIndicator/>
                    </View>
                </Background>
            )

        return(
            <Background>
                 <ScrollView style={{height:height}} >  
                    {this.renderLedsEnabled()}
                    {this.renderHeatBeatTime()}
                    {this.renderCentralInfo()}
                    {this.renderRemoteInfo()}
                </ScrollView>                    
            </Background>
        );
    }
}


const mapStateToProps = state => ({
    device : state.scanCentralReducer.central_device,
    activated_led: state.scanCentralReducer.activated_led,
    power_activated_led: state.scanCentralReducer.power_activated_led,
    fail_safe_option : state.scanCentralReducer.fail_safe_option,
    configuration_data_state: state.scanCentralReducer.configuration_data_state,
    cloud_heart_beat : state.scanCentralReducer.cloud_heart_beat,
    pairing_info: state.scanCentralReducer.pairing_info,
    cloud_fail_safe_options: state.scanCentralReducer.cloud_fail_safe_options,
    equipments_paired_with : state.scanCentralReducer.equipments_paired_with,
    equipments_fail_safe_options : state.scanCentralReducer.equipments_fail_safe_options,
    heart_beat : state.scanCentralReducer.heart_beat,
    temp_fail_safe_options_value: state.scanCentralReducer.temp_fail_safe_options_value,
    relay_times_selected: state.scanCentralReducer.relay_times_selected,
    wiegand_led_mode: state.scanCentralReducer.wiegand_led_mode
});

export default connect(mapStateToProps)(Configuration);