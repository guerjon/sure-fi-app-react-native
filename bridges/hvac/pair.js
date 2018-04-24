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
import {styles,first_color,width,height} from '../../styles/index.js'
import { connect } from 'react-redux';
import { 
	IS_EMPTY,
	HEX_TO_BYTES,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	DIVIDE_MANUFACTURED_DATA,
	FIND_ID,
	MATCH_DEVICE,
	GET_DEVICES_ON_PAIRING_MODE,
    CENTRAL_SERIAL_HARDWARE_TYPE,
    REMOTE_SERIAL_HARDWARE_TYPE,
    CENTRAL_HARDWARE_TYPE,
    REMOTE_HARDWARE_TYPE,
    GET_PAIRING_TO_DEVICES,
    FORCE_PAIR,
    NORMAL_PAIR,
    EQUIPMENT_TYPE,
    THERMOSTAT_TYPE,
} from '../../constants'
import { NavigationActions } from 'react-navigation'
import BleManager from 'react-native-ble-manager'
import {COMMAND_MAKE_DEPLOY} from '../../commands'
import ScanRemoteUnits from '../scan_remote_units'
import Background from '../../helpers/background'
import {
	PUSH_CLOUD_STATUS,
	WRITE_PAIRING,
	CONNECT,
	READ_STATUS,
	DISCONNECT,
    HVAC_WRITE_COMMAND
} from '../../action_creators/index'

import {PhoneCmd_Pair} from '../../hvac_commands_and_responses'

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class HVACPair extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true,
    }

	constructor(props) {
		super(props);
		this.fast_manager = props.manager
		this.central_device = props.device
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.devices = []
	}

    componentWillMount() {
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
                case "willDisappear":
                    this.fast_manager.stopDeviceScan();
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

    showAlertConfirmation(remote_device_id){
  
        var remote_device_id = remote_device_id ? remote_device_id : this.props.remote_device_id;
    	var hardware_type = this.central_device.manufactured_data.hardware_type

        if(hardware_type == CENTRAL_HARDWARE_TYPE || hardware_type == CENTRAL_SERIAL_HARDWARE_TYPE){
            var central_id = this.central_device.manufactured_data.device_id
            var remote_id = remote_device_id.toUpperCase()
        }else{
            var central_id = remote_device_id.toUpperCase()
            var remote_id = this.central_device.manufactured_data.device_id
        }

        this.props.dispatch({type: "HIDE_REMOTE_CAMERA"})
    	Alert.alert(
    		"Continue Pairing",
    		"Are you sure you wish to Pair with the following Sure-Fi devices: \n \n" + "Controller : " + central_id + "\n\n" + " Remote : " + remote_id,
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
		this.props.navigator.pop()    	
    }

    scanDevices(){
        console.log("scanRemoteDevices()")
        var devices = this.devices

        this.fast_manager.startDeviceScan([],null,(error,device) => {
            if(error){
                console.log("error on scan devices",error)
                return
            }
            if(device.name){
                if (device.name.indexOf("Sure") !== -1){
                    
                    if (!FIND_ID(devices, device.id)) {   
                        var data = this.getManufacturedData(device)
                        delete data._manager
                        devices.push(data)
                        this.devices = devices
                    }                
                }
            }
        })
    }

    pair(){
    	console.log("pair()")
		var {remote_device,dispatch} = this.props
		
        let rxUUID = this.central_device.manufactured_data.device_id
    	let txUUID = remote_device.manufactured_data.device_id
		let remote_id_bytes = HEX_TO_BYTES(remote_device.manufactured_data.device_id)

        this.fast_manager.stopDeviceScan();

        if(!this.props.debug_mode_status)
            this.props.dispatch({type:"SET_PAIR_DISCONNECT",pair_disconnect: true})

        this.props.dispatch({type:"ALLOW_NOTIFICATIONS",allow_notifications:false})
        
        //this.props.saveOnCloudLog(remote_id_bytes,"PAIR")

        console.log("central_device.id",this.central_device.id)
        console.log("remote_id_bytes",remote_id_bytes)
        console.log("rxUUID",rxUUID)
        console.log("txUUID",txUUID)
        let data = [PhoneCmd_Pair,NORMAL_PAIR].concat(remote_id_bytes)
        console.log("data",data)
        HVAC_WRITE_COMMAND(this.central_device.id,data)
			.then(response => {
				//PUSH_CLOUD_STATUS(rxUUID,"04|04|" + rxUUID + "|" + txUUID)
		    	//.then(response => {	
                    
                    //console.log("response 0 on pair",response)

		    		//PUSH_CLOUD_STATUS(txUUID,"04|04|" + txUUID + "|" + rxUUID)
		    		//.then(response => {
                        //console.log("response on pair",response)

						this.central_device.manufactured_data.tx = txUUID
						this.central_device.manufactured_data.device_state = "0004";
						this.central_device.writePairResult = true
                        
                        this.props.dispatch({type: "SET_WRITE_PAIR_RESULT",write_pair_result : true})
			    		this.props.dispatch({type:"SET_WRITE_UNPAIR_RESULT",write_unpair_result: false})
                        
                        this.props.dispatch({
		                    type: "CENTRAL_DEVICE_MATCHED",
		                    central_device: this.central_device
		                });
                        
                        if(this.props.debug_mode_status){
                            this.props.dispatch({type: "NORMAL_CONNECTING_CENTRAL_DEVICE"})
                            setTimeout(() => this.props.readStatusOnDevice(this.central_device),1000)
                            setTimeout(() => this.props.searchPairedUnit(this.central_device),3000)
                        }

                        
		               
	    			//}).catch(error => console.log(error))
	    		//}).catch(error => console.log("error",error))
	    	}).catch(error => {console.log("error",error)})	
            this.props.navigator.pop();
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

    isDeviceOnPairingMode(device){
        console.log("isDeviceOnPairingMode",device)
        if(!device.manufactured_data)
            return false
        var state = device.manufactured_data.device_state.substring(2,4)

        if(state == "00"){
            return true
        }       
        return false        
    }

    matchDevice(device_id){
        console.log("matchDevice()",device_id)
        var {
            dispatch,
            navigation
        } = this.props;
        var hardware_type = this.central_device.manufactured_data.hardware_type
        var devices = this.devices
        var matched_device = []
        var device_on_pairing_mode_flag = false

        if(devices){// the scanner should found some devices at this moment, if not just keep looking 
            var matched_devices = MATCH_DEVICE(devices,device_id) //MATCH_DEVICE_CONSTANT looks for devices with the same qr scanned id 
            var device = matched_devices[0]

            if (device) {  
               //if we found devices, now we need be sure that the matched devices are the correct type to pair
               
                var correct_type = this.getCorrectPairType(this.central_device)
                console.log("device.manufactured_data.hardware_type",device.manufactured_data.hardware_type)
                console.log("correct_type",correct_type)

                if(device.manufactured_data.hardware_type == correct_type){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a REMOTE _device

                    device_on_pairing_mode_flag = this.isDeviceOnPairingMode(device) // now we need check the state of the device

                    if(device_on_pairing_mode_flag){
                        
                        dispatch({
                            type: "REMOTE_DEVICE_MATCHED",
                            remote_device: device
                        });

                        this.props.navigator.dismissLightBox();
                        this.showAlertConfirmation(device_id)
                        
                    }else{
                        this.showDeviceIsNotOnPairingMode(device_id)
                    }
                }else{
                    this.showCorrectErrorForPair(this.central_device)
                }
            }else{
                this.showDeviceNotFound(device_id)
            }
        }
    }

    showDeviceIsNotOnPairingMode(device_id){
        Alert.alert(
            "Pairing Error",
            "Device " + device_id.toUpperCase() +" is not on pairing mode.",
            [
                {text: "Accept", onPress: () => this.showCamera()}
            ],
            {
                cancelable: false
            }
        );   
    }

    showDeviceNotFound(device_id){
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




    showCorrectErrorForPair(device){
        var device_type = device.manufactured_data.hardware_type
        var correct_device = ""
        switch(device_type){
            case CENTRAL_HARDWARE_TYPE:
                correct_device = "Remote Sure-Fi Bridge"
            break
            case REMOTE_HARDWARE_TYPE:
                correct_device = "Controller Sure-Fi Bridge"
            break
            case CENTRAL_SERIAL_HARDWARE_TYPE:
                correct_device = "Remote Serial Sure-Fi Bridge"
            break
            case REMOTE_SERIAL_HARDWARE_TYPE:
                correct_device = "Controller Serial Sure-Fi Bridge"
            break
            default:
                correct_device = " "
            break
        }

        Alert.alert(
            "Pairing Error",
            "Device \n" + device.manufactured_data.device_id.toUpperCase() + "  \n needs be paired with a "+ correct_device +" .",
            [
                {text: "Accept", onPress: () => this.showCamera()}
            ],
            {
                cancelable: false
            }
        );        

    }

    getCorrectPairType(device){
        var device_type = device.manufactured_data.hardware_type 
        var correct_type = 0

        switch(device_type){
            case EQUIPMENT_TYPE:
                correct_type = THERMOSTAT_TYPE
            break
            case THERMOSTAT_TYPE:
                correct_type = EQUIPMENT_TYPE
            break
            default:
                correct_type = 0
            break
        }
        return correct_type
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
        var hardware_type = current_device.manufactured_data.hardware_type
        var first_string = ""
        var second_string = ""
        var third_string = ""

        if(hardware_type == CENTRAL_HARDWARE_TYPE || hardware_type == CENTRAL_SERIAL_HARDWARE_TYPE){
            first_string = "Remote Unit"
            second_string = "Scan Remote Unit"
            third_string = "Sure-Fi Bridge Controller"
        }else{  
            first_string = "Controller Interface"
            second_string = "Scan Controller Interface"
            third_string = "Sure-Fi Bridge Remote"
        }

		if(IS_EMPTY(remote_device))
			var remote_content = (
				<View>
					<View style={{alignItems:"center",width:width,paddingVertical:20}}>
						<View style={{flexDirection:"row"}}>
							<View>
								<Image 
									source={require('../../images/central_unit_icon.imageset/central_unit_icon.png')} 
									style={{width:50,height:50}}
								/>
							</View>
							<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
								<Text style={{textAlign:"center",justifyContent:"center"}}> 
									{first_string} 
								</Text>
								<Text style={{fontSize:22,textAlign:"center"}}>
									{second_string} 
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
								source={require('../../images/central_unit_icon.imageset/central_unit_icon.png')} 
								style={{width:width/3}}
							>
							</Image>
						</View>
						<View style={{}}>
							<Text style={{textAlign:"center"}}>
								{first_string} 
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
										source={require('../../images/central_unit_icon.imageset/central_unit_icon.png')} 
										style={{width:width/3}}
									>
									</Image>
								</View>
								<View style={{}}>
									<Text style={{textAlign:"center"}}>
										{third_string} 
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
  	manager : state.scanCentralReducer.fast_manager,
  	remote_device_status : state.scanRemoteReducer.remote_device_status,
  	device: state.scanCentralReducer.central_device,
    debug_mode_status : state.setupCentralReducer.debug_mode_status,
});

export default connect(mapStateToProps)(HVACPair);