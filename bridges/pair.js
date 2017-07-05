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
	FIND_ID,
	DIVIDE_MANUFACTURED_DATA
} from '../constants'
import modules from '../CustomModules.js'
import { NavigationActions } from 'react-navigation'
import BleManager from 'react-native-ble-manager'
const BleManagerModule = NativeModules.BleManager;


class PairBridge extends Component{
	
	static navigationOptions ={
		title : "Pair New Sure-Fi Bridge",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentDidMount() {
		var {dispatch} = this.props;
		this.manager = BleManagerModule
		dispatch({type: "RESET_PAIR_REDUCER"})
		var bleManagerEmitter = new NativeEventEmitter(this.manager)
		this.devices = this.props.devices;
		bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => this.handleDiscoverPeripheral(data));
        BleManager.start().then(() => {
        	this.searchDevices()
        });
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


	searchDevices(){
		this.scanning = setInterval(() => {
			BleManager.scan([], 3, true).then(() => {
            	console.log('handleScan()');
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
        //console.log(devices)
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
		this.props.navigation.navigate("ScanCentralUnits",{manager : this.manager,scan : this.scanning})
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

	showAlert(){
		Alert.alert(
			"Initiate Bridge Configuration",
			"Are you sure you are ready to initiate configuration of this Sure-Fi Bridge?",
			[
				{text: "Cancel",onPress : () => null},
				{text: "Continue",onPress : () => this.props.navigation.navigate("WriteBridgeConfiguration",{manager: this.manager})}
			]
		);
	}

	resetState(){
		var {dispatch} = this.props;
		dispatch({type : RESET_QR_CENTRAL_STATE});
		dispatch({type : RESET_QR_REMOTE_STATE});
	}

	render(){
		if(this.props.devices.length > 0)
			var devices_content = (
				<ScrollView>
					<FlatList data={this.props.devices} renderItem={(item) => this.renderDevice(item)} keyExtractor={(item,index) => item.id } />	
				</ScrollView>
			)
		else{
			var devices_content = <ActivityIndicator />
		}
		return(
			<View style={{flex:1}}>
				<ScrollView style={{flexDirection:"column"}}>
					<View style={{flex:1,alignItems:"center",justifyContent:"center",marginHorizontal:10}}>
						<Text style={{fontSize: 22,marginVertical: 10}}>
							Prepare for Paring 
						</Text>
						<Text style={{fontSize: 16,marginVertical:20}}> 
							1. Make sure both Central and Remote devices are set up, powered on and the QR Codes are clearly visible.
						</Text>
						<Text style={{fontSize: 16, marginBottom:20}}>
							2. Make sure that Bluetooth is enabled on this phone
						</Text>
					</View>
					<View style={{flex:1,marginHorizontal:10}}>
						<TouchableHighlight style={{backgroundColor:success_green,padding:10,alignItems:"center",justifyContent:"center"}} onPress={() => this.scanCentralDevices()} >
							<Text style={{fontSize:18,color:"white"}}>
								Start
							</Text>
						</TouchableHighlight>
					</View>
					<View style={{marginVertical:20}}>
						<Text style={{fontSize: 16,margin:10}}>
							SURE-FI DEVICES
						</Text>
						{devices_content}
					</View>
				</ScrollView>	
			</View>
		)
	}
}

const mapStateToProps = state => ({
  	central_matched : state.scanCentralReducer.central_device_matched,
  	central_device: state.scanCentralReducer.central_device,
  	remote_matched : state.scanRemoteReducer.remote_device_matched,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices
});

export default connect(mapStateToProps)(PairBridge);