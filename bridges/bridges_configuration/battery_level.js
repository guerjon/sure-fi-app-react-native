import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	ActivityIndicator,
  	NativeEventEmitter,
  	NativeModules
} from 'react-native'
import {styles,first_color} from '../../styles/index.js'
import { connect } from 'react-redux';
import BleManager from 'react-native-ble-manager';

import {
	BatteryLevel as BatteryLevelCommand
} from '../../commands';
import { 
	LOADING,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	BYTES_TO_HEX,
	byteArrayToLong
} from '../../constants'

import {
	IS_CONNECTED,
	START_NOTIFICATION
} from '../../action_creators/index'

const BleManagerModule = NativeModules.BleManager;

const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class BatteryLevel extends Component{
	
	static navigationOptions ={
		title : "Battery Level",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	constructor(props) {
		super(props);
		var {central_device} = this.props
		
		bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',(data) => this.handleCharacteristicNotification(data) );
		this.power = 0
		this.battery = 0
	}

	componentWillMount() {
		var {central_device} = this.props
		START_NOTIFICATION(central_device.id)
			.then(response => {
				this.requestDeviceBattery(central_device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID)
			})		
			.catch(error => {
				console.log("error on componentWillMount",error)
			})
	}
	

	handleCharacteristicNotification(data){
		var {dispatch} = this.props
		let values = data.value
		let command = values[0]
		console.log("command",command)
		if(command == 20){
			let battery_level = this.calculateVoltage(byteArrayToLong([values[1],values[2]])).toFixed(2)
			let power = byteArrayToLong([values[3],values[4]])
			dispatch({type : "CHANGE_BATTERY_LEVEL" , battery_level : battery_level})
		}
	}

	calculateVoltage(x){
		let voltage = (x / 4095) * 15
		return voltage
	}

	requestDeviceBattery(id,service,characteristic,data){
		var {central_device} = this.props
		IS_CONNECTED(central_device.id)
			.then(response => {
				if(response){
					BleManager.write(id,service,characteristic,[0x1E],20)
					.then(() => {
						console.log("write?")
					})
					.catch(error => console.log("error",error))
				}else{
					BleManagerModule.retrieveServices(id,() => {
						BleManager.write(id,service,characteristic,[0x1E],20)
						.then(() => {
						})
						.catch(error => console.log("error",error))
					})					
				}
			})
			.catch(error => console.log("error on requestDeviceBattery()",error))


	}

	render(){	

		if(this.props.battery_level){
			return(
				<ScrollView style={styles.pairContainer}>
					<Image  
						source={require('../../images/temp_background.imageset/temp_background.png')} 
						style={styles.image_complete_container}
					>	
						<View style={styles.pairSectionsContainer}>
							<Text>
								Battery Level : {this.props.battery_level}
							</Text>
						</View>
					</Image>
				</ScrollView>
			);				
		}else{
			return <View><ActivityIndicator/></View>
		}

	}
}

const mapStateToProps = state => ({
	central_device: state.scanCentralReducer.central_device,
	battery_level : state.batteryLevelReducer.battery_level
});

export default connect(mapStateToProps)(BatteryLevel);
