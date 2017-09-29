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
import {styles,first_color,success_green} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	LOADED,
	DEVICES_FOUNDED,
	DEVICES_NOT_FOUNDED,
	TO_HEX_STRING,
	SCANNING_CENTRAL_UNITS,
	SCANNING_REMOTE_UNITS,
	RESET_QR_CENTRAL_STATE,
	RESET_QR_REMOTE_STATE,
	IS_EMPTY,
	DIVIDE_MANUFACTURED_DATA,
	GET_REMOTE_DEVICES,
	PAIR_SUREFI_SERVICE,
	PAIR_SUREFI_WRITE_UUID,
	HEX_TO_BYTES,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID
} from '../constants'
import { NavigationActions } from 'react-navigation'
import BleManager from 'react-native-ble-manager'
import ScanRemoteUnits from './scan_remote_units'
import Background from '../helpers/background'
import { 
	PUSH_CLOUD_STATUS,
	WRITE_COMMAND,
	WRITE_PAIRING
} from '../action_creators/index'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class ForcePair extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

	constructor(props) {
		super(props);
		this.device = this.props.device
		this.hardware_status = this.props.hardware_status.split("|") //this should be something like "0x|0x|FFFFFF|FF1FF1"
		this.remote_device_id =   this.hardware_status[3]
	}

	componentDidMount() {
		this.props.dispatch({type: "RESET_REMOTE_REDUCER"})
	}

    forcePair(){
    	let txUUID = HEX_TO_BYTES(this.remote_device_id)
    
    	if(this.device.manufactured_data.hardware_type == "01")
    		var type_of_device = 0x1
    	else
    		var type_of_device = 0x2

    	WRITE_COMMAND(this.device.id,[0x20,type_of_device])
    	.then(() => {
    		WRITE_PAIRING(this.device.id,txUUID).then(() => {
    			
    			this.hardware_status[0] = "04"
    			let hardware_status = "04"  + "|" + "04" + "|" + this.hardware_status[2] + "|" + this.hardware_status[3]

    			PUSH_CLOUD_STATUS(this.device.manufactured_data.device_id,hardware_status)
    			.then(response => {

	    			this.device.manufactured_data.device_state = "0004"
	    			this.props.dispatch({
	                    type: "CENTRAL_DEVICE_MATCHED",
	                    central_device: this.device
	                });
	                
	                this.props.dispatch({type: "SET_INDICATOR_NUMBER",indicator_number: 4})

	                this.props.dispatch({type:"HIDE_CAMERA"})
	                this.props.navigator.dismissModal();
    			})

    		}).catch(error => console.log("error",error))
    	}).catch(error => console.log("error",error))
    }

	render(){
		
		let device = this.device
		let remote_device_id = this.remote_device_id

		if(device.manufactured_data.hardware_type == "01"){
			var first_title = "Sure-Fi Bridge Central"
			var second_title = "Central Unit UnPaired"

			var id_central = device.manufactured_data ? (device.manufactured_data.device_id ? device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") 

			var tx_first_title = "Sure-Fi Bridge Remote"
			var tx_second_title = "Remote Unit Paired"
			var remote_device = remote_device_id
		}
		else {
			var first_title = "Sure-Fi Bridge Remote"
			var second_title = "Remote Unit Unpaired"

			var id_central = remote_device_id

			var tx_first_title = "Sure-Fi Bridge Central"
			var tx_second_title = "Central Unit Paired"

			var remote_device = device.manufactured_data ? (device.manufactured_data.device_id ? device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") 
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
										{first_title}
									</Text>
									<Text style={{fontSize:22}}>
										{id_central}
									</Text>

									<Text style={{fontSize:18}}>
										{second_title}
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
								<View style={{flexDirection: "row"}}>
									<Image 
										source={require('../images/remote_unit_icon.imageset/remote_unit_icon.png')} 
										style={styles.touchableSectionInnerImage}
									>
									</Image>
									<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
										<Text >
											{tx_first_title}
										</Text>
										<Text style={{fontSize:22}}>
											{remote_device}
										</Text>

										<Text style={{fontSize:18}}>
											{tx_second_title}
										</Text>
									</View>					
								</View>
							</View>
						</View>
					</View>					
				</View>			
		        <View style={{flex:1,flexDirection:"row",marginTop:10,marginHorizontal:10}}>
		            <TouchableHighlight 
		            	style={{flex:0.5,backgroundColor: "red",alignItems:"center",justifyContent:"center",borderRadius:10,marginRight:10,height:50}} 
		            	onPress={() =>  this.forcePair()}
		            >
		                <Text style={{color:"white",fontSize:16}}>
		                    Force Pair
		                </Text>
		            </TouchableHighlight>

		        </View>							
			</Background>
		)
	}
}

const mapStateToProps = state => ({
  	remote_matched : state.scanRemoteReducer.remote_device_matched,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices,
  	device_status : state.setupCentralReducer.device_status,
  	hardware_status : state.setupCentralReducer.hardware_status,
  	device: state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(ForcePair);