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
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	IS_EMPTY,
	HEX_TO_BYTES,
} from '../constants'
import { NavigationActions } from 'react-navigation'
import BleManager from 'react-native-ble-manager'

import ScanRemoteUnits from './scan_remote_units'
import Background from '../helpers/background'
import {
	PUSH_CLOUD_STATUS,
	WRITE_PAIRING,
	CONNECT,
	READ_STATUS,
	DISCONNECT
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
	}


	componentDidMount() {
		this.props.dispatch({type: "RESET_REMOTE_REDUCER"})
		this.props.dispatch({type: "SHOW_REMOTE_CAMERA"})
		
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

    	this.fast_manager.stopDeviceScan();

    	READ_STATUS(this.central_device.id)
    	.then(response => {
	    	this.pushStatusToCloud(response[0])

    	})
    	.catch(error => console.log("error",error))
    }

    pushStatusToCloud(response){
    	console.log("pushStatusToCloud()",response)

		var {remote_device,dispatch} = this.props
		let remote_id_bytes = HEX_TO_BYTES(remote_device.manufactured_data.device_id)

    	let device_id = this.central_device.manufactured_data.device_id
    	let remote_device_id = remote_device.manufactured_data.device_id
    	let expected_status = 3
    	let rxUUID = this.central_device.manufactured_data.device_id
    	let txUUID = remote_device.manufactured_data.device_id 
    	let remote_rxUUID = remote_device.manufactured_data.device_id
    	let remote_txUUID = this.central_device.manufactured_data.device_id

		let device_status = response
    	let hardware_status = "0" + device_status + "|" + "0" + expected_status + "|" + rxUUID + "|" + txUUID
    	let remote_hardware_status = "0" + device_status + "|" + "0" + expected_status + "|" + remote_rxUUID + "|" + remote_txUUID

    	PUSH_CLOUD_STATUS(device_id,hardware_status)
    	.then(response => {
    		
    		PUSH_CLOUD_STATUS(remote_device_id,remote_hardware_status)
    		.then(response => {
    			WRITE_PAIRING(this.central_device.id,remote_id_bytes)
    			.then(response => {
					this.central_device.manufactured_data.tx = remote_device.manufactured_data.device_id
					this.central_device.manufactured_data.device_state = "0003";
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
    	}).catch(error => {
    		console.log("error",error)
    	})
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


	render(){
		let current_device = this.central_device
		let remote_device = this.props.remote_device

		if(IS_EMPTY(remote_device))
			var remote_content = (
				<View>
					<View style={{flexDirection: "row"}}>
						<ScanRemoteUnits 
							navigation={this.props.navigation} 
							showAlertConfirmation={() => this.showAlertConfirmation()} 
							current_device={current_device}
						/>

						<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
							<Text >
								{current_device.manufactured_data.hardware_type == "01" ? "Remote Unit" : "Central Unit"} 
							</Text>
							<Text style={{fontSize:22}}>
								{current_device.manufactured_data.hardware_type == "01" ? "Scan Remote Unit" : "Scan Central Unit"} 
							</Text>
						</View>
					</View>
					<View style={{padding:20}}>
                        {this.props.remote_device_status ? this.getNoMatchedMessage() : null}
                    </View>
				</View>
			)
		else{
				var remote_content = (
					<View style={{flexDirection: "row"}}>
						<Image 
							source={require('../images/remote_unit_icon.imageset/remote_unit_icon.png')} 
							style={styles.touchableSectionInnerImage}
						>
						</Image>
						<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
							<Text >
								{current_device.manufactured_data.hardware_type == "01" ? "Remote Unit" : "Central Unit"} 
							</Text>
							<Text style={{fontSize:22}}>
								{remote_device.manufactured_data ? (remote_device.manufactured_data.device_id ? remote_device.manufactured_data.device_id.toUpperCase() : "UNKNOWN" ) : "UNKNOWN"}
							</Text>

							<Text style={{fontSize:18}}>
								Remote Unit {this.props.remote_device.manufactured_data.device_state == "1301" ? "Unpaired" : "Paired"}
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
							<View style={styles.touchableSectionInner}>
								<Image 
									source={require('../images/central_unit_icon.imageset/central_unit_icon.png')} 
									style={styles.touchableSectionInnerImage}
								>
								</Image>
								<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
									<Text>
										{current_device.manufactured_data.hardware_type == "01" ? "Sure-Fi Bridge Central" : "Sure-Fi Bridge Remote"} 
									</Text>
									<Text style={{fontSize:22}}>
										{current_device.manufactured_data ? (current_device.manufactured_data.device_id ? current_device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") }
									</Text>

									<Text style={{fontSize:18}}>
										{current_device.manufactured_data.hardware_type == "01" ? "Central Unit" : "Remote Unit"} {(current_device.manufactured_data ? current_device.manufactured_data.device_state : "Undefined") == "1301" ? "Unpaired" : "Paired"}
									</Text>
								</View>
							</View>
						</View>
					</View>					
				</View>
				<View style={{marginVertical:20}}>
					<View style={styles.touchableSectionContainer}>
						<View style={styles.touchableSection}>
							<View style={styles.touchableSectionInner}>
								{remote_content}
							</View>
						</View>
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