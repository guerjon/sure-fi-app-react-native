import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	ActivityIndicator,
  	NativeModules,
  	NativeEventEmitter,
  	TextInput,
  	Alert
} from 'react-native'
import {styles,first_color,width} from '../styles/index.js'
import { connect } from 'react-redux';
import BleManager from 'react-native-ble-manager'

import { 
	LOADING,
	IS_EMPTY,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_READ_UUID,
	GET_DEVICE_NAME_ROUTE,
	UPDATE_DEVICE_NAME_ROUTE,
	BASE64,
	DIVIDE_MANUFACTURED_DATA
} from '../constants'

import {IS_CONNECTED} from '../action_creators/'
import Icon from 'react-native-vector-icons/FontAwesome'
import {WhiteRowLink} from '../helpers/white_row_link'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);



class StatusBox extends Component{
	constructor(props) {
		super(props);
		this.connected = false
		this.input_text = ""
		this.device = props.device
		this.device_status = props.device_status
		this.indicator_number = props.indicator_number
		this.power_voltage = props.power_voltage
	}

	componentDidMount() {
		this.fetchDeviceName()
	}

		
	fetchDeviceName(){
		let device = this.props.device
		let device_id = device.manufactured_data.device_id.toUpperCase()
		let uuid = device.id

		fetch(GET_DEVICE_NAME_ROUTE,{
			method: "POST",
			headers: {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify({hardware_serial: device_id,ret_uuid:uuid})
		})
		.then(response => {
			var data = JSON.parse(response._bodyInit).data
			this.device_name = data.name
			this.props.dispatch({type: "UPDATE_DEVICE_NAME",device_name : data.name})

		})
		.catch(error => console.log("error",error))
	}

	renderConnectingBox(){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{padding: 10,margin:5}}>
							Status
						</Text >
						<View style={{width:180}}>
							<Text style={{fontSize:15}}>
								Hold the Test button on the Bridge for 5 seconds
							</Text>
						</View>
					</View>
					<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
						<ActivityIndicator />
					</View>							
				</View>
			</View>
		)
	}

	renderNormalConnecting(){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{padding: 10,margin:5}}>
							Status
						</Text >
						<View style={{width:180,justifyContent:"center",alignItems:"center"}}>
							<Text style={{fontSize:15}}>
								Connecting
							</Text>
						</View>
					</View>
					<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
						<ActivityIndicator />
					</View>							
				</View>
			</View>
		)
	}	
	
	renderDisconnectingBox(){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{padding: 10,margin:5}}>
							Status
						</Text >
						<Text style={{color: "red",padding: 10,margin: 5}}>
							"Disconnected"
						</Text>
					</View>
				</View>
			</View>
		)
/*
	<View style={{flex:1}}>
		<TouchableHighlight 
			style={{backgroundColor:"#00DD00",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
			onPress={()=> this.props.manualConnect(this.props.device)}
		>
			<Text style={styles.bigGreenButtonText}>
				Connect
			</Text>
		</TouchableHighlight>
	</View>							
*/

	}

    renderStatusDevice(){
    	var {device_status,remote_devices,remote_device_status,device} = this.props

    	switch(device_status){
    		case "normal_connecting":
    			return this.renderNormalConnecting()
			case "connecting":
				return this.renderConnectingBox()
			case "disconnected":
	            return this.renderDisconnectingBox();
			case "connected":
				if (this.props.options_loaded) 
 				return(
					<View>
						<View style={{backgroundColor:"white"}}>
				            <View style={{margin:10}}>
								<View style={{
									justifyContent:"center",
									alignItems:"center",
									flexDirection: "row"
								}}>
									<Text style={{padding: 2,fontSize:18}}>
										Status:
									</Text >
									<Text style={{color: "#00DD00",padding: 2,fontSize:18}}> 
										Connected
									</Text>
								</View>
							</View>
						</View>
					</View>	            	
	            )
 				else
 					return this.renderNormalConnecting()

	        default:
	        	return <Text>Error</Text>
    	}

		/*
			<View style={{flex:1}}>
				<TouchableHighlight 
					style={{backgroundColor:"gray",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
					onPress={() => this.props.manualDisconnect()}
				>
					<Text style={styles.bigGreenButtonText}>
						Disconnect
					</Text>
				</TouchableHighlight>
			</View>

		*/

    }
	
    updateName(){

    	if(this.props.device_name.length > 0 && this.props.device_name.  length < 60){
	    	let device = this.props.device
	    	let device_id = device.manufactured_data.device_id.toUpperCase()
	    	let ret_uuid = device.id
	    	let name = BASE64.btoa(this.props.device_name)

	    	fetch(UPDATE_DEVICE_NAME_ROUTE,{
	    		method: "POST",
	    		headers : {
	    			"Accept" : 'application/json',
	    			"Content-Type" : 'application/json'
	    		},
	    		body : JSON.stringify({
	    			hardware_serial : device_id,
	    			ret_uuid : ret_uuid,
	    			hardware_name : name
	    		})
	    	}).then(response => {
	    		let data = JSON.parse(response._bodyInit)
	    		if(data.status == "success"){
	    			this.device_name = data.data.name
	    			this.finishEditName();
	    		}else{
	    			Alert.alert("Error on update","Something was wrong on update the name")
	    		} 

	    	})
	    	.catch(error => console.log("error",error))

    	}else{
    		if(this.props.device_name == 0)
				Alert.alert("Error!","The name can't be empty.")
			else{
				Alert.alert("Error!","The name is so large.")
			}
    	}
    }

	startEditName(){
		this.props.dispatch({type: "START_EDITING"})
	}

	finishEditName(){
		this.props.dispatch({type: "FINISH_EDITING"})
	}

	render(){	
	
		var {device,is_editing,device_name,options_loaded,show_switch_button} = this.props;
		var switch_button =  (
			<WhiteRowLink 
				name={this.props.device.manufactured_data.hardware_type == "01" ? "Switch to Remote Unit" : "Switch to Central Unit"} 
				callback={() => this.props.switchUnit()}
			/>
		)

		if(this.props.is_editing){
			var content = (
				<View style={{flexDirection:"row",alignItems:"center"}}>
					<View style={{flex:0.8}}>
						<TextInput
							placeholder = "Write your new name"
							style={{height: 40, width:width -80, borderColor: 'gray', borderWidth: 0.3,borderRadius:5,backgroundColor:"white"}} 
							underlineColorAndroid="transparent"
							onChangeText = {text => this.props.dispatch({type: "UPDATE_DEVICE_NAME",device_name : text })}
							value = {this.props.device_name}
						/>					
					</View>
					<View style={{flex:0.2}}>
						<TouchableHighlight 
							style={{flex:0.1,alignItems:"flex-end",justifyContent:"center",paddingVertical:10}}
							onPress={() => this.finishEditName()}
						>
							<Icon name="times" size={25} color="red"/>
						</TouchableHighlight>
						<TouchableHighlight 
							style={{flex:0.1,alignItems:"flex-end",justifyContent:"center",paddingVertical:10}}
							onPress={() => this.updateName()}
						>
							<Icon name="upload" size={25} color="green"/>
						</TouchableHighlight>
					</View>	
				</View>
			)
		}else{
			if(device.manufactured_data.hardware_type == "01"){
				var image  = <Image source={require('../images/device_wiegand_central.imageset/device_wiegand_central.png')}/>
			}else{
				var image = <Image source={require('../images/device_wiegand_remote.imageset/device_wiegand_remote.png')}/>
			}

			var content = (
				<View style={{flexDirection:"row",alignItems:"center"}}>
					<View style={{flex:0.2}}>
						{image}
					</View>
					<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center",flex:0.5}}>
						<Text style={{fontSize:14}}>
							{this.device_name}
						</Text>
						 <Text style={{fontSize:10}}>
							{this.props.device.manufactured_data.hardware_type == "01" ? "Central Unit" : "Remote Unit" } {this.props.device.manufactured_data.device_state == "1301" ? "Unpaired" : "Paired"}
						</Text>
					</View>
					<TouchableHighlight 
						style={{flex:0.1,alignItems:"flex-end",justifyContent:"center"}}
						onPress={() => this.startEditName()}
					>
						<Icon name="edit" size={20} color="gray"/>			
					</TouchableHighlight>
				</View>
			)
		}

        return (
            <ScrollView>
				<View>
					<View style={styles.touchableSectionContainer}>
						<View onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
							{content}
						</View>
					</View>					
					<View>
						{this.renderStatusDevice()}
					</View>
					<View>
						{this.props.show_switch_button ? switch_button : null }
					</View>
				</View>

			</ScrollView>
        );

	}
}

const mapStateToProps = state => ({
	is_editing : state.setupCentralReducer.is_editing,
	device_name : state.setupCentralReducer.device_name,
	options_loaded : state.setupCentralReducer.options_loaded,
	show_switch_button : state.setupCentralReducer.show_switch_button
})

export default connect(mapStateToProps)(StatusBox);