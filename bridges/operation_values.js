import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	NativeModules,
  	NativeEventEmitter,
  	ActivityIndicator,
  	Alert
} from 'react-native'
import {styles,first_color,width,height} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	TWO_BYTES_TO_INT,
	byteArrayToLong,
	BYTES_TO_HEX,
	Hex2Bin,
	stringFromUTF8Array
} from '../constants'
import {WRITE_COMMAND} from '../action_creators'
import Background from '../helpers/background'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const text_style = {
	height:30,
	backgroundColor:"white",
	width:width/2,
	alignItems:"center",
	justifyContent:"center"
}


function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}


const Item = params => {
	console.log("params",params.snr);
	if(params.message_success){
		var text_style = {color:"green"} 
	}else{
		var text_style = {color: "red"}
	}

	return (
		<View>
			<Text style={styles.device_control_title}>
				{params.title}
			</Text>
			<View style={{flexDirection:"row"}}>
				<View>
					<View style={{height:30,backgroundColor:"gray",width:width/2,alignItems:"center",justifyContent:"center",borderRightWidth:1,borderRightColor:"white"}}>
						<Text style={{color:"white"}}>
							{params.removeSuccess ? "" : "Success"} 
						</Text>
					</View>
					<View style={{height:30,backgroundColor:"white",width:width/2,alignItems:"center",justifyContent:"center"}}>
						<Text style={text_style}>
							{params.success}
						</Text>
					</View>
				</View>
				<View >
					<View style={{height:30,backgroundColor:"gray",width:width/4,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
						<Text style={{color:"white"}}>
							RSSI
						</Text>
					</View>
					<View style={{height:30,backgroundColor:"white",width:width/4,alignItems:"center",justifyContent:"center"}}>
						<Text style={{color:"black"}}>
							{params.rssi}
						</Text>						
					</View>
				</View>
				<View >
					<View style={{height:30,backgroundColor:"gray",width:width/4,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
						<Text style={{color:"white"}}>
							SNR
						</Text>
					</View>
					<View style={{height:30,backgroundColor:"white",width:width/4,alignItems:"center",justifyContent:"center"}}>
						<Text style={{color:"black"}}>
							{params.snr} 
						</Text>					
					</View>
				</View>				
			</View>		
		</View>
	)
}

class OperationValues extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        title : "Scan Device",
    }

	constructor(props) {
		super(props);
		this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
		this.device = this.props.device
	}

	componentWillMount() {
		
		
		this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicNotification)
		
		this.getOperationValues()
	}

    componentWillUnmount() {
      this.props.activateHandleCharacteristic()
    }

	handleCharacteristicNotification(data){
			var device = this.device;
			switch(data.value[0]){
				case 0x19:
					data.value.shift()
					this.props.saveOnCloudLog(data.value,"OPERATINGVALUES")
					this.handleValues(data.value)

					break		
				default:
				break
			}
	}

	getOperationValues(){
		console.log("getOperationValues()");
		
		this.props.dispatch({type:"LOADING_OPERATION_VALUES",loading_operation_values:true})

		WRITE_COMMAND(this.device.id,[0x25])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))
	}

    handleValues(values){
    	console.log("handleValues()",values);

		this.values = values
		
		var values_hex = bytesToHex(values)

		var relayValues = parseInt(values_hex.substr(0,2),16)
		var wiegandValue = values_hex.substr(2,10)
		var wiegandBytes =  parseInt(values_hex.substr(12,2), 16)
		

		this.tryRelayValues(relayValues)
		this.tryWiegandValues(wiegandValue,wiegandBytes)
		this.tryTransmitValues(values_hex)
		this.tryRecieveValues(values_hex)
    }

	tryRelayValues(relayValues){
		var props = this.props

		if( (relayValues / 1) % 2 == 1 ){
			props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_1",central_relay_image_1: false})            
        } else {
        	props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_1",central_relay_image_1: true})
        }

        if( (relayValues / 2) % 2 == 1 ){
        	props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_2",central_relay_image_2: false})
        } else {
            props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_2",central_relay_image_2: true})
        }

        if( (relayValues / 4) % 2 == 1 ){
        
            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_1",remote_relay_image_1: false})
        } else {

            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_1",remote_relay_image_1: true})
        }

        if ((relayValues / 8) % 2 == 1 ){
            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_2",remote_relay_image_2: false})
        } else {
            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_2",remote_relay_image_2: true})
        }

        if( (relayValues / 16) % 2 == 1 ){
        	props.dispatch({type: "SET_LED_LABEL",led_label : true})
        } else {
        	props.dispatch({type: "SET_LED_LABEL",led_label: false})
        }

        if ((relayValues / 32) % 2 == 1) {
            props.dispatch({type: "SET_AUX_LABEL",aux_label : true})
        } else {
        	props.dispatch({type: "SET_AUX_LABEL",aux_label: false})
        }
	}


	tryWiegandValues(wiegandValue,wiegandBytes){

        var codeString = ""
        var facString = ""
        var rawString = wiegandValue
        let bitsString = wiegandBytes

        /*
	        console.log("wiegandValue",wiegandValue);
	        console.log("wiegandBytes",wiegandBytes);
	        console.log("rawString",rawString);
	        console.log("bitsString",bitsString);
		*/

		if(wiegandBytes == 4){
			
			codeString = parseInt(wiegandValue, 16) 

		}else if(wiegandBytes == 26){ 
			

			var wiegandValueBin = Hex2Bin(wiegandValue)

			var wiegandBinary = wiegandValueBin

			if(this.wiegandValueBin.length < 26){
				wiegandBinary = this.addZerosUntilNumber(wiegandValueBin,26) 
			}

			facString = parseInt(wiegandBinary.substr(1,8), 2) 
			codeString = parseInt(wiegandBinary.substr(9,16), 2) 



		}else if(wiegandBytes == 37){
			wiegandValueBin = Hex2Bin(wiegandValue)


			if(wiegandValueBin.length < 37){
				wiegandBinary = this.addZerosUntilNumber(wiegandValueBin,37) 
			}

			facString = parseInt(wiegandBinary.substr(1,16))
			codeString = parseInt(wiegandBinary.substr(17,19)) 
		}

		this.props.dispatch(
			{
				type: "SET_WIEGAND_VALUES",
				wiegand_values : {
					wiegand_binary: wiegandBinary,
					fac_bin_string: facString,
					code_string : codeString,
					wiegand_bytes: wiegandBytes,
					raw_string : rawString,
					bit_string: bitsString
				}
			}
		)

	}

	tryTransmitValues(values_hex){
		console.log("tryTransmitValues")

        if(values_hex.length > 26){
	        this.txSuccess = parseInt(values_hex.substr(14,2), 16)
	        this.numRetries = parseInt(values_hex.substr(16,2), 16) 
	        this.maxRetries = parseInt(values_hex.substr(18,2), 16)
	        this.rssiValue = 0 - (parseInt(values_hex.substr(20,4), 16) - 20)
	        this.snrValue = 0 - (parseInt(values_hex.substr(24,2) - 20), 16)
	        console.log("txSuccess",this.txSuccess);
	        this.props.dispatch(
	        	{
	        		type:"SET_TRANSMIT_VALUES",
	        		transmit_values: {
	        			txSuccess: this.txSuccess,
	        			numRetries: this.numRetries,
	        			maxRetries: this.maxRetries,
	        			rssiValue : this.rssiValue,
	        			snrValue : this.snrValue
	        		}
	        	}
	        )
        }

        this.props.dispatch({type: "LOADING_OPERATION_VALUES",loading_operation_values:false})

	}

	addZerosUntilNumber(string,number){
		
		do{
			string = 0 + string
		}while(string.length < number)
		
		return string
	}


	tryRecieveValues(values_hex){
		
        if(values_hex.length > 31){
        	var rssiValue_2 = values_hex.substr(26,4)
        	var snrValue_2 = values_hex.substr(30,2)
            
            
            rssiValue_2 = parseInt(rssiValue_2,16)
            snrValue_2 = parseInt(snrValue_2,16)

            
            rssiValue_2 = 0 - (rssiValue_2 - 20)
            snrValue_2 = 0 - (snrValue_2 - 20)

            
            this.props.dispatch(
            	{
            		type:"SET_RECEIVE_VALUES",
            		receive_values: {
            			rssiValue_2:rssiValue_2,
            			snrValue_2:snrValue_2
            		}
            	})
        }		
	}

	getCentralImages(){
		var relay_nc = <Image style={{width:80,height:80}} source={require('../images/relay_nc.imageset/relay_nc.png')} />
		var relay_no = <Image style={{width:80,height:80}} source={require('../images/relay_no.imageset/relay_no.png') }/>

		if(this.props.central_relay_image_1){
			var central_relay_image_1 = relay_nc
		}else{
			var central_relay_image_1 = relay_no
		}

		if(this.props.central_relay_image_2){
			var central_relay_image_2 = relay_nc
		}else{
			var central_relay_image_2 = relay_no
		}

		return (
			<View style={{flexDirection:"row"}}>
				<View>
					{central_relay_image_1}
					<Text style={{textAlign:"center",fontSize:12}}>
						Relay 1
					</Text>
				</View>
				<View>
					{central_relay_image_2}
					<Text style={{textAlign:"center",fontSize:12}}>
						Relay 2
					</Text>
				</View>
			</View>
		)
	}

	getRemoteImages(){
		var relay_nc = <Image style={{width:80,height:80}} source={require('../images/relay_nc.imageset/relay_nc.png')} />
		var relay_no = <Image style={{width:80,height:80}} source={require('../images/relay_no.imageset/relay_no.png') }/>

		if(this.props.remote_relay_image_1){
			var remote_relay_image_1 = relay_nc
		}else{
			var remote_relay_image_1 = relay_no
		}

		if(this.props.remote_relay_image_2){
			var remote_relay_image_2 = relay_nc
		}else{
			var remote_relay_image_2 = relay_no
		}

		return (
			<View style={{flexDirection:"row"}}>
				<View>
					{remote_relay_image_1}
					<Text style={{textAlign:"center",fontSize:12}}>
						Relay 1
					</Text>
				</View>
				<View>
					{remote_relay_image_2}
					<Text style={{textAlign:"center",fontSize:12}}>
						Relay 2
					</Text>
				</View>
			</View>
		)
	}

	renderRelaySettings(){
		return(
			<View>
				<Text style={styles.device_control_title}>
					RELAY SETTINGS
				</Text>
				<View style={{flexDirection:"row"}}>
					<View>
						<View style={{height:30,backgroundColor:"gray",width:width/2,alignItems:"center",justifyContent:"center",borderRightWidth:1,borderRightColor:"white"}}>
							<Text style={{color:"white"}}>
								Central Unit
							</Text>
						</View>
						<View style={{height:130,backgroundColor:"white",width:width/2,alignItems:"center"}}>
							{this.getCentralImages()}
							<View>
								<Text>
									Aux: {this.props.aux_label ? "Low" : "High"}
								</Text>
							</View>
						</View>
					</View>
					<View >
						<View style={{height:30,backgroundColor:"gray",width:width/2,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
							<Text style={{color:"white"}}>
								Remote Unit
							</Text>
						</View>
						<View style={{height:130,backgroundColor:"white",width:width/2,alignItems:"center"}}>
							{this.getRemoteImages()}
							<View>
								<Text>
									LED: {this.props.aux_label ? "ON" : "OFF"}
								</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
		)
	}

	doPrettyZeros(number){
		if(number == "0"){
			return "0x0000000000"
		}else{
			return "0x" + number
		}
	}

	renderWiegandValues(wiegand_values){
		return (
			<View>
				<Text style={styles.device_control_title}>
					WIEGAND VALUES
				</Text>
				<View style={{flexDirection:"row"}}>
					<View>
						<View style={{height:30,backgroundColor:"gray",width:width/2,alignItems:"center",justifyContent:"center",borderRightWidth:1,borderRightColor:"white"}}>
							<Text style={{color:"white"}}>
								Raw Data
							</Text>
						</View>
						<View style={text_style}>
							<Text>
								{this.doPrettyZeros(parseInt(wiegand_values.wiegand_bytes, 2).toString(16))}
							</Text>
						</View>
					</View>
					<View >
						<View style={{height:30,backgroundColor:"gray",width:width/4,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
							<Text style={{color:"white"}}>
								Code
							</Text>
						</View>
						<View style={{height:30,backgroundColor:"white",width:width/4,alignItems:"center",justifyContent:"center"}}>
							<Text >
								{wiegand_values.code_string}
							</Text>						
						</View>
					</View>
					<View >
						<View style={{height:30,backgroundColor:"gray",width:width/8,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
							<Text style={{color:"white"}}>
								FAC
							</Text>
						</View>
						<View style={{height:30,backgroundColor:"white",width:width/8,justifyContent:"center",alignItems:"center"}}>
							<Text>
								{wiegand_values.fac_bin_string}
							</Text>
						</View>
					</View>	
					<View >
						<View style={{height:30,backgroundColor:"gray",width:width/8,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
							<Text style={{color:"white"}}>
								Bits
							</Text>
						</View>
						<View style={{height:30,backgroundColor:"white",width:width/8,justifyContent:"center",alignItems:"center"}}>
							<Text>
								{wiegand_values.wiegand_bytes}
							</Text>
						</View>
					</View>												
				</View>		
			</View>
		)
	}

	renderTransmitValues(transmit_values){
		//console.log("transmit_values",transmit_values);
		if(transmit_values.txSuccess){
			var message = "Success " + transmit_values.numRetries + " of " + transmit_values.maxRetries + " Retries. " ;
			var message_success = true
		}else{
			var message = "Failure " + transmit_values.numRetries  + " of " + transmit_values.maxRetries + " Retries. ";
			var message_success = false
		}

		return(
			<View>
				<Item 
					title="TRANSMIT VALUES" 
					success={message} 
					rssi={transmit_values.rssiValue + " dBm"}
					snr={transmit_values.snrValue + " dBm"} 
					message_success = {message_success}
				/>
			</View>						
		)
	}

	renderReceiveValues(receive_values){
		return(
			<View>
				<Item 
					title="RECEIVE VALUES" 
					success=""
					rssi={receive_values.rssiValue_2 + " dBm"}
					snr={receive_values.snrValue_2 + " dBm"} 
					removeSuccess = {true}
				/>
			</View>
		)
	}

	render(){	
		if(this.props.loading_operation_values)
			return (
				<Background> 
					<View style={{height:height}}>
						<ActivityIndicator /> 
					</View>
				</Background>
			)
		/*console.log("wiegand_values",this.props.wiegand_values);
		console.log("transmit_values",this.props.transmit_values);
		console.log("receive_values",this.props.receive_values);*/

		return(
			<ScrollView style={styles.pairContainer}>
				<Background>
					<View style={{height:height+40}}>
						{this.renderRelaySettings()}
        				{this.renderWiegandValues(this.props.wiegand_values)}
    					{this.renderTransmitValues(this.props.transmit_values)}
    					{this.renderReceiveValues(this.props.receive_values)}
					</View>
				</Background>
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({
	device : state.scanCentralReducer.central_device,
	central_relay_image_1 : state.operationValuesReducer.central_relay_image_1,
	central_relay_image_2 : state.operationValuesReducer.central_relay_image_2,
	remote_relay_image_1 :  state.operationValuesReducer.remote_relay_image_1,
	remote_relay_image_2 : state.operationValuesReducer.remote_relay_image_2,
	led_label : state.operationValuesReducer.led_label,
	aux_label : state.operationValuesReducer.aux_label,
	loading_operation_values : state.operationValuesReducer.loading_operation_values,
	wiegand_values : state.operationValuesReducer.wiegand_values,
	transmit_values : state.operationValuesReducer.transmit_values,
	receive_values : state.operationValuesReducer.receive_values
} );

export default connect(mapStateToProps)(OperationValues);
