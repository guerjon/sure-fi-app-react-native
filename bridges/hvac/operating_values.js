import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	ActivityIndicator,
  	Alert,
  	TouchableHighlight,
  	FlatList
} from 'react-native'
import {styles,first_color,width,height} from '../../styles/index.js'
import {PhoneCmd_GetLastPacketTime} from '../../hvac_commands_and_responses'
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { 
	LOADING,
	TWO_BYTES_TO_INT,
	byteArrayToLong,
	BYTES_TO_HEX,
	Hex2Bin,
	stringFromUTF8Array,
	NOTIFICATION,
	FOUR_BYTES_ARRAY_TO_DECIMAL,
	BYTES_TO_INT,
	prettyBytesToHex
} from '../../constants'
import {
	WRITE_COMMAND,
	LOG_INFO,
	HVAC_WRITE_COMMAND,
	parseSecondsToHumanReadable
	} from '../../action_creators'
import Background from '../../helpers/background'
import {SWITCH} from '../../helpers/switch'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const check = (<Icon name="check" size={25} color={success_green} />)
const times = (<Icon name="times" size={25} color="red" />)
const text_style = {
	height:30,
	backgroundColor:"white",
	width:width/2,
	alignItems:"center",
	justifyContent:"center",
}

import {success_green,cancel_red,gray_background} from '../../styles/index.js'

function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}

function doPrettyZeros(number){
	if(number == "0"){
		return "0x00"
	}else{
		var number_string = number.toString()
		if(number_string.length > 1)
			return "0x" + number

		return "0x0" + number
	}
}



var TIME = params => {
	var value = ""
	var minutes = params.minutes
	if(params.minutes < 1){
		value = "Less than a minute"
	}else if(params.minutes > 60 && params.minutes < 240){
		var hours = parseInt(params.minutes / 60)
		var rest_minutes = params.minutes - (hours * 60)
		value = hours + " Hours " + minutes + " minutes"
	}else if(params.minutes > 240 && params.minutes < 254){
		value = "More than 4 hours"
	}else {
		value = "Empty"
	}

	return (
		<View style={{marginLeft:5}}>
			<Text>
				{value}
			</Text>
		</View>
	)
}

var ERROR_BLOCK = params => {
	var error = params.error
	return(
		<View style={{width:width/8,borderRadius:30,alignItems:"center"}}>
			<Text style={{backgroundColor:gray_background,padding:5,margin:1,fontSize:10}}>
				{doPrettyZeros(error)}
			</Text>
		</View>
	)
}

function combineJSON(obj1,obj2){
	var result = Object.assign({},obj1, obj2);	
	return result
}

var RELAY_STATE = params => {
	let relay_states = params.relay_states.map(x => parseInt(x))
	let relay_time = params.relay_time
	let backgroundGray = params.backgroundGray
	let backgroundStyle = {width:160,height:140,padding:8}

	if(backgroundGray){
		backgroundStyle.backgroundColor = gray_background
	}


	console.log("relay_states",relay_states)
	console.log("relay_time",relay_time)
	console.log("backgroundGray",backgroundGray)
	console.log("backgroundStyle",backgroundStyle)

	
	if(relay_time == 255)
		return null

	if(relay_states.length == 8){

		return (
			<View style={backgroundStyle}>
				<View style={{flexDirection:"row",marginVertical:5}}>
					<SWITCH isActivated={relay_states[0]} onPress={() => console.log("switch pressend")} />
					<SWITCH isActivated={relay_states[1]} onPress={() => console.log("switch pressend")} />
					<SWITCH isActivated={relay_states[2]} onPress={() => console.log("switch pressend")} />
					<SWITCH isActivated={relay_states[3]} onPress={() => console.log("switch pressend")} />
				</View>
				<View style={{flexDirection:"row",marginVertical:5}}>
					<SWITCH isActivated={relay_states[4]} onPress={() => console.log("switch pressend")} />
					<SWITCH isActivated={relay_states[5]} onPress={() => console.log("switch pressend")} />
					<SWITCH isActivated={relay_states[6]} onPress={() => console.log("switch pressend")} />
					<SWITCH isActivated={relay_states[7]} onPress={() => console.log("switch pressend")} />
				</View>
				<View style={{alignItems:"center",flexDirection:"row"}}>

					<Text style={{color:"white",borderWidth:1,padding:1,borderRadius:50,paddingHorizontal:5,backgroundColor:"black",textAlign:"center"}}>
						{params.relay_number}
					</Text>
					<TIME minutes={relay_time} />					
				</View>
			</View>
		)
	}

	return null
}

var HVAC_DEVICE = params => {
	return (
		<View style={{backgroundColor:"white",alignItems:"center",padding:10,flexDirection:"row",borderBottomWidth:1}}>
			<View style={{padding:10,borderRadius:10,marginRight:10}}>
				<View style={{flexDirection:"row"}}>
					<Text style={{fontSize:18,marginRight:10}}>
						Equipment {params.equipment_number} : 
					</Text>
					<Text style={{color:"black",fontSize:18}}>
						{params.device_id}
					</Text>
				</View>
				<View>
					<Text>
						Last Package: {params.time}
					</Text>
				</View>
			</View>
			<View>
				<View style={{flexDirection:"row"}}>
					<View style={{borderWidth:1,borderRadius:50,width:40,height:40,alignItems:"center",justifyContent:"center",marginBottom:5}}>
						{check}
					</View>
					<View style={{height:40,width:60,alignItems:"center",justifyContent:"center"}}>
						<Text>
							Status 1
						</Text>
					</View>					
				</View>
				<View style={{flexDirection:"row"}}>
					<View style={{borderWidth:1,borderRadius:50,width:40,height:40,alignItems:"center",justifyContent:"center"}}>
						{times}
					</View>
					<View style={{height:40,width:60,alignItems:"center",justifyContent:"center"}}>
						<Text>
							Status 2
						</Text>
					</View>					
				</View>

			</View>
		</View>
	)
}

var TRANSMIT = params => {
	var transmit_info = params.transmit_info
	var success_text = transmit_info.success == 1 ? "SUCCESS" : "FAILURE";
	var success_color = transmit_info.success == 1 ? success_green : "red";
	var num_retrays = transmit_info.numRetries + " retrays"
	var rssi = "RSSI: "  + TWO_BYTES_TO_INT(transmit_info[0],transmit_info[1])
	var snr = "SNR: " + transmit_info.snr
	var ack_data = transmit_info.ackDataLength + " Byte ACK" 

	return (
		<View style={{marginRight:10,marginLeft:5,padding:10,width: ((width/3) - 5)}}>
			<View style={{flexDirection:"row"}}>
				<Text style={{color:success_color}}>
					{success_text}
				</Text>
			</View>
			<View>
				<Text>
					{num_retrays}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{rssi}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{snr}
				</Text>
			</View>
			<View>
				<Text>
					{ack_data}
				</Text>
			</View>
		</View>
	)
}

var RECEIVE = params => {
	var receive_info = params.receive_info
	var success_text = receive_info.success == 1 ? "SUCCESS" : "FAILURE";
	var success_color = receive_info.success == 1 ? success_green : "red";
	var rssi = "RSSI: "  + TWO_BYTES_TO_INT(receive_info[0],receive_info[1])
	var snr = "SNR: " + receive_info.snr

	return (
		<View style={{marginRight:5,marginLeft:5,padding:10,width: ((width/3) - 5)}}>
			<View style={{flexDirection:"row"}}>
				<Text style={{color:success_color}}>
					{success_text}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{rssi}
				</Text>
			</View>
			<View style={{flexDirection:"row"}}>
				<Text>
					{snr}
				</Text>
			</View>
		</View>
	)
}

var powerOnTimeInterval = 0

class OperationValues extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        title : "Scan Device",
        navBarTitleTextCentered: true,
    }

	constructor(props) {
		super(props);
		console.log("constructor()")
		this.device = this.props.device
		this.operating_values = this.props.operating_values
		this.flat_list_height = 0
	}

	componentWillMount() {
		var activate_operating_values_wait = true
		//this.props.getOperatingValues(activate_operating_values_wait)
		this.props.dispatch({type:"LOADING_OPERATION_VALUES",loading_operation_values:false})
	}

	componentWillUnmount(){
		this.props.dispatch({type:"LOADING_OPERATION_VALUES",loading_operation_values:true})
	}

	componentDidMount(){
		//this.createPowerOnInterval()
	}

	createPowerOnInterval(){
		console.log("createPowerOnInterval()")
		if(powerOnTimeInterval == 0){
			this.updatePowerOn()
			//powerOnTimeInterval = setInterval(() => this.updatePowerOn(),5000)	
		}
	}

	clearPowerOnInterval(){
		if(powerOnTimeInterval != 0){
			clearInterval(powerOnTimeInterval)
			powerOnTimeInterval = 0
		}
	}

	updatePowerOn(){
		this.props.dispatch({
			type:"SET_POWER_ON_TIME_SECONDS",
			power_on_time_seconds : this.props.power_on_time_seconds + 1
		})
	}


	renderStatus(demo_unit_status,transmit_states,failure_states,power_on_time){
		var status = "uknown"
		var color = "green"
		var text_color = "white"

		if(demo_unit_status == 1){
			status = "Unpaired"
			color = "green"
		}
		if(demo_unit_status == 4){
			status = "Deployed"
			var color = "green"
		}
		var decimal_transmit_states = FOUR_BYTES_ARRAY_TO_DECIMAL(transmit_states) 
		var decimal_failure_states = FOUR_BYTES_ARRAY_TO_DECIMAL(failure_states) 
		
		var power_on_time_string = parseSecondsToHumanReadable(power_on_time)
	
		return (
			<View style={{height:80,width: width,backgroundColor:"white"}}>
				<View style={{flexDirection:"row",width:width,backgroundColor:color,alignItems:"center",justifyContent:"center"}}>
					<Text style={{color:text_color,padding:5,borderRadius:5,marginHorizontal:5,fontSize:15}}>
						{status} 
					</Text>
				</View>					
				<View style={{flexDirection:"row"}}>
					<View style={{width:width/2,alignItems:"center",justifyContent:"center",height:50}}>
						{this.props.device.hardware_type == "03" && ( 
							<View style={{marginHorizontal:10,marginTop:5}}>
								<Text style={{padding:3}}>{demo_unit_status} Pairs</Text>
							</View>
							)
						}
						<View style={{marginHorizontal:5,marginTop:5,flexDirection:"row"}}>
							<Text style={{color:"green",marginHorizontal:5}}>
								{decimal_transmit_states} transmits
							</Text>
							<Text style={{color:"red",marginHorizontal:5}}>
								{decimal_failure_states} failures
							</Text>
						</View>
					</View>
					<View style={{width:width/2,backgroundColor:gray_background,padding:5,height:50,alignItems:"center",justifyContent:"center"}}>
						<Text style={{borderRadius:10}}>
							Power on : {power_on_time_string}
						</Text>
					</View>
				</View>				
			</View>
		)
	}

	renderRelays(relay_states,relay_times){
		//console.log("renderRelays()",relay_states,relay_times)
		relay_states = relay_states.map(x => Hex2Bin(x))
		relay_states = relay_states.map(x => {
			if(x.length < 8){
				return this.addZerosUntilNumber(x,8)
			}
			return x
		})

		relay_states = relay_states.map(x => x.split(""))

		//console.log("relay_states 3",relay_states)
		//console.log("relay_times 3",relay_times)

		return (
			<ScrollView style={{backgroundColor:"white",flexDirection:"row"}} horizontal={true}> 
				<RELAY_STATE relay_number={1} relay_states={relay_states[0]} relay_time={relay_times[0]}  /> 
				<RELAY_STATE relay_number={2} relay_states={relay_states[1]} relay_time={relay_times[1]} backgroundGray={true}/> 
				<RELAY_STATE relay_number={3} relay_states={relay_states[2]} relay_time={relay_times[2]} /> 
				<RELAY_STATE relay_number={4} relay_states={relay_states[3]} relay_time={relay_times[3]} backgroundGray={true}/> 
				<RELAY_STATE relay_number={5} relay_states={relay_states[4]} relay_time={relay_times[4]} /> 
				<RELAY_STATE relay_number={6} relay_states={relay_states[5]} relay_time={relay_times[5]} backgroundGray={true}/> 
				<RELAY_STATE relay_number={7} relay_states={relay_states[6]} relay_time={relay_times[6]} /> 
				<RELAY_STATE relay_number={8} relay_states={relay_states[7]} relay_time={relay_times[7]} backgroundGray={true}/> 
			</ScrollView>
		) 
	}

	parseTransmitToAJson(transmit){
		var data = {}
		if(transmit.length > 6){
			data.success = transmit[0]
			data.rssi = [transmit[1],transmit[2]]
			data.snr = transmit[3]
			data.numRetries = transmit[4]
			data.maxRetries = transmit[5]
			data.ackDataLength = transmit[6]
		}
		return data
	}

	parseReceiveInfoToAJson(recieve){
		//console.log("parseReceiveInfoToAJson()",recieve)
		var data = {}
		if(recieve.length > 3){
			data.success = recieve[0]
			data.rssi = [recieve[1],recieve[2]]
			data.snr = recieve[3]
		}

		return data 
	}

	renderTransmit(transmit_info_1,transmit_info_2,transmit_info_3){
		console.log("renderTransmit(transmit_info_1,transmit_info_2,transmit_info_3,receive_info_1,receive_info_2,receive_info_3)",transmit_info_1,transmit_info_2,transmit_info_3)
		transmit_info_1 = this.parseTransmitToAJson(transmit_info_1)
		transmit_info_2 = this.parseTransmitToAJson(transmit_info_2)
		transmit_info_3 = this.parseTransmitToAJson(transmit_info_3)

		return (
			<View style={{flexDirection:"row",backgroundColor:"white"}}>
				<TRANSMIT transmit_info={transmit_info_1}/>
				<TRANSMIT transmit_info={transmit_info_2}/>
				<TRANSMIT transmit_info={transmit_info_3}/>
			</View>
		)


		return null
	}

	renderReceives(receive_info_1,receive_info_2,receive_info_3){
		console.log("renderReceives()",receive_info_1,receive_info_2,receive_info_3)
		receive_info_1 = this.parseReceiveInfoToAJson(receive_info_1)
		receive_info_2 = this.parseReceiveInfoToAJson(receive_info_2)
		receive_info_3 = this.parseReceiveInfoToAJson(receive_info_3)				
		return(
			<View style={{flexDirection:"row",backgroundColor:"white"}}>
				<RECEIVE receive_info={receive_info_1}/>
				<RECEIVE receive_info={receive_info_2}/>
				<RECEIVE receive_info={receive_info_3}/>
			</View>
		)
	}

	renderErrorCodes(error_codes){
		console.log("renderErrorCodes()",error_codes)
		if(error_codes.length > 7)
		return(
			<View style={{backgroundColor:"white"}}>
				<View style={{flexDirection:"row"}}>
					<ERROR_BLOCK error={error_codes[0]} />
					<ERROR_BLOCK error={error_codes[1]} />
					<ERROR_BLOCK error={error_codes[2]} />
					<ERROR_BLOCK error={error_codes[3]} />
					<ERROR_BLOCK error={error_codes[4]} />
					<ERROR_BLOCK error={error_codes[5]} />
					<ERROR_BLOCK error={error_codes[6]} />
					<ERROR_BLOCK error={error_codes[7]} />
				</View>
			</View>
		)

		return null
	}

	renderPairedDevices(){
		console.log("renderPairedDevices()")
		
		if(this.props.isEquipment()){
			var time = parseSecondsToHumanReadable(this.props.last_package_time)
			return(
				<View style={{backgroundColor:"red"}}>
					<HVAC_DEVICE time={time} equipment_number={1} device_id={this.device.manufactured_data.tx} />
				</View>

			)
		}else if(this.props.isThermostat()){
			console.log("this.props.pairing_info",this.props.last_package_time_thermostat)
			if(this.props.last_package_time_thermostat.length > 0){
				
				return (
					<View>
						<FlatList 
						data={this.props.last_package_time_thermostat} 
						renderItem={(item) => this.renderThermostatHVAC(item)} 
						keyExtractor={(item,index) => index}
						extraData= {this.props}
						/>
					</View>
				)
			}else{
				return null
			}
		}else{
			return null
		}
	}

	renderThermostatHVAC(data){
		console.log("renderThermostatHVAC")
		var item = data.item
		var new_index = data.index + 1
		var id = BYTES_TO_HEX(item[0]).toUpperCase()
		var time = parseSecondsToHumanReadable(item[1])
		return (
			<View style={{backgroundColor:"red",height:100,width:width}}> 
				<HVAC_DEVICE time={time} equipment_number={new_index} device_id={id} />
			</View>
		)
	}

	addZerosUntilNumber(string,number){	
		do{
			string = 0 + string
		}while(string.length < number)
		
		return string
	}
	
	getOperatingValuesAsJson(receive_values){
		console.log("getOperatingValuesAsJson()",receive_values)
		var data = {}
		
		if(receive_values.length > 66){
			data.demo_unit_status = receive_values.slice(0,1)
			data.relay_states = receive_values.slice(1,9)
			data.relay_times = receive_values.slice(9,17)
			data.equipment = receive_values.slice(17,18)
			data.number_of_transmits = receive_values.slice(18,22)
			data.number_of_failures = receive_values.slice(22,26)
			data.transmit_info_1 = receive_values.slice(26,33)
			data.transmit_info_2 = receive_values.slice(33,40)
			data.transmit_info_3 = receive_values.slice(40,47)
			data.receive_info_1 = receive_values.slice(47,51)
			data.receive_info_2 = receive_values.slice(51,55)
			data.receive_info_3 = receive_values.slice(55,59)
			data.error_codes = receive_values.slice(59,67)
			return data;
		}
			
		return false
		
	}

	render(){
		console.log("this.props.loading_operation_values",this.props.loading_operation_values)
		if(this.props.loading_operation_values)
			return (
				<Background> 
					<View style={{height:height}}>
						<ActivityIndicator  style={{marginTop:80}}/> 
					</View>
				</Background>
			)
		var data = this.getOperatingValuesAsJson(this.props.operating_values)

		if(data){

			return(
				<ScrollView style={styles.pairContainer}>
					<Background>
						<View style={{height:(height + 300 + this.flat_list_height)}}>
							
							{this.renderStatus(data.demo_unit_status,data.number_of_transmits,data.number_of_failures,this.props.power_on_time)}

							<Text style={styles.device_control_title}>
								Relays
							</Text>
							<View style={{height:130}}>
								{this.renderRelays(data.relay_states,data.relay_times)}
							</View>
							<Text style={styles.device_control_title}>
								Paired Devices
							</Text>
							{this.renderPairedDevices()}
							<Text style={styles.device_control_title}>
								Trasmits
							</Text>
							{this.renderTransmit(data.transmit_info_1,data.transmit_info_2,data.transmit_info_3)}
							<Text style={styles.device_control_title}>
								Receives
							</Text>
							{this.renderReceives(data.receive_info_1,data.receive_info_2,data.receive_info_3)}
							<Text style={styles.device_control_title}>
								Error Codes
							</Text>
							{this.renderErrorCodes(data.error_codes)}
						</View>
					</Background>
				</ScrollView>
			);
		}else{
			return(
				<View>
					<Background>
						<View style={{height:height}}>
							<Text>
								Error the operating values are incorrect.
							</Text>
							<TouchableHighlight onPress={() => this.props.getOperatingValues()}>
								<Text>
									Try Again.
								</Text>
							</TouchableHighlight>
						</View>
					</Background>
				</View>
			)
		}
	}
}

const mapStateToProps = state => ({
	device : state.scanCentralReducer.central_device,
	central_relay_image_1 : state.operationValuesReducer.central_relay_image_1,
	central_relay_image_2 : state.operationValuesReducer.central_relay_image_2,
	remote_relay_image_1 :  state.operationValuesReducer.remote_relay_image_1,
	remote_relay_image_2 : state.operationValuesReducer.remote_relay_image_2,
	led_label : state.operationValuesReducer.led_label,
	aux_label : state.operationValuesReducer.aux_label,
	loading_operation_values : state.operationValuesReducer.loading_operation_values,
	wiegand_values : state.operationValuesReducer.wiegand_values,
	transmit_values : state.operationValuesReducer.transmit_values,
	receive_values : state.operationValuesReducer.receive_values,
	operating_values: state.operationValuesReducer.operating_values,
	power_on_time : state.operationValuesReducer.power_on_time,
	power_on_time_seconds: state.operationValuesReducer.power_on_time_seconds,
	pairing_info: state.scanCentralReducer.pairing_info,
	last_package_time: state.scanCentralReducer.last_package_time,
	last_package_time_thermostat : state.scanCentralReducer.last_package_time_thermostat,
	
} );

export default connect(mapStateToProps)(OperationValues);
