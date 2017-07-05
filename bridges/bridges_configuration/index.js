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
    NativeEventEmitter,
    FlatList,
    StyleSheet
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
    IS_EMPTY,
    FIND_ID,
    DIVIDE_MANUFACTURED_DATA,
    PAIR_SUREFI_SERVICE, 
    PAIR_SUREFI_WRITE_UUID
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
       	var {dispatch} = this.props;
		this.manager = BleManagerModule
		this.resetStatus()
		var bleManagerEmitter = new NativeEventEmitter(this.manager)
		bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => this.handleDiscoverPeripheral(data));
        BleManager.start().then(() => {
        	this.searchDevices()
        });
    }

	searchDevices(){
		this.scanning = setInterval(() => {
			BleManager.scan([], 3, true).then(() => {
            	
        	})
		} , 1000)
        this.devices = []
        setTimeout(() => {
        	if(this.scanning)
          	clearInterval(this.scanning)
        },60000)
	}

	handleDiscoverPeripheral(data) {
      
      var devices = this.devices;
        
        //if(data.name == "SF Bridge"){
        if (data.name == "Sure-Fi Brid" || data.name == "SF Bridge") {
        	
            if (!FIND_ID(devices, data.id)) {              
            	
              	var data = this.getManufacturedData(data)
                devices.push(data)
                this.devices = devices
                this.remote_devices = this.filterRemoteDevices(devices)
                this.props.dispatch({type: "UPDATE_DEVICES",devices: this.devices,remote_devices: this.remote_devices})
            }
        }
    }

    getManufacturedData(device) {
        if (device) {
            device.manufactured_data = DIVIDE_MANUFACTURED_DATA(device.new_representation, device.id);
            delete device.manufacturerData;
        }else{
          console.log("error on getManufacturedData device is null or 0")
        }
        return device;
    }

	scanRemoteDevices(){
		var {dispatch,navigation} = this.props;
		this.props.navigation.navigate("ConfigurationScanRemoteUnits",{manager: this.manager,scan : this.scanning})
	}

	scanCentralDevices(){
		var {dispatch,navigation} = this.props;
		this.props.navigation.navigate("ConfigurationScanCentralUnits",{manager : this.manager,scan : this.scanning})
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
        BleManagerModule.disconnect(central_device.id, (data) => {
        	this.resetStatus()
        	this.props.navigation.goBack()
        });
    }

    disconnectRemote(){
    	var {
    		remote_device,
    		dispatch
    	} = this.props
    	BleManagerModule.disconnect(remote_device.id,(data) => {
    		this.resetRemoteStatus()
    	})
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
                
            })
            .catch((error) => {
                dispatch({
                    type: ERROR_ON_CENTRAL_SCANNING
                })
                console.log(error);
            });
    }

    resetStatus(){
    	this.props.dispatch({
    		type: "RESET_CENTRAL_REDUCER"
    	})
    	this.props.dispatch({
    		type: "RESET_PAIR_REDUCER"
    	})
    }

    resetRemoteStatus(){
    	this.props.dispatch({
    		type: "CONFIGURATION_RESET_REMOTE_REDUCER"
    	})

    }

    unPair() {
    	var {central_device} = this.props
    	BleManagerModule.retrieveServices(central_device.id, () => {
            BleManagerModule.unPair(central_device.id, PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID, 20,(response) => {
	    		
	    		Alert.alert("Success", "Un-Pair successfully sent")
	    		this.disconnect()
	    		
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

    componentWillUnmount() {
    	var {central_device,remote_device} = this.props
    	if(central_device)
    		if(central_device.id)
    			BleManager.disconnect(central_device.id)
    				.then(info => console.log("disconnect:" + info ))
    				.catch(error => console.log(error) )

    	if(remote_device)
    		if(remote_device.id)
    			BleManager.disconnect(remote_device.id)
    				.then(info => console.log("disconnect:" + info ))
    				.catch(error => console.log(error) )    				
    }


	renderDevice(device){
		device = device.item
		return(
			<View style={{backgroundColor:"white",borderBottomWidth: StyleSheet.hairlineWidth}}>
				<View style={{padding: 10}}>
					<Text style={styles.title}>{device.name}</Text>
					<Text style={{fontSize:12}}>
						Rx: {device.manufactured_data.device_id} Tx : {device.manufactured_data.tx} Tp: {device.manufactured_data.hardware_type} VER: {device.manufactured_data.firmware_version} STAT: {device.manufactured_data.device_state.substring(2,4)}
					</Text>
				</View>
			</View>
		);
	}

	renderConnectingBox(){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{padding: 10,margin:5}}>
							Status
						</Text >
						<View style={{width:180}}>
							<Text style={{fontSize:15}}>
								Hold the Test button on the Bridge for 5 seconds
							</Text>
						</View>
					</View>
					<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
						<ActivityIndicator />
					</View>							
				</View>
			</View>
		)
	}

	renderDisconnectingBox(callback){
		return (
			<View>
	            <View style={{flexDirection: "row",backgroundColor: "white"}}>
					<View style={{flexDirection:"row"}}>
						<Text style={{padding: 10,margin:5}}>
							Status
						</Text >
						<Text style={{color: "red",padding: 10,margin: 5}}>
							"Disconnected"
						</Text>
					</View>
					<View style={{flex:1}}>
						<TouchableHighlight 
							style={{backgroundColor:"#00DD00",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
							onPress={()=> callback()}
						>
							<Text style={styles.bigGreenButtonText}>
								Connect
							</Text>
						</TouchableHighlight>
					</View>							
				</View>
			</View>
		)
	}

	renderRemoteStatusDevice(){
		var {remote_device_status,remote_device} = this.props

		if(this.props.remote_devices.length > 0){
    		var remote_devices = this.renderDevicesList(this.props.remote_devices)
    	}else{
    		var remote_devices = <ActivityIndicator style={{marginTop:40}}/>	
    	}

		switch(remote_device_status){
			case "connecting":
			var content = this.renderConnectingBox()
			break
			case "disconnected":
			var content = this.renderDisconnectingBox(this.scanRemoteDevices)
			break
			case "connected":
			var content = (
				<View>
					<View style={{backgroundColor:"white"}}>
			            <View style={{flexDirection: "row",margin:10}}>
							<View style={{flex:1,flexDirection:"row"}}>
								<Text style={{padding: 10,margin:5}}>
									Status
								</Text >
								<Text style={{color: "#00DD00",padding: 10,margin: 5}}> 
									Connected
								</Text>
							</View>
							<View style={{flex:1}}>
								<TouchableHighlight 
									style={{backgroundColor:"red",alignItems:"center",justifyContent:"center",padding:7,margin:5,alignSelf:"flex-end",borderRadius:10}}
									onPress={() => this.disconnectRemote()}
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
									onPress={() => this.props.navigation.navigate("UpdateFirmwareCentral")}
								>
									<Text style={styles.white_row_text}>
										Update Firmware - Application
									</Text>
								</TouchableHighlight>
								<TouchableHighlight style={styles.white_row} onPress={() => this.props.navigation.navigate("FirmwareUpdateRadio")}>
									<Text style={styles.white_row_text}> 
										Update Firmware - Radio
									</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>		
				</View>

			)
			break
			default:
				var content = null
			break
			
		}

		if(!IS_EMPTY(remote_device)){

			return (
				<View>
					<View style={styles.titleContainer}>
						<Text style={styles.title}>
							Remote Unit
						</Text>
					</View>
					<View style={styles.touchableSectionContainer}>
						<TouchableHighlight onPress={()=> this.scanRemoteDevices()} style={styles.touchableSection}>
							<View style={styles.touchableSectionInner}>
								<Image 
									source={require('../../images/hardware_select.imageset/hardware_select.png')} 
									style={styles.touchableSectionInnerImage}
								>
								</Image>
								<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
									<Text >
										Sure-Fi Bridge Central
									</Text>
									<Text style={{fontSize:22}}>
										{remote_device.manufactured_data ? (remote_device.manufactured_data.device_id ? remote_device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") }
									</Text>
								</View>
							</View>
						</TouchableHighlight>
					</View>
					<View style={{borderTopWidth:0.5}}>
						{content}
					</View>
				</View>
			)
		}else{
			
			return (
					<View>
						<View style={styles.titleContainer}>
							<Text style={styles.title}>
								Remote Unit
							</Text>
						</View>
						<View style={styles.touchableSectionContainer}>
							<TouchableHighlight onPress={()=> this.scanRemoteDevices()} style={styles.touchableSection}>
								<View style={styles.touchableSectionInner}>
									<Image 
										source={require('../../images/hardware_select.imageset/hardware_select.png')} 
										style={styles.touchableSectionInnerImage}
									>
									</Image>
									<Text style={styles.touchableSectionInnerText}>
										Scan Remote Unit
									</Text>
								</View>
							</TouchableHighlight>
						</View>
						<View>
							{remote_devices}
						</View>
					</View>
			)			
		}
	}

    renderStatusDevice(){
    	var {central_device_status,remote_devices,remote_device_status} = this.props

    	switch(central_device_status){
			case "connecting":
				return this.renderConnectingBox()
			case "disconnected":
	            return this.renderDisconnectingBox(this.scanCentralDevices);
			case "connected":
 				return(
					<View>
						<View style={{backgroundColor:"white"}}>
				            <View style={{flexDirection: "row",margin:10}}>
								<View style={{flex:1,flexDirection:"row"}}>
									<Text style={{padding: 10,margin:5}}>
										Status
									</Text >
									<Text style={{color: "#00DD00",padding: 10,margin: 5}}> 
										Connected
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
											Update Firmware - Application
										</Text>
									</TouchableHighlight>
									<TouchableHighlight style={styles.white_row} onPress={() => this.props.navigation.navigate("FirmwareUpdateRadio")}>
										<Text style={styles.white_row_text}> 
											Update Firmware - Radio
										</Text>
									</TouchableHighlight>
								</View>
							</View>
							<View>
								{this.renderRemoteStatusDevice()}
							</View>							
						</View>							
					</View>	            	
	            )
	        default:
	        	return <Text>Error</Text>
    	}
    }

    renderDevicesList(devices){
    	return (
			<ScrollView style={{marginTop:20}}>
				<FlatList data={this.props.devices} renderItem={(item) => this.renderDevice(item)} keyExtractor={(item,index) => item.id } />	
			</ScrollView>
    	)
    }

    filterRemoteDevices(devices){
    	let remote_revices = devices.filter(device => {
    		return device.manufactured_data.hardware_type == "02"
    	})
    	return remote_revices
    }

    render() {
        var {
            devices,
            central_device,
        } = this.props;

    	if(this.props.devices.length > 0){
			var devices_content = this.renderDevicesList(this.props.devices)
		}else{
			var devices_content = <ActivityIndicator style={{marginTop:40}}/>
		}

        var status = this.renderStatusDevice()
        
        if (!IS_EMPTY(central_device)) {
            return (
                <ScrollView style={styles.pairContainer}>
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
					
				</ScrollView>
            );

        } else {
            return (
                <ScrollView style={styles.pairContainer}>

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
							{devices_content}

						</View>
					
				</ScrollView>
            );
        }
    }
}

const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    central_device_status: state.configurationScanCentralReducer.central_device_status,
    /*	 central_device : { 
    	new_representation: '01020603FF0FF0FF1FF1',
		rssi: -63,
		name: 'Sure-Fi Brid',
		id: 'DB:CB:B5:8E:33:9A',
		advertising: 
		{ CDVType: 'ArrayBuffer',
		data: 'AgEGDf///wECBgP/D/D/H/ENCFN1cmUtRmkgQnJpZBEHeM6DVxUtQyE2JcUOCgC/mAAAAAAAAAAAAAAAAAA=' },
		manufactured_data: 
		{ hardware_type: '01',
		firmware_version: '02',
		device_state: '0603',
		device_id: 'FF0FF0',
		tx: 'FF1FF1',
		address: 'DB:CB:B5:8E:33:9A',
		security_string: [ 178, 206, 206, 71, 196, 39, 44, 165, 158, 178, 226, 19, 111, 234, 113, 180 ] } 
    },*/
    //central_device_status: "connected",
    central_matched : state.scanCentralReducer.central_device_matched,
  	remote_matched : state.scanRemoteReducer.remote_device_matched,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices,
  	remote_devices : state.pairReducer.remote_devices,
  	remote_device_status : state.configurationScanRemoteReducer.remote_device_status
});

export default connect(mapStateToProps)(BridgesConfiguration);