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
var powerOptionsReverse = new Map()
var bandWidthReverse = new Map()
var spreadingFactorReverse = new Map()

powerOptions.set(1,"1/8 Watt")
powerOptions.set(2,"1/4 Watt")
powerOptions.set(3,"1/2 Watt")
powerOptions.set(4,"1 Watt")

bandWidth.set(1,"31.25 kHz")
bandWidth.set(2,"62.50 kHz")
bandWidth.set(3,"125, 4 kHz")
bandWidth.set(4,"250 kHz")
bandWidth.set(5,"500 kHz")

spreadingFactor.set(1,"SF7")
spreadingFactor.set(2,"SF8")
spreadingFactor.set(3,"SF9")
spreadingFactor.set(4,"SF10")
spreadingFactor.set(5,"SF11")
spreadingFactor.set(6,"SF12")



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

class ConfigureRadio extends Component {

	static navigationOptions ={
		title : "Configure Sure-Fi Radio",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white'

	}

	componentDidMount() {
		bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',(data) => this.handleDisconnectedPeripheral(data) );
    	bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicNotification(data) );
    	this.startNotification()
	}

	handleDisconnectedPeripheral(data){

    	var {central_device,dispatch} = this.props
    	BleManagerModule.disconnect(central_device.id, () => dispatch({
            type: "DISCONNECT_CENTRAL_DEVICE"
        }));
    	Alert.alert("Disconnected","The device " + central_device.manufactured_data.device_id.toUpperCase() + " has been disconnected.")	
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
		var {power_selected,spreading_factor_selected,band_width_selected,dispatch} = this.props		
		this.write([0x0A,powerOptionsReverse.get(power_selected),spreadingFactorReverse.get(spreading_factor_selected),bandWidthReverse.get(band_width_selected)])
		Alert.alert("Success","The update was made with success")
		dispatch({type:"CLOSE_OPTIONS"})
	}

	handleCharacteristicNotification(data){
		console.log("data",data)
		var {dispatch} = this.props
		var values = data.value
		var power =  powerOptions.get(values[3])
		var spreading_factor = spreadingFactor.get(values[2])
		var band_width = bandWidth.get(values[1])

		if(values.length > 3){
			dispatch(
				{
					type: "CONFIGURE_RADIO_CENTRAL_PAGE_LOADED",
					power_selected : power, 
					spreading_factor_selected : spreading_factor ,
					band_width_selected : band_width
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

		} = this.props
		var content = null
		
		return(
			
			<ScrollView>
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
				<View style={{alignItems:"center"}}>
					<TouchableHighlight onPress = {() => this.update()} style={styles.bigGreenButton}>
							<Text style={styles.bigGreenButtonText}>
								UPDATE
							</Text>
						</TouchableHighlight>
					</View>
			</ScrollView>
			
		)
	}

	renderOptions(options){
		var {power_selected,spreading_factor_selected,band_width_selected} = this.props
		var options_array = Array.from(options)
		return (
			<FlatList 
				data={options_array}  
				renderItem={({item}) => this.renderOption(item)}
				extraData = {[power_selected[1],spreading_factor_selected[1],band_width_selected[1]]}
				keyExtractor={(item,index) => index}/>
		)
	}	

	showOptions(name){
		var {dispatch,options_selected} = this.props

		if(name == "Power"){
			if(options_selected == "power_options")
				dispatch({type: "CLOSE_OPTIONS"})
			else
				dispatch({type: "SHOW_POWER_OPTIONS"})
		}
		if(name == "Spreading Factor"){
			if(options_selected == "spreading_factor_options")
				dispatch({type: "CLOSE_OPTIONS"})
			else
				dispatch({type: "SHOW_SPREADING_FACTOR_OPTIONS"})
		}

		if(name == "BandWidth"){
			if(options_selected == "bandwidth_options")
				dispatch({type: "CLOSE_OPTIONS"})
			else
				dispatch({type: "SHOW_BANDWIDTH_OPTIONS"})
		}
	}



	renderOption(name){
		
		var value = name[1] ? name[1] : "Undefined"
		var {power_selected,spreading_factor_selected,band_width_selected,dispatch,options_selected} = this.props

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
				<Image  
					source={require('../../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>	
					{content}
				</Image>				
			</ScrollView>
		)
	}
}

const mapStateToProps = state => ({
  	//central_device: {id :"FD:C0:90:D7:05:95"},
  	central_device: state.configurationScanCentralReducer.central_device,
  	page_status : state.configureRadioCentralReducer.page_status,
  	options_selected : state.configureRadioCentralReducer.options_selected,
  	option_selected : state.configureRadioCentralReducer.option_selected,
  	power_selected : state.configureRadioCentralReducer.power_selected,
  	band_width_selected : state.configureRadioCentralReducer.band_width_selected,
  	spreading_factor_selected : state.configureRadioCentralReducer.spreading_factor_selected
});

export default connect(mapStateToProps)(ConfigureRadio)