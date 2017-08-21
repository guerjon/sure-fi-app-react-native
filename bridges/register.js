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
  	NativeEventEmitter,
  	Alert,
  	Modal
} from 'react-native'
import {styles,first_color,link_color,success_green,option_blue} from '../styles/index.js'
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome';
import { 
	LOADING,
	CHECK_USER_EXITS,
	FINISH_USER_REGISTRATION
} from '../constants'

var {width,height} = Dimensions.get('window')
var validator = require("email-validator");
const Permissions = require('react-native-permissions')
const PushNotification = NativeModules.PushNotification
const pnEventManager = new NativeEventEmitter(PushNotification);
const messageIcon = (<Icon name="commenting-o" size={40} color="white" />)

class Register extends Component{

	constructor(props) {
		super(props);

		this.map = new Map()
		console.log("constructor()",props)
		pnEventManager.addListener('GetConfirmationCode',(code) => this.fillConfirmationCode(code));
		this.first_input = ""
		this.navigation = props.navigation;
		this.info = props.info;
	}

	componentWillMount() {
		console.log("componentWillMount()")
		
	}

	componentDidMount() {
		/*
		Permissions.checkMultiple(['read_sms'])
  		.then(response => {

  			if(response.read_sms != "authorized")
  				this.props.dispatch({type: "SHOW_CONTACTS_MODAL"})

  		}).catch(error => Alert.alert("Error",error))
  		*/	
	}

  	fillConfirmationCode(code){
  		console.log("fillConfirmationCode()")
  		var code = code.code
  		if(first_input > 3){
	  		this.first_input.setNativeProps({
	  			text: code.charAt(0)
	  		})
	  		this.map.set(0,code.charAt(0))
	  		
	  		this.props.dispatch({type: "SHOW_NAME_BOX"})

  		}else{
  			console.log("The code is not correctly")
  		}
  	}


	sendMessage(){
		console.log("sendMessage()")
		var {dispatch} = this.props
		PushNotification.openSmsBox((response) => {
			console.log(response)
		})
		dispatch({type: "SHOW_CODE_OPTION"})
	}


	handleNumberChange(t){
		console.log("handleNumberChange()")
		this.first_input = t
		if(t.length == 4){
			this.props.dispatch({type: "SHOW_NAME_BOX"})
		}else{
			this.props.dispatch({type: "HIDE_NAME_BOX"})
		}
	}

	checkNameLenght(text){
		console.log("checkNameLenght()")
		var {dispatch} = this.props
		this.name = text
		if(text.length){
			if(this.info){
				if(this.info.email){
					this.email = this.info.email
					dispatch({type : "SHOW_ACTIVATE_BUTTON"})
				}else{
					dispatch({type: "SHOW_EMAIL_BOX"})
				}
			}else{
				dispatch({type: "SHOW_EMAIL_BOX"})
			}
		}else{
			dispatch({type: "HIDE_ACTIVATE_BUTTON"})
		}
	}

	handleEmailAddress(email){
		this.email = email
		/*if(validator.validate(email)){
			
			dispatch({type : "SHOW_ACTIVATE_BUTTON"})
		}else{
			Alert.alert("Error","The email is not correct.")
		}*/
	}


	activate(){
		if(validator.validate(this.email)){
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
				console.log("response",response)
				if(response.status == 200){
					var data_response = JSON.parse(response._bodyInit)
					if(data_response.status == "success"){
						var id = data_response.data.user_data.user_id;
						
						var data = JSON.stringify({
							activation_code : this.first_input,
							user_id : id,
							device_token : this.info.token,
							device_uuid : this.info.device_id,				
						})
						
						console.log("special_data",data)
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
									this.navigation.dispatch(goMainScreen)					
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
		}else{
			Alert.alert("The email is incorrect.")
		}

	}

	renderStep1(){
		console.log("renderStep1()")
		let props = this.props
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
						<View style={{width:width-300,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center"}}>
							<View style={{alignItems:"center",justifyContent:"center",height:50,width:width-300}}>
								<TextInput 
									maxLength={4}
									style={{flex:1,justifyContent:"center",fontSize:25,width:width-340}} 
									keyboardType="numeric" 
									underlineColorAndroid="transparent" 
									onChangeText={(t) => this.handleNumberChange(t)}
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
					/>
				</View>
			</View>
		)
	}

	renderEmailBox(){
		return (
			<View>
				
				<Text style={{color:"white",marginVertical:10,fontSize:16}}>
					Step 4 - Enter your Email
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

	requestContactPermissions(){
		console.log("requestContactPermissions()")
		this.props.dispatch({type: "HIDE_CONTACTS_MODAL"})
		this.checkPermissions()
	}

  	checkPermissions(){

  		Permissions.checkMultiple(['read_sms'])
  		.then(response => {
  			 if(response.contacts == "undetermined"){
  				this.askForReadSms(response)
  			}else if(response.contacts == "denied"){
  				this.askForReadSms(response)
  			}else if(response.contacts == "restricted"){
  				this.showSMSAlert(response)
  			}
  			else{
  				this.sendMessage()
  			}
  		})
  		.catch(error => Alert.alert("Error",error))  	
  	}

	askForReadSms(response){
		Permissions.request('read_sms')
		.then(response => {
			if(response == "authorized"){
				this.sendMessage()
			}else if(response == "restricted"){
				this.props.dispatch({type: "SHOW_WELCOME_SCREEN"})
			}else if (response == "denied"){
				this.showSMSAlert(response)
			}else{
				Alert.alert("Error","This error shoudln't never happend.")
			}			
		})
		.catch(error => Alert.alert("Error",error))
	}

	showSMSAlert(response){
		console.log("showSMSAlert()")
  		Alert.alert(
  			"Error on SMS Access",
  			"In order to register your Sure-Fi device, we need access to the SMS Box",
  			[
  				{text: 'Cancel', onPress: () => this.props.dispatch({type: "SHOW_WELCOME_SCREEN"}), style: 'cancel'},
  				{text : "Accept", onPress: () => this.askForReadSms(response) }
  			]
  		)		
	}

	renderModal(){
		return (
			<Modal 
				animationType={"slide"}
				transparent={true}
				visible={this.props.show_contacts_modal}
				onRequestClose={() => null}

			>
				<View style={{backgroundColor: 'rgba(10,10,10,0.5)',flex:1,alignItems:"center",justifyContent:"center"}}>
					
					<View style={{backgroundColor:"white",width: width-80,height:300,alignSelf:'center',borderRadius:10,alignItems:"center"}}>
						<View style={{width:width-80,backgroundColor:option_blue,height:100,borderTopLeftRadius:10,borderTopRightRadius:10,alignItems:"center",justifyContent:"center"}}>
							{messageIcon}
						</View>
						<View style={{marginHorizontal:20,marginVertical:15,height:100,alignItems:"center",justifyContent:"center"}}>
							<Text style={{fontSize:17}}>
								In order to verify your number, the Sure Fi App need Access to the SMS Messages.
							</Text>
						</View>
						
						
						<TouchableHighlight 
							onPress={() => this.requestContactPermissions()} 
							style={{
								marginTop:10,
								borderTopWidth: 0.2,
								width:width,
								height: 60,
								alignItems:"center",
								justifyContent:"center",
								borderRadius: 10
							}}>
							<Text style={{color:option_blue}}>
								ACCEPT
							</Text>
						</TouchableHighlight>
					</View>
				</View>
			</Modal>
		)
	}

	render(){	
		var {register_status} = this.props
		return(
			<View style={{flex:1}}>
				<View style={{flex:1,backgroundColor:first_color,alignItems:"center"}}>
					{(register_status  == 0 || register_status > 0) && this.renderStep1()}
					{(register_status  == 1 || register_status > 1) && this.renderStep2()} 
					{(register_status  == 2 || register_status > 2) && this.renderStep3()} 	
					{(register_status  == 4 || register_status > 4) && this.renderEmailBox()}
					{(register_status  == 3 || register_status > 3) && this.renderButtonActivate()} 	
					
				</View>
				<View>
					{this.renderModal()}
				</View>
			</View>
		);	
	}
}

const mapStateToProps = state => ({
	register_status : state.registerReducer.register_status,
	contacts_permission : state.mainScreenReducer.contacts_permission,
	phone_state_permission : state.mainScreenReducer.phone_state_permission,
	sms_permission : state.mainScreenReducer.sms_permission,
	show_contacts_modal : state.registerReducer.show_contacts_modal
});

export default connect(mapStateToProps)(Register);

