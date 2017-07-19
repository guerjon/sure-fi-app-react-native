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
	PAIR_SUREFI_WRITE_UUID
} from '../constants'


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

	goToPair(){
		this.props.navigation.navigate("PairBridge",{central_device: this.props.device})
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
    	BleManagerModule.retrieveServices(device.id, () => {
            BleManagerModule.unPair(device.id, PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID, 20,(response) => {	
            	// you don't have to do anything here since the BLE event onDisconnect handle the change
	    		Alert.alert("Success", "Un-Pair successfully sent") 
	    	})      
        })  
    }

    getPairBridgeOption(){
		return (
			<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.goToPair()}>
				<View style={styles.white_touchable_highlight_inner_container}>
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
		)    	
    }

    getUpdateFirwmareOption(){
		return (
			<TouchableHighlight style={styles.white_touchable_highlight}>
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
			<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.goToPair()}>
				<View style={styles.white_touchable_highlight_inner_container}>
					<View style={styles.white_touchable_highlight_image_container}>
						<Image source={require('../images/menu_deploy.imageset/menu_deploy.png')} style={styles.white_touchable_highlight_image}/>
					</View>
					<View style={styles.white_touchable_text_container}>
						<Text style={styles.white_touchable_text}>
							Deploy Central Unit
						</Text>
					</View>
				</View>
			</TouchableHighlight>
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
});

export default connect(mapStateToProps)(Options);