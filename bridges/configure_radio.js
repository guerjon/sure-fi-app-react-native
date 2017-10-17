import React, {Component} from 'react'
import {styles,first_color,success_green,option_blue} from '../styles/'
import {connect} from 'react-redux'
import {
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	TWO_BYTES_TO_INT,
	HEX_TO_BYTES
} from "../constants"
import {
	View,
	Text,
	NativeModules,
	NativeEventEmitter,
	Dimensions,
	ScrollView,
	Image,
	TouchableHighlight,
	FlatList,
	Button,
	Alert,
	Picker,
	
} from 'react-native'
import ActivityIndicator from '../helpers/centerActivityIndicator'
import Background from '../helpers/background'
import {WRITE_COMMAND} from '../action_creators'
import Power from '../radio_buttons/power'
import Acknowledments from '../radio_buttons/acknowledments'
import BandWidth from '../radio_buttons/bandWidth'
import HeartBeatPeriod from '../radio_buttons/heartBeatPeriod'
import RetryCount from'../radio_buttons/retryCount'
import SpreadingFactor from'../radio_buttons/spreadingFactor'
import HoppingTable from '../radio_buttons/hopping_table'
import SFBTable from '../radio_buttons/sfb_table'
import BleManager from 'react-native-ble-manager'

import {
COMMAND_GET_HOPPING_TABLE,
} from '../commands'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import Icon from 'react-native-vector-icons/FontAwesome';
const myIcon = (<Icon name="angle-right" size={25} color="#E4E9EC" />)
const check = (<Icon name="check" size={25} color={success_green} />)

const window = Dimensions.get('window');

class ConfigureRadio extends Component {


    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

	static navigatorButtons = {
		rightButtons: [
		  {
		    title: 'Update',
		    id: 'update',
		  }
		]
	};

    onNavigatorEvent(event){
    	if(event.id == "update"){
    		this.update()
    	}
    }

	constructor(props) {
		super(props);
		this.device = this.props.device
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
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
					() => this.writeStartUpdate()
				)
        	}
        )
	}

	writeStartUpdate(){
		console.log("writeStartUpdate()")
		WRITE_COMMAND(this.device.id,[0x09])
	}

	update(){
		var {
			power_selected,
			spreading_factor_selected,
			band_width_selected,
			dispatch,
			retry_count_selected,
			heartbeat_period_selected,
			acknowledments_selected,
			hopping_table_selected,
			sfb_table_selected
		} = this.props


		let heart_hex_value =  heartbeat_period_selected.toString(16) 
		let heart_value = HEX_TO_BYTES(heart_hex_value)
	

		if(heart_value.length == 1){
			var first_value = 0
			var second_value = heart_value[0]
		}else{
			var first_value = heart_value[0]
			var second_value = heart_value[1]
		}

		if(this.props.radio_values_lenght == 9){
			data = 		
				[
					0x0A,
					spreading_factor_selected,
					band_width_selected,
					power_selected,
					retry_count_selected,
					first_value, // change one byte to two bytes now is a 16 
					second_value,
					acknowledments_selected,
					parseInt(hopping_table_selected),
					sfb_table_selected
				]

			console.log("sfb_table_selected",sfb_table_selected)
			
			this.updateHoppingTableOnDeviceDetails(
				sfb_table_selected,
				hopping_table_selected,
				spreading_factor_selected,
				band_width_selected
			)

		}else{

			data =
				[
					0x0A,
					spreading_factor_selected,
					band_width_selected,
					power_selected,
					retry_count_selected,
					first_value, // change one byte to two bytes now is a 16 
					second_value,
					acknowledments_selected,
					parseInt(hopping_table_selected)
				]			

		}

		this.updatePower(power_selected)

		WRITE_COMMAND(
			this.device.id,
			data
		)

		Alert.alert("Success","Update successful")
		
	}

	updateHoppingTableOnDeviceDetails(sfb_table_selected,hopping_table,selectedDeviceSF,selectedDeviceBandwidth){
		console.log("updateHoppingTableOnDeviceDetails()",sfb_table_selected,hopping_table) 
		if(sfb_table_selected == 0){

			
			var sf = this.choseSpreadingFactor(selectedDeviceSF)
			var bw = this.chooseBandWidth(selectedDeviceBandwidth)
			console.log("sf",sf)
			this.props.dispatch({type: "UPDATE_HOPPING_TABLE",hopping_table:hopping_table})
        	this.props.dispatch({type: "UPDATE_SPREADING_FACTOR",spreading_factor:sf})
        	this.props.dispatch({type: "UPDATE_BAND_WIDTH",band_width:bw})


		}else{
			
			setTimeout(() => {
				console.log("entra")
				WRITE_COMMAND(this.device.id,[COMMAND_GET_HOPPING_TABLE])
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

				console.log("heart",heart);
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

	updatePowerValue(power_selected){
		this.props.dispatch({type:"UPDATE_POWER_SELECTED",power_selected:power_selected})
	}

	updateSpreadingFactor(spreading_factor_selected){
		this.props.dispatch({type: "UPDATE_SPREADING_FACTOR_SELECTED",spreading_factor_selected :spreading_factor_selected})
	}

	updateBandWidth(band_width_selected){
		this.props.dispatch({type: "UPDATE_BAND_WIDTH_SELECTED",band_width_selected:band_width_selected})
	}

	updateRetryCount(retry_count_selected){
		this.props.dispatch({type: "UPDATE_RETRY_COUNT",retry_count_selected:retry_count_selected})
	}

	updateHeartBeatPeriod(heartbeat_period_selected){
		this.props.dispatch({type: "UPDATE_HEARTBEAT_PERIOD",heartbeat_period_selected:heartbeat_period_selected})
	}

	updateAcknowledments(acknowledments_selected){
		this.props.dispatch({type: "UPDATE_ACKNOWLEDMENTS",acknowledments_selected:acknowledments_selected})
	}

	updateSFBTable(sfb_table_selected){
		this.props.dispatch({type: "UPDATE_SFBTABLE",sfb_table_selected: sfb_table_selected})
	}

	updateHoppingTable(hopping_table_selected){
		this.props.dispatch({type: "UPDATE_HOPPING_TABLE_SELECTED",hopping_table_selected:hopping_table_selected})
	}

	render(){
		var button_style = {
			backgroundColor:option_blue,
			width:80,
			height: 40,
			alignItems: "center",
			justifyContent:"center",
			borderRadius: 10,
			marginHorizontal: 5
		}
		var button_text_style = {
			color:"white"
		}


		if(this.props.page_status == "loaded"){
			return (
				<Background>
					<ScrollView>
						<View style={{marginTop:10}}>
							<Power current_value={this.props.power_selected} updateValue={(value => this.updatePowerValue(value))}/>
						</View>
						{this.props.radio_values_lenght == 9 && 
							(
								<View>
									<SFBTable 
										current_value={this.props.sfb_table_selected} 
										updateValue={(value) => this.updateSFBTable(value)}
									/>
								</View>
							)
						}						
						<View>
							<SpreadingFactor current_value={this.props.spreading_factor_selected} updateValue={(value) => this.updateSpreadingFactor(value) }/>
						</View>	
						<View>
							<BandWidth current_value={this.props.band_width_selected} updateValue={(value) => this.updateBandWidth(value)}/>
						</View>		
						<View>
							<RetryCount current_value={this.props.retry_count_selected} updateValue={(value) => this.updateRetryCount(value)}/>
						</View>
						<View>
							<HeartBeatPeriod current_value={this.props.heartbeat_period_selected} updateValue={(value) => this.updateHeartBeatPeriod(value)}/>
						</View>		
						<View >
							<Acknowledments current_value={this.props.acknowledments_selected} updateValue={(value) => this.updateAcknowledments(value)}/>
						</View>
						<View style={{backgroundColor:"white",marginTop:10}}>
							<HoppingTable 
								current_value={this.props.hopping_table_selected}
								text_input_editable = {this.props.text_input_editable} 
								checkbox_selected={this.props.checkbox_selected} />
						</View>

					</ScrollView>											
				</Background>
			)			
		}else{
			return <Background><ActivityIndicator /></Background>
		}
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
});

export default connect(mapStateToProps)(ConfigureRadio)