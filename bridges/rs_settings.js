import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	ActivityIndicator,
  	TextInput,
  	Alert
} from 'react-native'
import {styles,first_color,width} from '../styles/index.js'
import Button from '../helpers/small_button'
import { connect } from 'react-redux';
import { 
	LOADING,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	NOTIFICATION,
	BYTES_TO_HEX,
	BYTES_VALUES,
	DEC2BIN,
	IS_EMPTY,
	HEX_TO_BYTES
} from '../constants'
import {
	COMMAND_GET_SETTIAL_SETTINGS,
	COMMAND_SET_SERIAL_SETTINGS
} from '../commands'
import {LOG_INFO,WRITE_COMMAND} from '../action_creators'
import Title from '../helpers/title'
import Background from '../helpers/background'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class RsSettings extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true,
    }

	static navigatorButtons = {
		rightButtons: [
		  {
		    title: 'Update',
		    id: 'update',
		  }
		]
	};

	constructor(props) {
		super(props);
		this.device = this.props.device
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	checkUpdate(){
		var values = this.props.rs_settings_data


		if(values.timeout){
			if(values.time_out < 0 && values.time_out > 65535)
				Alert.alert("(Timeout incorrect) should be a value between 1 and 65535")
		}else{
			Alert.alert("The Timeout can't be empty")
			return;
		}
		this.update()
		
	}

    onNavigatorEvent(event){
    	if(event.id == "update"){
    		this.checkUpdate()
    	}
    }

	componentWillMount() {
		this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicNotification(data));
		this.startNotification()
	}

	componentWillUnmount() {
		this.handlerUpdate.remove()
		this.props.activateHandleCharacteristic()
	}    

	startNotification(){
        BleManagerModule.retrieveServices(
        	this.device.id,
        	() => {
        		BleManagerModule.startNotification(
					this.device.id,
					SUREFI_CMD_SERVICE_UUID,
					SUREFI_CMD_READ_UUID,
					() => this.getSettings()
				)
        	}
        )
	}	

	getSettings(){
		console.log("writeStartUpdate()")
		WRITE_COMMAND(this.device.id,[COMMAND_GET_SETTIAL_SETTINGS])
	}	

	parseStringArrayToInt(array){
		var parsed_array = []
		array.map(element => {
			parsed_array.push(element.toString())	
		})
		return parsed_array
	}

	parseStringArrayToInt(array){
		var parsed_array = []
		array.map(element => {
			parsed_array.push(parseInt(element))
		})
		return parsed_array
	}

	correctFlags(flags){
		return this.parseStringArrayToInt(this.addZeros(DEC2BIN(flags),8).split(""))
	}

	discorrectFlags(flags){
		console.log("discorrectFlags()")
		var mini_flags = this.removeZeros(this.parseStringArrayToInt(flags)) 
		if (mini_flags.length) {
			var string_flags = ""
			mini_flags.map(element => {
				string_flags = string_flags + element
			})
			return parseInt(string_flags,2)

		}else{
			return 0
		}
	}

	handleCharacteristicNotification(data){
		var {dispatch} = this.props
		var value = data.value.shift()
		var values = data.value
		console.log("data",data.value)
		

		switch(value){
			case 0x29:
				var  time_out = BYTES_TO_HEX([values[2],values[3]])
				console.log("time_out",parseInt(time_out,16) )
				var rs_settings_data = {
					flags :   this.correctFlags(values[0]),
					bound_rate : parseInt(BYTES_TO_HEX([values[1]]),16 )  ,
					timeout : parseInt(BYTES_TO_HEX([values[2],values[3]]),16) ,
					term_char : parseInt(BYTES_TO_HEX([values[4]]),16),
					address_mode : parseInt(BYTES_TO_HEX([values[5]]),16),					
				}
				
				this.updateRsSettings(rs_settings_data)

			break

			default:
				console.log("Error","No option found to: " + data.value)
			break
		}
	}    

	addZeros(string,lenght_to_stop){
		console.log("lenght_to_stop",lenght_to_stop)
		if(string.length < lenght_to_stop)
			return this.addZeros("0" + string,lenght_to_stop)

		return string
	}

	removeZeros(array){
		if(array){
			if(array.lenght > 0){
				if(array[0] == 0){
					array.shift()
					return this.removeZeros(array)
				}
			}else{
				return []
			}
		}else{
			return []
		}
		return array
	}

	updateRsSettings(values){
		console.log("updateRsSettings()",values)
		this.props.dispatch({type: "SET_RS_SETTINGS_DATA",rs_settings_data: values})
	}

	updateBaud(value){
		var values = JSON.parse(JSON.stringify(this.props.rs_settings_data)) 
		values.bound_rate = value
		this.updateRsSettings(values)
	}

	updateBitMode(value){
		var values = JSON.parse(JSON.stringify(this.props.rs_settings_data)) 
		values.flags[5] = value
		this.updateRsSettings(values)
	}

	updateTimeout(value){
		var values = JSON.parse(JSON.stringify(this.props.rs_settings_data)) 
		values.timeout = parseInt(value)
		this.updateRsSettings(values)
	}

	updatePacketTermination(value){
		var values = JSON.parse(JSON.stringify(this.props.rs_settings_data)) 
		values.flags[values.flags.length -1] = parseInt(value)
		this.updateRsSettings(values)
	}

	updateTerminationCharacter(value){
		var values = JSON.parse(JSON.stringify(this.props.rs_settings_data))
		values.term_char = value
		this.updateRsSettings(values)
	}

	updateIncludeTerminationCharacter(value){
		var values = JSON.parse(JSON.stringify(this.props.rs_settings_data)) 
		values.flags[values.flags.length -2] = parseInt(value)
		this.updateRsSettings(values)
	}

	update(){
		console.log("update()")
		var values = this.props.rs_settings_data
		var flags = this.discorrectFlags(values.flags) 
		var bound_rate = values.bound_rate
		
		var time_out = values.timeout
		time_out = time_out.toString(16)
		console.log("time_out",time_out)
		
		if(time_out.length < 4)
			time_out = this.addZeros(time_out,4)

		console.log("time_out", time_out)
		var bytes_time_out = HEX_TO_BYTES(time_out)

		var address_mode = values.address_mode
		var term_char = values.term_char

		if(bytes_time_out.length == 1){
			var first_value = 0
			var second_value = bytes_time_out[0]
		}else{
			var first_value = bytes_time_out[0]
			var second_value = bytes_time_out[1]
		}		

		var data = [COMMAND_SET_SERIAL_SETTINGS,flags,bound_rate,first_value,second_value,term_char,address_mode,0,0,0,0]
		WRITE_COMMAND(this.props.device.id,data)
		Alert.alert("Success","Update sucessfully")
	}


	render(){	
		if(IS_EMPTY(this.props.rs_settings_data) )
			return <ActivityIndicator/>

		var d = this.props.rs_settings_data
		var bit_mode = d.flags[5]
		var packet_termination = d.flags[d.flags.length -1]
		var include_term_characther = d.flags[d.flags.length -2]

		return(
			<View style={{flex:1}}>
				<Background>
					<View style={{width:width}}>
						<View>
							
							<View>
								<View style={styles.row_normal_style}>
									<View>
										<Title size={14} name="BAUD RATE" type=""/>
									</View>
									<View style={{flexDirection:"row",justifyContent:"flex-end",flex:1}}>
										<Button text="9600" active={d.bound_rate == 1} handleTouchButton={() => this.updateBaud(1)}/>
										<Button text="19200" active={d.bound_rate == 2} handleTouchButton={() => this.updateBaud(2)}/>
										<Button text="38400" active={d.bound_rate == 3} handleTouchButton={() => this.updateBaud(3)}/>
									</View>
								</View>
							</View>
						</View>

						<Text style={{fontSize:20,padding:20}}>
							PACKET DETAILS
						</Text>
						<View>
							<View style={styles.row_normal_style}>
								<View>
									<Title size={14} name="RS-486 Bit Mode" type=""/>
								</View>
								<View style={{flexDirection:"row",justifyContent:"flex-end",flex:1}}>
									<Button text="8 bits" active={bit_mode == 0} handleTouchButton={() => this.updateBitMode(0)}/>
									<Button text="9 bits" active={bit_mode == 1} handleTouchButton={() => this.updateBitMode(1)}/>
								</View>
							</View>
						

							<View style={styles.row_normal_style}>
								<View>
									<Title size={14} name="Timeout" type=""/>
								</View>
								<View style={{flexDirection:"row",justifyContent:"flex-end",flex:1}}>
								    <TextInput
					    				style={{height: 40, borderColor: 'gray', borderWidth: 0.6,backgroundColor:"white",width:90,textAlign:"center",fontSize:18,marginHorizontal:40}}
					    				keyboardType="numeric"
					    				maxLength = {3}
					    				onChangeText={(value) => this.updateTimeout(value)}
					    				underlineColorAndroid="transparent" 
					    				value={d.timeout.toString()}
					    				placeholder="XXX"
					  				/>
			  					</View>
							</View>

							<View style={styles.row_normal_style}>
								<View>
									<Title size={14} name="Packet Termination" type=""/>
								</View>
								<View style={{flexDirection:"row",justifyContent:"flex-end",flex:1}}>
									<Button text="Enable" active={packet_termination == 1} handleTouchButton={() => this.updatePacketTermination(1)}/>
									<Button text="Disable" active={packet_termination == 0} handleTouchButton={() => this.updatePacketTermination(0)}/>
								</View>
							</View>
							{packet_termination == 1 && (
								<View>
									<View style={styles.row_normal_style}>
										<View>
											<Title size={14} name="Termination Character" type=""/>
										</View>
										<View style={{flexDirection:"row",justifyContent:"flex-end",flex:1}}>
											<Button text="Enable" active={d.term_char == 1} handleTouchButton={() => this.updateTerminationCharacter(1)}/>
											<Button text="Disable" active={d.term_char == 0} handleTouchButton={() => this.updateTerminationCharacter(0)}/>
										</View>
									</View>
									<View style={styles.row_normal_style}>
										<View>
											<Title size={14} name="Include Term Character" type=""/>
										</View>
										<View style={{flexDirection:"row",justifyContent:"flex-end",flex:1}}>
											<Button text="Enable" active={include_term_characther == 1} handleTouchButton={() => this.updateIncludeTerminationCharacter(1)}/>
											<Button text="Disable" active={include_term_characther == 0} handleTouchButton={() => this.updateIncludeTerminationCharacter(0)}/>
										</View>
									</View>
								</View>
								)
							}
						</View>
						<Text style={{fontSize:20,padding:20}}>
							ADDRESING
						</Text>
						<View>						
							<View style={styles.row_normal_style}>
								<View>
									<Title size={14} name="Include Term Character" type=""/>
								</View>
								<View style={{flexDirection:"row",justifyContent:"flex-end",flex:1}}>
									<Button text="Enable" active={false} handleTouchButton={() => this.updateBitMode(8)}/>
									<Button text="Disable" active={true} handleTouchButton={() => this.updateBitMode(8)}/>
								</View>
							</View>
						</View>
						
					</View>
				</Background>
			</View>
		);	
	}
}

const mapStateToProps = state => ({
	device: state.scanCentralReducer.central_device,
	rs_settings_data : state.rsSettingsReducer.rs_settings_data
});

export default connect(mapStateToProps)(RsSettings);