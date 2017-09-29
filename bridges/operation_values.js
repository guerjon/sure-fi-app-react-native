import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
} from 'react-native'
import {styles,first_color,width,height} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	TWO_BYTES_TO_INT,
	byteArrayToLong,
	BYTES_TO_HEX,
	Hex2Bin
} from '../constants'
import Background from '../helpers/background'
const text_style = {
	height:30,
	backgroundColor:"white",
	width:width/2,
	alignItems:"center",
	justifyContent:"center"
}
const Item = params => {

	return (
		<View>
			<Text style={styles.device_control_title}>
				{params.title}
			</Text>
			<View style={{flexDirection:"row"}}>
				<View>
					<View style={{height:30,backgroundColor:"gray",width:width/2,alignItems:"center",justifyContent:"center",borderRightWidth:1,borderRightColor:"white"}}>
						<Text style={{color:"white"}}>
							Success
						</Text>
					</View>
					<View style={{height:30,backgroundColor:"white",width:width/2,alignItems:"center",justifyContent:"center"}}>
						<Text>
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
						<Text>
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
					<View style={{height:30,backgroundColor:"white",width:width/4}}>
						<Text style={{color:"white"}}>
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
		this.values = props.values
	}

	componentWillMount() {
		
		var values = this.values
		this.values_hex = BYTES_TO_HEX(this.values)
		
		this.relayValues = parseInt(this.values_hex.substr(0,2),16)
		this.wiegandValue = this.values_hex.substr(2,10)
		console.log("this.wiegand_values",this.wiegandValue)
		this.wiegandBytes =  parseInt(this.values_hex.substr(12,2), 16)
		console.log("this.wiegand_bytes",this.wiegandBytes)
		this.tryRelayValues()
		this.tryWiegandValues()
		this.tryTransmitValues()
	}

	tryRelayValues(){
		var props = this.props

		if( (this.relayValues / 1) % 2 == 1 ){
			props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_1",central_relay_image_1: false})            
        } else {
        	props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_1",central_relay_image_1: true})
        }

        if( (this.relayValues / 2) % 2 == 1 ){
        	props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_2",central_relay_image_2: false})
        } else {
            props.dispatch({type: "SET_CENTRAL_RELAY_IMAGE_2",central_relay_image_2: true})
        }

        if( (this.relayValues / 4) % 2 == 1 ){
        
            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_1",remote_relay_image_1: false})
        } else {

            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_1",remote_relay_image_1: true})
        }

        if ((this.relayValues / 8) % 2 == 1 ){
            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_2",remote_relay_image_2: false})
        } else {
            props.dispatch({type: "SET_REMOTE_RELAY_IMAGE_2",remote_relay_image_2: true})
        }

        if( (this.relayValues / 16) % 2 == 1 ){
        	props.dispatch({type: "SET_LED_LABEL",led_label : true})
        } else {
        	props.dispatch({type: "SET_LED_LABEL",led_label: false})
        }

        if ((this.relayValues / 32) % 2 == 1) {
            props.dispatch({type: "SET_AUX_LABEL",aux_label : true})
        } else {
        	props.dispatch({type: "SET_AUX_LABEL",aux_label: false})
        }
	}

	addZerosUntilNumber(string,number){
		
		do{
			string = 0 + string
		}while(string.length < number)
		
		return string
	}

	tryWiegandValues(){
		this.code_string = ""
		
		if(this.wiegandBytes == 4){
			
			this.code_string = parseInt(this.wiegandBytes, 16) 

		}else if(this.wiegandBytes == 26){ 
			this.wiegandValueBin = Hex2Bin(this.wiegandValue)
			
			if(this.wiegandValueBin.length < 26){
				this.wiegandBinary = this.addZerosUntilNumber(this.wiegandValueBin,26) 
			}

			console.log("this.wiegandBinary",this.wiegandBinary)

			this.fac_bin_string = parseInt(this.wiegandBinary.substr(1,8), 2) 
			this.code_string = parseInt(this.wiegandBinary.substr(9,16), 2) 

		}else if(this.wiegandBytes == 37){
			this.wiegandValueBin = Hex2Bin(this.wiegandValue)


			if(this.wiegandValueBin.length < 37){
				this.wiegandBinary = this.addZerosUntilNumber(this.wiegandValueBin,37) 
			}

			this.fac_bin_string = parseInt(this.wiegandBinary.substr(1,16))
			this.code_string = parseInt(this.wiegandBinary.substr(17,19)) 

		}else{
			this.wiegandBinary =  "000000" 
			this.fac_bin_string = "000000"
			this.code_string = "000000"
		}
	}

	tryTransmitValues(){
		var values_hex = this.values_hex
		console.log("this.values_hex",values_hex)

        if(this.values_hex.length > 26){
	        this.txSuccess = parseInt(values_hex.substr(14,2), 16)
	        this.numRetries = parseInt(values_hex.substr(16,2), 16) 
	        this.maxRetries = parseInt(values_hex.substr(18,2), 16)
	        this.rssiValue = 0 - (parseInt(values_hex.substr(20,4), 16) - 20)
	        this.snrValue = 0 - (parseInt(values_hex.substr(24,2) - 20), 16)
        }else{
	        this.txSuccess = 0
	        this.numRetries = 0
	        this.maxRetries = 0
	        this.rssiValue = 0 
	        this.snrValue = 0 
        }

	}


	tryRecieveValues(){
		var values_hex = this.values_hex
		console.log("this.values_hex",values_hex)

        if(this.values_hex.length > 32){
            this.rssiValue_2 = 0 - (parseInt(values_hex.substring(26,4),16) - 20)
            this.snrValue_2 = 0  - (parseInt(values_hex.substring(30,2),16) - 20)

        }else{
            this.rssiValue_2 = 0
            this.snrValue_2 = 0 

        }		
	}

	getCentralImages(){
		var relay_nc = <Image style={{width:100,height:100}} source={require('../images/relay_nc.imageset/relay_nc.png')} />
		var relay_no = <Image style={{width:100,height:100}} source={require('../images/relay_no.imageset/relay_no.png') }/>

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
				</View>
				<View>
					{central_relay_image_2}
				</View>
			</View>
		)
	}

	getRemoteImages(){
		var relay_nc = <Image style={{width:100,height:100}} source={require('../images/relay_nc.imageset/relay_nc.png')} />
		var relay_no = <Image style={{width:100,height:100}} source={require('../images/relay_no.imageset/relay_no.png') }/>

		if(this.props.remote_relay_image_1){
			var remote_relay_image_1 = relay_nc
		}else{
			var remote_relay_image_1 = relay_no
		}

		if(this.props.central_relay_image_2){
			var remote_relay_image_2 = relay_nc
		}else{
			var remote_relay_image_2 = relay_no
		}


		return (
			<View style={{flexDirection:"row"}}>
				<View>
					{remote_relay_image_1}
				</View>
				<View>
					{remote_relay_image_2}
				</View>
			</View>
		)
	}

	render(){	
		return(
			<ScrollView style={styles.pairContainer}>
				<Background>
					<View style={{height:height+40}}>
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
												Aux: {this.props.aux_label ? "Low" : "Hight"}
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
											{"0x" + parseInt(this.wiegandBinary, 2).toString(16) }
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
											{this.code_string}
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
											{this.fac_bin_string}
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
											{this.wiegandBytes}
										</Text>
									</View>
								</View>												
							</View>		
						</View>
        
    

						<View>
							<Item 
								title="TRANSMIT VALUES" 
								success={this.txSuccess == 1 ? "Success" : ("Failure " + this.numRetries + " of " + this.maxRetries + " Retries ") } 
								rssi={this.rssiValue + " dBm"}
								snr={this.snrValue + " dBm"} 
							/>
						</View>						
						<View>
							<Item 
								title="RECIEVE VALUES" 
								success=""
								rssi={this.rssiValue_2 + " dBm"}
								snr={this.snrValue_2 + " dBm"} 
							/>
						</View>
					</View>
				</Background>
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({

		central_relay_image_1 : state.operationValuesReducer.central_relay_image_1,
		central_relay_image_2 : state.operationValuesReducer.central_relay_image_2,
		remote_relay_image_1 :  state.operationValuesReducer.remote_relay_image_1,
		remote_relay_image_2 : state.operationValuesReducer.remote_relay_image_2,
		led_label : state.operationValuesReducer.led_label,
		aux_label : state.operationValuesReducer.aux_label
	
} );

export default connect(mapStateToProps)(OperationValues);
