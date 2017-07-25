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
import { NavigationActions } from 'react-navigation'
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_WRITE_UUID,
	IS_EMPTY
} from '../constants'
import { 
	PUSH_CLOUD_STATUS
} from '../action_creators/index'



class Options extends Component{
	
	static navigationOptions ={
		title : "Template",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}


	constructor(props) {
		super(props);		
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
    	var {device} = this.props
    	let device_id = device.manufactured_data.device_id
    	let expected_status = 1
    	let rxUUID = device.manufactured_data.device_id
    	let txUUID = IS_EMPTY(this.props.remote_device) ? device.manufactured_data.tx : this.props.remote_device.manufactured_data.device_id.toUpperCase()
    	let hardware_status = "0" + this.props.device_status + "|" + "0" + expected_status + "|" + rxUUID + "|" + txUUID

    	PUSH_CLOUD_STATUS(device_id,hardware_status)
    	.then(response => {
    		console.log(response)
	    	BleManagerModule.retrieveServices(device.id, () => {
	            BleManagerModule.unPair(device.id, PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID, 20,(response) => {	
	            	// you don't have to do anything here since the BLE event onDisconnect handle the change
		    		Alert.alert(
		    			"Success", "Un-Pair successfully sent",[
		    				{text: "Ok",onPress : () => this.resetStack()}
		    			],
			    		{
			    			cancelable : false
			    		}  	    		
		    		)
		    	})
	        })    		
    	})
    	.catch(error => console.log("error",error))

  
    }

    resetStack(){
    	console.log("devices on Unpair ResetStack",this.device)

    	const resetActions = NavigationActions.reset({
    		index: 1,
    		actions : [
    			NavigationActions.navigate({routeName: "Main"}),
    			NavigationActions.navigate({routeName: "DeviceControlPanel",device : this.device, tryToConnect:true})
    		]
    	})

    	this.props.navigation.dispatch(resetActions)
    }

    getPairBridgeOption(){
		return (
			<View style={{marginBottom:50}}>
				
				<Text style={{alignSelf:"center"}}>
					Next Step
				</Text>
				
				
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
			<TouchableHighlight style={styles.white_touchable_highlight}>
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
    	
    	return (
    		<View style={{marginBottom:50}}>
				<Text style={{alignSelf:"center"}}>
					Next Step
				</Text>    		
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.props.goToDeploy()}>
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
								{this.props.device.manufactured_data.hardware_type == "01" ? "Deploy Central Unit" : "Deploy Remote Unit" } 
							</Text>
						</View>
					</View>
				</TouchableHighlight>
			</View>
    	)
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
    }

	renderUnpairedOptions(){
		return (
			<View style={{marginTop:10}}>
				{this.getPairBridgeOption()}
				{this.getUpdateFirwmareOption()}
				{this.getConfigureRadioOption()}
			</View>
		)
	}

	renderPairedOptions(){
		return (
			<View style={{marginTop:10}}>
				{this.getDeployCentralUnitOption()}
				{this.getUnPairBridgeOption()}
				{this.getUpdateFirwmareOption()}
				{this.getConfigureRadioOption()}
			</View>
		)		
	}

	renderDeployedOptions(){
		return (
			<View style={{marginTop:10}}>
				{this.getUnPairBridgeOption()}
				{this.getUpdateFirwmareOption()}
				{this.getConfigureRadioOption()}
			</View>
		)
	}

	renderOptions(status){
		switch(status){
			case 0:
			return null
			
			case 1:
			return <View>{this.renderUnpairedOptions()}</View>
			
			case 3: 
			return this.renderPairedOptions()
			
			case 4:
			return this.renderDeployedOptions()
			
			default:
			return null;
		}
	}

	render(){	

		var options = this.renderOptions(this.props.device_status)
		return <View>{options}</View>
		
	}
}

const mapStateToProps = state => ({
	device_status : state.setupCentralReducer.device_status,
	central_device: state.scanCentralReducer.central_device,
	device_status : state.setupCentralReducer.device_status,
	remote_device : state.scanRemoteReducer.remote_device
});

export default connect(mapStateToProps)(Options);