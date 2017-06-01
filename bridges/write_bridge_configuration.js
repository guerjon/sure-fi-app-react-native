import React, { Component } from 'react'
import {View, Text,Image,TouchableHighlight,ScrollView,  Platform,
  PermissionsAndroid,
  NativeAppEventEmitter
} from 'react-native'
import {connect} from 'react-redux'
import {styles} from '../styles/index'
import modules from '../CustomModules.js'
import Icon from 'react-native-vector-icons/FontAwesome';
import {
	SCANNING_UNITS,
	CONNECTING_CENTRAL_UNIT,
	WRITING_CENTRAL_UNIT,
	WROTE_CENTRAL_UNIT,
	CONNECTING_REMOTE_UNIT,
	WRITING_REMOTE_UNIT,
	WROTE_REMOTE_UNIT,
	ERROR_ON_CENTRAL_SCANNING,
	ERROR_ON_CENTRAL_WROTE,
	ERROR_ON_REMOTE_SCANNING,
	ERROR_ON_REMOTE_WROTE,
	DEVICES_NOT_FOUNDED,
	ADD_DEVICES,
	TO_HEX_STRING
} from '../constants'
import BleManager from 'react-native-ble-manager';
var base64 = require('base64-js');
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const Base64 = {
  btoa: (input:string = '')  => {
    let str = input;
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

      charCode = str.charCodeAt(i += 3/4);

      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      
      block = block << 8 | charCode;
    }
    
    return output;
  },

  atob: (input:string = '') => {
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  }
};

const myIcon = (<Icon name="check" size={15} color="#00DD00" />)
const spinner = (<Icon name="spinner" size={15} color="gray" />)

class WriteBridgeConfiguration extends Component{

	static navigationOptions = {
		title : "Configuring Sure-Fi Bridge"
	}

	componentDidMount() {
		var {dispatch,central_device,remote_device} = this.props;
		dispatch({type: "RESET_STATE"})
    	BleManager.start({showAlert: false});
        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);

        NativeAppEventEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );      
        this.toggleScanning()
        

	}

	toggleScanning(){
		var {dispatch} = this.props;
		dispatch({type: SCANNING_UNITS})

		var scanning = setInterval( ()=> this.handleScan(), 3000);  

		setTimeout(() => this.stopScanning(scanning),10000)
	}

  	findId(data, idToLookFor) {
	    if(data){
	      for (var i = 0; i < data.length; i++) {
	          if (data[i].id == idToLookFor) {
	              return true
	          }
	      }      
	    }
    	return false;
  	}

	stopScanning(scanning){
	    var {dispatch,devices,central_device,remote_device} = this.props;
	    var new_bridges = this.getManufacturedData(devices)
	    clearInterval(scanning)
	    
	    if(devices.length > 0){
	      	
	      	this.connectCentral(central_device.id)
        	this.connectRemote(remote_device.id)
	    }
	    else  
	      dispatch({type: DEVICES_NOT_FOUNDED})
    
  	}

	handleDiscoverPeripheral(data){
		var {devices,dispatch} = this.props;

		var new_bridges = [];


		if(data.name == "SF Bridge"){
		  
		  if(!this.findId(devices,data.id)){
		    devices.push(data)
		    dispatch({type: ADD_DEVICES, devices : devices})

		  }else{
		    console.log("repetido",data.id)
		  }
		}
	}


	hexToBytes(hex) {
	  	for (var bytes = [], c = 0; c < hex.length; c += 2){
		  	var sub = hex.substr(c, 2);
		  	
		  	var parse_int = parseInt(sub, 16)
		  	bytes.push(parse_int);
	  	}
	  	return bytes;
	}

	handleScan() {
	    BleManager.scan([], 3, true)
	            .then((results) => {console.log('Scanning...'); });
	}  	

  	connectCentral(id){
  		console.log("connect_central id",id)
  		var {dispatch} = this.props;
  		dispatch({type : CONNECTING_CENTRAL_UNIT})
  		this.connect(id,"central");
  	}

  	connectRemote(id){
  		console.log("connect_remote id",id)
  		var {dispatch} = this.props;
  		dispatch({type : CONNECTING_REMOTE_UNIT})
  		this.connect(id,"remote");
  	}
	
	uint8ToString(u8a){
	  var CHUNK_SZ = 0x8000;
	  var c = [];
	  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
	    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
	  }
	  return c.join("");
	}

  	write(id,data,kind){

 		var {dispatch} = this.props;
 		var hex = this.hexToBytes(data)
	    var u8 = new Uint8Array(hex)
	    var b64encoded = Base64.btoa(this.uint8ToString(u8));
	    
	    BleManager.write(id, '98BF000A-0EC5-2536-2143-2D155783CE78', '98BF000C-0EC5-2536-2143-2D155783CE78', b64encoded)
	      .then(() => {
	        // Success code
	        console.log('Write on:+'+ id + ' ' + b64encoded);
	        BleManager.disconnect(id)
	          .then(() => {    
				if(kind == "central"){
		  			dispatch({type: WROTE_CENTRAL_UNIT})
		  		}else{
		  			dispatch({type: WROTE_REMOTE_UNIT})
		  		}
	            console.log('Disconnected' + id);
	          })
	          .catch((error) => {

	            console.log(error);
				if(kind == "central"){
		  			dispatch({type: ERROR_ON_CENTRAL_WROTE})
		  		}else{
		  			dispatch({type: ERROR_ON_REMOTE_WROTE})
		  		}
	          });
	      })
	      .catch((error) => {
	        console.log(error);
	      });
  	}

  	sureWrite(id,kind){
  		var {central_device,remote_device,dispatch} = this.props;
  		  if(kind == "central"){
		  	dispatch({type: WRITING_CENTRAL_UNIT})
		  	this.write(id,remote_device.manufactured_data.device_id,kind)
		  }else{
		  	dispatch({type: WRITING_REMOTE_UNIT})
		  	this.write(id,central_device.manufactured_data.device_id,kind)
		  }
  	}
 
	connect(id,kind){
		var {central_device,remote_device,dispatch} = this.props;
		BleManager.connect(id)
		.then((peripheralInfo) => {
		  // Success code
			setTimeout(() => this.sureWrite(id,kind),2000)
		  console.log('Connected to' + id);
		  
		})
		.catch((error) => {
			if(kind == "central")
		  		dispatch({type: ERROR_ON_CENTRAL_SCANNING})
		  	else{
		  		dispatch({type: ERROR_ON_REMOTE_SCANNING})
		  	}
		  console.log(error);
		});
	}

	bluetoothResult(result){
		
		var {dispatch,central_device,remote_device} = this.props;

		if(result == "901"){
			InitiateCentralWrite.write(
				central_device.manufactured_data.address,
				remote_device.manufactured_data.device_id,
				(central_connection_result) => this.centralConnectionResult(central_connection_result),
				(error) => this.deviceError(error),
			);

			InitiateRemoteWrite.write(
				remote_device.manufactured_data.address,
				central_device.manufactured_data.device_id,
				(remote_connection_result) => this.remoteConnectionResult(remote_connection_result),
				(error) => this.deviceError(error),
			);

		}else{
			dispatch({type: WRITE_BRIDGE_BLUETOOTH_ERROR})
		}
	}

	

	deviceError(error){
		Alert.alert(error);
	}

	getManufacturedData(devices){
		if(devices){
			var new_devices = [];
			for (var i = 0; i < devices.length; i++) {
			  var device = devices[i];
			  
			  device.manufactured_data = this.divideManufacturedData(device.new_representation,device.address);
			  delete device.manufacturerData;
			  new_devices.push(device);
			}
			return new_devices;
		}
	}

	/*
	* manufacturedData its an string 
	*/
	divideManufacturedData(manufacturedData,address){

		var divide_manufactured_data = {}
		manufacturedData = TO_HEX_STRING(manufacturedData)
		divide_manufactured_data.hardware_type = manufacturedData.substr(0,2) // 01 or 02
		divide_manufactured_data.firmware_version = manufacturedData.substr(2,2) //all four bytes combinations
		divide_manufactured_data.device_state = manufacturedData.substr(4,4)
		divide_manufactured_data.device_id = manufacturedData.substr(8,6);
		divide_manufactured_data.paired_id = manufacturedData.substr(14,6)
		divide_manufactured_data.address = address;
		/*
			console.log("device info ----------------------")
			console.log("hardware_type: ", divide_manufactured_data.hardware_type)
			console.log("firmware_version",divide_manufactured_data.firmware_version)
			console.log("device_state",divide_manufactured_data.device_state)
			console.log("device_id",divide_manufactured_data.device_id)
			console.log("paired_id",divide_manufactured_data.paired_id)
			console.log("address",divide_manufactured_data.address)
			console.log("device_state ----------------------")
		*/
		return divide_manufactured_data;
	}   

	smartBack(){

		this.props.navigation.goBack()

	}

	render(){
		var {
			write_bridge_bluetooth_error,
			scanning_units,
			connecting_central_unit,
			connecting_remote_unit,
			writing_central_unit,
			writing_remote_unit,
			wrote_remote_unit,
			wrote_central_unit,
			error_on_central_scanning,
			error_on_central_wrote,
			error_on_remote_scanning,
			error_on_remote_wrote,
		} = this.props;
		
		if(write_bridge_bluetooth_error){
			<ScrollView style={styles.pairContainer} >
				<Image  
					source={require('../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>
					<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
						<View style={{backgroundColor:"white",width: 20,height:20}}>
							Bluetooth device is turned off
						</View>
					</View>
				</Image>
			</ScrollView>
		}

		return(
			<ScrollView style={styles.pairContainer} >
				<Image  
					source={require('../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>	
					<View style={styles.rowContainer}>
						<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Central Unit
								</Text>
							</View>
						<View style={styles.rowContainerContainer}>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Scanning Central Unit
								</Text>
								<Text style={styles.simpleRowText}>
									{scanning_units ? myIcon : spinner } 
								</Text>
							</View>
							
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Connected
								</Text>
								<Text style={styles.simpleRowText}>
									{connecting_central_unit ? myIcon : spinner } 
								</Text>
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Configured
								</Text>
								<Text style={styles.simpleRowText}>
									{writing_central_unit ? myIcon : spinner } 
								</Text>						
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Paired
								</Text>
								<Text style={styles.simpleRowText}>
									{wrote_central_unit ? myIcon : spinner } 
								</Text>						
							</View>
						</View>
					</View>
					<View style={styles.rowContainer}>
							<View style={styles.titleContainer}>
								<Text style={styles.title}>
									Remote Unit
								</Text>
							</View>
						<View style={styles.rowContainerContainer} >
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Scanning Remote Unit
								</Text>
								<Text style={styles.simpleRowText}>
									{scanning_units ? myIcon : spinner } 
								</Text>
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Remote Unit Connected
								</Text>
								<Text>
								{connecting_remote_unit ? myIcon : spinner }
								</Text>
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Remote Unit Configured
								</Text>
								<Text style={styles.simpleRowText}>
									{writing_remote_unit ? myIcon : spinner }
								</Text>						
							</View>
							<View style={styles.simpleRow}>
								<Text style={styles.simpleRowText}>
									Central Unit Paired
								</Text>
								<Text style={styles.simpleRowText}>
									{wrote_remote_unit ? myIcon : spinner }
								</Text>						
							</View>
						</View>
					</View>
					{ (wrote_remote_unit && wrote_central_unit) &&
						<View style={{alignItems:"center",justifyContent:"center"}}>
							<Text>Success!</Text>

							<TouchableHighlight style={{backgroundColor:"#00DD00",padding:10,borderRadius:10}} onPress={() => this.smartBack() }>
								<Text style={{color:"white",fontSize:16}}>
									Continiue
								</Text>
							</TouchableHighlight>
						</View>							
					}
				</Image>
			</ScrollView> 
		)
	}
}

const mapStateToProps = state => ({
	scanning_units  : state.writeBridgeConfigurationReducer.scanning_units,
	connecting_central_unit : state.writeBridgeConfigurationReducer.connecting_central_unit,
	writing_central_unit : state.writeBridgeConfigurationReducer.writing_central_unit,
	wrote_central_unit : state.writeBridgeConfigurationReducer.wrote_central_unit,
	connecting_remote_unit : state.writeBridgeConfigurationReducer.connecting_remote_unit,
	writing_remote_unit : state.writeBridgeConfigurationReducer.writing_remote_unit,
	wrote_remote_unit : state.writeBridgeConfigurationReducer.wrote_remote_unit,
	error_on_central_scanning : state.writeBridgeConfigurationReducer.error_on_central_scanning,
	error_on_central_wrote  : state.writeBridgeConfigurationReducer.error_on_central_wrote,
	error_on_remote_scanning : state.writeBridgeConfigurationReducer.error_on_remote_scanning,
	error_on_remote_wrote : state.writeBridgeConfigurationReducer.error_on_remote_wrote,

  	central_device: state.scanCentralReducer.central_device,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices,

});

export default connect(mapStateToProps)(WriteBridgeConfiguration)
