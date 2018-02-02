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
	UPDATE_DEVICE_NAME_ROUTE,
	BASE64,
	DIVIDE_MANUFACTURED_DATA,
	CENTRAL_HARDWARE_TYPE,
	REMOTE_HARDWARE_TYPE,
	CENTRAL_SERIAL_HARDWARE_TYPE,
	REMOTE_SERIAL_HARDWARE_TYPE,

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
		let device = this.props.device
		let device_id = device.manufactured_data.device_id.toUpperCase()
		let remote_device_id = device.manufactured_data.tx.toUpperCase()
	}

	renderConnectingBox(){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row",height:50,alignItems:"center",justifyContent:"center",width:width}}>
						<View>
							<Text style={{fontSize:15,color:"gray",padding:5}}>
								Hold the Test button for 5 seconds
							</Text>
						</View>
						<ActivityIndicator />
					</View>
				</View>
			</View>
		)
	}

	renderNormalConnecting(){
		return(
			<View>
				<View style={{backgroundColor:"white"}}>
		            <View style={{margin:10}}>
						<View style={{
							justifyContent:"center",
							alignItems:"center",
							flexDirection: "row"
						}}>
							<Text style={{color: "#FFA500",padding: 2,fontSize:18}}>
								Status:
							</Text >
							<Text style={{color: "#FFA500",padding: 2,fontSize:18}}> 
								Connecting
							</Text>
						</View>
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
 				return(
					<View>
						<View style={{backgroundColor:"white"}}>
				            <View style={{margin:10}}>
								<View style={{
									justifyContent:"center",
									alignItems:"center",
									flexDirection: "row"
								}}>
									<Text style={{color: "#009900",padding: 2,fontSize:18}}>
										Status:
									</Text >
									<Text style={{color: "#009900",padding: 2,fontSize:18}}> 
										Connected
									</Text>
								</View>
							</View>
						</View>
					</View>
	            )
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
	
    updateName(save_param){
    	console.log("updateName()",this.props.device_name,save_param);
    	
		var device_name = this.props.device_name.trim()

    	if(device_name.length > 0 && device_name.length < 60){

			this.props.dispatch({type:"UPDATE_DEVICE_NAME",device_name: device_name,original_name:device_name})
			this.props.dispatch({type: "FINISH_EDITING"})

	    	let device = this.props.device
	    	let device_id = device.manufactured_data.device_id.toUpperCase()
	    	let ret_uuid = device.id
	    	let name = BASE64.btoa(device_name)

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
	    		console.log("data",response);
	    		if(data.status == "success"){


	    		}else{
	    			Alert.alert("Error on update","Something was wrong on update the name")
	    		} 

	    	})
	    	.catch(error => console.log("error",error))

    	}else{
    		if(device_name.length == 0)
				Alert.alert("Error!","The name can't be empty.")
			else{
				Alert.alert("Error!","The name is too long.")
			}
    	}    		
    	
    }

	startEditName(){
		this.props.dispatch({type: "START_EDITING"})
	}

	getSwitchButton(){
		var hardware_type = this.props.device.manufactured_data.hardware_type
		var correct_string = ""

		if(hardware_type == CENTRAL_HARDWARE_TYPE || hardware_type == CENTRAL_SERIAL_HARDWARE_TYPE)
			correct_string = "Switch to Remote Unit"
		else
			correct_string = "Switch to Controller Interface"

		return(
			<WhiteRowLink 
				name={correct_string} 
				callback={() => this.props.switchUnit()}
			/>
		)
	}

	getSerialInfo(){
		var hardware_type = this.props.device.manufactured_data.hardware_type

		if(hardware_type == CENTRAL_HARDWARE_TYPE || hardware_type == CENTRAL_SERIAL_HARDWARE_TYPE){
			return (
				<View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
					 					 	
			 		<Text style={{marginRight:5}}>
						Central Serial: {this.props.device.manufactured_data.device_id.toUpperCase()} 
					</Text>
						
					{this.props.device.manufactured_data.tx && this.props.device.manufactured_data.tx != "000000" &&
						(<Text>
							Remote Serial: {this.props.device.manufactured_data.tx.toUpperCase()} 
						</Text>)
					}
				</View>
			)

		}else{

			return (
				<View style={{flexDirection:"row",justifyContent:"center"}}>
					<Text style={{fontSize:12,marginRight:5}}>
						Remote Serial : {this.props.device.manufactured_data.device_id.toUpperCase()}
					</Text>
					{this.props.device.manufactured_data.tx && this.props.device.manufactured_data.tx != "000000" &&
						(<Text  style={{fontSize:12,marginRight:5}}>
							Central Serial : {this.props.device.manufactured_data.tx.toUpperCase()} 
						</Text>)
					}
				</View>
			)			

		}

	}

	checkFocusInput(){
		console.log("checkFocusInput()")
		if(this.input){
			if(this.input.isFocused){
				console.log("funciona")
			}else{
				console.log("funciona 2")
			}
		}
	}


	getEditing(){
		return (
			<View style={{}}>
				<View style={{margin:10,flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
					<View style={{flex:0.5}}>
						<TextInput
							placeholder = "Write your new name"
							style={{height: 40, width:width -20, borderColor: 'black', borderWidth: 0.7,borderRadius:5,backgroundColor:"white"}} 
							underlineColorAndroid="transparent"
							onChangeText = {text => this.props.dispatch({type: "UPDATE_DEVICE_NAME",device_name : text })}
							onEndEditing = {() => this.updateName()}
							value = {this.props.device_name}
						/>					
					</View>
				</View>
			</View>
		)
	}

	getTextPairedWith(){
		if(this.props.remote_device_name != "" && this.props.remote_device_name != "000000" && this.props.remote_device_name ){
			return <Text style={{fontSize:18,fontWeight:"400",textAlign: 'center',color:"black"}}>Paired to {this.props.remote_device_name}</Text>
		}else
			return null
	}

	getNormalText(){
		var hardware_type = this.props.device.manufactured_data.hardware_type
		if(hardware_type == CENTRAL_HARDWARE_TYPE || hardware_type == CENTRAL_SERIAL_HARDWARE_TYPE){
			var image  = <Image source={require('../images/device_wiegand_central.imageset/device_wiegand_central.png')}/>
		}else{
			var image = <Image source={require('../images/device_wiegand_remote.imageset/device_wiegand_remote.png')}/>
		}

		return (
			<View style={{flexDirection:"row"}}>
				<View style={{width: 50}}>
					{image}
				</View>
				<View style={{width: width -100}}>
					<View style={{flexDirection:"row",height:50,justifyContent:"center",alignItems:"center"}}>
						<Text style={{fontSize:20,fontWeight:"200",color:"black",textAlign:'center',justifyContent:"center"}}>
							{this.props.device_name}
						</Text>
					</View>
					<View>
						{this.getTextPairedWith()}
					</View>
					<View style={{marginTop:10}}>
						{this.getSerialInfo()}
					</View>
				</View>
				<View style={{width: 50}}>
					<TouchableHighlight 
						style={{justifyContent:"center",height:50,justifyContent:"center",alignItems:"center"}}
						onPress={() => this.startEditName()}
					>
						<Icon name="edit" size={20} color="gray"/>			
					</TouchableHighlight>

				</View>

			</View>
		)		
	
	}

	getTextSection(is_editing){

		if(is_editing){
			return this.getEditing()
		}else{

			return this.getNormalText()
		}
	}

	render(){	
	
		var {device,is_editing,device_name,options_loaded,show_switch_button} = this.props;
		var switch_button =  this.getSwitchButton()
		/*console.log("this.props.device_name",this.props.device_name);
		console.log("this.props.remote_device_name",this.props.remote_device_name);
		*/
        return (
            <ScrollView>
				<View>
					<View style={{backgroundColor:"white"}}>
						<View onPress={()=> this.scanCentralDevices()}>
							{this.getTextSection(this.props.is_editing)}
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
	options_loaded : state.setupCentralReducer.options_loaded,
	show_switch_button : state.setupCentralReducer.show_switch_button,
  	device_name : state.setupCentralReducer.device_name,
	remote_device_name : state.setupCentralReducer.remote_device_name,
	original_name: state.setupCentralReducer.original_name
})

export default connect(mapStateToProps)(StatusBox);