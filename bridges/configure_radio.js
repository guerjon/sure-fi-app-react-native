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
import BleManager from 'react-native-ble-manager'

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
			hopping_table_selected
		} = this.props

		let heart_hex_value =  heartbeat_period_selected.toString(16) 
		console.log("heart_hex_value",heart_hex_value)
		let heart_value = HEX_TO_BYTES(heart_hex_value)



		if(heart_value.length == 1){
			var first_value = 0
			var second_value = heart_value[0]
		}else{
			var first_value = heart_value[0]
			var second_value = heart_value[1]
		}


		console.log("lol",heart_value)
		

		WRITE_COMMAND(
			this.device.id,
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

		)

		Alert.alert("Success","Update successful")
		
	}

	handleCharacteristicNotification(data){
		console.log("notification on configure_radio",data)
		var {dispatch} = this.props
		var values = data.value
		var heartbeat_period = TWO_BYTES_TO_INT(values[5],values[6])

		switch(values[0]){
			case 0x08:
				if(values.length > 7){
					
					this.updatePowerValue(values[3])
					this.updateSpreadingFactor(values[2])
					this.updateBandWidth(values[1])
					this.updateRetryCount(values[4])
					this.updateHeartBeatPeriod(heartbeat_period)
					this.updateAcknowledments(values[7])
					this.updateHoppingTable(values[8])
					this.props.dispatch({type: "UPDATE_PAGE_STATUS",page_status:"loaded"})

				}else{
					Alert.alert("Error","Error on get the radio values.")
				}
			break
			case 0xE:
				Alert.alert("Error","Error on Write bytes");
			break
			default:
				Alert.alert("Error","Error on get the radio values.")
			break
		}
	}

	updatePowerValue(power_selected){
		this.props.dispatch({type:"UPDATE_POWER",power_selected:power_selected})
	}

	updateSpreadingFactor(spreading_factor_selected){
		this.props.dispatch({type: "UPDATE_SPREADING_FACTOR",spreading_factor_selected :spreading_factor_selected})
	}

	updateBandWidth(band_width_selected){
		this.props.dispatch({type: "UPDATE_BAND_WIDTH",band_width_selected:band_width_selected})
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

	updateHoppingTable(hopping_table_selected){
		this.props.dispatch({type: "UPDATE_HOPPING_TABLE",hopping_table_selected:hopping_table_selected})
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

		console.log("this.props.",this.props.hopping_table_selected)

		if(this.props.page_status == "loaded"){
			return (
				<Background>
					<ScrollView>
						<View style={{marginTop:10}}>
							<Power current_value={this.props.power_selected} updateValue={(value => this.updatePowerValue(value))}/>
						</View>
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
						<View style={{marginBottom:50,backgroundColor:"white",marginTop:10}}>
							<HoppingTable current_value={this.props.hopping_table_selected} />
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
    device: state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(ConfigureRadio)