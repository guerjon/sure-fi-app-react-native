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
var height = Dimensions.get('window').height


class InsertIdModal extends Component{
	
	constructor(props) {
	  	super(props);
	  	this.text = ""
	}


	handleIdChange(text){
		this.text = text.toUpperCase()
	}

	handleDeviceId(){
		console.log("handleDeviceId()");
		if(this.text.length == 6){
			console.log("this.text.toUpperCase()",this.text.toUpperCase());
			this.props.matchDevice(this.text.toUpperCase())

		}else{
			Alert.alert("Error","The field shoud be six characteres long.")
		}
	}

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
				        			Manual Entry
				        		</Text>
				        		<Text style={{textAlign:"center"}}>
				        			Please enter your 6 Character Serial Number for the Central device.
				        		</Text>
			        		</View>
		        		</View>
		        	</View>
					<View style={{backgroundColor:"white"}}>
						<View style={{flexDirection:"row"}}>
							<View style={{width:modal_width-20,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10}}>
								<View style={{alignItems:"center",justifyContent:"center",height:50,width:200}}>
									<TextInput 
										maxLength={6}
										style={{flex:1,justifyContent:"center",fontSize:25,width:200,textAlign:"center"}}
										underlineColorAndroid="transparent" 
										onChangeText={(t) => this.handleIdChange(t)}
										placeholder="XXXXXX"
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
			        		onPress={() => this.handleDeviceId()}
			        		style={{backgroundColor:"white",height:60,borderBottomRightRadius:10,}} 
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
	user_data : state.loginReducer.user_data
});

export default connect(mapStateToProps)(InsertIdModal);
