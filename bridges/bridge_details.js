import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TextInput,
  	Dimensions,
  	TouchableHighlight
} from 'react-native'
import {styles,first_color,success_green} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	IS_EMPTY
} from '../constants'

var {width,height} = Dimensions.get('window')

class BridgeDetails extends Component{
	
	static navigationOptions ={
		title : "Step 3 - Bridge Details",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentDidMount() {
		
		clearInterval(this.props.navigation.state.params.scan)
	}
	checkText(text){
    	var {dispatch} = this.props
    	
    	this.description = text
    	if(text.length > 0 ){
    		dispatch({type: "SHOW_BRIDGE_DETAILS_BUTTON"})
    	}else{
    		dispatch({type: "HIDE_BRIDGE_DETAILS_BUTTON"})
    	}
    }

    smartGoBack(){
    	var {dispatch} = this.props
    	dispatch({type : "BRIDGE_DETAILS_DESCRIPTION", brige_details_description : this.description})
    	this.props.navigation.navigate("WriteBridgeConfiguration")
    }

	render(){	
		var {brige_details_description} = this.props
		return(
			<ScrollView style={styles.pairContainer}>
					<View style={{alignItems:"center",marginVertical:20,marginHorizontal:10}}>
						<Text style={styles.bigTitle}>
							System Information
						</Text>
						<Text style={{marginVertical:10}}>
							Please provide a descriptin for this Sure-Fi Bridge
						</Text>
						<TextInput 
							onChangeText = {(text) => this.checkText(text)}
							style={{height: 90, width:width -20, borderColor: 'gray', borderWidth: 0.3,borderRadius:5,backgroundColor:"white"}} 
							underlineColorAndroid="transparent"
							placeholder={"Please provide a description... \n \n Example - This Sure-Fi Remote Unit is connected to a 4-Door controller from XYZ Company"}
						>
						</TextInput>
						{ this.props.show_remote_continue_button &&
							<View>
								<TouchableHighlight 
									onPress={() => this.smartGoBack() } 
									style={{height:40,width: width-20,backgroundColor:success_green,marginVertical: 20,alignItems:"center",justifyContent: "center",borderRadius:5}}
								>
									<Text style={{color:"white",fontSize:18}}>
										Start Pairing
									</Text>
								</TouchableHighlight>
							</View>
						}
					</View>
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({
	remote_device: state.scanRemoteReducer.remote_device,
	brige_details_description : state.bridgeDetailsReducer.brige_details_description,
	show_remote_continue_button : state.bridgeDetailsReducer.show_remote_continue_button
});

export default connect(mapStateToProps)(BridgeDetails);
