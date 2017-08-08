import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	Alert,
  	ActivityIndicator,
  	Dimensions
} from 'react-native'
import {styles,first_color,option_blue} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	GET_HEADERS,
} from '../constants'

import BleManager from 'react-native-ble-manager'
import RNFetchBlob from 'react-native-fetch-blob'
import { NavigationActions } from 'react-navigation'
import ProgressBar from 'react-native-progress/Bar';

const BleManagerModule = NativeModules.BleManager;
const BluetoothModule = NativeModules.BluetoothModule
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const window = Dimensions.get('window');
var {
    height,
    width
} = window

import SelectFirmwareCentral from './bridges_configuration/select_firmware_central'

class BluetoothFirmwareUpdate extends Component{
/*	
	static navigationOptions ={
		title : "FirmwareUpdate",
		tabBarLabel: "Bluetooth",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
		tabBarIcon : ({ focused, tintColor }) =>  <Icon name="bluetooth" size={20} color="white"/>
	}*/
	
	constructor(props) {
		super(props);
		this.device = this.props.device
		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this)
		this.dfuCompletedEvent = this.dfuCompletedEvent.bind(this);
		this.updateGraph = this.updateGraph.bind(this)
		this.view_kind = props.viewKind
		this.firmware_file = props.firmwareFile
	}


	componentWillMount() {
		this.discoverPeripheral = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
		this.completedEvent = bleManagerEmitter.addListener("DFUCompletedEvent",this.dfuCompletedEvent)
		this.uGraph = bleManagerEmitter.addListener("DFUUpdateGraph",this.updateGraph)
		//this.props.dispatch({type : "RESET_FIRMWARE_UPDATE_REDUCER"})
	}

	componentWillUnmount() {
		this.discoverPeripheral.remove()
		this.completedEvent.remove()
		this.uGraph.remove()
	}

	componentDidMount() {
		if(this.view_kind == "normal")
			this.fetchFirmwareUpdate(this.firmware_file)
	}

	updateGraph(data){
		var {dispatch} = this.props;
		dispatch({type: "CHANGE_PROGRESS", new_progress: (data.percent * 0.01)})
	}

	dfuCompletedEvent(data){
		Alert.alert("Update Complete","The bluetooth update has been completed");
		this.props.resetStack()
	}

	searchDevices(){
		this.scanning = setInterval(() => {
			BleManager.scan([], 3, true).then(() => {
            	console.log('scanning...');
        	})
		} , 1000)
        this.devices = []
        setTimeout(() => {
        	if(this.scanning)
          	clearInterval(this.scanning)
        },60000)
	}

	fetchFirmwareUpdate(firmware_file){
		let path = firmware_file.firmware_path
		this.firmware_version = firmware_file.firmware_version
		if(path){
			RNFetchBlob.config({
			    // add this option that makes response data to be stored as a file,
			    // this is much more performant.
			    fileCache : true,
	  		})
			.fetch('GET', path,GET_HEADERS)
			
			.then((res) => {
				this.filePath = res.path()
				


				BleManagerModule.retrieveServices(this.device.id,() => {
					BleManagerModule.specialWrite(this.device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[0x1A],20)
						this.searchDevices()
				})	

			})
			.catch((errorMessage, statusCode) => {
			    console.log("ERROR",errorMessage)
			    //dispatch({"FIRMWARE_UPDATE_ERROR",error : })
			    // error handling 
			})

		}else{
			Alert.alert("File not found","The file firmware was not found.")
		}	
	
	}


	getStartRow(){
		var {progress,app_version} = this.props

		if(progress > 0){
			console.log("1")
			var content = (
				<View>
					<View style={{flexDirection:"row"}}>
						<View style={{flex:1}}>
							<Text style={{fontSize:16,padding:5}}>
								Updating Bluetooth
							</Text>
						</View>
						<View style={{flex: 1}}>
							<Text style={{alignSelf:"flex-end"}}>
								{progress.toFixed(2) * 100 } %
							</Text>
						</View>
					</View>
					<View>
						<View>
							<ProgressBar progress={progress} width={width-60} height={20} borderRadius={20} color={option_blue}/>
						</View>
					</View>
				</View>
			)
		}else{
			console.log("2")
			var content = (
				<ActivityIndicator />
			)
		}
		return(
			<View style={{padding:50}}>
				{content}
			</View>
		)
	}

	handleDiscoverPeripheral(device){
		var devices = this.devices;
		
		if(device.name){
	        if (device.name.toUpperCase() == "DFUT") {
	        	
	        	let short_id = this.device.manufactured_data.device_id.substring(2,6)
	        	
	        	if(device.new_representation == short_id){
					if(this.scanning){
          				clearInterval(this.scanning)
					}
					this.props.dispatch({type: "START_UPDATE"})
	        		BluetoothModule.initService(device.id,device.name,this.filePath)
	        	}
	        }
        }
	}


	render(){	

		return(
			<View style={{flex:1}}>
				<View style={{alignItems:"center"}}>
					<View style={{alignItems:"center"}}>
						<Text style={{fontSize:18,color:"black"}}>
							Current Radio Firmware Version
						</Text>
						<Text style={{fontSize:18,color:"black",fontWeight:"900"}}>
							{this.props.radio_version}
						</Text>
						<View style={{height:400}}>
							<SelectFirmwareCentral 
								device ={this.device}
								kind_firmware="radio" 
								fetchFirmwareUpdate={(file) => this.fetchFirmwareUpdate(file)}
								getStartRow={() => this.getStartRow()}
								firmware_files={this.props.firmware_files}
							/>
						</View>
					</View>
				</View>
			</View>
		);	
	}
}

const mapStateToProps = state => ({
	bluetooth_version : state.setupCentralReducer.bluetooth_version,
	devices : state.pairReducer.devices,
    progress : state.firmwareUpdateReducer.progress,
});

export default connect(mapStateToProps)(BluetoothFirmwareUpdate);
