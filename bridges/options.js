import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	TouchableHighlight,
  	Alert,
  	TouchableNativeFeedback,
  	TouchableWithoutFeedback,
  	TouchableOpacity
} from 'react-native'

import {
	styles,
	first_color,
	width,
	success_green
} from '../styles/index.js'
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { 
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

const Option = params => {

	return (
		<View  style={{width:width,backgroundColor:"white"}}>
			<TouchableOpacity onPress={() => params.callback()}>
				<View style={{flexDirection:"row"}}>
					<View style={{width:70}}>
						<Image source={params.image} style={{width:60,height:60,margin:5}}/>
					</View>
					<View style={{width:width-120,alignItems:"center",justifyContent:"center"}}>
						<Text style={{color:"black",fontSize:28}}>
							{params.name}
						</Text>
					</View>
					<View style={{width:50,alignItems:"center",justifyContent:"center"}}>
						<Text style={{fontSize:20,color:"rgba(10,10,10,0.3)"}}>
							>
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		</View>
	)    		
}


class Options extends Component{
	
	constructor(props) {
		super(props);	
		this.device_status = this.props.device_status
		this.device = this.props.device

	}

	showAlertUnpair(){
		var {device} = this.props
		let txUUID = IS_EMPTY(this.props.remote_device) ? device.manufactured_data.tx : this.props.remote_device.manufactured_data.device_id.toUpperCase()

		Alert.alert(
			"Continue Un-Pairing",
			"Are you sure you wish to Un-Pair with the following Sure-Fi device? \n ID: " + device.manufactured_data.tx.toUpperCase(),
			[
				{text : "Cancel", onPress:() => console.log("Cancel unpairing")},
				{text : "UNPAIR", onPress:() => this.props.unPair()}
			]
		)
	}



    forceUnPair(){
    	console.log("forceUnPair()")
    	var {device} = this.props
    	let device_id = device.manufactured_data.device_id
    	let expected_status = 1
    	let rxUUID = device.manufactured_data.device_id
    	let txUUID = IS_EMPTY(this.props.remote_device) ? device.manufactured_data.tx : this.props.remote_device.manufactured_data.device_id.toUpperCase()

    	
    	this.props.saveOnCloudLog([0],"UNPAIR-FORCE")

		WRITE_FORCE_UNPAIR(device.id).then(response => {
			console.log("after write_force_unpair")
			let hardware_status = "01|01|" + rxUUID + "|000000"
			PUSH_CLOUD_STATUS(device_id,hardware_status)
			.then(response => {
				
				console.log("response on forceUnpair",response)
				device.manufactured_data.tx = "000000" // this is because we need recalculate the security string to connect again, same reason for the next dispatch
				device.manufactured_data.device_state = "0001"

	    		this.props.dispatch({
                    type: "CENTRAL_DEVICE_MATCHED",
                    central_device: device
                });
				
				this.props.dispatch({type: "SET_BRIDGE_STATUS",set_bridge_status: 1})
	    		this.props.setConnectionEstablished()
	    		
			})
			.catch(error => console.log("error",error))

		}).catch(error => console.log(error))
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
		    		var message = "This Controller Interface has been deployed. If you have not done so, you must still deploy the Remote Unit before the bridge will function properly"
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
	    	
	    	//console.log("device_id",device_id,hardware_status,other_guy_status)

	    	PUSH_CLOUD_STATUS(device_id,hardware_status)
	    	.then(response => {
	    		//console.log("hardware_status",hardware_status)
	    		PUSH_CLOUD_STATUS(txUUID,other_guy_status)
	    		.then(response => {
	    			//console.log("response3",response)
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
    	return <Option callback={() => this.props.goToOperationValues()} image={require('../images/menu_operating_dark.imageset/menu_operating.png')} name="Operating Values"/>
    }

    getInstructionalVideos(){
    	//<Option callback={() => this.props.goToInstructionalVideos()} image={require('../images/menu_video.imageset/menu_video.png')} name="Wiring Guides"/>
    	return (
    		<View style={{width:width,alignItems:"center"}}>
				<Text style={styles.device_control_title}>
					ADDITIONAL OPTIONS
				</Text>    		
    		</View>
    	)
    }

    getRelayDefaults(){
    	return <Option callback={() => this.props.goToRelay()} image={require('../images/menu_config_dark/menu_config_dark.png')} name="Configuration" />
   	}

    getUnPairBridgeOption(){
    	return <Option callback={() => this.showAlertUnpair()} image={require('../images/menu_unpair_dark.imageset/menu_unpair.png')} name="Unpair Bridge"/>
    }

    getResetDemoOption(){
    	//console.log("getResetDemoOption()",this.props.warranty_information,this.props.demo_unit_time)
    	var run_time = this.props.warranty_information
    	var demo_time = this.props.demo_unit_time[0] * 86400 

    	if(this.props.show_activate_option != 0){
    		var time = "0 Hours Remaining"
    		
    		if(run_time <= demo_time){
    			var remaining_time = parseInt((demo_time - run_time) / 3600)
    			if(remaining_time > 24) {
    				var remaining_days = parseInt(remaining_time / 24) 
    				time = remaining_days + " Days Remaining" 
    			}else{
    				time = remaining_time + " Hours Remaining"	
    			}
    		}

	    	return (
				<View style={{marginBottom:20}}>		
					<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToPayMentOptions()}>
						<View style={{
							flexDirection:"row",
							alignItems:"center",						
							justifyContent:"center"
	  					}}>
							<View style={{alignItems:"center",justifyContent:"center",backgroundColor:"red",padding:10,width:width}}>
								<Text style={styles.white_touchable_text}>
									{time}
								</Text>
								<Text style={{fontSize:22,color:"white"}}>
									Touch to Activate now!
								</Text>
							</View>
						</View>
					</TouchableHighlight>
				</View>
			)   	
    	}
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
							<Image source={require('../images/menu_pair_dark.imageset/menu_pair.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={{color:"black",fontSize:28}}>
								Pair Bridge
							</Text>
						</View>
					</View>
				</TouchableHighlight>
			</View>
		)    	
    }

    getUpdateFirwmareOption(){
    	return <Option callback={() => this.props.goToFirmwareUpdate()} image={require('../images/menu_flash_firmware_dark.imageset/menu_flash_firmware.png')} name="Update Firmware" />
    }

    getConfigureRadioOption(){
    	return <Option callback={() => this.props.goToConfigureRadio()} image={require('../images/menu_radio_settings_dark.imageset/menu_radio_settings.png')} name="Configure Radio" />
    }

    getDeployCentralUnitOption(){
    	if(this.props.device){
    		if(this.props.device.manufactured_data){
    			if(this.props.device.manufactured_data.hardware_type){
    				var status_text = this.props.device.manufactured_data.hardware_type == 1 ? "Deploy Controller Interface" : "Deploy Remote Unit" 
    				let status_text_2 = this.props.device.manufactured_data.hardware_type == 1 ? "Deploy Controller Interface" : "Deploy Remote Unit" 
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

    getResetUnit(){
    	return <Option callback={() => this.props.resetUnitAlert()} image={require('../images/menu_flash_firmware_dark.imageset/menu_flash_firmware.png')} name="Reset Unit" />
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


	getAdminOptions(bridge_status){
		//console.log("getAdminOptions()",bridge_status);
		switch(bridge_status){
			case 1:
				return(
					<View>
						{this.getResetDemoOption()}
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getConfigureRadioOption()}
						{this.getOperatingValuesOption()}
					</View>
				)
			break
			case 3:
				return (
					<View>
						{this.getResetDemoOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						{this.getConfigureRadioOption()}
						
					</View>
				)
			break
			case 4:
				return (
					<View>
						{this.getResetDemoOption()}
						{this.getInstructionalVideos()}
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
		//console.log("getNormalOptions()",bridge_status)
		switch(bridge_status){
			case 1:
				return (
					<View>
						
						{this.getResetDemoOption()}
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getOperatingValuesOption()}
						{this.getResetUnit()}
						
					</View>
				)
			break
			case 3:
				return (
					<View>
						
						{this.getResetDemoOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						{this.getResetUnit()}
					</View>
				)
			break
			case 4:
				return (
					<View>
						
						{this.getResetDemoOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						{this.getRelayDefaults()}
						{this.getResetUnit()}
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
		switch(bridge_status){
			case 1:
				return (
					<View>
						{this.getResetDemoOption()}
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getOperatingValuesOption()}
						
					</View>
				)

			case 3:
				return (
					<View>
						{this.getResetDemoOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
						
					</View>
				)
			
			case 4:
				return (	
					<View style={{flex:1}}>
						{this.getResetDemoOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getUnPairBridgeOption()}
						{this.getOperatingValuesOption()}
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
			default:
				return null
			break;
		}
	}

	render(){	
		
		let user_type = this.props.user_data ?  this.props.user_data.user_type : false
		//console.log("render()",this.props.bridge_status);
		
		var admin_options = ["SYS_ADMIN","PROD_ADMIN","CLIENT_DEV"]
		var sales_dist = ["SALES","DIST"]		
		var bridge_status = parseInt(this.props.bridge_status) 

		if(admin_options.lastIndexOf(user_type) !== -1){
		//if(true){

			return this.getAdminOptions(bridge_status)

		}else if(sales_dist.lastIndexOf(user_type) !== -1){
			return this.getNormalOptions(bridge_status)

		}else{
			return this.getDefaultOptions(bridge_status)
		}
	}
}

const mapStateToProps = state => ({
	device_status : state.setupCentralReducer.device_status,
	remote_device : state.scanRemoteReducer.remote_device,
	user_status : state.mainScreenReducer.user_status,
	user_data : state.loginReducer.user_data,
	debug_mode_status : state.setupCentralReducer.debug_mode_status,
	demo_unit_time : state.scanCentralReducer.demo_unit_time,
	show_activate_option : state.scanCentralReducer.show_activate_option,
	warranty_information : state.scanCentralReducer.warranty_information,
	bridge_status : state.scanCentralReducer.bridge_status,
});

export default connect(mapStateToProps)(Options);