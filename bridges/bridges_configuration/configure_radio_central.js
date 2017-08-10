import React, {Component} from 'react'
import {styles,first_color,success_green} from '../../styles/'
import {connect} from 'react-redux'
import {SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,SUREFI_CMD_READ_UUID} from "../../constants"
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
	Alert
} from 'react-native'
import ActivityIndicator from '../../helpers/centerActivityIndicator'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import Icon from 'react-native-vector-icons/FontAwesome';
const myIcon = (<Icon name="angle-right" size={25} color="#E4E9EC" />)
const check = (<Icon name="check" size={25} color={success_green} />)

const window = Dimensions.get('window');
var powerOptions = new Map()
var bandWidth = new Map()
var spreadingFactor = new Map()
var heartbeatPeriod = new Map()
var acknowledments = new Map()
var retryCount = new Map()

var powerOptionsReverse = new Map()
var bandWidthReverse = new Map()
var spreadingFactorReverse = new Map()
var heartbeatPeriodReverse = new Map()
var acknowledmentsReverse = new Map()



powerOptions.set(1,"1/8 Watt")
powerOptions.set(2,"1/4 Watt")
powerOptions.set(3,"1/2 Watt")
powerOptions.set(4,"1 Watt")

bandWidth.set(1,"31.25 kHz")
bandWidth.set(2,"62.50 kHz")
bandWidth.set(3,"125 kHz")
bandWidth.set(4,"250 kHz")
bandWidth.set(5,"500 kHz")

spreadingFactor.set(1,"SF7")
spreadingFactor.set(2,"SF8")
spreadingFactor.set(3,"SF9")
spreadingFactor.set(4,"SF10")
spreadingFactor.set(5,"SF11")
spreadingFactor.set(6,"SF12")

retryCount.set(1,1)
retryCount.set(2,2)
retryCount.set(3,3)
retryCount.set(4,4)
retryCount.set(5,5)
retryCount.set(6,6)

heartbeatPeriod.set(0,"0 Sec")
heartbeatPeriod.set(15,"15 Sec")
heartbeatPeriod.set(30,"30 Sec")
heartbeatPeriod.set(60,"60 Sec")
heartbeatPeriod.set(90,"90 Sec")
heartbeatPeriod.set(120,"120 Sec")

acknowledments.set(0,"Disabled")
acknowledments.set(1,"Enabled")

powerOptionsReverse.set("1/8 Watt",1)
powerOptionsReverse.set("1/4 Watt",2)
powerOptionsReverse.set("1/2 Watt",3)
powerOptionsReverse.set("1 Watt",4)

bandWidthReverse.set("31.25 kHz",1)
bandWidthReverse.set("62.50 kHz",2)
bandWidthReverse.set("125, 4 kHz",3)
bandWidthReverse.set("250 kHz",4)
bandWidthReverse.set("500 kHz",5)

spreadingFactorReverse.set("SF7",1)
spreadingFactorReverse.set("SF8",2)
spreadingFactorReverse.set("SF9",3)
spreadingFactorReverse.set("SF10",4)
spreadingFactorReverse.set("SF11",5)
spreadingFactorReverse.set("SF12",6)

heartbeatPeriodReverse.set("0 Sec",0)
heartbeatPeriodReverse.set("15 Sec",15)
heartbeatPeriodReverse.set("30 Sec",30)
heartbeatPeriodReverse.set("60 Sec",60)
heartbeatPeriodReverse.set("90 Sec",90)
heartbeatPeriodReverse.set("120 Sec",120)


acknowledmentsReverse.set("Disabled",0)
acknowledmentsReverse.set("Enabled",1)





class ConfigureRadio extends Component {

	static navigationOptions ={
		title : "Configure Sure-Fi Radio",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white'

	}

	componentDidMount() {
		//bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',(data) => this.handleDisconnectedPeripheral(data) );
    	bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicNotification(data) );
    	this.startNotification()
	}

	handleDisconnectedPeripheral(data){

    	var {central_device,dispatch} = this.props
    	BleManagerModule.disconnect(central_device.id, () => dispatch({
            type: "DISCONNECT_CENTRAL_DEVICE"
        }));

    	//Alert.alert("Disconnected","The device " + central_device.manufactured_data.device_id.toUpperCase() + " has been disconnected.")	
    	this.props.navigation.goBack()	
	}

	startNotification(){
		var {central_device,dispatch} = this.props
        BleManagerModule.retrieveServices(
        	central_device.id,
        	() => {
        		BleManagerModule.startNotification(
					central_device.id,
					SUREFI_CMD_SERVICE_UUID,
					SUREFI_CMD_READ_UUID,
					() => this.writeStartUpdate()
				)
        	}
        )
	}

	writeStartUpdate(){
		let {central_device,dispatch} = this.props
		this.write([9])
	}

	temporalyConnect(){
		BleManagerModule.start({},start => {})
		var {central_device,dispatch} = this.props
	    BleManagerModule.connect(central_device.id,() => this.startNotification())
	}	

	update(){
		var {power_selected,spreading_factor_selected,band_width_selected,dispatch,retry_count_selected,heartbeat_period_selected,acknowledments_selected} = this.props		
		this.write(
			[
				0x0A,
				powerOptionsReverse.get(power_selected),
				spreadingFactorReverse.get(spreading_factor_selected),
				bandWidthReverse.get(band_width_selected),
				retryCount.get(retry_count_selected),
				heartbeatPeriodReverse.get(heartbeat_period_selected),
				acknowledmentsReverse.get(acknowledments_selected)
			]
		)
		Alert.alert("Success","Update successful")
		dispatch({type:"CLOSE_OPTIONS"})
	}

	handleCharacteristicNotification(data){
		var {dispatch} = this.props
		var values = data.value
		var band_width = bandWidth.get(values[1])
		var spreading_factor = spreadingFactor.get(values[2])
		var power =  powerOptions.get(values[3])
		var retry_count = values[4]
		var heartbeat_period = heartbeatPeriod.get(values[5]) 
		var acknowledments2 = acknowledments.get(values[6]) 

		if(values.length > 3){
			dispatch(
				{
					type: "CONFIGURE_RADIO_CENTRAL_PAGE_LOADED",
					power_selected : power, 
					spreading_factor_selected : spreading_factor ,
					band_width_selected : band_width,
					retry_count_selected : retry_count,
					heartbeat_period_selected : heartbeat_period,
					acknowledments_selected : acknowledments2
				}
			)
		}else{
			console.log("Something was wrong with radio values.")
		}
	}

	write(data){
		var {central_device} = this.props
		console.log("write this",data)
		BleManagerModule.specialWrite(central_device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20)
	}


	getOptions(){
		var {
			power_selected,
			spreading_factor_selected,
			band_width_selected,
			options_selected,
			retry_count_selected,
			heartbeat_period_selected,
			acknowledments_selected
		} = this.props
		var content = null
		
		return(
			
			<ScrollView>
				<View style={{alignItems:"center"}}>
					<TouchableHighlight onPress = {() => this.update()} style={styles.greenButton}>
						<Text style={styles.greenButtonText}>
							UPDATE
						</Text>
					</TouchableHighlight>
				</View>
				<View style={{marginVertical:20}}>
					{this.getRow("Power", power_selected ? power_selected : "Unknown")}
					{(options_selected == "power_options") ? this.renderOptions(powerOptions) : null}
				</View>
				<View style={{marginVertical:20}}>
					{this.getRow("Spreading Factor", spreading_factor_selected ? spreading_factor_selected : "Unknown")}
					{options_selected == "spreading_factor_options" ? this.renderOptions(spreadingFactor) : null}
				</View>
				<View style={{marginVertical:20}}>
					{this.getRow("BandWidth",band_width_selected ?  band_width_selected : "Unknown")}
					{options_selected == "bandwidth_options" ? this.renderOptions(bandWidth) : null}
				</View>
				<View style={{marginVertical:20}}>
					{this.getRow("Retry Count",retry_count_selected ?  retry_count_selected : "Unknown")}
					{options_selected == "retry_count_options" ? this.renderOptions(retryCount) : null}
				</View>
				<View style={{marginVertical:20}}>
					{this.getRow("Heartbeat Period",heartbeat_period_selected ?  heartbeat_period_selected : "Unknown")}
					{options_selected == "heartbeat_period_options" ? this.renderOptions(heartbeatPeriod) : null}
				</View>
				<View style={{marginVertical:20}}>
					{this.getRow("Acknowledments",acknowledments_selected ?  acknowledments_selected : "Unknown")}
					{options_selected == "acknowledments_options" ? this.renderOptions(acknowledments) : null}
				</View>

				<View style={{alignItems:"center"}}>
					<TouchableHighlight onPress = {() => this.update()} style={styles.greenButton}>
							<Text style={styles.greenButtonText}>
								UPDATE
							</Text>
						</TouchableHighlight>
				</View>
			</ScrollView>
			
		)
	}

	renderOptions(options){
		var {
			power_selected,
			spreading_factor_selected,
			band_width_selected,
			retry_count_selected,
			heartbeat_period_selected,
			acknowledments_selected
		} = this.props
		var options_array = Array.from(options)
		console.log("options_array",options_array)
		return (
			<FlatList 
				data={options_array}  
				renderItem={({item}) => this.renderOption(item)}
				extraData = {
					[
						power_selected ? power_selected[1] : 0 ,
						spreading_factor_selected ? spreading_factor_selected[1] : 0,
						band_width_selected ? band_width_selected[1] : 0,
						retry_count_selected ? retry_count_selected[1] : 0,
						heartbeat_period_selected ? heartbeat_period_selected[1] : 0,
						acknowledments_selected ? acknowledments_selected[1] : 0
					]
				}
				keyExtractor={(item,index) => index}/>
		)
	}	

	showOptions(name){
		var {dispatch,options_selected} = this.props
		console.log("poderoso name",name)
		switch(name){
			case "Power":
				if(options_selected == "power_options")
					dispatch({type: "CLOSE_OPTIONS"})
				else
					dispatch({type: "SHOW_POWER_OPTIONS"})
			return
			case "Spreading Factor":
				if(options_selected == "spreading_factor_options")
					dispatch({type: "CLOSE_OPTIONS"})
				else
					dispatch({type: "SHOW_SPREADING_FACTOR_OPTIONS"})			
			return
			case "BandWidth":
				if(options_selected == "bandwidth_options")
					dispatch({type: "CLOSE_OPTIONS"})
				else
					dispatch({type: "SHOW_BANDWIDTH_OPTIONS"})
			return 
			case "Retry Count":
				if(options_selected == "retry_count_options")
					dispatch({type: "CLOSE_OPTIONS"})
				else
					dispatch({type: "SHOW_RETRY_COUNT_OPTIONS"})

			return
			case "Heartbeat Period" :
				if(options_selected == "heartbeat_period_options")
					dispatch({type: "CLOSE_OPTIONS"})
				else
					dispatch({type: "SHOW_HEARTBEAT_PERIOD_OPTIONS"})

			return 
			case "Acknowledments" :
				if(options_selected == "acknowledments_options")
					dispatch({type: "CLOSE_OPTIONS"})
				else
					dispatch({type: "SHOW_ACKNOWLEDMENTS_OPTIONS"})
			return 
			default:
			return
		}

	}


	/*
		Render the values of each radio option
	*/
	renderOption(name){
		
		var value = name[1] ? name[1] : "Undefined"
		var {
			power_selected,
			spreading_factor_selected,
			band_width_selected,
			dispatch,
			options_selected,
			retry_count_selected,
			heartbeat_period_selected,
			acknowledments_selected
		} = this.props

		return (
			<TouchableHighlight onPress={() => dispatch({type: "OPTION_SELECTED",value: value, option_selected : options_selected}) }>
				<View style={{backgroundColor:"white",padding: 15,flexDirection:"row",borderBottomWidth:0.3}}>
					<View style={{flex:1, flexDirection:"row"}}>
						<View style={{marginHorizontal:10}}>
						<Text> 
							{value}
						</Text>
						</View>
						<View>
							{
								value == power_selected && <Text>{check}</Text>
							}
							{
								value == spreading_factor_selected && <Text>{check}</Text>
							}
							{
								value == band_width_selected && <Text>{check}</Text>
							}
							{
								value == retry_count_selected && <Text> {check} </Text>
							}
							{
								value == heartbeat_period_selected && <Text> {check} </Text>
							}
							{
								value == acknowledments_selected && <Text> {check} </Text>
							}
						</View>
					</View>
				</View>
			</TouchableHighlight>
		)
	}

	getRow(name,value){
		return (		
			<TouchableHighlight onPress={() => this.showOptions(name)} style={{borderBottomWidth:0.3}}>
				<View style={{backgroundColor:"white",padding: 15,flexDirection:"row"}}>
					<View style={{flex:1}}>
						<Text> 
							{name}
						</Text>
					</View>
					<View>
						<Text style={{fontWeight: 'bold'}}>
							{value}
						</Text>
					</View>
					<View style={{marginHorizontal:10}}>
						{myIcon}
					</View>
				</View>
			</TouchableHighlight>
		)
	}

	render(){
		var {page_status} = this.props 
		switch(page_status){
			case "loading" :
				var content = (<View style={{flex:1,alignItems:"center",justifyContent:"center"}}><ActivityIndicator/></View>)
				break
			case "loaded" :
				var content = this.getOptions()
				break
			default:
				var content = (<View><Text>Something was wrong </Text></View>)
		}

		return (
			<ScrollView style={styles.pairContainer}>
				{content}
			</ScrollView>
		)
	}
}

const mapStateToProps = state => ({
  	//central_device: {  id: "DB:CB:B5:8E:33:9A"},
  	central_device: state.scanCentralReducer.central_device,
  	page_status : state.configureRadioCentralReducer.page_status,
  	options_selected : state.configureRadioCentralReducer.options_selected,
  	option_selected : state.configureRadioCentralReducer.option_selected,
  	power_selected : state.configureRadioCentralReducer.power_selected,
  	band_width_selected : state.configureRadioCentralReducer.band_width_selected,
  	spreading_factor_selected : state.configureRadioCentralReducer.spreading_factor_selected,
  	retry_count_selected : state.configureRadioCentralReducer.retry_count_selected,
  	heartbeat_period_selected : state.configureRadioCentralReducer.heartbeat_period_selected,
  	acknowledments_selected : state.configureRadioCentralReducer.acknowledments_selected
});

export default connect(mapStateToProps)(ConfigureRadio)