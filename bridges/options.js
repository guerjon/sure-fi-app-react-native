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
		this.props.navigation.navigate("PairBridge")
	}

	showAlertUnpair(){
		var {central_device} = this.props
		console.log(central_device)
		Alert.alert(
			"Continue UnPairing",
			"Are you sure you wish to UnPair the Following Sure-Fi Devices: \n\n" + "Central : " + central_device.manufactured_data.device_id.toUpperCase() +" \n From \n" + "Remote : " + central_device.manufactured_data.tx.toUpperCase(),
			[
				{text : "Cancel", onPress:() => console.log("Cancel unpairing")},
				{text : "UNPAIR", onPress:() => this.unPair()}
			]
		)
	}

    unPair() {

    	var {central_device} = this.props
    	BleManagerModule.retrieveServices(central_device.id, () => {
            BleManagerModule.unPair(central_device.id, PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID, 20,(response) => {	
	    		Alert.alert("Success", "Un-Pair successfully sent")
	    	})      
        })  
    }

	renderUnpairedOptions(){
		return (
			<View style={{marginTop:10}}>
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
			</View>
		)
	}

	renderPairedOptions(){
		return (
			<View style={{marginTop:10}}>
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
				<TouchableHighlight style={styles.white_touchable_highlight} onPress={() => this.showAlertUnpair()}>
					<View style={styles.white_touchable_highlight_inner_container}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_unpair.imageset/menu_unpair.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								UnPair Bridge
							</Text>
						</View>
					</View>
				</TouchableHighlight>
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
			</View>
		)		
	}

	renderDeployedOptions(){

	}

	renderOptions(status){
		console.log("status",status)
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