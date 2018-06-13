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
    TouchableOpacity
} from 'react-native'
import {styles,first_color,width,height,success_green,red_error,option_blue} from '../../styles/index.js'
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

} from '../../constants'
import Background from '../../helpers/background'
import {SWITCH} from '../../helpers/switch'
import Button from '../../helpers/button'
import {
	HVAC_WRITE_COMMAND,
	LOG_INFO,
    JOIN_JSONS,
    parseSecondsToHumanReadable,
    CHECK_GENERIC_RESPONSE
} from '../../action_creators'

var bytes_values = BYTES_VALUES
var equipments_paired_with_interval = 0

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
        this.loadingConfigurationData()
        if(this.props.isEquipment()){
            
            this.fetchLog()

        }else if(this.props.isThermostat()){
            if(this.props.equipments_paired_with.length > 0){
                this.fetchLogThermostat()
            }else{
                this.createEquipmentsPairedWithInterval()
            }
        }else{
            console.log("Error","The device has not hardware type.")
        } 
    }

    createEquipmentsPairedWithInterval(){
        if(equipments_paired_with_interval == 0){
            equipments_paired_with_interval = setInterval(() => {
                if(this.props.equipments_paired_with_interval.length > 0){
                    this.deleteEquipmentsPairedWithInterval()
                    this.fetchLogThermostat()
                }
            },1000)
        }
    }

    deleteEquipmentsPairedWithInterval(){
        clearInterval(equipments_paired_with_interval)
    }

    loadingConfigurationData(){
        this.props.dispatch({type: "SET_CONFIGURATION_DATA_STATE", configuration_data_state : LOADING})
    }

    loadedConfigurationData(){
        this.props.dispatch({type: "SET_CONFIGURATION_DATA_STATE", configuration_data_state : LOADED})
    }

    async fetchLog(){
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
                            }else{
                                Alert.alert("Error","The data doesn't content any heartbeat value connect to the thermostat interface first.")
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

        this.loadedConfigurationData()
    }

    async fetchLogThermostat(){
        console.log("fetchLogThermostat()")
        
        this.props.dispatch({type: "SET_CLOUD_EQUIPMENT_FAIL_SAFE_OPTIONS",cloud_equipment_fail_safe_options:[]})

        let ids = this.props.equipments_paired_with
        let ids_text = ids.map(id => BYTES_TO_HEX(id).toUpperCase())
        console.log("ids_text",ids_text)
        var promises = ids_text.map(async (id) =>  {
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
                    let current_fail_safe_options = this.props.cloud_equipment_fail_safe_options.slice()
                    current_fail_safe_options.push(bytes)
                    this.props.dispatch({type: "SET_CLOUD_EQUIPMENT_FAIL_SAFE_OPTIONS",cloud_equipment_fail_safe_options:current_fail_safe_options})
                }else{
                    Alert.alert("Error","Error the fails safe options on the equipments are incorrect.")
                }
            }else{
                Alert.alert("Error","Error the fails safe options on the equipments are incorrect.")
            }
        })
        setTimeout(() => this.loadedConfigurationData(),1000)
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "update":
                    if(this.props.isThermostat()){
                        this.updateThermostat()
                    }else if(this.props.isEquipment()){
                        this.update()
                    }else{
                        Alert.alert("Error","The device hasn't hardware type.");
                    }
                break
                default:
                break
            }
        } 
    }

    update(){
    	console.log("update()",this.props.activated_led,this.props.fail_safe_option)
    	this.props.setFailSafeOption(this.props.fail_safe_option)
    	setTimeout(() => this.props.setActivateLed(this.props.activated_led),1000)
    }

    updateThermostat(){
        console.log("updateThermostat()",this.props.heart_beat,this.props.activated_led)
        this.props.setHeartbeat(this.props.heart_beat)
        setTimeout(() => this.props.setActivateLed(this.props.activated_led),2000)
    }

    handleLedsEnabledButton(){
        let new_value = this.props.activated_led[0] == 0 ? 1 : 0
        this.props.updateLedsEnabled([new_value])
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
        console.log("changeSwitchStatus",value,pos)
        let incomplete_bytes_string = this.props.fail_safe_option[4].toString(2)
        let bytes_string = this.addZerosUntilNumber(incomplete_bytes_string,8)
        var relay_state = bytes_string.split("")
        relay_state[pos] = value == 0 ? 1 : 0
        var relay_state = relay_state.reduce((acomulator,currentValue) =>  acomulator.toString() + currentValue.toString(),"")
        let current_fail_safe_option = this.props.fail_safe_option.slice()
        current_fail_safe_option[4] = parseInt(relay_state,2) 
        this.props.updateFailSafeOption(current_fail_safe_option)
    }

    addZerosUntilNumber(string,number){ 
        do{
            if(string.length < number){
                string = 0 + string    
            }
        }while(string.length < number)
        
        return string
    }

    getTrueOrFalseFromByte(byte){
        let value = parseInt(byte)
        if(value == 1){
            return true
        }else{
            return false
        }
    }

    relays(){
        let fail_safe_option = this.props.fail_safe_option.slice(0,4)
        let human_readable_time = parseSecondsToHumanReadable(fail_safe_option)
        let relays_states = this.props.fail_safe_option[4]  
        let minutes_slider_value = parseInt( BYTES_TO_INT_LITTLE_ENDIANG(fail_safe_option) / 60 )
        let bytes_string = this.props.fail_safe_option[4].toString(2)
        
        if(bytes_string.length < 8){
            relay_state = this.addZerosUntilNumber(bytes_string,8).split("")    
        }else{
            relay_state = bytes_string.split("")
        }
        const row_style = {
            alignItems:"center",
            flexDirection:"row",
            borderBottomWidth:.5,
            width:width,
            borderBottomColor:"gray",
            padding:10
        }

        return(
            <View style={{alignItems:"center",justifyContent:"center"}}>
                <View style={{alignItems:"center"}}>
                    <View style={row_style}>
                        <Text style={{width:width-70}}> Relay 1 (W,O/B) </Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[0])} onPress={(value) => this.changeSwitchStatus(value,0)}/>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-70}}>Relay 2 (Y)</Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[1])}  onPress={(value) => this.changeSwitchStatus(value,1)}/>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-70}}>Relay 3 (G)</Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[2])} onPress={(value) => this.changeSwitchStatus(value,2)}/>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-70}}>Relay 4 (Y2)</Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[3])} onPress={(value) => this.changeSwitchStatus(value,3)}/>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-70}}>Relay 5 (W2,AUX)</Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[4])}  onPress={(value) => this.changeSwitchStatus(value,4)}/>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-70}}>Relay 6 (E)</Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[5])} onPress={(value) => this.changeSwitchStatus(value,5)}/>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-70}}>Relay 7</Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[6])}  onPress={(value) => this.changeSwitchStatus(value,6)}/>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-70}}>Relay 8</Text> 
                        <SWITCH isActivated={this.getTrueOrFalseFromByte(relay_state[7])} onPress={(value) => this.changeSwitchStatus(value,7)}/>
                    </View>
                </View>
            </View>
        )
    }

    updateRelayFailSafe(new_seconds){
        const relay_options = this.props.fail_safe_option.slice(4,5)
        let new_seconds_bytes = DECIMAL_TO_FOUR_BYTES(new_seconds + 10) 
        new_seconds_bytes.push(relay_options[0])
        this.props.updateFailSafeOption(new_seconds_bytes)
    }

    relays_times(){   
        let seconds_fail_option = BYTES_TO_INT_LITTLE_ENDIANG(this.props.fail_safe_option.slice(0,4))
        let seconds_heart_beat = BYTES_TO_INT_LITTLE_ENDIANG(this.props.cloud_heart_beat)

        var option_style = {
            height:40,
            width:40,
            borderColor:option_blue,
            alignItems:"center",
            justifyContent:"center",
            borderTopWidth:1,
            borderBottomWidth:1,
            borderRightWidth:1
        }

        if(seconds_heart_beat != 0){
            let option_selected = parseInt(seconds_fail_option/seconds_heart_beat)  
            let current_hertbeat = option_selected * seconds_heart_beat
            var active_background = {backgroundColor:option_blue}
            
            var off_style = option_selected == 0 ? JOIN_JSONS(option_style,{backgroundColor:option_blue,borderLeftWidth:1}) : JOIN_JSONS(option_style,{borderLeftWidth:1}) 
            var first_style =  option_selected == 1 ? JOIN_JSONS(option_style,{backgroundColor:option_blue}) : option_style
            var second_style = option_selected == 2 ? JOIN_JSONS(option_style,{backgroundColor:option_blue}) : option_style
            var third_style = option_selected == 3 ? JOIN_JSONS(option_style,{backgroundColor:option_blue}) : option_style
            var fourth_style = option_selected == 4 ? JOIN_JSONS(option_style,{backgroundColor:option_blue}) : option_style
            var fifth_style = option_selected == 5 ? JOIN_JSONS(option_style,{backgroundColor:option_blue}) : option_style

            if(option_selected >= 0 && option_selected <= 5){

                return (
                    <View style={{height:50,flexDirection:"row",alignItems:'center',justifyContent:"center"}}>
                        <TouchableHighlight style={off_style} onPress={() => this.updateRelayFailSafe(0 * seconds_heart_beat)}>
                            <Text>
                                Off
                            </Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={first_style} onPress={() => this.updateRelayFailSafe(1 * seconds_heart_beat)}>
                            <Text>
                                1x
                            </Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={second_style} onPress={() => this.updateRelayFailSafe(2 * seconds_heart_beat)}>
                            <Text>
                                2x
                            </Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={third_style} onPress={() => this.updateRelayFailSafe(3 * seconds_heart_beat)}>
                            <Text>
                               3x
                            </Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={fourth_style} onPress={() => this.updateRelayFailSafe(4 * seconds_heart_beat)}>
                            <Text>
                                4x
                            </Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={fifth_style} onPress={() => this.updateRelayFailSafe(5 * seconds_heart_beat)}>
                            <Text>
                                5x
                            </Text>
                        </TouchableHighlight>
                        <View style={{alignItems:"center",justifyContent:"center",padding:20}}>
                            <Text> 
                                {current_hertbeat} s
                            </Text>
                        </View>
                    </View>
                )
            }
            console.log(option_selected)
        }else{
            Alert.alert("Error","The seconds of the heartbeat are 0.")
        }
    }   

    renderFailSafeOptionOn(element){
        console.log("element",element)
        let index = element.index
        let item = element.item
        let seconds_fail_option = BYTES_TO_INT_LITTLE_ENDIANG(item.slice(0,4))
        let relay_options = item.slice(4,5)
        let id = BYTES_TO_HEX(this.props.equipments_paired_with[index]).toUpperCase()
        
        if(relay_options.length < 8){
            relay_state = this.addZerosUntilNumber(relay_options,8).split("")    
        }else{
            relay_state = relay_options.split("")
        }

        const row_style = {
            alignItems:"center",
            flexDirection:"row",
            borderBottomWidth:.5,
            width:width,
            borderBottomColor:"gray",
            padding:10
        }

        return(
            <View>
                <Text style={{padding:10,fontSize:14}}>
                    Relay FAILSAFE DEFAULTS - {id}
                </Text>            
                <View style={{backgroundColor:"white",borderBottomWidth:1,borderTopWidth:1,padding:10,marginBottom:20}}>
                    <View style={{alignItems:"center",flexDirection:"row",borderBottomWidth:.5,width:width,borderBottomColor:"gray",padding:10,justifyContent:"space-between"}}>
                        <Text >
                            Equipment Failsafe Delay Time : 
                        </Text>
                        <Text style={{marginRight:15}}>
                            {seconds_fail_option} Sec
                        </Text>
                    </View>
                
                    <View style={row_style}>
                        <Text style={{width:width-90}}> Relay 1 (W,O/B) </Text> 
                        <Text>{relay_state[0] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-90}}>Relay 2 (Y)</Text> 
                        <Text>{relay_state[1] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-90}}>Relay 3 (G)</Text> 
                        <Text>{relay_state[2] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-90}}>Relay 4 (Y2)</Text> 
                        <Text>{relay_state[3] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-90}}>Relay 5 (W2,AUX)</Text> 
                        <Text>{relay_state[4] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-90}}>Relay 6 (E)</Text> 
                        <Text>{relay_state[5] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-90}}>Relay 7</Text> 
                        <Text>{relay_state[6] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                    <View style={row_style}>
                        <Text style={{width:width-90}}>Relay 8</Text> 
                        <Text>{relay_state[7] == 1 ? "Enabled" : "Disabled"}</Text>
                    </View>
                </View>            
            </View>
        )
    }

    updateHeartBeat(value){
      let bytes_time =  DECIMAL_TO_FOUR_BYTES(value)
      this.props.updateHeartBeat(bytes_time)
    }

    renderHeatBeatTimeStuffs(){
        console.log("renderHeatBeatTimeStuffs()",this.props.cloud_equipment_fail_safe_options)
        
        if(this.props.isThermostat()){
            if(this.props.heart_beat){
                if(this.props.heart_beat.length == 4){
                    let time = BYTES_TO_INT_LITTLE_ENDIANG(this.props.heart_beat)

                        return (
                        <View>
                            <View>
                                <Text style={{padding:20}}>HEARTBEAT TIME</Text>
                                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                                    <Button text="Off" width={width/9} active={time == 0} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(0)}/>
                                    <Button text="1m" width={width/9} active={time == 60} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(60)}/>
                                    <Button text="2m" width={width/9} active={time == 120} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(120)}/>
                                    <Button text="5m" width={width/9} active={time == 300} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(300)}/>
                                    <Button text="10m" width={width/9} active={time == 600} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(600)}/>
                                    <Button text="30m" width={width/9} active={time == 1800} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(1800)}/>
                                    <Button text="1h" width={width/9} active={time == 3600} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(3600)}/>
                                    <Button text="2h" width={width/9} active={time == 7200} marginHorizontal={1} handleTouchButton={() => this.updateHeartBeat(7200)}/>
                                </View>
                            </View>
                            {this.props.cloud_equipment_fail_safe_options.length && (
                                <FlatList 
                                    data={this.props.cloud_equipment_fail_safe_options} 
                                    renderItem={(item) => this.renderFailSafeOptionOn(item)} 
                                    keyExtractor={(item,index) => index}
                                />
                            )}
                        </View>
                    )

                }else{
                    return null
                }
            }else{
                return null
            }
            
        }else if(this.props.isEquipment()){
            return(
                <View>
                    <View style={{marginVertical:18,marginLeft:20}}>
                        <Text style={{fontSize:18}}>
                           HEARTBEAT TIME
                        </Text>
                    </View>

                    <View style={{backgroundColor:"white",alignItems:"center"}}>
                        <View style={{flexDirection:"row",padding:10,alignItems:"center",justifyContent:"center"}}>
                            <TouchableHighlight onPress={() => this.handleLedsEnabledButton()}>
                                <Text style={{color:"black"}}>
                                    THERMOSTAT : {BYTES_TO_INT_LITTLE_ENDIANG(this.props.cloud_heart_beat)} s
                                </Text>
                            </TouchableHighlight>
                        </View>
                    </View>    
                    
                    <View style={{marginVertical:18,marginLeft:20}}>
                        <Text style={{fontSize:18}}>
                            RELAY FAILSAFE DEFAULTS
                        </Text>
                    </View>
                    <View style={{backgroundColor:"white",padding:10}}>
                        {this.relays_times()}
                        {this.relays()}                                                    
                    </View>
                </View>
            )
        }else{
            return (<Text>Error The device has not hardware type</Text>)
        }
    }

	render(){	
        let led_value = this.props.activated_led[0]
        let led_enable_text = led_value == 0 ? "Off" : "On"
        var led_button_style = {padding:10,borderRadius:10,marginLeft:10,width:50,alignItems:'center'}
        led_button_style.backgroundColor = led_value == 0 ? "gray" : "green"

        if(this.props.configuration_data_state == NO_ACTIVITY || this.props.configuration_data_state == LOADING)
            return (
                <Background>
                    <View>
                        <ActivityIndicator/>
                    </View>
                </Background>
            )

		return(
			<ScrollView style={styles.pairContainer}>
				<Background>
					<View >
                        <View style={{marginVertical:18,marginLeft:20}}>
                            <Text style={{fontSize:18}}>
                                LEDS SETTINGS
                            </Text>
                        </View>
						<View style={{backgroundColor:"white",width:width}}>
							<View style={{flexDirection:"row",padding:10,alignItems:"center",justifyContent:"space-between"}}>
								<Text style={{fontSize:18,color:"black"}}>
									LEDs Enabled
								</Text>
                                <TouchableOpacity onPress={() => this.handleLedsEnabledButton()} style={led_button_style}>
                                    <Text style={{color:"white",fontSize:18}}>
                                        {led_enable_text}
                                    </Text>
                                </TouchableOpacity>
							</View>
						</View>
                        <View>
                            {this.renderHeatBeatTimeStuffs()}
                        </View>
					</View>
				</Background>
			</ScrollView>
		);
	}
}


const mapStateToProps = state => ({
	device : state.scanCentralReducer.central_device,
	activated_led: state.scanCentralReducer.activated_led,
	fail_safe_option : state.scanCentralReducer.fail_safe_option,
    configuration_data_state: state.scanCentralReducer.configuration_data_state,
    cloud_heart_beat : state.scanCentralReducer.cloud_heart_beat,
    pairing_info: state.scanCentralReducer.pairing_info,
    cloud_equipment_fail_safe_options: state.scanCentralReducer.cloud_equipment_fail_safe_options,
    equipments_paired_with : state.scanCentralReducer.equipments_paired_with,
    equipments_fail_safe_options : state.scanCentralReducer.equipments_fail_safe_options,
    heart_beat : state.scanCentralReducer.heart_beat,
});

export default connect(mapStateToProps)(Configuration);