import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	TouchableHighlight,
  	Alert,
} from 'react-native'

import {styles,first_color} from '../styles/index.js'
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
		<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => params.callback()}>
			<View style={styles.white_touchable_highlight_inner_container}>
				<View style={styles.white_touchable_highlight_image_container}>
					<Image source={params.image} style={styles.white_touchable_highlight_image}/>
				</View>
				<View style={styles.white_touchable_text_container}>
					<Text style={styles.white_touchable_text}>
						{params.name}
					</Text>
				</View>
			</View>
		</TouchableHighlight>
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
    	console.log("unPair999()",this.device.manufactured_data.device_id)

	    this.props.dispatch({
	    	type: "SET_UNPAIR_DISCONNECT",
	    	unpair_disconnect: true
	    })


		WRITE_UNPAIR(this.device.id).then(response => {
			var state = "01|01|"+this.device.manufactured_data.device_id+"|000000"
			
			var remote_state = "01|01|"+this.device.manufactured_data.tx+"|000000"

			PUSH_CLOUD_STATUS(this.device.manufactured_data.device_id,state)
			.then(response => {
				PUSH_CLOUD_STATUS(this.device.manufactured_data.tx,remote_state)
				//console.log("resopnse",response);
				this.device.manufactured_data.tx = "000000"
				this.device.manufactured_data.device_state = "0001"
				this.device.writeUnpairResult = true
		    	this.props.dispatch({
		            type: "CENTRAL_DEVICE_MATCHED",
		            central_device: this.device,
		        });

		    	this.props.dispatch({type: "UPDATE_REMOTE_DEVICE_NAME",remote_device_name : ""})

                console.log("this.props.debug_mode_status",this.props.debug_mode_status);

                if(this.props.debug_mode_status){
					this.props.readStatusOnDevice(this.device)
					setTimeout(() => this.props.readStatusOnDevice(this.device),3000)
                }		        
			})
			.catch(error => Alert.alert("Error",error))

		}).catch(error => console.log(error))
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
    	return <Option callback={() => this.props.goToOperationValues()} image={require('../images/menu_operating.imageset/menu_operating.png')} name="Operating Values"/>
    }

    getInstructionalVideos(){
    	return <Option callback={() => this.props.goToInstructionalVideos()} image={require('../images/menu_video.imageset/menu_video.png')} name="Wiring Guides"/>
    }

    getRelayDefaults(){
    	return <Option callback={() => this.props.goToRelay()} image={require('../images/menu_relay.imageset/menu_relay.png')} name="Default settings" />
   	}

   	getSureFiChat(){
   		return <Option callback={() => this.props.goToChat()} image={require('../images/menu_chat.imageset/menu_chat.png')} name="Sure-Fi Chat" />
   	}

    getUnPairBridgeOption(){
    	return <Option callback={() => this.showAlertUnpair()} image={require('../images/menu_unpair.imageset/menu_unpair.png')} name="Unpair Bridge"/>
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
    	return <Option callback={() => this.props.goToFirmwareUpdate()} image={require('../images/menu_flash_firmware.imageset/menu_flash_firmware.png')} name="Update Firmware" />
    }

    getConfigureRadioOption(){
    	return <Option callback={() => this.props.goToConfigureRadio()} image={require('../images/menu_radio_settings.imageset/menu_radio_settings.png')} name="Configure Radio" />
    }

    getDocumentationOption(){
    	return <Option callback={() => this.props.goToDocumentation()} image={require('../images/menu_docs.imageset/menu_documents.png')} name="Documentation"/>
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
		//console.log("getOptions()",this.props.indicatorNumber,this.props.user_data);
		var admin_options = ["SYS_ADMIN","PROD_ADMIN","CLIENT_DEV"]
		var sales_dist = ["SALES","DIST"]		
		var indicator = this.props.indicatorNumber

		if(admin_options.lastIndexOf(user_type) !== -1){
		//if(true){

			return this.getAdminOptions(indicator)

		}else if(sales_dist.lastIndexOf(user_type) !== -1){
			return this.getNormalOptions(indicator)

		}else{
			return this.getDefaultOptions(indicator)
		}
	}

	getAdminOptions(bridge_status){
		//console.log("getAdminOptions()");
		switch(bridge_status){
			case 1:
				return(
					<View>
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getDocumentationOption()}
					</View>
				)
			break
			case 3:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getSureFiChat()}
						{this.getUpdateFirwmareOption()}
						{this.getDocumentationOption()}
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
						{this.getDocumentationOption()}
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
						{this.getDocumentationOption()}
						{this.getRelayDefaults()}
					</View>
				)
			break
			case 3:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getSureFiChat()}
						{this.getUpdateFirwmareOption()}
						{this.getDocumentationOption()}
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
						{this.getDocumentationOption()}
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
		switch(bridge_status){
			case 1:
				return (
					<View>
						{this.getPairBridgeOption()}
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getDocumentationOption()}
						{this.getRelayDefaults()}	
					</View>
				)

			case 3:
				return (
					<View>
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getDocumentationOption()}
						{this.getUnPairBridgeOption()}
						{this.getRelayDefaults()}
					</View>
				)
			
			case 4:
				return (	
					<View style={{flex:1}}>
						{this.getInstructionalVideos()}
						{this.getUpdateFirwmareOption()}
						{this.getDocumentationOption()}
						{this.getUnPairBridgeOption()}
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
		return (
			<View style={{marginVertical:20}}>
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
	user_data : state.loginReducer.user_data,
	debug_mode_status : state.setupCentralReducer.debug_mode_status,
});

export default connect(mapStateToProps)(Options);