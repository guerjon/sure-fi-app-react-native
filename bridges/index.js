import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	FlatList,
  	Alert,
  	NativeModules,
  	NativeEventEmitter,
  	TextInput
	} from 'react-native';

import {styles,first_color,width} from '../styles/index.js'
import  {connect} from 'react-redux';
import ScanCentralUnits from './scan_central_units'
import ScannedDevicesList from '../helpers/scanned_devices_list'
import Background from '../helpers/background'
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationActions } from 'react-navigation'
import { BleManager,Service,Characteristic } from 'react-native-ble-plx';
import {
 	SUREFI_SEC_SERVICE_UUID,
 	SUREFI_SEC_HASH_UUID,
 	ARRAY_BUFFER_TO_BASE64,
 	MATCH_DEVICE,
 	FIND_ID,
    DIVIDE_MANUFACTURED_DATA,
 } from '../constants' 

const helpIcon = (<Icon name="info-circle" size={40} color="black" />)
const bluetoothIcon = (<Icon name="bluetooth" size={30} color="black" />)
const refreshIcon = (<Icon name="refresh" size={30} color="black"/>)
const serialIcon = (<Icon name="keyboard-o" size={40} color="black"/>)
class Bridges extends Component{
	
	static navigationOptions ={
		title : "Scan Sure-Fi Code",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	constructor(props) {
		super(props);
		this.manager = new BleManager();
	}

	componentWillUnmount() {
		this.manager.stopDeviceScan();
	}

	showHelpAlert(){
		Alert.alert(
			"Instructions",
			"1. Locate the Qr Code found on your Sure-Fi Bridge \n\n "+
			"2. Using the viewfinder on this screen bring the CR Conde into focus. You may have to move the bridge closer or farther away from your device \n\n" +
			"3. When the code has been scanned,select \"Continue\" to connect the Sure-Fi Bridge."
		)
	}

	showOrHideDevicesList(){
		var {list_status,dispatch} = this.props;
		if(list_status == "showed"){
			dispatch({type : "HIDE_DEVICES_LIST"})
		}

		if(list_status == "hidden"){
			dispatch({type : "SHOW_DEVICES_LIST"})
		}
	}

	stopScanning(device){
		console.log("stopScanning()",device)
		this.manager.stopDeviceScan();
		const reset_stack = NavigationActions.reset({
            index : 1,
            actions : [
                NavigationActions.navigate({routeName:"Main"}),
                NavigationActions.navigate(
                	{
                		routeName:"DeviceControlPanel",
                		device : device,
                		dispatch: this.props.dispatch,
                		device_status:"first_connection",
                		fast_manager: this.manager
                	})
            ]
        })

        this.props.navigation.dispatch(reset_stack)
	}

    startScanning(){
        console.log("startScanning()")
        var devices = this.props.devices
        this.manager.startDeviceScan(null,null,(error,device) => {
            if(error){
                return
            }

            if (device.name == "Sure-Fi Brid" || device.name == "SF Bridge") {
                if (!FIND_ID(devices, device.id)) {       
                    var data = this.getManufacturedData(device)
                    devices.push(data)
                    this.devices = devices
                    this.remote_devices = this.filterRemoteDevices(devices)
                    this.props.dispatch({type: "UPDATE_DEVICES",devices: this.devices,remote_devices: this.remote_devices})
                }                
            }
        })
    }

    filterRemoteDevices(devices){
    	let remote_revices = devices.filter(device => {
    		return device.manufactured_data.hardware_type == "02"
    	})
    	return remote_revices
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


	renderDeviceList(){
		if(this.props.scanning_status != "")
			return <ScannedDevicesList manager={this.manager} devices={this.devices}/>
		else
			return null 
	}

	searchDeviceBySerial(id){
		let device_id = id.toUpperCase()
		this.scan_result = device_id
		var { dispatch,navigation} = this.props;
	    var devices = this.props.devices
        var matched_device = []

		if(device_id.length == 6){
            if(devices){// the scanner should found some devices at this moment, if not just keep looking 
                
                var matched_devices = MATCH_DEVICE(devices,device_id) //MATCH_DEVICE_CONSTANT looks for devices with the same qr scanned id 
                if (matched_devices.length > 0) {  //if we found devices, now we need be sure that the matched devices are central i.e hardware_type == 01 return true
                
                    //matched_devices = constants.GET_CENTRAL_DEVICES(matched_devices)
                    if(matched_devices.length > 0){ // if centra_devices > 0 this means we found a device with the same qr scanned id and its a central _device
                
                        
                        if(matched_devices.length > 0){
                
                            var matched_device = matched_devices[0]
                            dispatch({
                                type: "CENTRAL_DEVICE_MATCHED",
                                central_device: matched_device
                            });

                            this.stopScanning(matched_device)
                        }else{
                        
                            dispatch({
                                type: "CENTRAL_DEVICE_IS_NOT_ON_PAIRING_MODE"
                            })                        
                        }
                    }else{
                        
                        dispatch({
                            type : "IS_NOT_CENTRAL_DEVICE"
                        })

                    }
                }else{
                    
                    dispatch({
                        type: "CENTRAL_DEVICE_NOT_MATCHED",
                    })
                }
            }   
		}
	}

	showOrHideSerialInput(){
		if(this.props.show_serial_input){
			this.props.dispatch({type:"HIDE_SERIAL_INPUT"})
		}else{
			this.props.dispatch({type:"SHOW_SERIAL_INPUT"})
		}
	}

	render(){

		/*
			<TouchableHighlight style={{marginLeft:25}} onPress={() => this.researchDevices()}>
				{refreshIcon}
			</TouchableHighlight>
			<TouchableHighlight style={{marginLeft:25}} onPress={() => this.showOrHideDevicesList()}>
				{bluetoothIcon}
			</TouchableHighlight>
		*/
		return(
			<Background>
				<ScrollView style={{flex:1,marginHorizontal:10}}>
					<View style={{height:250,alignItems:"center",marginBottom:60}}>
						<ScanCentralUnits 
							navigation={this.props.navigation} 
							stopScanning={(device)=> this.stopScanning(device)}
							scanResult = {this.scan_result}
							manager = {this.manager}
							startScanning = {() => this.startScanning()} 
						/>
					</View>
					<View style={{flexDirection:"row"}}>
						<View style={{alignItems:"center",justifyContent:"center",flex:1,flexDirection:"row"}}>	
							<View>
								<TouchableHighlight style={{marginRight: 30}} elevation={5} onPress={() => this.showOrHideSerialInput()} >
									{serialIcon}
								</TouchableHighlight>
							</View>
							<View>
								<Image  
									source={require('../images/instruction_image_1.imageset/instruction_image.png')} 
									style={{width:80,height:100}}
								/>	
							</View>
							<View>
								<TouchableHighlight style={{marginLeft: 30}} elevation={5} onPress={() => this.showHelpAlert()} >
									{helpIcon}
								</TouchableHighlight>
							</View>
						</View>
					</View>
					<View>
					{ this.props.show_serial_input && (
						<View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
							<View style={{width:width-200,height:50,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
								<View style={{alignItems:"center",justifyContent:"center",height:50,width:width-200}}>
									<TextInput 
										maxLength={6}
										style={{flex:1,justifyContent:"center",fontSize:25,width:width-200}} 
										underlineColorAndroid="transparent" 
										onChangeText={(t) => this.searchDeviceBySerial(t)}
									/>
								</View>
							</View>
						</View>
					)
					}
					</View>
					 <ScrollView>
						{this.renderDeviceList() } 
					</ScrollView>
				</ScrollView>
			</Background>

		);	
	}
}

const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    manufactured_data: state.scanCentralReducer.manufactured_data,
    scanning_status: state.scanCentralReducer.scanning_status,
    list_status : state.scannedDevicesListReducer.list_status,
    devices : state.pairReducer.devices,
    show_serial_input : state.scanCentralReducer.show_serial_input
})

export default connect(mapStateToProps)(Bridges)