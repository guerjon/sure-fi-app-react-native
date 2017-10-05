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
  	NativeEventEmitter,
  	StyleSheet
} from 'react-native'
import {styles,first_color,width,height} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	IS_EMPTY,
	HEX_TO_BYTES,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	DIVIDE_MANUFACTURED_DATA,
	FIND_ID,
	MATCH_DEVICE,
	GET_REMOTE_DEVICES,
	GET_DEVICES_ON_PAIRING_MODE,
	GET_CENTRAL_DEVICES,
} from '../constants'
import { NavigationActions } from 'react-navigation'
import BleManager from 'react-native-ble-manager'
import {COMMAND_MAKE_DEPLOY} from '../commands'
import ScanRemoteUnits from './scan_remote_units'
import Background from '../helpers/background'
import {
	PUSH_CLOUD_STATUS,
	WRITE_PAIRING,
	CONNECT,
	READ_STATUS,
	DISCONNECT,
} from '../action_creators/index'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class PairBridge extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

	constructor(props) {
		super(props);
		this.fast_manager = props.manager
		this.central_device = props.device
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.devices = []
		this.scanDevices()
	}


	componentDidMount() {
		this.props.dispatch({type: "RESET_REMOTE_REDUCER"})
		this.props.dispatch({type: "SHOW_REMOTE_CAMERA"})
	}

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "insert_pin":
                	this.goToInsertIDModal()
                break
                default:
                break
            }
        } 
    }

    getManufacturedData(device) {
        if (device) {
            device.manufactured_data = DIVIDE_MANUFACTURED_DATA(device.CORRECT_DATA.substring(14), device.id);
            delete device.manufacturerData
            delete device.CORRECT_DATA;
        }else{
          console.log("error on getManufacturedData device is null or 0")
        }
        return device;
    }

    scanDevices(){
        console.log("scanRemoteDevices()")
        var devices = this.devices
        this.fast_manager.startDeviceScan(['98bf000a-0ec5-2536-2143-2d155783ce78'],null,(error,device) => {
            if(error){
                return
            }
            if (device.name == "Sure-Fi Brid" || device.name == "SF Bridge") {
                
                if (!FIND_ID(devices, device.id)) {   
                    var data = this.getManufacturedData(device)
                    devices.push(data)
                    this.devices = devices
                }                
            }
        })
    }

    goToInsertIDModal(){
		this.props.navigator.showLightBox({
            screen: "InsertIDModal",
            style: {
                backgroundBlur: "none", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                backgroundColor: "backgroundColor: 'rgba(10,10,10,0.5)", // tint color for the background, you can specify alpha here (optional)
            },
            passProps: {
            	matchDevice : (value) => this.matchDevice(value)
            }
        });
    }

    showAlertConfirmation(){
    	
    	let central_id = this.central_device.manufactured_data.hardware_type == "01" ? this.props.remote_device.manufactured_data.device_id :  this.central_device.manufactured_data.device_id 
    	let remote_id = this.central_device.manufactured_data.hardware_type == "02" ? this.central_device.manufactured_data.device_id : this.props.remote_device.manufactured_data.device_id
    	this.props.dispatch({type: "HIDE_REMOTE_CAMERA"})
    	Alert.alert(
    		"Continue Pairing",
    		"Are you sure you wish to Pair the following Sure-Fi Devices: \n \n" + "Central : " + central_id + "\n\n" + " Remote : " + remote_id,
    		[
    		 	
    		 	{text : "Cancel", onPress: () => console.log(("CANCEL"))},
    		 	{text : "PAIR", onPress: () => this.pair() },
    		]
    	)	
    }

    resetStack(){
    	console.log("resetStack()")
    	this.props.dispatch({type:"UPDATE_ACTION_FROM_DISCONNNECT",action_from_disconnect:"pair"})
    	this.props.dispatch({type:"HIDE_CAMERA"})
	    this.props.dispatch({
            type: "CENTRAL_DEVICE_MATCHED",
            central_device: this.central_device
        });
		this.props.navigator.dismissModal()    	
    }

    componentWillUnmount() {
    	this.fast_manager.stopDeviceScan();
    }

    pair(){
    	console.log("pair()")
		var {remote_device,dispatch} = this.props
		let rxUUID = this.central_device.manufactured_data.device_id
    	let txUUID = remote_device.manufactured_data.device_id

		let remote_id_bytes = HEX_TO_BYTES(remote_device.manufactured_data.device_id)

    	this.fast_manager.stopDeviceScan();

	    WRITE_PAIRING(this.central_device.id,remote_id_bytes)
			.then(response => {
				PUSH_CLOUD_STATUS(rxUUID,"04|04|" + rxUUID + "|" + txUUID)
		    	.then(response => {	
		    		PUSH_CLOUD_STATUS(txUUID,"04|04|" + txUUID + "|" + rxUUID)
		    		.then(response => {

						this.central_device.manufactured_data.tx = txUUID
						this.central_device.manufactured_data.device_state = "0004";
						this.central_device.writePairResult = true

			    		this.props.dispatch({
		                    type: "CENTRAL_DEVICE_MATCHED",
		                    central_device: this.central_device
		                });

		                this.props.dispatch({
					        type: "NORMAL_CONNECTING_CENTRAL_DEVICE",
					    })	

			    		this.props.navigator.dismissModal();
		                
		                DISCONNECT(this.central_device.id)
		                .then(() => {
		                	setTimeout(() => this.props.fastTryToConnect(this.central_device),1000) 	
		                })
	    			}).catch(error => console.log(error))
	    		}).catch(error => console.log("error",error))
	    	}).catch(error => {console.log("error",error)})	
    }

    getNoMatchedMessage(){

        return (
            <View style={{backgroundColor:"white"}}>
                <Text>
                    Device with code {this.props.scan_result_id} not found it.
                </Text>
            </View>
        )
    }

    onSuccess(scan_result) {
        //Vibration.vibrate()
        var device_id = scan_result.data.substr(-6).toUpperCase();
        this.scan_result_id = device_id
        this.hideCamera();
        this.matchDevice(device_id)
    }

    matchDevice(device_id){
    	console.log("matchDevice()",device_id);
        var {
            dispatch,
            navigation
        } = this.props;
        
        var devices = this.devices
        var matched_device = []

        if(devices){// the scanner should found some devices at this moment, if not just keep looking 
                
            var matched_devices = MATCH_DEVICE(devices,device_id) //MATCH_DEVICE_CONSTANT looks for devices with the same qr scanned id 

            if (matched_devices.length > 0) {  //if we found devices, now we need be sure that the matched devices are REMOTE i.e hardware_type == 01 return true
            
                if(this.central_device.manufactured_data.hardware_type == "01"){ // THE PREVIOUS MATCHED DEVICE IS A CENTRAL SO WE NEED FIGURE OUT A REMOTE ONE
                    
                    matched_devices = GET_REMOTE_DEVICES(matched_devices)
                    
                    if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a REMOTE _device
                        matched_devices = GET_DEVICES_ON_PAIRING_MODE(matched_devices) // now we need check the state of the device
                        if(matched_devices.length > 0){

                            let device = matched_devices[0]
                            dispatch({
                                type: "REMOTE_DEVICE_MATCHED",
                                remote_device: device
                            });
                            this.props.showAlertConfirmation()
                            
                        }else{
                           Alert.alert(
                            "Pairing Error",
                            "Device \n" + device_id.toUpperCase() +"  \n is not on pairing mode.",
                            [
                                {text: "Accept", onPress: () => this.showCamera()}
                            ],
                            {
                                cancelable: false
                            }
                            );   
                        }
                    }else{
                        Alert.alert(
                            "Pairing Error",
                            "Device \n" + device_id.toUpperCase() + "  \n is a Sure-Fi Central Unit. You need to pair to a Sure-Fi Remote Unit.",
                            [
                                {text: "Accept", onPress: () => this.showCamera()}
                            ],
                            {
                                cancelable: false
                            }
                        );
                    }
            
                }else{
                    matched_devices = GET_CENTRAL_DEVICES(matched_devices)
                    
                    if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a REMOTE _device
                        matched_devices = GET_DEVICES_ON_PAIRING_MODE(matched_devices) // now we need check the state of the device
                        if(matched_devices.length > 0){

                            let device = matched_devices[0]
                            dispatch({
                                type: "REMOTE_DEVICE_MATCHED",
                                remote_device: device
                            });
                            this.props.navigator.dismissLightBox();
                            this.showAlertConfirmation()
                            
                        }else{
                            Alert.alert(
                                "Pairing Error",
                                "Device \n" + device_id.toUpperCase() +"  \n is not on pairing mode.",
                                [
                                    {text: "Accept", onPress: () => this.showCamera()}
                                ],
                                {
                                    cancelable: false
                                }                            
                            );
                        }
                    }else{
                        Alert.alert(
                            "Pairing Error",
                            "Device \n" + device_id.toUpperCase() + "  \n is a Sure-Fi Remote Unit. You need to pair to a Sure-Fi Remote Unit.",
                            [
                                {text: "Accept", onPress: () => this.showCamera()}
                            ],
                            {
                                cancelable: false
                            }                            
                        );
                    }
                }
            }else{
                Alert.alert(
                    "Pairing error",
                    "The device " + device_id.toUpperCase() + " was not found",
                    [
                        {text: "Accept", onPress: () => this.showCamera()}
                    ],
                    {
                        cancelable: false
                    }
                );
            }
        }
    }


    showCamera(){
        this.props.dispatch({type:"SHOW_REMOTE_CAMERA"})
    }

    hideCamera(){
        this.props.dispatch({type:"HIDE_REMOTE_CAMERA"})
    }

	render(){
		let current_device = this.central_device
		let remote_device = this.props.remote_device

		if(IS_EMPTY(remote_device))
			var remote_content = (
				<View>
					<View style={{alignItems:"center",width:width,paddingVertical:20}}>
						<View style={{flexDirection:"row"}}>
							<View>
								<Image 
									source={require('../images/central_unit_icon.imageset/central_unit_icon.png')} 
									style={{width:50,height:50}}
								/>
							</View>
							<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
								<Text style={{textAlign:"center",justifyContent:"center"}}> 
									{current_device.manufactured_data.hardware_type == "01" ? "Remote Unit" : "Central Unit"} 
								</Text>
								<Text style={{fontSize:22,textAlign:"center"}}>
									{current_device.manufactured_data.hardware_type == "01" ? "Scan Remote Unit" : "Scan Central Unit"} 
								</Text>
							</View>
						</View>

						<ScanRemoteUnits 
							navigation={this.props.navigation} 
							showAlertConfirmation={() => this.showAlertConfirmation()} 
							master_device={current_device}
							onSuccess = {(e) => this.onSuccess(e)}
						/>

					</View>
				</View>
			)
		else{
				var remote_content = (
					<View style={{width:width,flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
						<View style={{width:width/3}}>
							<Image 
								source={require('../images/central_unit_icon.imageset/central_unit_icon.png')} 
								style={{width:width/3}}
							>
							</Image>
						</View>
						<View style={{}}>
							<Text style={{textAlign:"center"}}>
								{current_device.manufactured_data.hardware_type == "01" ? "Remote Unit" : "Central Unit"} 
							</Text>
							<Text style={{fontSize:22,textAlign:"center"}}>
								{remote_device.manufactured_data ? (remote_device.manufactured_data.device_id ? remote_device.manufactured_data.device_id.toUpperCase() : "UNKNOWN" ) : "UNKNOWN"}
							</Text>
						</View>						
					</View>
				)
			}
			
		return(
			<Background>
				<View style={{marginVertical:20}}>
					<View style={styles.touchableSectionContainer}>
						<View  style={styles.touchableSection}>
							<View style={{width:width,flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
								<View style={{width:width/3}}>
									<Image 
										source={require('../images/central_unit_icon.imageset/central_unit_icon.png')} 
										style={{width:width/3}}
									>
									</Image>
								</View>
								<View style={{}}>
									<Text style={{textAlign:"center"}}>
										{current_device.manufactured_data.hardware_type == "01" ? "Sure-Fi Bridge Central" : "Sure-Fi Bridge Remote"} 
									</Text>
									<Text style={{fontSize:22,textAlign:"center"}}>
										{current_device.manufactured_data ? (current_device.manufactured_data.device_id ? current_device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") }
									</Text>
								</View>
							</View>
						</View>
					</View>					
				</View>
				<View style={{marginVertical:20}}>
					<View style={{backgroundColor:"white"}}>
						{remote_content}
					</View>
				</View>
				{!IS_EMPTY(current_device) && !IS_EMPTY(remote_device) &&
					(
				        <View style={{flex:1,flexDirection:"row",marginTop:10,marginHorizontal:10}}>
				            <TouchableHighlight
				            	style={{flex:0.5,backgroundColor: "red",alignItems:"center",justifyContent:"center",borderRadius:10,marginRight:10,height:50}}
				            	onPress={() =>  this.props.dispatch({type: "RESET_REMOTE_REDUCER"})}
				            >
				                <Text style={{color:"white",fontSize:16}}>
				                    Reset
				                </Text>
				            </TouchableHighlight>
				        </View>
					)
				}								
			</Background>
		)
	}
}

const mapStateToProps = state => ({
  	remote_matched : state.scanRemoteReducer.remote_device_matched,
  	scan_result_id : state.scanRemoteReducer.scan_result_id,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices,
  	device_status : state.setupCentralReducer.device_status,
  	manager : state.scanCentralReducer.manager,
  	remote_device_status : state.scanRemoteReducer.remote_device_status,
  	device: state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(PairBridge);