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
	TWO_BYTES_TO_INT
} from '../constants'
import Background from '../helpers/background'

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
					<View style={{height:30,backgroundColor:"white",width:width/2}}>
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
					<View style={{height:30,backgroundColor:"white",width:width/4}}>
						<Text>
							{params.rssi}
						</Text>						
					</View>
				</View>
				<View >
					<View style={{height:30,backgroundColor:"gray",width:width/4,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
						<Text style={{color:"white"}}>
							{params.snr}
						</Text>
					</View>
					<View style={{height:30,backgroundColor:"white",width:width/4}}>
					</View>
				</View>				
			</View>		
		</View>
	)
}


class OperationValues extends Component{
	
	static navigationOptions ={
		title : "Template",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	constructor(props) {
		super(props);
		this.values = props.values
		
	}

	componentWillMount() {
		this.relayValues = TWO_BYTES_TO_INT(this.values[0],this.values[1])
		console.log("relayValues",this.relayValues)
	}

	tryRelayValues(){
			if( (this.relayValues / 1) % 2 == 1 ){

                //centralRelay1Image.image = UIImage(named: "relay_no")

            } else {

                //centralRelay1Image.image = UIImage(named: "relay_nc")

            }

            if( (this.relayValues / 2) % 2 == 1 ){

                //centralRelay2Image.image = UIImage(named: "relay_no")

            } else {

                //centralRelay2Image.image = UIImage(named: "relay_nc")

            }

            if( (this.relayValues / 4) % 2 == 1 ){

                //remoteRelay1Image.image = UIImage(named: "relay_no")

            } else {

                //remoteRelay1Image.image = UIImage(named: "relay_nc")

            }

            if ((this.relayValues / 8) % 2 == 1 ){

                //remoteRelay2Image.image = UIImage(named: "relay_no")

            } else {

                //remoteRelay2Image.image = UIImage(named: "relay_nc")

            }

            if( (this.relayValues / 16) % 2 == 1 ){

                //ledLabel.text = "LED: On"

            } else {

                //ledLabel.text = "LED: Off"

            }

            if ((this.relayValues / 32) % 2 == 1) {

                //auxLabel.text = "Aux: Low"

            } else {

                //auxLabel.text = "Aux: High"

            }		
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
									<View style={{height:150,backgroundColor:"white",width:width/2}}>
									</View>
								</View>
								<View >
									<View style={{height:30,backgroundColor:"gray",width:width/2,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
										<Text style={{color:"white"}}>
											Remote Unit
										</Text>
									</View>
									<View style={{height:150,backgroundColor:"white",width:width/2}}>
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
									<View style={{height:30,backgroundColor:"white",width:width/2}}>
										<Text>
											00000
										</Text>
									</View>
								</View>
								<View >
									<View style={{height:30,backgroundColor:"gray",width:width/4,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
										<Text style={{color:"white"}}>
											Code
										</Text>
									</View>
									<View style={{height:30,backgroundColor:"white",width:width/4}}>
										<Text>
											000000
										</Text>						
									</View>
								</View>
								<View >
									<View style={{height:30,backgroundColor:"gray",width:width/8,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
										<Text style={{color:"white"}}>
											FAC
										</Text>
									</View>
									<View style={{height:30,backgroundColor:"white",width:width/8}}>
										<Text>
											0f
										</Text>
									</View>
								</View>	
								<View >
									<View style={{height:30,backgroundColor:"gray",width:width/8,alignItems:"center",justifyContent:"center",borderLeftWidth:1,borderLeftColor:"white"}}>
										<Text style={{color:"white"}}>
											Bits
										</Text>
									</View>
									<View style={{height:30,backgroundColor:"white",width:width/8}}>
										<Text>
											0f
										</Text>
									</View>
								</View>												
							</View>		
						</View>
						<View>
							<Item 
								title="TRANSMIT VALUES" 
								success="000"
								rssi="000" 
								snr="000" 
							/>
						</View>						
						<View>
							<Item 
								title="RECIEVE VALUES" 
								success="000"
								rssi="000" 
								snr="000" 
							/>
						</View>
					</View>
				</Background>
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(OperationValues);
