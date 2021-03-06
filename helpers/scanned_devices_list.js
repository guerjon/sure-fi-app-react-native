import React, {
    Component
} from 'react'
import {
    Text,
    View,
    Image,
    ScrollView,
    TouchableHighlight,
    ActivityIndicator,
    Alert,
    NativeModules,
    NativeEventEmitter,
    FlatList,
    StyleSheet
} from 'react-native'

import {
    styles,
    first_color
} from '../styles/index.js'
import {
    connect
} from 'react-redux';
import {
    TO_HEX_STRING,
    SUREFI_CMD_SERVICE_UUID,
    SUREFI_CMD_WRITE_UUID,
    IS_EMPTY,
    FIND_ID,
    DIVIDE_MANUFACTURED_DATA,
    PAIR_SUREFI_SERVICE, 
    PAIR_SUREFI_WRITE_UUID
} from '../constants'




class ScannedDevicesList extends Component {

    constructor(props) {
    	super(props);
        this.manager = this.props.manager;
        this.devices =  this.props.devices
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

    renderDevicesList(devices){
    	return (
			<ScrollView style={{marginTop:20}}>
				<View>
					<FlatList data={this.props.devices} renderItem={(item) => this.renderDevice(item)} keyExtractor={(item,index) => item.id } />	
				</View>
			</ScrollView>
    	)
    }



    render() {
        var {
            devices,
            central_device,
            list_status
        } = this.props;
        if(list_status == "showed"){
	    	if(this.props.devices.length > 0){
				var devices_content = this.renderDevicesList(this.props.devices)
			}else{
				var devices_content = <ActivityIndicator style={{marginTop:40}}/>
			}

        }else{
			var devices_content = null
        }


       return <View>{devices_content}</View>
    }
}

const mapStateToProps = state => ({
    central_device: state.scanCentralReducer.central_device,
    central_device_status: state.configurationScanCentralReducer.central_device_status,
    central_matched : state.scanCentralReducer.central_device_matched,
  	remote_matched : state.scanRemoteReducer.remote_device_matched,
  	remote_device : state.scanRemoteReducer.remote_device,
  	devices : state.pairReducer.devices,
  	remote_devices : state.pairReducer.remote_devices,
  	remote_device_status : state.configurationScanRemoteReducer.remote_device_status,
  	list_status : state.scannedDevicesListReducer.list_status,
});

export default connect(mapStateToProps)(ScannedDevicesList);