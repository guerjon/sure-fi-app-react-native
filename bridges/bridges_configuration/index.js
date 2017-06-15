import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	ActivityIndicator,
  	FlatList,
  	Alert,
  	NativeModules,
  	NativeEventEmitter
} from 'react-native'
import {styles,first_color} from '../../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	LOADED,
	DEVICES_FOUNDED,
	DEVICES_NOT_FOUNDED,
	TO_HEX_STRING,
	SCANNING_CENTRAL_UNITS,
	RESET_QR_CENTRAL_STATE,
	HEX_TO_BYTES,
	UINT8TOSTRING,
	BASE64,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	IS_EMPTY

} from '../../constants'
import modules from '../../CustomModules.js'
import { NavigationActions } from 'react-navigation'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


var ScanCentral = modules.ScanCentral
var ConnectDevice = modules.ConnectDevice

class BridgesConfiguration extends Component{
	
	static navigationOptions ={
		title : "Configure Sure-Fi Bridge",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentDidMount() {
		var {dispatch,central_device} = this.props
		dispatch({type: "RESET_CENTRAL_REDUCER"})
	}

	initBLEManager(){
		BleManagerModule.start({showAlert: false});
        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => this.handleDiscoverPeripheral() );
        setTimeout(() => this.stopScanning(this.toggleScanning()),10000)
	}

	toggleScanning(){
	    return setInterval( ()=> this.handleScan(), 3000)
  	}

  	handleDiscoverPeripheral(data){
	    var {devices,dispatch} = this.props;
	    var new_bridges = [];
	    if(data.id == central_device.id){
	      	clearInterval(this.scanning)
	      	this.connect()
	    }
  	}

	stopScanning(scanning){
	    clearInterval(scanning)
  	}

  	handleScan() {
    	BleManagerModule.scan([], 3, true)
            .then((results) => {console.log('Scanning...'); });
  	}

	scanCentralDevices(){
		var {dispatch,navigation} = this.props;
		this.props.navigation.navigate("ConfigurationScanCentralUnits",{screenBefore: "configure-bridge"})
	}

	renderDevice(device){
		return(
			<View style={{backgroundColor:"white",marginVertical: 5}}>
				<View style={{padding: 10}}>
					<Text>Name: {device.name}</Text>
					<Text>Address: {device.address} </Text>
					<Text>Manufactured data : {TO_HEX_STRING(device.manufacturerData)}</Text>
					<Text>Uuid : {device.uuids} </Text>
				</View>
			</View>
		);
	}

	showAlert(){
		Alert.alert(
			"Initiate Bridge Configuration",
			"Are you sure you are ready to initiate configuration of this Sure-Fi Bridge?",
			[
				{text: "Cancel",onPress : () => null},
				{text: "Continue",onPress : () => this.props.navigation.navigate("WriteBridgeConfiguration")}
			]
		);
	}

	resetState(){
		var {dispatch} = this.props;
		dispatch({type : RESET_QR_CENTRAL_STATE});
	}

	disconnect(){
		var {central_device,dispatch} = this.props
		BleManagerModule.disconnect(central_device.id,() => dispatch({type : "DISCONNECTED_CENTRAL_UNIT"}));
	}

	connect(){
		var {central_device,dispatch} = this.props

		BleManagerModule.connect(central_device.id)
		  .then((peripheralInfo) => {
		    dispatch({type: "CONNECTED_CENTRAL_UNIT"})
		    console.log(peripheralInfo)
		})
		.catch((error) => {
		  dispatch({type: ERROR_ON_CENTRAL_SCANNING})
		  console.log(error);
		});

	}
	
	uint8ToString(u8a){
		var CHUNK_SZ = 0x8000;
		var c = [];
		for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
		  c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
		}
		return c.join("");
	}

	unPair(){
	    this.write([0x000000])
	    Alert.alert("Success","Un-Pair successfully sent")
	}

	write(data){
		var {central_device} = this.props
		BleManagerModule.retrieveServices(central_device.id,() => {
			BleManagerModule.specialWrite(central_device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,data,20)
		})
	}

	render(){
		var {devices,central_device,connected_central_unit} = this.props;
		if(connected_central_unit){
			var central_status_text_style = {
				color: "#00DD00",
				padding: 10,
				margin: 5
			}
		}else{
			var central_status_text_style = {
				color: "orange",
				padding: 10,
				margin: 5
			}
		}

		if(!IS_EMPTY(central_device)){
			return(
				<ScrollView style={styles.pairContainer}>
					<Image  
						source={require('../../images/temp_background.imageset/temp_background.png')} 
						style={styles.image_complete_container}
					>	
						<View style={styles.pairSectionsContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
							<View style={styles.touchableSectionContainer}>
								<TouchableHighlight onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
									<View style={styles.touchableSectionInner}>
										<Image 
											source={require('../../images/hardware_bridge.imageset/hardware_bridge.png')} 
											style={styles.touchableSectionInnerImage}
										>
										</Image>
										<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
											<Text >
												Sure-Fi Bridge Central
											</Text>
											<Text style={{fontSize:22}}>
												{central_device.manufactured_data.device_id.toUpperCase()}
											</Text>
										</View>
									</View>
								</TouchableHighlight>
							</View>					
							<View style={{backgroundColor:"white",borderTopWidth:0.5,flexDirection:"row"}}>
								<View style={{flexDirection: "row"}}>
									<Text style={{padding: 10,margin:5}}>
										Status
									</Text >
									<Text style={central_status_text_style}>
										{connected_central_unit ? "Connected" : "Disconnected"}
									</Text>
								</View>
								<View style={{flex:1}}>
									{
										connected_central_unit &&
										<TouchableHighlight 
											style={{backgroundColor:"red",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
											onPress={() => this.disconnect()}
										>
											<Text style={styles.bigGreenButtonText}>
												Disconnect
											</Text>
										</TouchableHighlight>
									}
									{
										!connected_central_unit &&
										<TouchableHighlight 
											style={{backgroundColor:"#00DD00",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
											onPress={()=> this.scanCentralDevices()}
										>
											<Text style={styles.bigGreenButtonText}>
												Connect
											</Text>
										</TouchableHighlight>
									}
								</View>
							</View>
							{
								connected_central_unit &&
									<View style={{marginTop: 10}}>
										<View style={{padding:10}}>
											<Text style={styles.title}>
												CONFIGURATION OPTIONS
											</Text>
										</View>
										<View style={{backgroundColor:"white"}}>
											<View>
												<TouchableHighlight 
													style={styles.white_row} 
													onPress={
														() => Alert.alert(
															"Un-Pair Bridge",
															"Are you sure you want to Un-Pair this Sure-Fi Bridge",
															[
															    {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
																{text: 'Un-Pair', onPress: () => this.unPair(), style:'cancel'}
															]
														)
													}
												>
													<Text style={styles.white_row_text}>
														Un-Pair Bridge
													</Text>
												</TouchableHighlight>
												<TouchableHighlight 
													style={styles.white_row} 
													onPress={() => this.props.navigation.navigate("UpdateFirmwareCentral")}
												>
													<Text style={styles.white_row_text}>
														Update Firmware - Central
													</Text>
												</TouchableHighlight>
												<TouchableHighlight style={styles.white_row} onPress={() => this.props.navigation.navigate("ConfigureRadioCentral")}>
													<Text style={styles.white_row_text}> 
														Configure Radio - Central
													</Text>
												</TouchableHighlight>
											</View>
										</View>
									</View>		
							}
						</View>
					</Image>
				</ScrollView>
			);
			
		}else{
			return(
				<ScrollView style={styles.pairContainer}>
					<Image  
						source={require('../../images/temp_background.imageset/temp_background.png')} 
						style={styles.image_complete_container}
					>	
						<View style={styles.pairSectionsContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
							<View style={styles.touchableSectionContainer}>
								<TouchableHighlight onPress={()=> this.scanCentralDevices()} style={styles.touchableSection}>
									<View style={styles.touchableSectionInner}>
										<Image 
											source={require('../../images/hardware_select.imageset/hardware_select.png')} 
											style={styles.touchableSectionInnerImage}
										>
										</Image>
										<Text style={styles.touchableSectionInnerText}>
											Select Central Unit
										</Text>
									</View>
								</TouchableHighlight>
							</View>							
						</View>
					</Image>
				</ScrollView>
			);	
		}
	}
}

const mapStateToProps = state => ({
  	central_device: state.configurationScanCentralReducer.central_device,
  	connected_central_unit : state.writeBridgeConfigurationReducer.connected_central_unit
});

export default connect(mapStateToProps)(BridgesConfiguration);