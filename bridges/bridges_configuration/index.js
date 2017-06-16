import React, {
    Component
} from 'react'
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableHighlight,
    ActivityIndicator,
    Alert,
    NativeModules,
    NativeEventEmitter
} from 'react-native'
import {
    styles,
    first_color
} from '../../styles/index.js'
import {
    connect
} from 'react-redux';
import {
    TO_HEX_STRING,
    SUREFI_CMD_SERVICE_UUID,
    SUREFI_CMD_WRITE_UUID,
    IS_EMPTY
} from '../../constants'
import modules from '../../CustomModules.js'
import {
    NavigationActions
} from 'react-navigation'
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class BridgesConfiguration extends Component {

    static navigationOptions = {
        title: "Configure Sure-Fi Bridge",
        headerStyle: {
            backgroundColor: first_color
        },
        headerTitleStyle: {
            color: "white"
        },
        headerBackTitleStyle: {
            color: "white",
            alignSelf: "center"
        },
        headerTintColor: 'white',
    }

    componentDidMount() {
        var {
            dispatch
        } = this.props
        dispatch({
            type: "RESET_CENTRAL_REDUCER"
        })
        this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',(data) => this.handleDisconnectedPeripheral(data) );
    }

    scanCentralDevices() {
        var {
            navigation
        } = this.props;

        this.props.navigation.navigate("ConfigurationScanCentralUnits", {
            screenBefore: "configure-bridge"
        })
    }

    handleDisconnectedPeripheral(data){
    	var {central_device,dispatch} = this.props
    	BleManagerModule.disconnect(central_device.id, () => dispatch({
            type: "DISCONNECT_CENTRAL_DEVICE"
        }));
    	Alert.alert("Disconnected","The device " + central_device.manufactured_data.device_id.toUpperCase() + " has been disconnected.")	
    }

    renderDevice(device) {
        return (
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

    showAlert() {
        Alert.alert(
            "Initiate Bridge Configuration",
            "Are you sure you are ready to initiate configuration of this Sure-Fi Bridge?", [{
                    text: "Cancel",
                    onPress: () => null
                },
                {
                    text: "Continue",
                    onPress: () => this.props.navigation.navigate("WriteBridgeConfiguration")
                }
            ]
        );
    }

    disconnect() {
        var {
            central_device,
            dispatch
        } = this.props
        BleManagerModule.disconnect(central_device.id, () => dispatch({
            type: "DISCONNECT_CENTRAL_DEVICE"
        }));
    }

    connect() {
        var {
            central_device,
            dispatch
        } = this.props

        BleManagerModule.connect(central_device.id)
            .then((peripheralInfo) => {
                dispatch({
                    type: "CONNECTED_CENTRAL_DEVICE"
                })
                console.log(peripheralInfo)
            })
            .catch((error) => {
                dispatch({
                    type: ERROR_ON_CENTRAL_SCANNING
                })
                console.log(error);
            });

    }

    unPair() {
    	var {central_device} = this.props
    	BleManagerModule.retrieveServices(central_device.id, () => {
            BleManager.write(central_device.id, SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_WRITE_UUID, [0x000000], 20).then((response) => {
	    		console.log(response)
	    		Alert.alert("Success", "Un-Pair successfully sent")
	    	}).catch((error) => {
	    		console.error("Error","Error on UnPair")
	    	})      
        })  
    }

    write(data) {
        var {
            central_device
        } = this.props
        BleManagerModule.retrieveServices(central_device.id, () => {
            BleManagerModule.specialWrite(central_device.id, SUREFI_CMD_SERVICE_UUID, SUREFI_CMD_WRITE_UUID, data, 20)
        })
    }

    renderStatusDevice(){
    	var {central_device_status} = this.props
    	
    	switch(central_device_status){
			case "connecting":
				var status = "Connecting"
	            var central_status_text_style = {
	                color: "orange",
	                padding: 10,
	                margin: 5
	            }	
				return(
					<View>
			            <View style={{flexDirection: "row",backgroundColor: "white"}}>
							<View style={{flexDirection:"row"}}>
								<Text style={{padding: 10,margin:5}}>
									Status
								</Text >
								<Text style={central_status_text_style}>
									{status}
								</Text>
							</View>
							<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
								<ActivityIndicator />
							</View>							
						</View>
						
					</View>
				)
			case "disconnected":
				var status = "Disconnected"
	            var central_status_text_style = {
	                color: "red",
	                padding: 10,
	                margin: 5
	            }	

	            return(
					<View>
			            <View style={{flexDirection: "row",backgroundColor: "white"}}>
							<View style={{flexDirection:"row"}}>
								<Text style={{padding: 10,margin:5}}>
									Status
								</Text >
								<Text style={central_status_text_style}>
									{status}
								</Text>
							</View>
							<View style={{flex:1}}>
								<TouchableHighlight 
									style={{backgroundColor:"#00DD00",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
									onPress={()=> this.scanCentralDevices()}
								>
									<Text style={styles.bigGreenButtonText}>
										Connect
									</Text>
								</TouchableHighlight>
							</View>							
						</View>
						
					</View>
	            )		
			case "connected":
				var status = "Connected"
	            var central_status_text_style = {
	                color: "#00DD00",
	                padding: 10,
	                margin: 5
	            }
	            
 				return(
					<View>
						<View style={{backgroundColor:"white"}}>
				            <View style={{flexDirection: "row",margin:10}}>
								<View style={{flex:1,flexDirection:"row"}}>
									<Text style={{padding: 10,margin:5}}>
										Status
									</Text >
									<Text style={central_status_text_style}> 
										{status}
									</Text>
								</View>
								<View style={{flex:1}}>
									<TouchableHighlight 
										style={{backgroundColor:"red",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
										onPress={() => this.disconnect()}
									>
										<Text style={styles.bigGreenButtonText}>
											Disconnect
										</Text>
									</TouchableHighlight>
								</View>
							</View>
						</View>
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
					</View>	            	
	            )
	        default:
	        	return <Text>Error</Text>
    	}
    }

    render() {
        var {
            devices,
            central_device,
        } = this.props;

       

        var status = this.renderStatusDevice()
        console.log(central_device)
        if (!IS_EMPTY(central_device)) {
            return (
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
												{central_device.manufactured_data ? (central_device.manufactured_data.device_id ? central_device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") }
											</Text>
										</View>
									</View>
								</TouchableHighlight>
							</View>					
							<View style={{borderTopWidth:0.5}}>
								{status}
							</View>
						</View>
					</Image>
				</ScrollView>
            );

        } else {
            return (
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
    central_device_status: state.configurationScanCentralReducer.central_device_status,

});

export default connect(mapStateToProps)(BridgesConfiguration);