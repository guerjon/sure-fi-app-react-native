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
									<Text style={{color: "#00DD00",padding: 2,fontSize:18}}>
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

    	if(this.props.device_name.length > 0 && this.props.device_name.length < 60){
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
	    		console.log("data",response);
	    		if(data.status == "success"){
	    			this.props.device_name = this.props.device_name

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

	getSwitchButton(){
		return(
			<WhiteRowLink 
				name={this.props.device.manufactured_data.hardware_type == "01" ? "Switch to Remote Unit" : "Switch to Central Unit"} 
				callback={() => this.props.switchUnit()}
			/>
		)
	}

	getSerialInfo(){
		if(this.props.device.manufactured_data.hardware_type == "01"){
			return (
				<View style={{flexDirection:"row"}}>
					 					 	
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
				<View style={{flexDirection:"row"}}>
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

	getEditing(){
		return (
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
	}

	getTextPairedWith(){
		if(this.props.remote_device_name != "" && this.props.remote_device_name != "000000" && this.props.remote_device_name ){
			return <Text style={{fontSize:18,fontWeight:"400",textAlign: 'center'}}>Paired to {this.props.remote_device_name}</Text>
		}else
			return null
	}

	getNormalText(){
		if(this.props.device.manufactured_data.hardware_type == "01"){
			var image  = <Image source={require('../images/device_wiegand_central.imageset/device_wiegand_central.png')}/>
		}else{
			var image = <Image source={require('../images/device_wiegand_remote.imageset/device_wiegand_remote.png')}/>
		}

		return (
			<View style={{flexDirection:"row"}}>
				<View>
					{image}
				</View>
				<View style={{flexDirection:"column",alignItems:"center",flex:0.5,paddingVertical:10}}>
					<Text style={{fontSize:20,fontWeight:"900",color:"black",textAlign: 'center'}}>
						{this.props.device_name}
					</Text>
					
					{this.getTextPairedWith()}

					{this.getSerialInfo()}
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
					<View style={styles.touchableSectionContainer}>
						<View onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
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
	remote_device_name : state.setupCentralReducer.remote_device_name	
})

export default connect(mapStateToProps)(StatusBox);