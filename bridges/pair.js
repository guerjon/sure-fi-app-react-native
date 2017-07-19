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
import modules from '../CustomModules.js'
import { NavigationActions } from 'react-navigation'
import BleManager from 'react-native-ble-manager'
import ScanRemoteUnits from './scan_remote_units'
import Background from '../helpers/background'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class PairBridge extends Component{
	
	static navigationOptions ={
		title : "Pair Sure-Fi Bridge",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}	

	componentWillMount() {
		this.central_device = this.props.navigation.state.params.central_device
	}

	componentDidMount() {
		this.props.dispatch({type: "RESET_REMOTE_REDUCER"})
	}

    showAlertConfirmation(){
    	this.props.dispatch({type: "HIDE_REMOTE_CAMERA"})
    	Alert.alert(
    		"Continue Pairing",
    		"Are you sure you wish to Pair the following Sure-Fi Devices: \n \n" + "Central : " + this.central_device.manufactured_data.device_id + "\n\n" + " Remote : " + this.props.remote_device.manufactured_data.device_id,
    		[
    		 	
    		 	{text : "Cancel", onPress: () => console.log(("CANCEL"))},
    		 	{text : "PAIR", onPress: () => this.pair() },
    		]
    	)	
    }

    resetStack(){
    	const resetActions = NavigationActions.reset({
    		index: 2,
    		actions : [
    			NavigationActions.navigate({routeName: "Main"}),
    			NavigationActions.navigate({routeName : "Bridges"}),
    			NavigationActions.navigate({routeName: "DeviceControlPanel"})
    		]
    	})
    	this.props.navigation.dispatch(resetActions)
    }

    tryToConnect(){
    	let device = this.props.remote_device

        var {
            navigation
        } = this.props;
        this.interval = setInterval(() => this.connect(device),1000);
    }

    connect(device) {
        var {
            dispatch
        } = this.props
        
    	BleManager.connect(device.id)
            .then((peripheralInfo) => {
            	if(this.interval){
            		clearInterval(this.interval)
            		this.pair()
            	}
            })
        .catch((error) => {
            console.log(error)
        });
        
    }

    pair(){
    	
		var {remote_device,dispatch} = this.props
		let remote_id_bytes = HEX_TO_BYTES(remote_device.manufactured_data.device_id)

    	BleManagerModule.retrieveServices(this.central_device.id,() => {
    		BleManager.write(this.central_device.id,PAIR_SUREFI_SERVICE,PAIR_SUREFI_WRITE_UUID,remote_id_bytes,20).then(() => {
    			Alert.alert(
							"Pairing Complete",
							"The pairing command has been successfully sent. Please test your Bridge and Confirm that it is functioning correctly.",
							[
								{text : "Ok",onPress: () => this.resetStack()}
							],
							{ cancelable: false }
						)
    			dispatch({type:"HIDE_CAMERA"})
    			this.props.navigation.goBack()
    		}).catch(error => console.log("error on Write Central",error))
    	})
    }

	render(){
		let central_device = this.central_device

		let remote_device = this.props.remote_device
		if(IS_EMPTY(remote_device))
			var remote_content = (
				<View style={{flexDirection: "row"}}>
					<ScanRemoteUnits navigation={this.props.navigation} />
					<View style={{flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
						<Text >
							Remote Unit
						</Text>
						<Text style={{fontSize:22}}>
							Scan Remote Unit
						</Text>
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
								Remote Unit
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
									<Text >
										Sure-Fi Bridge Central
									</Text>
									<Text style={{fontSize:22}}>
										{central_device.manufactured_data ? (central_device.manufactured_data.device_id ? central_device.manufactured_data.device_id.toUpperCase() : ("UNKNOWN") ) : ("UNKNOWN") }
									</Text>

									<Text style={{fontSize:18}}>
										Central Unit  {(central_device.manufactured_data ? central_device.manufactured_data.device_state : "Undefined") == "1301" ? "Unpaired" : "Paired"}
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
				{!IS_EMPTY(central_device) && !IS_EMPTY(remote_device) &&
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
				            <TouchableHighlight 
				            	style={{flex:1,backgroundColor: "#00DD00",alignItems:"center",justifyContent:"center",borderRadius:10,marginLeft:10,height:50}} 
				            	onPress={() => this.showAlertConfirmation()}
				            >
				                <Text style={{color: "white",fontSize:16}}>
				                    Continue
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
  	/*central_device:{
        new_representation: '01021303FF0FF0FF1FF1',
        rssi: -54,
        name: 'Sure-Fi Brid',
        id: 'C1:BC:40:D9:93:B9',
        advertising: {
          CDVType: 'ArrayBuffer',
          data: 'AgEGDf///wECEwP/D/D/H/ENCFN1cmUtRmkgQnJpZBEHeM6DVxUtQyE2JcUOCgC/mAAAAAAAAAAAAAAAAAA='
        },
        manufactured_data: {
          hardware_type: '01',
          firmware_version: '02',
          device_state: '1303',
          device_id: 'FF0FF0',
          tx: 'FF1FF1',
          address: 'C1:BC:40:D9:93:B9',
          security_string: [
            178,
            206,
            206,
            71,
            196,
            39,
            44,
            165,
            158,
            178,
            226,
            19,
            111,
            234,
            113,
            180
          ]
        }
      },
    */
  	remote_matched : state.scanRemoteReducer.remote_device_matched,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices,

});

export default connect(mapStateToProps)(PairBridge);