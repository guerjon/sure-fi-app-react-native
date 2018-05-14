import React, {Component} from 'react'
import { connect } from 'react-redux';
import Background from '../../helpers/background'
import {
	TouchableHighlight,
	View,
	Text,
	Alert,
    NativeModules,
    NativeEventEmitter,
    ScrollView
} from 'react-native'

import {
    HEADERS_FOR_POST,
    GET_HEADERS,
    prettyBytesToHex,
    bytesToHex,
} from '../../constants.js'

import {
    IS_CONNECTED
} from '../../action_creators'

const APPLICATION_TYPE = 1
const RADIO_TYPE = 2
const BLUETOOTH_TYPE = 3

class FirmwareUpdate extends Component{

	constructor(props) {
    	super(props);	
        this.device = this.props.device
    }

    startAllFirmwareUpdate(){
        this.props.dispatch({type: "SET_COMPLETE_FIRMWARE_UPDATE_ON_COURSE",complete_firmware_update_on_course: true})
        this.props.startFirmwareUpdate(RADIO_TYPE)
    }

    startRadioAndAplicationFirmwareUpdate(){
        this.props.dispatch({type: "SET_RADIO_AND_APLICATION_FIRMWARE_UPDATE",radio_and_aplication_firmware_update: true})
        this.props.startFirmwareUpdate(RADIO_TYPE)
    }

    startRadioBluetoothFirmwareUpdate(){
        this.props.dispatch({type: "SET_RADIO_AND_BLUETOOTH_FIRMWARE_UPDATE",radio_and_bluetooth_firmware_update: true})
        this.props.startFirmwareUpdate(RADIO_TYPE)   
    }

    startApplicationAndBluetoothFirmwareUpdate(){
        this.props.dispatch({type: "SET_APPLICATION_AND_BLUETOOTH_FIRMWARE_UPDATE",application_and_bluetooth_firmware_update:true})
        this.props.startFirmwareUpdate(APPLICATION_TYPE)
    }

	render(){

		return(
			<Background>
				<ScrollView>
					<TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(RADIO_TYPE)}>
						<Text style={{color:"white"}}>
							Start Radio
						</Text>
					</TouchableHighlight>
                    <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(APPLICATION_TYPE)}>
                        <Text style={{color:"white"}}>
                            Start App
                        </Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.props.startFirmwareUpdate(BLUETOOTH_TYPE)}>
                        <Text style={{color:"white"}}>
                            Start Bluetooth
                        </Text>
                    </TouchableHighlight>


                    <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startRadioAndAplicationFirmwareUpdate()}>
                        <Text style={{color:"white"}}>
                            Start Radio and Aplication
                        </Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startRadioBluetoothFirmwareUpdate()}>
                        <Text style={{color:"white"}}>
                            Start Radio and Bluetooth Firmware Update
                        </Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startApplicationAndBluetoothFirmwareUpdate()}>
                        <Text style={{color:"white"}}>
                            Start Application and Bluetooth Firmware Update
                        </Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={{padding:10,backgroundColor:"green",padding:20,alignItems:"center",margin:20}} onPress={() => this.startAllFirmwareUpdate()}>
                        <Text style={{color:"white"}}>
                            Start All FirmwareUpdate
                        </Text>
                    </TouchableHighlight>

				</ScrollView>
			</Background>
		)
	}
}

const mapStateToProps = state => ({
	device : state.scanCentralReducer.central_device,
	app_board_version : state.setupCentralReducer.app_board_version,
  	radio_board_version : state.setupCentralReducer.radio_board_version,
    bluetooth_version : state.setupCentralReducer.bluetooth_version,
    devices : state.pairReducer.devices,
    progress : state.firmwareUpdateReducer.progress,
    bootloader_info : state.updateFirmwareCentralReducer.bootloader_info,
    complete_firmware_update_on_course: state.updateFirmwareCentralReducer.complete_firmware_update_on_course,
    radio_and_aplication_firmware_update: state.updateFirmwareCentralReducer.radio_and_aplication_firmware_update,
    radio_and_bluetooth_firmware_update: state.updateFirmwareCentralReducer.radio_and_bluetooth_firmware_update,
    application_and_bluetooth_firmware_update: state.updateFirmwareCentralReducer.application_and_bluetooth_firmware_update
});

export default connect(mapStateToProps)(FirmwareUpdate);