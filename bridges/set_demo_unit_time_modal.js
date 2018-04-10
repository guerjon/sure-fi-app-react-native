import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	StyleSheet,
  	Dimensions,
  	Button,
  	TouchableHighlight,
  	TextInput,
  	Alert
} from 'react-native'
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { 
	LOADING,
	GET_USERS_FROM_PIN
} from '../constants'

import {
	COMMAND_SET_DEMO_TIME
} from '../commands'

import {
	WRITE_COMMAND,
} from '../action_creators'

const option_blue = "#5AB0E3"

var modal_width = Dimensions.get('window').width * 0.8
var height = Dimensions.get('window').height


class SetDemoUnitTimeModal extends Component{
	
	constructor(props) {
	  	super(props);
	  	this.text = ""
	}

	fetchResults(text){
		fetch(GET_USERS_FROM_PIN,{
			method: "POST",
			headers: {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify({
				"user_pin": text,
			}) 
		}).then(response => {
			var data = JSON.parse(response._bodyInit)

			if(data.status == "success"){
				var user_data = data.data.user_data
				this.props.dispatch({type: "SET_USER_DATA",user_data: user_data})
				this.props.hideRightButton()
				this.closeModal()
			}else{
				Alert.alert("Error",data.msg)
			}
		}).catch(error => {
			console.log("error",error);
			Alert.alert("Error",error)
		})
	}

	handleNumberChange(text){
		this.text = text
	}

	handleEnterButton(){
		if(this.text.length){
			//this.fetchResults(this.text)
			this.setDemoUnitTime(this.text)
		}else{
			Alert.alert("Error","The field can't be empty.")
		}
	}

	setDemoUnitTime(number_of_days){
		console.log("setDemoUnitTime",number_of_days);
		var data = [COMMAND_SET_DEMO_TIME,parseInt(number_of_days)]
		console.log("data",data);

		WRITE_COMMAND(this.props.device.id, data)
	    	.then(response => {		 

	    	})
	    	.catch(error => console.log("error",error))		

	    this.props.updateDemoUnitTime(number_of_days)
	    this.props.navigator.dismissLightBox();
	}

	longToByteArray (long) {
	    // we want to represent the input as a 8-bytes array
	    var byteArray = [0, 0];

	    for ( var index = byteArray.length -1; index >= 0; index -- ) {
	        var byte = long & 0xff;
	        byteArray [ index ] = byte;
	        long = (long - byte) / 256 ;
	    }

	    return byteArray;
	};

	closeModal() {
        this.props.navigator.dismissLightBox();
    }

  	render() {
	    return (
	      	<View style={styles.container}>
	      		<View style={{marginTop:150}}>
		        	<View
		        		
		        		style={{backgroundColor:"white",borderTopRightRadius:10, borderTopLeftRadius: 10}} 
		        	>
		        		<View style={{flexDirection:"row",padding:10,width: modal_width,alignItems:"center",justifyContent:"center"}}>
			        		<View style={{justifyContent:"flex-start"}}>
				        		<Text style={{fontSize:20,textAlign:"center"}}>
				        			Set Demo Unit Time (days)
				        		</Text>
			        		</View>
		        		</View>
		        	</View>
					<View style={{backgroundColor:"white"}}>
						<View style={{flexDirection:"row"}}>
							<View style={{width:modal_width-20,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10}}>
								<View style={{alignItems:"center",justifyContent:"center",height:50,width:200}}>
									<TextInput 
										maxLength={20}
										style={{flex:1,justifyContent:"center",fontSize:25,width:200,textAlign:"center"}} 
										keyboardType="numeric" 
										underlineColorAndroid="transparent" 
										onChangeText={(t) => this.handleNumberChange(t)}
										placeholder="DAYS"
									/>
								</View>
							</View>
						</View>
					</View>
					<View style={{flexDirection:"row"}}>
			        	<TouchableHighlight
			        		onPress={() => this.closeModal()}
			        		style={{backgroundColor:"white",height:60, borderBottomLeftRadius: 10}} 
			        	>
			        		<View style={{flexDirection:"row",padding:10,width: modal_width/2,alignItems:"center",justifyContent:"center"}}>
				        		<Text style={{fontSize:20,color:"red"}}>
				        			Cancel
				        		</Text>
			        		</View>
			        	</TouchableHighlight>
			        	<TouchableHighlight
			        		onPress={() => this.handleEnterButton()}
			        		style={{backgroundColor:"white",height:60,borderBottomRightRadius:10}} 
			        	>
			        		<View style={{flexDirection:"row",padding:10,width: modal_width/2,alignItems:"center",justifyContent:"center"}}>
				        		<Text style={{fontSize:20,color:option_blue}}>
				        			Enter
				        		</Text>
			        		</View>
			        	</TouchableHighlight>
		        	</View>
	        	</View>
	      	</View>
	    );
	}
}

const styles = StyleSheet.create({
  container: {
    width: modal_width,
    borderTopRightRadius:10,
    borderTopLeftRadius: 10,
    borderRadius: 5,
    flex:1
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    marginTop: 8,
  },
});

const mapStateToProps = state => ({
	device: state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(SetDemoUnitTimeModal);
