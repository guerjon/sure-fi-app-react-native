import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	NativeModules,
  	TextInput,
  	Dimensions,
  	ActivityIndicator,
  	NativeEventEmitter
} from 'react-native'
import {styles,first_color,link_color,success_green} from '../styles/index.js'
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation'
import { 
	LOADING,
	CHECK_USER_EXITS,
	FINISH_USER_REGISTRATION
} from '../constants'

var {width,height} = Dimensions.get('window')
var validator = require("email-validator");

const PushNotification = NativeModules.PushNotification
const pnEventManager = new NativeEventEmitter(PushNotification);

class Register extends Component{
	constructor(props) {
		super(props);
		this.map = new Map()
		pnEventManager.addListener('GetConfirmationCode',(code) => this.fillConfirmationCode(code));
	}

	static navigationOptions ={
		title : "Register device",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentWillMount() {
		this.info = this.props.navigation.state.info;
	}


  	fillConfirmationCode(code){
  		var code = code.code
  		
  		if(code.length > 3){
	  		this.first_input.setNativeProps({
	  			text: code.charAt(0)
	  		})
	  		this.map.set(0,code.charAt(0))
	  		this.second_input.setNativeProps({
	  			text: code.charAt(1)
	  		})
	  		this.map.set(1,code.charAt(1))
	  		this.third_input.setNativeProps({
	  			text: code.charAt(2)
	  		})
	  		this.map.set(2,code.charAt(2))
	  		this.fourth_input.setNativeProps({
	  			text: code.charAt(3)
	  		})
	  		this.map.set(3,code.charAt(3))
	  		this.props.dispatch({type: "SHOW_NAME_BOX"})
  		}else{
  			console.log("The code is not correctly")
  		}
  	}


	sendMessage(){
		var {dispatch} = this.props
		PushNotification.openSmsBox((response) => {
			console.log(response)

		})
		dispatch({type: "SHOW_CODE_OPTION"})
	}


	handleNumberChange(numer,index){
		
		this.map.set(index,numer)
		
		if(this.map.size == 4){
			this.props.dispatch({type: "SHOW_NAME_BOX"})
		}else{
			this.props.dispatch({type: "HIDE_NAME_BOX"})
		}
	}

	checkNameLenght(text){
		var {dispatch} = this.props
		if(text.length){
			if(this.info.email){
				this.email = this.info.email
				this.name = text
				dispatch({type : "SHOW_ACTIVATE_BUTTON"})
			}else{
				dispatch({type: "SHOW_EMAIL_BOX"})
			}
		}else{
			dispatch({type: "HIDE_ACTIVATE_BUTTON"})
		}
	}

	handleEmailAddress(email){
		if(validator.validate(email)){
			this.email = email
			dispatch({type : "SHOW_ACTIVATE_BUTTON"})
		}else{
			Alert.alert("Error","The email is not correct.")
		}
	}


	activate(){
		
		var data = {
			"user_name" : this.name,
			"user_email" : this.email
		}
		fetch(CHECK_USER_EXITS,{
			method: "POST",
			headers: {
    			'Accept': 'application/json',
    			'Content-Type': 'application/json',
  			},
			body: JSON.stringify(data)
		}).then(response => {

			if(response.status == 200){
				var data_response = JSON.parse(response._bodyInit)
				if(data_response.status == "success"){
					var id = data_response.data.user_data.user_id;
					
					var data = JSON.stringify({
						activation_code : this.map.get(0) + this.map.get(1) + this.map.get(2) + this.map.get(3),
						user_id : id,
						device_token : this.props.navigation.state.info.token						
					})
					fetch(FINISH_USER_REGISTRATION,{
						method: "POST",
						headers: {
			    			'Accept': 'application/json',
			    			'Content-Type': 'application/json',
			  			},						
						body : data
					}).then(response => {
						if(response.status == 200){
							var data_response = JSON.parse(response._bodyInit)
							console.log("Data_desponser",data_response)
							if(data_response.status == "success"){
		  						const goMainScreen = NavigationActions.reset({
								  	index: 0,
								  	actions: [
								    	NavigationActions.navigate({ routeName: 'Main'})
								  	]
								})			
								this.props.navigation.dispatch(goMainScreen)					
							}else{
								Alert.alert("Error","The data isn't correct.")
							}
						}else{
							Alert.alert("Error","Can't connect with the server.")
						}
						console.log(response)
					})
				}else{
					Alert.alert("Error","The data isn't correct.");
				}
			}else{
				Alert.alert("Error","Can't connect with the server.")
			}	
		})
	}

	renderStep1(){
		return (
			<View>
				<Text style={{color:"white",marginVertical:20,fontSize:16}}>
					Please register your mobile device with Sure-Fi
				</Text>
				<Text style={{color:"white",marginVertical:10,fontSize:16}}>
					Step 1 - Request Activation Code from Sure-Fi
				</Text>
				<TouchableHighlight onPress={() => this.sendMessage()} style={{alignItems:"center"}}>
					<Text style={{color:"#1E90FF",marginVertical:10,fontSize:16}}>
						Touch here to Send Message
					</Text>
				</TouchableHighlight>
			</View>
		)
	}

	renderStep2(){
		return (
			<View style={{alignItems:"center"}}>
				
				<Text style={{color:"white",marginVertical:10,fontSize:16}}>
					Step 2 - Enter Activation Code
				</Text>
				<View>
					<View style={{flexDirection:"row"}}>
						<View style={{width:35,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
							<View style={{alignItems:"center",justifyContent:"center",height:50,width:35}}>
								<TextInput 
									maxLength={1} 
									style={{flex:1,justifyContent:"center",fontSize:25}} 
									keyboardType="numeric" 
									underlineColorAndroid="transparent" 
									onChangeText={(t) => this.handleNumberChange(t,1)}
									ref={first_input => {
										this.first_input = first_input
									}}
								/>
							</View>
						</View>
						<View style={{width:35,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
							<View style={{alignItems:"center",justifyContent:"center",height:50,width:35}}>
								<TextInput 
									maxLength={1} 
									style={{flex:1,justifyContent:"center",fontSize:25}} 
									keyboardType="numeric" 
									underlineColorAndroid="transparent" 
									onChangeText={(t) => this.handleNumberChange(t,2)}
									ref={second_input => {
										this.second_input = second_input
									}}
								/>
							</View>
						</View>
						<View style={{width:35,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
							<View style={{alignItems:"center",justifyContent:"center",height:50,width:35}}>
								<TextInput 
									maxLength={1} 
									style={{flex:1,justifyContent:"center",fontSize:25}} 
									keyboardType="numeric" 
									underlineColorAndroid="transparent" 
									onChangeText={(t) => this.handleNumberChange(t,3)}
									ref={third_input => {
										this.third_input = third_input
									}}

								/>
							</View>
						</View>
						<View style={{width:35,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
							<View style={{alignItems:"center",justifyContent:"center",height:50,width:35}}>
								<TextInput 
									maxLength={1} 
									style={{flex:1,justifyContent:"center",fontSize:25}}
									keyboardType="numeric" 
									underlineColorAndroid="transparent" 
									onChangeText={(t) => this.handleNumberChange(t,4)}
									ref={fourth_input => {
										this.fourth_input = fourth_input
									}}
								/>
							</View>
						</View>

					</View>
				</View>
			</View>
		)
	}

	renderStep3(){
		
		return (
			<View>
				
				<Text style={{color:"white",marginVertical:10,fontSize:16}}>
					Step 3 - Enter your Name
				</Text>
				<View style={{backgroundColor:"white",height:40,width:(width-60)}}>
					<TextInput style={{height:40,width:(width-20)}}
					 	onChangeText={t => this.checkNameLenght(t)} 
					 	underlineColorAndroid="transparent"
					 	ref= {name => this.name}
					/>
				</View>
			</View>
		)
	}

	renderEmailBox(){
		return (
			<View>
				
				<Text style={{color:"white",marginVertical:10,fontSize:16}}>
					Step 3 - Enter your Email
				</Text>
				<View style={{backgroundColor:"white",height:40,width:(width-60)}}>
					<TextInput 
						style={{height:40,width:(width-20)}} 
						onChangeText={t => this.handleEmailAddress(t)} 
						underlineColorAndroid="transparent"
						keyboardType = "email-address"
					/>
				</View>
			</View>
		)
	}

	renderButtonActivate(){
		return (
			<View>
							
				<View style={styles.bigButtonContainer}>
					<TouchableHighlight onPress={() => this.activate()} style={styles.bigGreenButton}>
						<Text style={styles.bigGreenButtonText}>
							Activate
						</Text>
					</TouchableHighlight>
				</View>
			</View>
		)
	}

	render(){	
		var {register_status} = this.props
		console.log("register_status",register_status)

		return(
			<View style={{flex:1}}>
				<View style={{flex:1,backgroundColor:first_color,alignItems:"center"}}>
					{(register_status  == 0 || register_status > 0) && this.renderStep1()}
					{(register_status  == 1 || register_status > 1) && this.renderStep2()} 
					{(register_status  == 2 || register_status > 2) && this.renderStep3()} 	
					{(register_status  == 3 || register_status > 3) && this.renderButtonActivate()} 	
					{(register_status  == 4 || register_status > 4) && this.renderEmailBox()} 	
				</View>
			</View>
		);	
	}
}

const mapStateToProps = state => ({
	register_status : state.registerReducer.register_status
});

export default connect(mapStateToProps)(Register);

