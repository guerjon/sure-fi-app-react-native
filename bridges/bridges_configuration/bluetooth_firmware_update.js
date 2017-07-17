import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	Alert,
  	ActivityIndicator
} from 'react-native'
import {styles,first_color} from '../../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	SUREFI_CMD_SERVICE_UUID,
	SUREFI_CMD_WRITE_UUID,
	GET_HEADERS,
} from '../../constants'

import BleManager from 'react-native-ble-manager'
import RNFetchBlob from 'react-native-fetch-blob'
import { NavigationActions } from 'react-navigation'
import ProgressBar from 'react-native-progress/Bar';

const BleManagerModule = NativeModules.BleManager;
const BluetoothModule = NativeModules.BluetoothModule
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);


class BluetoothFirmwareUpdate extends Component{
	
	static navigationOptions ={
		title : "Bluetooth Firmware Update",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	constructor(props) {
		super(props);
		this.central_device = this.props.central_device
		bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => this.handleDiscoverPeripheral(data));
		bleManagerEmitter.addListener('DFUCompletedEvent',data => this.dfuCompletedEvent(data))
		bleManagerEmitter.addListener("DFUUpdateGraph",data => this.updateGraph(data))
		
		 // remote after finish the testing 
	}

	updateGraph(data){
		var {dispatch} = this.props;
		dispatch({type: "CHANGE_PROGRESS", new_progress: (data.percent * 0.01)})
	}

	componentWillMount() {
		this.props.dispatch({type : "RESET_FIRMWARE_UPDATE_REDUCER"})
		BleManagerModule.retrieveServices(this.central_device.id,() => {
			BleManagerModule.specialWrite(this.central_device.id,SUREFI_CMD_SERVICE_UUID,SUREFI_CMD_WRITE_UUID,[0x1A],20)
				this.searchDevices()
		})
	}

    connect() {
        var {
            central_device,
            dispatch
        } = this.props
        dispatch({
            type: "CONNECTING_CENTRAL_DEVICE"
        })
		const navigation_reset = NavigationActions.reset({
			index : 0,
			actions: [
				NavigationActions.navigate({routeName: "BridgesConfiguration",shouldConnect: "yes"})
			]
		})
		
		this.props.navigation.dispatch(navigation_reset)
    }

	dfuCompletedEvent(data){
		Alert.alert("Update Complete","The bluetooth update has been completed");
		this.connect()
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


	fetchFirmwareFile(id,name){
		var {dispatch} = this.props

		dispatch({type:"START_FETCH"})
		
		var {firmware_file} = this.props

		let path = firmware_file.firmware_path
		
		// send http request in a new thread (using native code) 
		
		RNFetchBlob.config({
		    // add this option that makes response data to be stored as a file,
		    // this is much more performant.
		    fileCache : true,
  		})
		.fetch('GET', path,GET_HEADERS)
		
		.then((res) => {
			BluetoothModule.initService(id,name,res.path())
		})
		 .catch((errorMessage, statusCode) => {
		    console.log("ERROR",errorMessage)
		    //dispatch({"FIRMWARE_UPDATE_ERROR",error : })
		    // error handling 
		  })
	}

	handleDiscoverPeripheral(device){
		var devices = this.devices;
		
		if(device.name){
	        if (device.name.toUpperCase() == "DFUT") {
	        	
	        	let short_id = this.props.central_device.manufactured_data.device_id.substring(2,6)
	        	
	        	if(device.new_representation == short_id){
					if(this.scanning){
          				clearInterval(this.scanning)
					}
	        		this.fetchFirmwareFile(device.id,device.name)
	        	}
	        }
        }
	}

	render(){	
		var {progress,dispatch} = this.props
		//var string_progress = progress.toString().substring(0)
		//
		var string_progress = (progress * 100).toString()
		if(string_progress.length > 3)
			string_progress = string_progress.substring(0,3)

		if(progress > 0){
			return(
				<ScrollView style={styles.pairContainer}>
					<Image  
						source={require('../../images/temp_background.imageset/temp_background.png')} 
						style={styles.image_complete_container}
					>	
						<View style={styles.pairSectionsContainer}>
							<View style={{alignItems:"center",justifyContent:"center"}}>
								<ProgressBar progress={progress} width={250} height={40}/>						
								<Text>
									Updating Firmware : {string_progress} %
								</Text>
							</View>
						</View>
					</Image>
				</ScrollView>
			);				
		}else{
			return (<View><ActivityIndicator/></View>)	
		}
	}
}

const mapStateToProps = state => ({
	central_device: state.scanCentralReducer.central_device,
    devices : state.pairReducer.devices,
    firmware_file : state.updateFirmwareCentralReducer.firmware_file,
    progress : state.firmwareUpdateReducer.progress,
});

export default connect(mapStateToProps)(BluetoothFirmwareUpdate);