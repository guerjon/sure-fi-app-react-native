import React, {Component} from 'react'
import {
	View,
	Text,
	Image,
	StyleSheets,
	ScrollView,
	TouchableHighlight,
	NativeAppEventEmitter

} from 'react-native'
import {styles} from '../../styles/index.js'
import {
	IS_EMPTY,
	GET_HEADERS,
	BASE64,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	SUREFI_CMD_READ_UUID,
	COMMAND_START_FIRWMARE_UPDATE,
	COMMAND_START_ROW,
	COMMAND_ROW_PIECE,
	COMMAND_END_ROW,
	COMMAND_FINISH_FIRMWARE_UPDATE,
	UINT8TOSTRING,
	HEX_TO_BYTES,

} from '../../constants.js'
import {connect} from 'react-redux'
import RNFetchBlob from 'react-native-fetch-blob'
import BleManager from 'react-native-ble-manager';

class UpdateFirmwareCentral extends Component{

	static navigationOptions = {
		title : "Update Firmware"
	}

//BleManagerDidUpdateValueForCharacteristic
	componentDidMount() {
		this.dispatch = this.props.dispatch
		this.firmware_file = this.props.firmware_file
		this.navigate = this.props.navigation.navigate
		this.dispatch({type: "RESET_UPDATE_FIRMWARE_CENTRAL_REDUCER"})
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this);
		NativeAppEventEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicNotification );
	}

	startUpdate(){
		if(!IS_EMPTY(this.props.firmware_file)){
			//this.fetchFirmwareFile()
			this.writeStartUpdate()
		}else{
			console.log("there is not firmware file selected")
		}
	}

	handleCharacteristicNotification(data){
		console.log("awuebo",data)
	}

	/*fetchFirmwareFile(){
		this.props.dispatch({type: 'SET_UP_UPDATE_MODE'})

		var {firmware_file} = this.props
		let path = firmware_file.firmware_path
		// send http request in a new thread (using native code) 
		
		RNFetchBlob.fetch('GET', path,GET_HEADERS)
		  // when response status code is 200 
		  .then((res) => {
		  	
		  	var byteCharacters = res.text()
		  	var byteArrays = [];
		  	var sliceSize = 2048
		  	var command = 0x03
		  	
		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		    const slice = byteCharacters.slice(offset, offset + sliceSize);
		    
		    const byteNumbers = new Array(slice.length);
		    for (let i = 1; i < (slice.length +1); i++) {
		      byteNumbers[i] = slice.charCodeAt(i);
		    }
		    byteNumbers[0] = command
		    const byteArray = new Uint8Array(byteNumbers);
		    
		    byteArrays.push(byteArray);
		}		  	

			console.log(byteArrays)
		 	
		  })
		  // Status code is not 200 
		  .catch((errorMessage, statusCode) => {
		    console.log(errorMessage)
		    // error handling 
		  })
	}*/

	uint8ToString(u8a){
	  var CHUNK_SZ = 0x8000;
	  var c = [];
	  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
	    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
	  }
	  return c.join("");
	}


	startNotification(){
		var {central_device} = this.props
		BleManager.connect(central_device.id)
  			.then((peripheralInfo) => {
  				console.log(peripheralInfo)
			BleManager.startNotification(central_device.id,SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_READ_UUID)
			  .then(() => {
			    // Success code 
			    console.log('Notification started');
			  })
			  .catch((error) => {
			    // Failure code 
			    console.log(error);
			  });
  		});  
	}


	writeStartUpdate(){
		var {central_device} = this.props
		var {dispatch} = this.props;
 		var hex = HEX_TO_BYTES(COMMAND_START_FIRWMARE_UPDATE)
	    var u8 = new Uint8Array(0x04)
	    var b64encoded = BASE64.btoa(UINT8TOSTRING(u8));
	    
		BleManager.write(central_device.id, SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_WRITE_UUID , b64encoded)
		  .then(() => {
		    
		    console.log('Write: ' + BASE64.atob(b64encoded) );
		  })
		  .catch((error) => {
		    // Failure code 
		    console.log(error);
		  });        	

	}


	readUpdate(){
		var {central_device} = this.props
		 BleManager.connect(central_device.id)
      		.then((peripheralInfo) => {
			
				BleManager.read(central_device.id, SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_READ_UUID)
					.then((readData) => {
					// Success code 
						console.log('Read: ' + readData);
					})
					.catch((error) => {
					// Failure code 
					console.log(error);
					});
				
    		})
    	.catch((error) => {
      		dispatch({type: "ERROR_ON_CENTRAL_SCANNING"})
      		console.log(error);
    	});
	}

	render(){
	
		if(!IS_EMPTY(this.props.firmware_file)){
			if(this.props.central_update_mode){
				var content = (
					<View style={{margin:40}}>
						<View>

						</View>
						<TouchableHighlight style={styles.bigRedButton} onPress={() => this.props.dispatch({type: "DELETE_FIRMWARE_SELECTED"})}>
							<Text style={styles.bigGreenButtonText}>
								Cancel
							</Text>
						</TouchableHighlight>
						<TouchableHighlight onPress={() => this.startUpdate()} style={styles.bigGreenButton}>
							<Text style={styles.bigGreenButtonText}>
								Start
							</Text>
						</TouchableHighlight>
					</View>
				)
			}else{
				var content = (
					<View style={{flexDirection:"column"}}>	
						<TouchableHighlight style={styles.bigRedButton} onPress={() => this.props.dispatch({type: "DELETE_FIRMWARE_SELECTED"})}>
							<Text style={styles.bigGreenButtonText}>
								Cancel
							</Text>
						</TouchableHighlight>
						<TouchableHighlight onPress={() => this.startUpdate()} style={styles.bigGreenButton}>
							<Text style={styles.bigGreenButtonText}>
								Start
							</Text>
						</TouchableHighlight>
						<TouchableHighlight onPress={() => this.readUpdate()} style={styles.bigRedButton}>
							<Text style={styles.bigGreenButtonText}>
								Read
							</Text>
						</TouchableHighlight>
						<TouchableHighlight onPress={() => this.startNotification()} style={styles.bigGreenButton}>
							<Text style={styles.bigGreenButtonText}>
								Start Notification
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
								<TouchableHighlight onPress={() => this.navigate("SelectFirmwareCentral")}>
									<Text style={styles.link}>
										Select Firmaware File
									</Text>

								</TouchableHighlight>
									<View style={{flexDirection:"column"}}>	
								<TouchableHighlight style={styles.bigRedButton} onPress={() => this.props.dispatch({type: "DELETE_FIRMWARE_SELECTED"})}>
									<Text style={styles.bigGreenButtonText}>
										Cancel
									</Text>
								</TouchableHighlight>
								<TouchableHighlight onPress={() => this.writeStartUpdate()} style={styles.bigGreenButton}>
									<Text style={styles.bigGreenButtonText}>
										Start
									</Text>
								</TouchableHighlight>
								<TouchableHighlight onPress={() => this.readUpdate()} style={styles.bigRedButton}>
									<Text style={styles.bigGreenButtonText}>
										Read
									</Text>
								</TouchableHighlight>
								<TouchableHighlight onPress={() => this.startNotification()} style={styles.bigGreenButton}>
									<Text style={styles.bigGreenButtonText}>
										Start Notification
									</Text>
								</TouchableHighlight>

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
	central_device: state.configurationScanCentralReducer.central_device,
	state : state
});


export default connect(mapStateToProps)(UpdateFirmwareCentral)
