import React, {Component} from 'react'
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableHighlight,
	NativeEventEmitter,
	NativeModules

} from 'react-native'
import {styles,first_color,success_green} from '../../styles/index.js'
import {
	IS_EMPTY,
	SUREFI_CMD_WRITE_UUID,
} from '../../constants.js'
import {connect} from 'react-redux'
import RNFetchBlob from 'react-native-fetch-blob'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


class UpdateFirmwareCentral extends Component{

	static navigationOptions = {
		title : "Update Firmware",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

//BleManagerDidUpdateValueForCharacteristic
	componentDidMount() {
		this.dispatch = this.props.dispatch
		this.firmware_file = this.props.firmware_file
		this.navigate = this.props.navigation.navigate
		this.dispatch({type: "RESET_UPDATE_FIRMWARE_CENTRAL_REDUCER"})
	}

	navigateToFirmwareUpdate(kind){
		if(kind == "application" || kind == "radio")
			this.navigate("FirmwareUpdate")
		else
			this.navigate("BluetoothFirmwareUpdate")

	}

	render(){
		var {firmware_update_state} = this.props
		if(!IS_EMPTY(this.props.firmware_file)){
			if(this.props.central_update_mode){
				var content = (
					<View style={{flexDirection:"row",flex:1,alignItems:"center",justifyContent:"center"}}>
						<View style={{width:140,height:60}}>
							<TouchableHighlight style={{backgroundColor:"red",alignItems:"center",justifyContent:"center",padding:20,borderRadius:10}} onPress={() => this.props.dispatch({type: "DELETE_FIRMWARE_SELECTED"})}>
								<Text style={styles.bigGreenButtonText}>
									Cancel
								</Text>
							</TouchableHighlight>
						</View>
						<View style={{width:140,height:60}}>
							<TouchableHighlight onPress={() => this.navigateToFirmwareUpdate(this.props.kind_firmware) } style={{backgroundColor: success_green,alignItems:"center",justifyContent:"center",padding:20,borderRadius:10}}>
								<Text style={styles.bigGreenButtonText}>
									Start
								</Text>
							</TouchableHighlight>
						</View>
					</View>
				)
			}
		
			return (
				<ScrollView>
					<Image  
						source={require('../../images/temp_background.imageset/temp_background.png')} 
						style={styles.image_complete_container}
					>	
						<View style={styles.mainContainer}>
							<View style={{alignItems:"center",justifyContent:"center"}}>
								<TouchableHighlight onPress={() => this.navigate("SelectFirmwareCentral")} style={{margin:60}}>
									<View style={{flexDirection:"row"}}>
										<Text>
											Firmware Selected :
										</Text>
										<Text style={styles.link}>
											 {this.props.firmware_file.firmware_title}
										</Text>
									</View>
								</TouchableHighlight>
								
							</View>
							{content}
						</View>

					</Image>
				</ScrollView>
			)

		}else{
			return (
				<ScrollView style={styles.pairContainer}>
					<Image  
						source={require('../../images/temp_background.imageset/temp_background.png')} 
						style={styles.image_complete_container}
					>	
						<View style={styles.mainContainer}>
							<View style={{alignItems:"center"}}>
								<TouchableHighlight onPress={() => this.navigate("SelectFirmwareCentral")} style={{padding:20}}>
									<Text style={styles.link}>
										Select Firmaware File
									</Text>
								</TouchableHighlight>
							<View style={{flexDirection:"column"}}>	
					</View>								
							</View>
							<View style={{alignItems:"center",justifyContent:"center"}}>
								<Text style={{padding:30}}>
									Please select a Firmware File and Press the Start button on the Navitagion Bar to begin Firmware Update
								</Text>
							</View>
						</View>

					</Image>
				</ScrollView>
			)
		}
	}
}

const mapStateToProps = state => ({
	firmware_file : state.updateFirmwareCentralReducer.firmware_file,
	central_update_mode : state.updateFirmwareCentralReducer.central_update_mode,
	central_device: state.scanCentralReducer.central_device,
	/*central_device : { 
    	new_representation: '01020C03FF0FF0FF1FF1',
		rssi: -63,
		name: 'Sure-Fi Brid',
		id: 'C1:BC:40:D9:93:B9',
		advertising: 
		{ CDVType: 'ArrayBuffer',
		data: 'AgEGDf///wECBgP/D/D/H/ENCFN1cmUtRmkgQnJpZBEHeM6DVxUtQyE2JcUOCgC/mAAAAAAAAAAAAAAAAAA=' },
		manufactured_data: 
		{ hardware_type: '01',
		firmware_version: '02',
		device_state: '0C03',
		device_id: 'FF0FF0',
		tx: 'FF1FF1',
		address: 'C1:BC:40:D9:93:B9',
		security_string: [ 178, 206, 206, 71, 196, 39, 44, 165, 158, 178, 226, 19, 111, 234, 113, 180 ] } 
    },
    */
    kind_firmware : state.selectFirmwareCentralReducer.kind_firmware
});


export default connect(mapStateToProps)(UpdateFirmwareCentral)
