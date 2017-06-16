import React, {Component} from 'react'
import {
	View,
	Text,
	Image,
	StyleSheets,
	ScrollView,
	TouchableHighlight,
	NativeEventEmitter,
	NativeModules

} from 'react-native'
import {styles,first_color} from '../../styles/index.js'
import {
	IS_EMPTY,
	GET_HEADERS,
	BASE64,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_SERVICE_UUIDD,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	SUREFI_CMD_READ_UUIDD,
	COMMAND_START_FIRWMARE_UPDATE,
	COMMAND_START_ROW,
	COMMAND_ROW_PIECE,
	COMMAND_END_ROW,
	COMMAND_FINISH_FIRMWARE_UPDATE,
	UINT8TOSTRING,
	HEX_TO_BYTES,
	ERROR_ON_CENTRAL_SCANNING


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

	render(){
		var {firmware_update_state} = this.props
		if(!IS_EMPTY(this.props.firmware_file)){
			if(this.props.central_update_mode){
				var content = (
					<View style={{margin:40,flexDirection:"row"}}>
						
						<TouchableHighlight style={styles.bigRedButton} onPress={() => this.props.dispatch({type: "DELETE_FIRMWARE_SELECTED"})}>
							<Text style={styles.bigGreenButtonText}>
								Cancel
							</Text>
						</TouchableHighlight>
						

						<TouchableHighlight onPress={() => this.navigate("FirmwareUpdate")} style={styles.bigGreenButton}>
							<Text style={styles.bigGreenButtonText}>
								Start
							</Text>
						</TouchableHighlight>

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
								{content}
							</View>
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
	central_device: {id :"FD:C0:90:D7:05:95"}, //state.configurationScanCentralReducer.central_device,
});


export default connect(mapStateToProps)(UpdateFirmwareCentral)
