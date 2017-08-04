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
	BASE64
} from '../constants'

import {IS_CONNECTED} from '../action_creators/'
import Icon from 'react-native-vector-icons/FontAwesome'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class StatusBox extends Component{
	constructor(props) {
		super(props);
		this.connected = false
		this.input_text = ""
	}

	componentWillMount() {
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

	disconnect(){
		console.log(this.props.device.id)
		BleManager.disconnect(this.props.device.id)
		.then(response => {
			this.props.dispatch({
				type : "DISCONNECT_CENTRAL_DEVICE"
			})
		}).catch(error => console.log("error",error))
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
					<View style={{flex:1}}>
						<TouchableHighlight 
							style={{backgroundColor:"#00DD00",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
							onPress={()=> this.props.tryToConnect(this.props.device)}
						>
							<Text style={styles.bigGreenButtonText}>
								Connect
							</Text>
						</TouchableHighlight>
					</View>							
				</View>
			</View>
		)
	}

    writeSecondService(device){
        if(!this.connected){
            BleManagerModule.retrieveServices(device.id,() => {
                BleManager.write(device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,device.manufactured_data.security_string,20).then((response) => {
       	
                    if(this.interval){
                        clearInterval(this.interval)
                        this.connected = true;
                    }
                    this.props.dispatch({
                        type: "CONNECTED_CENTRAL_DEVICE"
                    })
                    this.props.readStatusCharacteristic(device)

                }).catch(error => console.log("Error",error));
            })
        }
    }	



    renderStatusDevice(){
    	var {device_status,remote_devices,remote_device_status,device} = this.props

    	switch(device_status){
			case "connecting":
				return this.renderConnectingBox()
			case "disconnected":
	            return this.renderDisconnectingBox();
			case "connected":
 				return(
					<View>
						<View style={{backgroundColor:"white"}}>
				            <View style={{flexDirection: "row",margin:10}}>
								<View style={{flex:1,flexDirection:"row"}}>
									<Text style={{padding: 10,margin:5}}>
										Status
									</Text >
									<Text style={{color: "#00DD00",padding: 10,margin: 5}}> 
										Connected
									</Text>
								</View>
								<View style={{flex:1}}>
									<TouchableHighlight 
										style={{backgroundColor:"red",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
										onPress={() => this.disconnect()}
									>
										<Text style={styles.bigGreenButtonText}>
											Disconnect
										</Text>
									</TouchableHighlight>
								</View>
							</View>
						</View>
					</View>	            	
	            )
	        default:
	        	return <Text>Error</Text>
    	}
    }
	
    updateName(){

    	if(this.input_text.length > 0 && this.input_text.length < 60){
	    	let device = this.props.device
	    	let device_id = device.manufactured_data.device_id.toUpperCase()
	    	let ret_uuid = device.id
	    	let name = BASE64.btoa(this.input_text)

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
    		if(this.input_text == 0)
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
		var {device} = this.props;
		
		if(this.props.is_editing){
			var content = (
				<View style={styles.touchableSectionInner}>
					<View style={{flex:0.8}}>
						<TextInput
							placeholder = "Write your new name"
							style={{height: 40, width:width -80, borderColor: 'gray', borderWidth: 0.3,borderRadius:5,backgroundColor:"white"}} 
							underlineColorAndroid="transparent"
							onChangeText = {(text) => this.input_text = text}
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

			var content = (
				<View style={styles.touchableSectionInner}>
					<View style={{flex:0.2}}>
					<Image 
						source={require('../images/bridge_icon.imageset/bridge_icon.png')} 
						style={styles.touchableSectionInnerImage}
					>
					</Image>
					</View>
					<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center",flex:0.9}}>
						<Text style={{fontSize:22}}>
							{this.device_name}
						</Text>
						
						<Text>
							{device.manufactured_data ? (device.manufactured_data.device_id ? device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") }
						</Text>
						 <Text style={{fontSize:18}}>
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

		if (!IS_EMPTY(device)) {
            return (
                <ScrollView style={styles.pairContainer}>
						<View style={styles.pairSectionsContainer}>
							<View style={styles.touchableSectionContainer}>
								<View onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
									{content}
								</View>
							</View>					
							{this.renderStatusDevice()}
						</View>
				</ScrollView>
            );

        } else {
            return (
                <ScrollView style={styles.pairContainer}>
						<View style={styles.pairSectionsContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
							<View style={styles.touchableSectionContainer}>
								<View onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
									<View style={styles.touchableSectionInner}>
										<Image 
											source={require('../images/hardware_select.imageset/hardware_select.png')} 
											style={styles.touchableSectionInnerImage}
										>
										</Image>
										<Text style={styles.touchableSectionInnerText}>
											Select Central Unit
										</Text>
									</View>
								</View>
							</View>
							{this.renderStatusDevice()}
						</View>
				</ScrollView>
            );
        }
	}
}

const mapStateToProps = state => ({
	is_editing : state.setupCentralReducer.is_editing
})

export default connect(mapStateToProps)(StatusBox);