import React, {Component} from 'react'
import {styles,first_color,success_green,option_blue,width} from '../../styles/'
import {connect} from 'react-redux'
import {
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	TWO_BYTES_TO_INT,
	HEX_TO_BYTES,
	NOTIFICATION
} from "../../constants"
import {
	View,
	Text,
	NativeModules,
	NativeEventEmitter,
	ScrollView,
	TouchableHighlight,
	Alert,
	TextInput
} from 'react-native'
import ActivityIndicator from '../../helpers/centerActivityIndicator'
import Background from '../../helpers/background'
import {HVAC_WRITE_COMMAND,LOG_INFO} from '../../action_creators'
import Power from '../../radio_buttons/power'
import Acknowledments from '../../radio_buttons/acknowledments'
import BandWidth from '../../radio_buttons/bandWidth'
import HeartBeatPeriod from '../../radio_buttons/heartBeatPeriod'
import RetryCount from'../../radio_buttons/retryCount'
import SpreadingFactor from'../../radio_buttons/spreadingFactor'
import HoppingTable from '../../radio_buttons/hopping_table'
import SFBTable from '../../radio_buttons/sfb_table'
import BleManager from 'react-native-ble-manager'
import Title from '../../helpers/title'
import Button from '../../helpers/button'
import {PhoneCmd_SetRadioSettings} from '../../hvac_commands_and_responses'
import {
COMMAND_GET_HOPPING_TABLE,
} from '../../commands'

import Icon from 'react-native-vector-icons/FontAwesome';
const myIcon = (<Icon name="angle-right" size={25} color="#E4E9EC" />)
const check = (<Icon name="check" size={25} color={success_green} />)

class HVACConfigureRadio extends Component {


    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true, 
    }


    onNavigatorEvent(event){
    	if(event.id == "update"){
			if(this.props.radio_settings[5] != 255 && (this.props.radio_settings > 215 || this.props.radio_settings < 0)){
				Alert.alert("Error","The hopping table is incorrect.")
			}else{
				this.props.dispatch({type: "UPDATE_PAGE_STATUS",page_status:"loading"})
				this.update()
			}    		
    	}
    }

	constructor(props) {
		super(props);
		this.device = this.props.device
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}


	writeStartUpdate(){
		console.log("writeStartUpdate()")
		HVAC_WRITE_COMMAND(this.device.id,[0x09])
	}




	update(){
		console.log("update()",)
		var data = [PhoneCmd_SetRadioSettings].concat(this.props.radio_settings)

		HVAC_WRITE_COMMAND(
			this.device.id,
			data			
		)

		this.props.dispatch({type: "UPDATE_PAGE_STATUS",page_status:"loaded"})
		Alert.alert("Success","Update successful")
		
		setTimeout(() => this.props.getRadioSettings(),1000)
		setTimeout(() => this.props.getHoppingTable(),2000)
		
	}

	updateHoppingTableOnDeviceDetails(sfb_table_selected,hopping_table,selectedDeviceSF,selectedDeviceBandwidth){
		console.log("updateHoppingTableOnDeviceDetails()",sfb_table_selected,hopping_table) 
		if(sfb_table_selected == 0){

			
			var sf = this.choseSpreadingFactor(selectedDeviceSF)
			var bw = this.chooseBandWidth(selectedDeviceBandwidth)
			this.props.dispatch({type: "UPDATE_HOPPING_TABLE",hopping_table:hopping_table})
        	this.props.dispatch({type: "UPDATE_SPREADING_FACTOR",spreading_factor:sf})
        	this.props.dispatch({type: "UPDATE_BAND_WIDTH",band_width:bw})


		}else{
			
			setTimeout(() => {
				console.log("entra")
				HVAC_WRITE_COMMAND(this.device.id,[COMMAND_GET_HOPPING_TABLE])
	    		.then(response => {
	    			console.log("response",response)
	    		})				
			},2000)
		}
	}

	choseSpreadingFactor(value){
		console.log("spreading_factor",value)
		var options = ["","SF7","SF8","SF9","SF10","SF11","SF12"]
		var spreading_factor = options[value]
		return spreading_factor
	}

	chooseBandWidth(value){
		var options = ["","31.25 kHz","62.50 kHz","125 kHz","250 kHz","500 kHz"]
		return options[value]
	}

	updatePower(power_selected){
		var values = ["","1/8 Watt","1/4 Watt","1/2 Watt","1 Watt"]
		this.props.dispatch({type:"UPDATE_POWER",power:values[power_selected]})
	}

	bytesToHex(bytes) {
	    for (var hex = [], i = 0; i < bytes.length; i++) {
	        hex.push((bytes[i] >>> 4).toString(16));
	        hex.push((bytes[i] & 0xF).toString(16));
	    }
	    return hex.join("");
	}

	handleCharacteristicNotification(data){
		console.log("notification on configure_radio",data)
		var {dispatch} = this.props
		var values = data.value
		LOG_INFO(values,NOTIFICATION)

		switch(values[0]){

			case 0x08:
				values.shift()
				console.log("updateHeartBeatPeriod",values[4],values[5]);
				this.props.dispatch({type: "SET_RADIO_VALUES_LENGHT",radio_values_lenght : values.length})
					
				
				var byte_1 = this.bytesToHex([values[4]])
				var byte_2 = this.bytesToHex([values[5]])

				if(byte_2.charAt(0) == "0")
					byte_2 = byte_2.charAt(1)


 				var byte_hex = byte_1 + byte_2

				var heart = parseInt(byte_hex,16)

				console.log("this.props.radio_values_lenght",this.props.radio_values_lenght);
				if(this.props.radio_values_lenght == 9){
					
					this.updateBandWidth(values[1])
					this.updateSpreadingFactor(values[0])
					this.updatePowerValue(values[2])
					this.updateRetryCount(values[3])
					this.updateHeartBeatPeriod(heart)
					this.updateAcknowledments(values[6])
					this.updateHoppingTable(values[7])
					this.updateSFBTable(values[8])

					this.props.dispatch({type: "UPDATE_PAGE_STATUS",page_status:"loaded"})


				}
				else if (this.props.radio_values_lenght == 8){

					this.updateBandWidth(values[1])
					this.updateSpreadingFactor(values[0])
					this.updatePowerValue(values[2])
					this.updateRetryCount(values[3])
					this.updateHeartBeatPeriod(heart)
					this.updateAcknowledments(values[6])
					this.updateHoppingTable(values[7])

					this.props.dispatch({type: "UPDATE_PAGE_STATUS",page_status:"loaded"})

				}else{
					Alert.alert("Error","Error on get the radio values.")
				}
			break
			case 0x20: //get hopping table
				console.log("getting hopping table",data.value);
				
				var selectedDeviceHoppingTable = data.value[0]
				selectedDeviceHoppingTable = parseInt(selectedDeviceHoppingTable,16)
				this.props.saveOnCloudLog(data.value,"HOPPINGTABLE")

				this.props.selectHoppingTable(selectedDeviceHoppingTable,data.value[0])
				
				break
			case 0xE:
				Alert.alert("Error","Error on Write bytes");
			break

			default:
				console.log("Error","No option found to: " + values[0])
				//Alert.alert("Error","Error on get the radio values.")
			break
		}
	}

	updateRadioSettings(value,position){
		console.log("updateRadioSettings()",value,position)
		let current_values = this.props.radio_settings.slice() // this is necery or it won't change the render
		if(current_values.length == 7){
			
			current_values[position] = value

			this.props.dispatch({type: "SET_RADIO_SETTINGS_HVAC",radio_settings:current_values})

		}else{
			console.log("Error","Error on updateCustomMode the radio settings values aren't correct")
		}
	}

	getValue(){
		

		if (this.props.current_value) {
			
			if(this.props.current_value != ''){
			
				return this.props.current_value.toString()
			}else{
			
				return ''
			}
		}else{
			
			return ''
		} 
	}

	render(){
		if(this.props.page_status != "loaded")
			return <Background><ActivityIndicator /></Background>
		console.log("this.props.radio_settings",this.props.radio_settings);
		return (
			<Background>
				<ScrollView>
					<View style={{backgroundColor:"white"}}>
						<Title name="Radio settings" type=""/>
						<View style={{flexDirection:"row",padding:10,alignItems:"center",justifyContent:"center"}}>
							<Button text="Default" active={this.props.radio_settings[6] == 0} handleTouchButton={() => this.updateRadioSettings(0,6)} width={(width/2) -10} height={30}/>
							<Button text="Custom" active={this.props.radio_settings[6] == 1} handleTouchButton={() => this.updateRadioSettings(1,6)} width={(width/2) -10} height={30}/>
						</View>
					</View>
					{this.props.radio_settings[6] == 1 && (
						<View>
							<View>
								<Title name="Spreading Factor" type=""/>
								<View style={styles.row_style}>
									<Button text="SF7" active={this.props.radio_settings[0] == 1} handleTouchButton={() => this.updateRadioSettings(1,0)}  width={(width/7) - 10 } height={30}/>
									<Button text="SF8" active={this.props.radio_settings[0] == 2} handleTouchButton={() => this.updateRadioSettings(2,0)}  width={(width/7) - 10 } height={30}/>
									<Button text="SF9" active={this.props.radio_settings[0] == 3} handleTouchButton={() => this.updateRadioSettings(3,0)}  width={(width/7) - 10 } height={30}/>
									<Button text="SF10" active={this.props.radio_settings[0] == 4} handleTouchButton={() => this.updateRadioSettings(4,0)} width={(width/7) - 10 } height={30}/>
									<Button text="SF11" active={this.props.radio_settings[0] == 5} handleTouchButton={() => this.updateRadioSettings(5,0)} width={(width/7) - 10 } height={30}/>
									<Button text="SF12" active={this.props.radio_settings[0] == 6} handleTouchButton={() => this.updateRadioSettings(6,0)} width={(width/7) - 10 } height={30}/>
								</View>
							</View>
							<View>
								<Title name="BandWidth (kHz)" type=""/>
								<View>
									<View style={styles.row_style}>
										<Button text="31.25 " active={this.props.radio_settings[1] == 1} handleTouchButton={() => this.updateRadioSettings(1,1)} width={(width/5) - 10 } height={30}/>
										<Button text="62.5 " active={this.props.radio_settings[1] == 2} handleTouchButton={() => this.updateRadioSettings(2,1)} width={(width/5) - 10 } height={30}/>									
										<Button text="125 " active={this.props.radio_settings[1] == 3} handleTouchButton={() => this.updateRadioSettings(3,1)} width={(width/5) - 10 } height={30}/>
										<Button text="250 " active={this.props.radio_settings[1] == 4} handleTouchButton={() => this.updateRadioSettings(4,1)} width={(width/5) - 10 } height={30}/>
										<Button text="500 " active={this.props.radio_settings[1] == 5} handleTouchButton={() => this.updateRadioSettings(5,1)} width={(width/5) - 10 } height={30}/>
									</View>
								</View>
							</View>		
						</View>				
					)}
					<View>
						<Title name="Power" type=""/>
						<View style={styles.row_style}>
							<Button text="1/8 Watt" active={this.props.radio_settings[2] == 0x16} handleTouchButton={() => this.updateRadioSettings(0x16,2)} width={(width/4) - 10 } height={30}/>
							<Button text="1/4 Watt" active={this.props.radio_settings[2] == 0x19} handleTouchButton={() => this.updateRadioSettings(0x19,2)} width={(width/4) - 10 } height={30}/>
							<Button text="1/2 Watt" active={this.props.radio_settings[2] == 0x1C} handleTouchButton={() => this.updateRadioSettings(0x1C,2)} width={(width/4) - 10 } height={30}/>
							<Button text="1 Watt" active={this.props.radio_settings[2] == 0x1F} handleTouchButton={() => this.updateRadioSettings(0x1F,2)} width={(width/4) - 10 } height={30}/>
						</View>
					</View>						
					<View>
						<Title name="Retry Counts" type=""/>
						<View>
							<View style={styles.row_style}>
								<Button text="0" active={this.props.radio_settings[3] == 0} handleTouchButton={() => this.updateRadioSettings(0,3)} width={(width/7) - 10 } height={30} marginHorizontal={2}/>
								<Button text="1" active={this.props.radio_settings[3] == 1} handleTouchButton={() => this.updateRadioSettings(1,3)} width={(width/7) - 5 } height={30} marginHorizontal={2}/>
								<Button text="2" active={this.props.radio_settings[3] == 2} handleTouchButton={() => this.updateRadioSettings(2,3)} width={(width/7) - 5 } height={30} marginHorizontal={2}/>
								<Button text="3" active={this.props.radio_settings[3] == 3} handleTouchButton={() => this.updateRadioSettings(3,3)} width={(width/7) - 5 } height={30} marginHorizontal={2}/>
								<Button text="4" active={this.props.radio_settings[3] == 4} handleTouchButton={() => this.updateRadioSettings(4,3)} width={(width/7) - 5 } height={30} marginHorizontal={2}/>
								<Button text="5" active={this.props.radio_settings[3] == 5} handleTouchButton={() => this.updateRadioSettings(5,3)} width={(width/7) - 5 } height={30} marginHorizontal={2}/>
								<Button text="6" active={this.props.radio_settings[3] == 6} handleTouchButton={() => this.updateRadioSettings(6,3)} width={(width/7) - 10 } height={30} marginHorizontal={2}/>
							</View>			
						</View>
					</View>	
					
					<View style={{backgroundColor:"white"}}>
						<Title name="Acknowledments" type=""/>
						<View style={{flexDirection:"row",padding:10,alignItems:"center",justifyContent:"center"}}>
							<Button text="Disabled" active={this.props.radio_settings[4] == 0} handleTouchButton={() => this.updateRadioSettings(0,4)} width={(width/2) -10} height={30}/>
							<Button text="Enabled" active={this.props.radio_settings[4] == 1} handleTouchButton={() => this.updateRadioSettings(1,4)} width={(width/2) -10} height={30}/>
						</View>
					</View>

					<View style={{backgroundColor:"white"}}>
						<Title name="Hopping Table" type=""/>
						<View style={{flexDirection:"row",padding:10,alignItems:"center",justifyContent:"center"}}>
							<Button text="Default" active={this.props.radio_settings[5] == 255} handleTouchButton={() => this.updateRadioSettings(255,5)} width={(width/2) -10} height={30}/>
							<Button text="Custom" active={this.props.radio_settings[5] != 255} handleTouchButton={() => this.updateRadioSettings(-1,5)} width={(width/2) -10} height={30}/>
						</View>
						{this.props.radio_settings[5] != 255 && (
							<View style={{alignItems:"center",justifyContent:"center",flexDirection:"row",padding:20,marginBottom:20}}>
								<Text>
									Hopping Table Value: 
								</Text>
							    <TextInput
				    				style={{height: 40, borderColor: 'gray', borderWidth: 0.6,backgroundColor:"white",width:80,textAlign:"center",fontSize:18,marginHorizontal:10}}
				    				keyboardType="numeric"
				    				maxLength = {3}
				    				onChangeText={(text) => this.updateRadioSettings(parseInt(text),5)}
				    				underlineColorAndroid="transparent" 
				    				value={ this.props.radio_settings[5].toString()  == -1 ? "" : this.props.radio_settings[5].toString() }
				    				placeholder="XXX"
				  				/>
							</View>
						)}
					</View>
				</ScrollView>											
			</Background>
			)
	}
}

const mapStateToProps = state => ({
  	page_status : state.configureRadioCentralReducer.page_status,
  	power_selected : state.configureRadioCentralReducer.power_selected,
  	band_width_selected : state.configureRadioCentralReducer.band_width_selected,
  	spreading_factor_selected : state.configureRadioCentralReducer.spreading_factor_selected,
  	retry_count_selected : state.configureRadioCentralReducer.retry_count_selected,
  	heartbeat_period_selected : state.configureRadioCentralReducer.heartbeat_period_selected,
  	acknowledments_selected : state.configureRadioCentralReducer.acknowledments_selected,
  	hopping_table_selected : state.configureRadioCentralReducer.hopping_table_selected,
  	sfb_table_selected : state.configureRadioCentralReducer.sfb_table_selected,
    radio_values_lenght : state.configureRadioCentralReducer.radio_values_lenght,
    checkbox_selected : state.configureRadioCentralReducer.checkbox_selected,
    text_input_editable : state.configureRadioCentralReducer.text_input_editable,
    device: state.scanCentralReducer.central_device,
    radio_settings: state.setupCentralReducer.radio_settings
});

export default connect(mapStateToProps)(HVACConfigureRadio)