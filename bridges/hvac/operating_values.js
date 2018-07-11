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
  	TouchableOpacity,
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
	prettyBytesToHex,
	EQUIPMENT_TYPE,
	THERMOSTAT_TYPE,
	reverseTwoComplement,
	TRANSMIT,
	RECEIVE,
	ERROR_BLOCK,
	TIME,
	SWITCH	
} from '../../constants'
import {
	WRITE_COMMAND,
	LOG_INFO,
	HVAC_WRITE_COMMAND,
	parseSecondsToHumanReadable
	} from '../../action_creators'
import Background from '../../helpers/background'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const check = (<Icon name="check" size={25} color={success_green} />)
const times = (<Icon name="times" size={25} color="red" />)

import {success_green,cancel_red,gray_background} from '../../styles/index.js'


var RELAY_STATE = params => {
	let relay_states = params.relay_states.map(x => parseInt(x)).reverse()
	console.log("relay_states",relay_states)
	let relay_time = params.relay_time
	let backgroundGray = params.backgroundGray
	let backgroundStyle = {width:180,height:140,padding:8}

	if(backgroundGray){
		backgroundStyle.backgroundColor = gray_background
	}

	if(relay_time == 255)
		return null

	if(relay_states.length == 8){
		return (
			<View style={backgroundStyle}>
				<View style={{flexDirection:"row",marginVertical:5}}>
					<SWITCH isActivated={relay_states[0]} onPress={() => console.log("switch pressend")} name="R1" color="white" background={gray_background}/>
					<SWITCH isActivated={relay_states[1]} onPress={() => console.log("switch pressend")} name="R2" color="#FFFF33" background={gray_background}/>
					<SWITCH isActivated={relay_states[2]} onPress={() => console.log("switch pressend")} name="R3" color="#009900" background={gray_background}/>
					<SWITCH isActivated={relay_states[3]} onPress={() => console.log("switch pressend")} name="R4" color="#3383C1" background={gray_background}/>
				</View>
				<View style={{flexDirection:"row",marginVertical:5}}>
					<SWITCH isActivated={relay_states[4]} onPress={() => console.log("switch pressend")} name="R5" color="#3383C1" background={gray_background}/>
					<SWITCH isActivated={relay_states[5]} onPress={() => console.log("switch pressend")} name="R6" color="#FF9933" background={gray_background}/>
					<SWITCH isActivated={relay_states[6]} onPress={() => console.log("switch pressend")} name="R7" color="#808080" background={gray_background}/>
					<SWITCH isActivated={relay_states[7]} onPress={() => console.log("switch pressend")} name="R8" color="#B266FF" background={gray_background}/>
				</View>
				<View style={{alignItems:"center",flexDirection:"row"}}>

					<Text style={{color:"white",borderWidth:1,padding:1,borderRadius:50,paddingHorizontal:5,backgroundColor:"black",textAlign:"center"}}>
						{params.relay_number}
					</Text>
					<TIME minutes={relay_time} current={params.current}/>					
				</View>
			</View>
		)
	}

	return null
}

var HVAC_DEVICE = params => {	
	
		const hardware_type = params.hardware_type
		let name = "Equipment " + params.equipment_number + " :"
		var equipment_state = null
		if(typeof params.equipment_state !== 'undefined' && params.equipment_state != null){
			console.log("params.equipment_state",params.equipment_state)
			equipment_state = params.equipment_state.toString(2).split("").map(x => parseInt(x))
			if(equipment_state.length == 1)
				equipment_state.push(0)
		}


		if(hardware_type == EQUIPMENT_TYPE)
			name = "Thermostat id:"
		
		return (
			<View style={{backgroundColor:"white",alignItems:"center",padding:10,flexDirection:"row",borderBottomWidth:1}}>
				<View style={{padding:10,borderRadius:10,marginRight:10}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{fontSize:18,marginRight:10}}>
							{name}		
						</Text>
						<Text style={{color:"black",fontSize:18}}>
							{params.device_id}
						</Text>
					</View>
					<View>
						<Text>
							Last Communication: {params.time}
						</Text>
					</View>
				</View>
				{Array.isArray(equipment_state) &&  equipment_state.length && (
					<View>
						<View style={{flexDirection:"row"}}>
							<View style={{borderWidth:1,borderRadius:50,width:40,height:40,alignItems:"center",justifyContent:"center",marginBottom:5}}>
								{equipment_state[0] == 1 ? times : (<Text> OK </Text>) }
							</View>
							<View style={{height:40,width:60,alignItems:"center",justifyContent:"center"}}>
								<Text>
									Status 1
								</Text>
							</View>					
						</View>
						<View style={{flexDirection:"row"}}>
							<View style={{borderWidth:1,borderRadius:50,width:40,height:40,alignItems:"center",justifyContent:"center"}}>
								{equipment_state[1] == 1 ? times : (<Text> OK </Text>) }
							</View>
							<View style={{height:40,width:60,alignItems:"center",justifyContent:"center"}}>
								<Text>
									Status 2
								</Text>
							</View>					
						</View>

					</View>
				)}
			</View>
		)

	
	return null
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
		relay_states = relay_states.map(x => x.toString(2))
		relay_states = relay_states.map(x => {
			if(x.length < 8){
				return this.addZerosUntilNumber(x,8)
			}
			return x
		})
		relay_states = relay_states.map(x => x.split(""))

		return (
			<ScrollView style={{backgroundColor:gray_background,flexDirection:"row"}} horizontal={true}> 
				{<RELAY_STATE relay_number={1} relay_states={relay_states[0]} relay_time={relay_times[0]} backgroundGray={true} current={true}/>}
				<RELAY_STATE relay_number={2} relay_states={relay_states[1]} relay_time={relay_times[1]} backgroundGray={true} current={true}/> 
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
		//console.log("renderReceives()")
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
		//console.log("renderErrorCodes()",error_codes)
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

	getBallContent(status){
		if(status){
			return times	
		}

		return (
			<Text>
				OK
			</Text>
		)
		
	}

	renderPairedDevices(data){
		console.log("renderPairedDevices()")
		
		if(this.props.isEquipment()){
			var time = parseSecondsToHumanReadable(this.props.last_package_time)
			return(
				<View>
					<HVAC_DEVICE time={time} equipment_number={1} device_id={this.device.manufactured_data.tx} hardware_type={this.device.manufactured_data.hardware_type} />
				</View>

			)
		}else if(this.props.isThermostat()){
			
			if(this.props.last_package_time_thermostat.length > 0){
				return (
					<View>
						<FlatList 
						data={this.props.last_package_time_thermostat} 
						renderItem={(item) => this.renderThermostatHVAC(item,data.equipment_states)} 
						keyExtractor={(item,index) => index}
						extraData= {this.props}
						/>
					</View>
				)
			}
		}

		return null
	}

	/*
	* in order to render the paired devices witha a flat list this function will take the last_package_time_thermostat and de equipment_states 
	* from the thermostat and will put all togueder 
	* @last_package_times is a 3 dimensional array, it contains an array with the id (3 bytes) in the 0 pos and with the time of the last package 
	* (4 bytes) in the second for every equipment paired  with this thermostat
	* last_package times example : [ [ [ 47, 243, 14 ], [ 76, 9, 0, 0 ] ], [ [ 47, 243, 107 ], [ 78, 9, 0, 0 ] ] ] two equipments paired to this unit
	* @equipment_states : is a 8 bytes array every byte represent the state of every posible paired bridge, 
	
	getLastPackageTimeAndEquipmentState(last_package_times,equipment_states){
		if(Array.isArray(last_package_times) && last_package_times.length > 0){
			
			console.log("last_package_times",last_package_times)
			console.log("equipment_states",equipment_states)

			for(let i = 0; i < last_package_times.length; i++){
				console.log(last_package_times)
				last_package_times[i].push([equipment_states[i]])
				console.log(last_package_times)
			}	
		}

		return last_package_times
	}
	*/ 

	renderThermostatHVAC(data,equipment_states){
		//console.log("renderThermostatHVAC",data,equipment_states)
		var item = data.item
		var index = data.index
		var new_index = data.index + 1
		var id = BYTES_TO_HEX(item[0]).toUpperCase()
		
		var equipment_state = 0

		var time = parseSecondsToHumanReadable(item[1])

		if(equipment_states.length >= index){
			equipment_state = equipment_states[index]
		}


		return (
			<View style={{height:100,width:width}}> 
				<HVAC_DEVICE time={time} equipment_number={new_index} device_id={id} equipment_state={equipment_state}/>
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
		var data = {}
		
		if(receive_values.length > 66){
			if(this.props.isEquipment()){			
				data.demo_unit_status = receive_values.slice(0,1) // 1 
				data.relay_states = receive_values.slice(1,9) // 8
				data.relay_times = receive_values.slice(9,17) // 8
				data.equipment = receive_values.slice(17,18) // 1
				data.number_of_transmits = receive_values.slice(18,22) // 4
				data.number_of_failures = receive_values.slice(22,26) // 4
				data.transmit_info_1 = receive_values.slice(26,33) // 7 
				data.transmit_info_2 = receive_values.slice(33,40) // 7 
				data.transmit_info_3 = receive_values.slice(40,47) // 7 
				data.receive_info_1 = receive_values.slice(47,51) // 4
				data.receive_info_2 = receive_values.slice(51,55) // 4
				data.receive_info_3 = receive_values.slice(55,59) // 4
				data.error_codes = receive_values.slice(59,67) //8
			}else{
				data.demo_unit_status = receive_values.slice(0,1)
				data.num_pairs = receive_values.slice(1,2)
				data.relay_states = receive_values.slice(2,10)
				data.relay_times = receive_values.slice(10,18)
				data.equipment_states = receive_values.slice(18,26) // 8
				data.number_of_transmits = receive_values.slice(26,30)
				data.number_of_failures = receive_values.slice(30,34)
				data.transmit_info_1 = receive_values.slice(34,41)
				data.transmit_info_2 = receive_values.slice(41,48)
				data.transmit_info_3 = receive_values.slice(48,55)
				data.receive_info_1 = receive_values.slice(55,59)
				data.receive_info_2 = receive_values.slice(59,63)
				data.receive_info_3 = receive_values.slice(63,67)
				data.error_codes = receive_values.slice(67,75)				
			}
			console.log("operating values:", data)
			return data;
		}
			
		return false
	}

	/*
	* @status is an integer
	*/
	getEquipmentStatus(status){
		let ball_1 = null
		let ball_2 = null
		
		//this.getBallContent(data.equipment[0])
		if(status == 0){
			ball_1 = this.getBallContent(false)
			ball_2 = this.getBallContent(false)
		}else if(status == 1){
			ball_1 = this.getBallContent(true)
			ball_2 = this.getBallContent(false)

		}else if(status == 2){
			ball_1 = this.getBallContent(false)
			ball_2 = this.getBallContent(true)

		}else if(status == 3){
			ball_1 = this.getBallContent(true)
			ball_2 = this.getBallContent(true)

		}

		return(
			<View style={{backgroundColor:"white",marginTop:20,flexDirection:"row",padding:10,alignItems:"center"}}>
				<Text>
					Equipment Status (This unit)
				</Text>
				<View style={{marginLeft:20,alignItems:"center",justifyContent:"center"}}>
					<View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
						<Text>
							Status 1 : 
						</Text>				
						<View style={{borderWidth:1,borderRadius:50,width:40,height:40,alignItems:"center",justifyContent:"center",marginLeft:10}}>
							{ball_1}
						</View>
					</View>							
					<View style={{flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:5}}>
						<Text>
							Status 2 :
						</Text>					
						<View style={{borderWidth:1,borderRadius:50,width:40,height:40,alignItems:"center",justifyContent:"center",marginLeft:10}}>
							{ball_2}
						</View>	
					</View>				
				</View>
			</View>			
		)
	}

	render(){
		//console.log("this.props.loading_operation_values",this.props.loading_operation_values)
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
							
							{this.props.isEquipment() && this.getEquipmentStatus(data.equipment)}							

							<Text style={styles.device_control_title}>
								Paired Devices
							</Text>
							{this.renderPairedDevices(data)}
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
	equipments_paired_with : state.scanCentralReducer.equipments_paired_with,
} );

export default connect(mapStateToProps)(OperationValues);
