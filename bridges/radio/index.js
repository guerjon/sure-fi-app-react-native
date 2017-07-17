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
import ConfigureRadio from '../bridges_configuration/configure_radio_central'

class RadioConfiguration extends Component {

    static navigationOptions = {
        title: "Configure Radio",
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
      
      var devices = this.devices || [];
        
        //if(data.name == "SF Bridge"){
        if (data.name == "Sure-Fi Brid" || data.name == "SF Bridge") {
        	
            if (!FIND_ID(devices, data.id)) {              
            	
              	var data = this.getManufacturedData(data)
                devices.push(data)
                this.devices = devices
                this.props.dispatch({type: "UPDATE_DEVICES",devices: this.devices})
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
		this.props.navigation.navigate("ScanRemoteUnits",{manager: this.manager})
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

    renderStatusDevice(){
    	var {central_device_status} = this.props


    	switch(central_device_status){
			case "connecting":
				var status = "Hold the test button by"
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
									RADIO OPTIONS
								</Text>
							</View>
							<ConfigureRadio />
						</View>							
					</View>	            	
	            )
	        default:
	        	return <Text>Error</Text>
    	}
    }

    componentWillUnmount() {
    	var {central_device} = this.props
    	console.log("central_device",central_device)
    	if(central_device)
    		if(central_device.id)
    			BleManager.disconnect(central_device.id)
    				.then(info => console.log("disconnect:" + info ))
    				.catch(error => console.log(error) )
    }

    render() {
        var {
            devices,
            central_device,
        } = this.props;

    	if(this.props.devices.length > 0)
			var devices_content = (

				<ScrollView style={{marginTop:20}}>
					<FlatList data={this.props.devices} renderItem={(item) => this.renderDevice(item)} keyExtractor={(item,index) => item.id } />	
				</ScrollView>
			)
		else{
			var devices_content = <ActivityIndicator />
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
  	devices : state.pairReducer.devices
});

export default connect(mapStateToProps)(RadioConfiguration);