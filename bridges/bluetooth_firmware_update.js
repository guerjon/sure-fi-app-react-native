import React, {Component} from 'react'
import {
  	Text,
  	View,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	Alert,
  	ActivityIndicator,
  	Dimensions,
  	TouchableHighlight
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
import SelectFirmwareCentral from './bridges_configuration/select_firmware_central'

import {
	WRITE_COMMAND,
	IS_CONNECTED
} from '../action_creators'

const BleManagerModule = NativeModules.BleManager;
const BluetoothModule = NativeModules.BluetoothModule
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const window = Dimensions.get('window');
var {
    height,
    width
} = window

var scanning_interval = 0

class BluetoothFirmwareUpdate extends Component{
	
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
		clearInterval(this.scanning)
		this.discoverPeripheral.remove()
		this.completedEvent.remove()
		this.uGraph.remove()
	}

	componentDidMount() {
		if(this.view_kind == "normal")
			this.fetchFirmwareUpdate(this.firmware_file,this.props.version)
	}

	fetchFirmwareUpdate(path,version){
	
		if(path){
			RNFetchBlob.config({
			    // add this option that makes response data to be stored as a file,
			    // this is much more performant.
			    fileCache : true,
	  		})
			.fetch('GET', path,GET_HEADERS)
			
			.then((res) => {
				
				if(version){
					if(this.device.manufactured_data.hardware_type == "01")
						this.props.saveOnCloudLog(version,'FIRMWARE-CENTRAL-BLUETOOTH')
					else
						this.props.saveOnCloudLog(version,'FIRMWARE-REMOTE-BLUETOOTH')
				}	
				
				this.filePath = res.path()

		    	this.props.dispatch({
		    		type:"SET_DEPLOY_DISCONNECT",
		    		deploy_disconnect:true
		    	})	 

		    	console.log("Connected device UUID:" + this.device.id)
		    	console.log("Connected device id:" + this.device.device_id)
		    	console.log("Connected device name" + this.device.name)


				WRITE_COMMAND(this.device.id,[0x1A])
				this.searchDevices()

			})
			.catch((errorMessage, statusCode) => {
			    console.log("ERROR",errorMessage)
			    //dispatch({"FIRMWARE_UPDATE_ERROR",error : })
			    // error handling 
			})

		}else{
			//Alert.alert("File not found","The file firmware was not found.")
		}	
	
	}	

	updateGraph(data){
		var {dispatch} = this.props;
		dispatch({type: "CHANGE_PROGRESS", new_progress: (data.percent * 0.01)})
	}

	dfuCompletedEvent(data){
		Alert.alert("Update Complete","The firmware update has been completed");
		

		setTimeout(() => this.fastTryToConnect(this.device),2000)
		this.props.closeAndConnect()
	}

	fastTryToConnect(){
		console.log("fastTryToConnect()")
	    
		this.props.dispatch({type: "SET_DEPLOY_DISCONNECT",deploy_disconnect:true})
		this.props.dispatch({type: "BT_UPDATE_STATUS",radio_update_status : "updated"})

		IS_CONNECTED(this.device.id)
		.then(response => {
			if(!response)
				BleManager.connect(this.device.id).then(response => {
				})
		})
	}


	searchDevices(){
		if(scanning_interval == 0){
			scanning_interval = setInterval(() => {
				BleManager.scan([], 3, true).then(() => {
	        	})
			} , 2000)
	        this.devices = []
	        setTimeout(() => {
	        	this.stopScan()
	        },60000)			
		}else
			console.log("Can't start searchDevices, the scanning_interval is already active.")
	}

	stopScan(){
		if(scanning_interval != 0){
			clearInterval(scanning_interval)
			scanning_interval = 0
		}else{
			console.log("The scanning was stopped before")
		}
	}

	getStartRow(){
		var {progress,app_version} = this.props

		if(progress > 0){
			var content = (
				<View style={{backgroundColor:"white",width:width,height:100,alignItems:"center"}}>
					<View style={{justifyContent:"space-between"}}>
						<View >
							<Text style={{fontSize:16,padding:10,textAlign:"center"}}>
								Updating Bluetooth
							</Text>
						</View>
						<View style={{padding:10}}>
							<Text style={{textAlign:"center"}}>
								{Math.trunc(progress * 100)} %
							</Text>
						</View>
						<View>
							<ProgressBar progress={progress} width={width-60} height={5} borderRadius={5} color={option_blue}/>
						</View>
					</View>
				</View>
			)
		}else{
			return null
		}
		return(
			<View style={{padding:50}}>
				{content}
			</View>
		)
	}

	handleDiscoverPeripheral(device){
		
		console.log("device.name",device)

		if(device.name){
			console.log("1")
	        	
        	let short_id = this.device.manufactured_data.device_id.substring(2,6)
        	//console.log("this.device",this.device)
        	console.log("device",device.new_representation)
        	if(device.new_representation.indexOf(short_id) !== -1){

        		this.stopScan()
		    	
		    	this.props.dispatch({type:"SET_DEPLOY_DISCONNECT",deploy_disconnect:false})							
  				
  				this.props.dispatch({type: "START_UPDATE"})
  				
  				console.log("Founded Device  ID ",device.id)
				console.log("Founded Device  Name ",device.name.toUpperCase())

  				setTimeout(() => BluetoothModule.initService(device.id,device.name.toUpperCase(),this.filePath),2000)				
          	}
        }
	}

	handleKindOfView(file){
		console.log("handleKindOfView",file);

		if(this.view_kind == "normal"){
			
			this.fetchFirmwareUpdate(file,this.props.version)
		}else{

			var path = file.firmware_path
			var version = file.firmware_version
			this.fetchFirmwareUpdate(path,version)
		}
	}

	getAdvanceView(){
		console.log("getAdvanceView()")
		//console.log("this.props.firmware_files",this.props.firmware_files)
		var bi = this.props.bootloader_info

		return (
			<View style={{alignItems:"center"}}>
				<View style={{height:100,width:width-20,marginVertical:5,marginBottom:20,alignItems:"center",borderWidth:1,borderRadius:10}}>
					<View style={{padding:10,backgroundColor:"white",borderRadius:10}}>
						<View style={{flexDirection:"row",justifyContent:"space-between"}}>
							<Text style={{color:"black",fontSize:18,marginBottom:10}}>
								Bootloader App Data
							</Text>
						</View>
						<Text>
							Upper CRC: {bi.upperReadCrc} | {bi.upperCalcCrc} Version: {bi.upperVersionMajor}.{bi.upperVersionMinor} Prgm:{bi.upperProgramNumber}
						</Text>
						<Text>
							Lower CRC: {bi.lowerReadCrc}|{bi.lowerCalcCrc} Version: {bi.lowerVersionMajor}.{bi.lowerVersionMinor}  Prgm:{bi.lowerProgramNumber}
						</Text>
					</View>
				</View>		
				<View>
					<SelectFirmwareCentral 
						device ={this.device}
						kind_firmware="application" 
						fetchFirmwareUpdate={(file) => this.handleKindOfView(file)}
						getStartRow={() => this.getStartRow()}
						firmware_files={this.props.firmware_files}
					/>
				</View>
			</View>
		)
	}	

	render(){
		return(
			<View>
				<View style={{alignItems:"center"}}>
					<View style={{backgroundColor:"white"}}>
						{this.props.viewKind == "normal" ? this.getStartRow() : this.getAdvanceView()}				
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
    bootloader_info : state.updateFirmwareCentralReducer.bootloader_info
});

export default connect(mapStateToProps)(BluetoothFirmwareUpdate);