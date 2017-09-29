import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	ActivityIndicator,
  	TouchableHighlight,
  	Alert,
  	NativeModules,
  	NativeEventEmitter,
  	

} from 'react-native'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import BleManager from "react-native-ble-manager"
import { NavigationActions } from 'react-navigation'
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
import * as KeyChain from 'react-native-keychain'
import { 
	LOADING,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_WRITE_UUID,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	IS_EMPTY
} from '../constants'
import { 
	PUSH_CLOUD_STATUS,
	WRITE_UNPAIR,
	WRITE_FORCE_UNPAIR,
	CONNECT,
	READ_STATUS,
	DISCONNECT,
	WRITE_COMMAND
} from '../action_creators/index'
import {COMMAND_MAKE_DEPLOY} from '../commands'

const next_step = <Text style={styles.device_control_title_container}>NEXT STEP</Text>

class Options extends Component{
	
	constructor(props) {
		super(props);	
		this.device_status = this.props.device_status
		this.device = this.props.device
	}

	showAlertUnpair(){
		var {device} = this.props
		Alert.alert(
			"Continue UnPairing",
			"Are you sure you wish to UnPair the Following Sure-Fi Devices: \n\n" + "Central : " + device.manufactured_data.device_id.toUpperCase() +" \n From \n" + "Remote : " + device.manufactured_data.tx.toUpperCase(),
			[
				{text : "Cancel", onPress:() => console.log("Cancel unpairing")},
				{text : "UNPAIR", onPress:() => this.unPair()}
			]
		)
	}

    unPair() {
    	console.log("unPair()")

    	READ_STATUS(this.device.id)
    	.then(response => {
    		console.log("response",response)
	    	this.pushStatusToCloud(response[0])
    	})
    }

    forceUnPair(){
    	console.log("forceUnPair()")
    	var {device} = this.props
    	let device_id = device.manufactured_data.device_id
    	let expected_status = 1
    	let rxUUID = device.manufactured_data.device_id
    	let txUUID = IS_EMPTY(this.props.remote_device) ? device.manufactured_data.tx : this.props.remote_device.manufactured_data.device_id.toUpperCase()

    	
			WRITE_FORCE_UNPAIR(device.id).then(response => {

    			let hardware_status = "01|01|" + rxUUID + "|000000"

				PUSH_CLOUD_STATUS(device_id,hardware_status)
				.then(response => {
					device.manufactured_data.tx = "000000" // this is because we need recalculate the security string to connect again, same reason for the next dispatch
					device.manufactured_data.device_state = "0001"

		    		this.props.dispatch({
	                    type: "CENTRAL_DEVICE_MATCHED",
	                    central_device: device
	                });
					
		    		this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 1})

				})
				.catch(error => console.log("error",error))

    		}).catch(error => console.log(error))
    	

    }

    getPairBridgeOption(){
		return (
			<View style={{marginBottom:20}}>
				<View style={styles.device_control_title_container}>
					<Text style={styles.device_control_title}>
						NEXT STEP
					</Text>
				</View>			
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToPair()}>
					<View style={{
						flexDirection:"row",
						padding:5,
						alignItems:"center",						
  					}}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_pair.imageset/menu_pair.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Pair Bridge
							</Text>
						</View>
					</View>
				</TouchableHighlight>
				
			</View>
		)    	
    }

    getUpdateFirwmareOption(){
		return (
			<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToFirmwareUpdate()}>
				<View style={styles.white_touchable_highlight_inner_container}>
					<View style={styles.white_touchable_highlight_image_container}>
						<Image source={require('../images/menu_flash_firmware.imageset/menu_flash_firmware.png')} style={styles.white_touchable_highlight_image}/>
					</View>
					<View style={styles.white_touchable_text_container}>
						<Text style={styles.white_touchable_text}>
							Update Firmware
						</Text>
					</View>
				</View>
			</TouchableHighlight>
		)    	
    }

    getConfigureRadioOption(){

    	return (
			<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToConfigureRadio()}>
				<View style={{flexDirection:"row",padding:5,alignItems:"center"}}>
					<View style={styles.white_touchable_highlight_image_container}>
						<Image source={require('../images/menu_radio_settings.imageset/menu_radio_settings.png')} style={styles.white_touchable_highlight_image}/>
					</View>
					<View style={styles.white_touchable_text_container}>
						<Text style={styles.white_touchable_text}>
							Configure Radio
						</Text>
					</View>
				</View>
			</TouchableHighlight>	
    	)
    }

    getDeployCentralUnitOption(){
    	if(this.props.device){
    		if(this.props.device.manufactured_data){
    			if(this.props.device.manufactured_data.hardware_type){
    				var status_text = this.props.device.manufactured_data.hardware_type == 1 ? "Deploy Central Unit" : "Deploy Remote Unit" 
    				let status_text_2 = this.props.device.manufactured_data.hardware_type == 1 ? "Deploy Central Unit" : "Deploy Remote Unit" 
    			}else{
    				var status_text = "UNDEFINED"
    				let status_text_2 = "UNDEFINED"
    			}
    		}else{
    			var status_text = "UNDEFINED"
    			let status_text_2 = "UNDEFINED"
    		}
    	}else{
    		var status_text = "UNDEFINED"
    		let status_text_2 = "UNDEFINED"
    	}

    	return (
    		<View style={{marginBottom:50}}>
				{next_step}
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.showAlertDeploy()}>
					<View style={{
						flexDirection:"row",
						padding:5,
						alignItems:"center",	
					}}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_deploy.imageset/menu_deploy.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								{status_text}
							</Text>
						</View>
					</View>
				</TouchableHighlight>
			</View>
    	)
    }

    showAlertDeploy(){
    	Alert.alert(
    		"Deploy Device",
    		"Are you sure you wish to Deploy this Sure-Fi Device: " + this.device.manufactured_data.device_id.toUpperCase(),
    		[
    		 	
    		 	{text : "Cancel", onPress: () => console.log(("CANCEL"))},
    		 	{text : "Deploy", onPress: () => this.deploy()},
    		]
    	)    	
    }

    deploy(){
    	READ_STATUS(this.device.id)
    	.then(response => {
	    	this.pushStatusToCloud(response[0])

    	})
    	.catch(error => console.log("error",error))
    }

    pushStatusToCloud(device_status){
    	let expected_status = device_status + 1
    	let rxUUID = this.device.manufactured_data.device_id.toUpperCase()
    	let txUUID = IS_EMPTY(this.props.remote_device) ? this.device.manufactured_data.tx : this.props.remote_device.manufactured_data.device_id.toUpperCase()
    	let device_id = this.device.manufactured_data.device_id
    	let hardware_status = "0" + device_status + "|" + "0" + expected_status + "|" + rxUUID + "|" + txUUID
    	
    	if(device_status != 4){
	    	PUSH_CLOUD_STATUS(device_id,hardware_status)
	    	.then(response => {
	    		console.log("response deploy",response)
		    	if(this.device.manufactured_data.hardware_type == 1){
		    		var message = "This Central Unit has been deployed. If you have not done so, you must still deploy the Remote Unit before the bridge will function properly"
		    	}else{
		    		var message = "This Remote Unit has been deployed. If you have not done so, you must still deploy the Remote Unit before the bridge will function properly"
		    	}

		    	WRITE_COMMAND(this.device.id,[COMMAND_MAKE_DEPLOY])
		    	.then(() =>{
					this.device.manufactured_data.device_state = "0004"
					
		    		this.props.dispatch({
	                    type: "CENTRAL_DEVICE_MATCHED",
	                    central_device: device
	                });
		    		this.props.getCloudStatus(device)

					Alert.alert(
						"Deployment Complete",
						message,
						{ cancelable: false }
					)
		    	})
		    	.catch(error => Alert.alert("Error",error))
	    	})
	    	.catch(error => console.log("error",error))    		
    	}else{
			var {device} = this.props
	    	let device_id = device.manufactured_data.device_id
	    	let expected_status = 1
	    	let rxUUID = device.manufactured_data.device_id

	    	let txUUID = IS_EMPTY(this.props.remote_device) ? device.manufactured_data.tx : this.props.remote_device.manufactured_data.device_id.toUpperCase()
	    	let hardware_status = "0" + device_status + "|" + "0" + expected_status + "|" + rxUUID + "|000000"
	    	let other_guy_status = "0" + device_status + "|0" + expected_status + "|" + txUUID + "|00000" 
	    	
	    	console.log("device_id",device_id,hardware_status,other_guy_status)

	    	PUSH_CLOUD_STATUS(device_id,hardware_status)
	    	.then(response => {
	    		console.log("hardware_status",hardware_status)
	    		PUSH_CLOUD_STATUS(txUUID,other_guy_status)
	    		.then(response => {
	    			console.log("response3",response)
	    			WRITE_UNPAIR(device.id).then(response => {

						device.manufactured_data.tx = "000000"
						device.manufactured_data.device_state = "0001"
						device.writeUnpairResult = true
				    	this.props.dispatch({
				            type: "CENTRAL_DEVICE_MATCHED",
				            central_device: device,
				        });

		                this.props.dispatch({
					        type: "NORMAL_CONNECTING_CENTRAL_DEVICE",
					    })	
		                DISCONNECT(device.id)
		                .then(() => {
		                	setTimeout(() => this.props.fastTryToConnect(device),1000) 	
		                })
		                .catch(error => console.log("error",error))

	    			}).catch(error => console.log(error))
	    		})
	    		.catch(error => console.log(error))
				
	    	}).catch(error => console.log("error",error))
    	}

    }

    getOperatingValuesOption(){
    	return (
    		<View>
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.getOperationValues()}>
					<View style={{
						flexDirection:"row",
						padding:5,
						alignItems:"center",	
					}}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_operating.imageset/menu_operating.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Operating Values
							</Text>
						</View>
					</View>
				</TouchableHighlight>
    		</View>
    	)
    }

    getInstructionalVideos(){
    	return (
    		<View>
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToInstructionalVideos()}>
					<View style={{
						flexDirection:"row",
						padding:5,
						alignItems:"center",	
					}}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_video.imageset/menu_video.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Wiring Guides
							</Text>
						</View>
					</View>
				</TouchableHighlight>
    		</View>
    	)
    }

    getRelayDefaults(){
    	
    	return (
			<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.getRelayValues()}>
				<View style={styles.white_touchable_highlight_inner_container}>
					<View style={styles.white_touchable_highlight_image_container}>
						<Image source={require('../images/menu_relay.imageset/menu_relay.png')} style={styles.white_touchable_highlight_image}/>
					</View>
					<View style={styles.white_touchable_text_container}>
						<Text style={styles.white_touchable_text}>
							Relay Defaults
						</Text>
					</View>
				</View>
			</TouchableHighlight>
    	)    
   	}

   	getSureFiChat(){

   		//if(this.props.device.manufactured_data.device_state == "0004" ){
   			return (
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToChat()}>
					<View style={styles.white_touchable_highlight_inner_container}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_chat.imageset/menu_chat.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Sure-Fi Chat
							</Text>
						</View>
					</View>
				</TouchableHighlight>   			
   			)
   		//}
   		return null
   	}

    getUnPairBridgeOption(){
    	return (
			<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.showAlertUnpair()}>
				<View style={styles.white_touchable_highlight_inner_container}>
					<View style={styles.white_touchable_highlight_image_container}>
						<Image source={require('../images/menu_unpair.imageset/menu_unpair.png')} style={styles.white_touchable_highlight_image}/>
					</View>
					<View style={styles.white_touchable_text_container}>
						<Text style={styles.white_touchable_text}>
							Unpair Bridge
						</Text>
					</View>
				</View>
			</TouchableHighlight>
    	)
	
    	return null
    }

    renderForcePairOption(){
		return (
			<View style={{marginBottom:50}}>
				
				<Text style={{alignSelf:"center"}}>
					Next Step
				</Text>
				
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToForcePair()}>
					<View style={{
						flexDirection:"row",
						padding:5,
						alignItems:"center",						
  					}}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_pair.imageset/menu_pair.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Force Pair  Bridge
							</Text>
						</View>
					</View>
				</TouchableHighlight>
				
			</View>
		)    	
    }

	renderForceUnpairOption(){
		return (
			<View style={{marginBottom:50}}>
				
				<Text style={{alignSelf:"center"}}>
					Next Step
				</Text>
				
				
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.forceUnPair()}>
					<View style={{
						flexDirection:"row",
						padding:5,
						alignItems:"center",						
  					}}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_unpair.imageset/menu_unpair.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Force Unpair
							</Text>
						</View>
					</View>
				</TouchableHighlight>
				
			</View>
		)   
	}

	getAdditionalOptions(){
		
		let user_type = this.props.user_data ?  this.props.user_data.user_type : false
		console.log("getOptions()",this.props.indicatorNumber,this.props.user_data);
		var admin_options = ["SYS_ADMIN","PROD_ADMIN","CLIENT_DEV"]
		var sales_dist = ["SALES","DIST"]		
		var indicator = this.props.indicatorNumber

		if(admin_options.lastIndexOf(user_type) !== -1){
			return this.getAdminOptions(indicator)

		}else if(sales_dist.lastIndexOf(user_type) !== -1){
			return this.getNormalOptions(indicator)

		}else{
			return this.getDefaultOptions(indicator)
		}
	}

	getAdminOptions(bridge_status){
		console.log("getAdminOptions()");
		switch(bridge_status){
			case 1:
				return(
					<View>
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getConfigureRadioOption()}
					</View>
				)
			break
			case 3:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getSureFiChat()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						{this.getConfigureRadioOption()}
						{this.getRelayDefaults()}
					</View>
				)
			break
			case 4:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getSureFiChat()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						{this.getConfigureRadioOption()}
						{this.getRelayDefaults()}
					</View>
				)
			case 0xE0:
				return (
					<View>
						{this.renderForcePairOption()}
					</View>
				)				
			case 0xE1:
				return (
					<View>
						{this.renderForcePairOption()}
					</View>
				)
			break
			case 0xE2:
				return (
					<View>
						{this.renderForceUnpairOption()}
					</View>
				)
			break
			case 0xEE:
				return (
					<View style={{alignItems:"center"}}>
						<Text>
							Error loading the options
						</Text>
					</View>
				)
			default:
				return null
			break
		}
	}

	getNormalOptions(bridge_status){
		console.log("getNormalOptions()",bridge_status)
		switch(bridge_status){
			case 1:
				return (
					<View>
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}	
					</View>
				)
			break
			case 3:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getSureFiChat()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						{this.getRelayDefaults()}
					</View>
				)
			break
			case 4:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getSureFiChat()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						{this.getRelayDefaults()}
					</View>
				)
			break
			case 0xE0:
				return (
					<View>
						{this.renderForcePairOption()}
					</View>
				)				
			case 0xE1:
				return (
					<View>
						{this.renderForcePairOption()}
					</View>
				)
			break
			case 0xE2:
				return (
					<View>
						{this.renderForceUnpairOption()}
					</View>
				)			
			default:
			break
		}
	}

	getDefaultOptions(bridge_status){
		console.log("getDefaultOptions()",bridge_status);
		switch(bridge_status){
			case 1:
				return (
					<View>
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}	
					</View>
				)

			case 3:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
					</View>
				)
			
			case 4:
				return (	
					<View style={{flex:1}}>
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
					</View>
				)
			case 0xE0:
				return (
					<View>
						{this.renderForcePairOption()}
					</View>
				)				
			case 0xE1:
				return (
					<View>
						{this.renderForcePairOption()}
					</View>
				)
			break
			case 0xE2:
				return (
					<View>
						{this.renderForceUnpairOption()}
					</View>
				)				
			default:
				return null
			break;
		}
	}

	getNextStepOptions(){

	}

	render(){	
		return (

			<View style={{marginVertical:20}}>
				
				<View>
					{this.getNextStepOptions()}
				</View>
				<View>
					{this.getAdditionalOptions()}
				</View>
			</View>
		)
	}
}

const mapStateToProps = state => ({
	device_status : state.setupCentralReducer.device_status,
	remote_device : state.scanRemoteReducer.remote_device,
	user_status : state.mainScreenReducer.user_status,
	user_data : state.loginReducer.user_data
});

export default connect(mapStateToProps)(Options);