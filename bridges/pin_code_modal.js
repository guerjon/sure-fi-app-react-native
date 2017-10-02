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

const option_blue = "#5AB0E3"

var modal_width = Dimensions.get('window').width * 0.8



class PINCodeModal extends Component{
	
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
				this.closeModal()
				Alert.alert("Success","You are in.")
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

	handlePinNumber(){
		if(this.text.length){

			this.fetchResults(this.text)		
		}else{
			Alert.alert("Error","The field can't be empty.")
		}
	}

	closeModal() {
        this.props.navigator.dismissLightBox();
    }

  	render() {
	    return (
	      	<View style={styles.container}>
	        	<View
	        		
	        		style={{backgroundColor:"white",height:50,borderTopRightRadius:10, borderTopLeftRadius: 10}} 
	        	>
	        		<View style={{flexDirection:"row",padding:10,width: modal_width,alignItems:"center",justifyContent:"center"}}>
		        		<View style={{justifyContent:"flex-start"}}>
			        		<Text style={{fontSize:20}}>
			        			Insert the PIN code
			        		</Text>
		        		</View>
	        		</View>
	        	</View>
				<View>
					<View style={{flexDirection:"row"}}>
						<View style={{width:modal_width-20,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10}}>
							<View style={{alignItems:"center",justifyContent:"center",height:50,width:200}}>
								<TextInput 
									maxLength={20}
									style={{flex:1,justifyContent:"center",fontSize:25,width:200}} 
									keyboardType="numeric" 
									underlineColorAndroid="transparent" 
									onChangeText={(t) => this.handleNumberChange(t)}
								/>
							</View>
						</View>
					</View>
				</View>
				<View style={{flexDirection:"row"}}>
		        	<TouchableHighlight
		        		onPress={() => this.closeModal()}
		        		style={{backgroundColor:"white",height:50,borderBottomRightRadius:10, borderBottomLeftRadius: 10}} 
		        	>
		        		<View style={{flexDirection:"row",padding:10,width: modal_width/2,alignItems:"center",justifyContent:"center"}}>
			        		<Text style={{fontSize:20,color:"red"}}>
			        			Cancel
			        		</Text>
		        		</View>
		        	</TouchableHighlight>
		        	<TouchableHighlight
		        		onPress={() => this.handlePinNumber()}
		        		style={{backgroundColor:"white",height:50,borderBottomRightRadius:10, borderBottomLeftRadius: 10}} 
		        	>
		        		<View style={{flexDirection:"row",padding:10,width: modal_width/2,alignItems:"center",justifyContent:"center"}}>
			        		<Text style={{fontSize:20,color:option_blue}}>
			        			Enter
			        		</Text>
		        		</View>
		        	</TouchableHighlight>		        	
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
    backgroundColor: '#ffffff',
    borderRadius: 5
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
	user_data : state.loginReducer.user_data
});

export default connect(mapStateToProps)(PINCodeModal);