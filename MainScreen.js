import React, {Component} from 'react'
import {
  	StyleSheet,
  	Text,
  	View,
  	Image,
  	Dimensions,
  	TouchableHighlight,
  	Linking,
  	NativeModules,
  	NativeEventEmitter,
  	Alert,
  	PermissionsAndroid
} from 'react-native';

import {
	DEVICE_REGISTRATION_LINK,
	DEVICE_REGISTRATE_LINK
} from './constants'
import { StackNavigator } from 'react-navigation';
import Coverflow from 'react-native-coverflow'
import SplashScreen from 'react-native-splash-screen'
import {styles} from './styles'
import { connect } from 'react-redux';
import RNFirebase from 'react-native-firebase'
import { NavigationActions } from 'react-navigation'
import ActivityIndicator from './helpers/centerActivityIndicator'
import Background from './helpers/background'
const PushNotification = NativeModules.PushNotification
const {width,height} = Dimensions.get("window")
const Permissions = require('react-native-permissions')
const image_styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  textStyle: {
    color: '#FFFFFF'
  },
  buttonContainer: {
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 1.0
  }
}

class MainScreen extends Component {
  
  	constructor(props) {
		super(props);	
  	}

  	componentWillMount() {	
  		this.checkPermissions()
  	}

  	checkPermissions(){

  		Permissions.checkMultiple(['contacts','phone_state','read_sms'])
  		.then(response => {
  			console.log("firs_Response",response)
  			if(response.contacts == "undetermined"){
  				this.askForContacts(response)
  			}else if(response.contacts == "denied"){
  				this.askForContacts(response)
  			}else if(response.contacts == "restricted"){
  				this.props.dispatch({type: "UPDATE_CONTACT_PERMISSION",contacts_permission: "restricted"})
  				this.askForPhoneState(response)
  			}
  			else{
  				this.props.dispatch({type: "UPDATE_CONTACT_PERMISSION",contacts_permission: "activated"})

  				if(response.phone_state == "undetermined")
  					this.askForPhoneState(response)
  				else if(response.phone_state == "denied")
  					this.askForPhoneState(response)
  				else if(response.phone_state == "restricted"){
  					this.props.dispatch({type: "UPDATE_PHONE_STATE_PERMISSION",phone_state_permission:"restricted"})
  					this.askForReadSms(response)
  				}
  				else{
  					this.props.dispatch({type: "UPDATE_PHONE_STATE_PERMISSION",phone_state_permission:"activated"})
  					
  					if(response.read_sms == "undetermined"){
  						this.askForReadSms(response)	
  					}else if(response.read_sms == "denied"){
  						this.askForReadSms(response)
  					}else if (response.read_sms == "restricted"){
  						this.props.dispatch({type: "UPDATE_SMS_PERMISSION",sms_permission : "restricted"})	
  						this.sendPushNotification()
  					}else{
  						this.sendPushNotification()
  					}
  				}
  			}
  		})
  		.catch(error => Alert.alert("Error",error))  		
  	}

  	askForContacts(response){
		Permissions.request('contacts')
		.then(response => {
			if(response == "activated"){
				this.props.dispatch({type: "UPDATE_CONTACT_PERMISSION",contacts_permission: "activated"})
			}else if (response == "restricted"){
				this.props.dispatch({type: "UPDATE_CONTACT_PERMISSION",contacts_permission: "restricted"})
				this.askForPhoneState(response)
			}else if (response == "denied"){
				this.props.dispatch({type: "UPDATE_CONTACT_PERMISSION",contacts_permission: "denied"})
				this.showContactsAlert(response)
			}else{
				this.askForPhoneState(response)
			}
		})
		.catch(error => console.log("Error",error))
  	}

	askForPhoneState(response){
		Permissions.request('phone_state')
		.then(response => {
			if(response == "activated"){
				this.props.dispatch({type : "UPDATE_PHONE_STATE_PERMISSION",phone_state_permission : "activated"})
			}else if(response == "restricted"){
				this.props.dispatch({type : "UPDATE_PHONE_STATE_PERMISSION",phone_state_permission : "restricted"})
				this.askForReadSms(response)
			}else if (response == "denied"){
				this.props.dispatch({type : "UPDATE_PHONE_STATE_PERMISSION",phone_state_permission : "denied"})
				this.showPhoneStatusAlert(response)
			}else{
				this.askForReadSms(response)
			}
		})
		.catch(error => Alert.alert("Error",error))
	}

	askForReadSms(response){
		Permissions.request('read_sms')
		.then(response => {
			if(response == "activated"){
				this.props.dispatch({type : "UPDATE_SMS_PERMISSION",sms_permission : "activated"})
			}else if(response == "restricted"){
				this.props.dispatch({type : "UPDATE_SMS_PERMISSION",sms_permission : "restricted"})
				this.sendPushNotification()
			}else if (response == "denied"){
				this.props.dispatch({type : "UPDATE_SMS_PERMISSION",sms_permission : "denied"})
				this.showSMSAlert(response)
			}else{
				this.sendPushNotification()
			}			
		})
		.catch(error => Alert.alert("Error",error))
	}

	showContactsAlert(response){
  		Alert.alert(
  			"Can we access to your contacts?",
  			"In order to register your Sure-Fi device, we need access to your contacts",
  			[
  				{text: 'Cancel', onPress: () => this.askForPhoneState(response), style: 'cancel'},
  				{text : "Accept", onPress: () => this.askForContacts(response)  }
  			]
  		)		
	}

	showPhoneStatusAlert(response){
  		Alert.alert(
  			"Can we access to your status phone?",
  			"In order to register your Sure-Fi device, we need access to the status phone",
  			[
  				{text: 'Cancel', onPress: () => this.askForReadSms(response), style: 'cancel'},
  				{text : "Accept", onPress: () => this.askForPhoneState(response) }
  			]
  		)		
	}

	showSMSAlert(response){

  		Alert.alert(
  			"Can we access to your sms?",
  			"In order to register your Sure-Fi device, we need access to the sms",
  			[
  				{text: 'Cancel', onPress: () => this.sendPushNotification(), style: 'cancel'},
  				{text : "Accept", onPress: () => this.askForReadSms(response) }
  			]
  		)		
	}

  	sendPushNotification(){
  		Permissions.checkMultiple(['contacts','phone_state','read_sms'])
  		.then(response => {
  			if((response.phone_state == "authorized") && (response.read_sms == "authorized")){
				PushNotification.getBuildInfo(data => { //data is a json change on production
		  			this.sendInformation(data)
		  		})  		  				
  			}else{
  				Alert.alert(
  					"Accept to continue",
  					"In order to continue you must allow the permissions, Contacts, SMS, Phone.",
  					[
  						{
  							text : "Accept", onPress : () => this.checkPermissions()
  						}
  					]
  				)
  			}
  		})
  		.catch(error => Alert.alert("Error",error))
  	}

  	sendInformation(info){
  		var {dispatch} = this.props
  		var device_details = info.model + "-" + info.android_version + "-" + info.language + "-" + info.country + "-" + info.app_version
  		console.log("device_details",device_details)
  		fetch(DEVICE_REGISTRATION_LINK,{
  			method: "POST",
			headers: {
			    'Accept': 'application/json',
			    'Content-Type': 'application/json',				
			},  			
  			body: JSON.stringify( {
  				"device_token" : info.token,
  				"device_type" : "ANDROID",
  				"device_title" : info.device_title,
  				"device_details" : device_details,
  			})
  		}).then(data => {
  			if(data.status == 200){
  				var response = JSON.parse(data._bodyText)
  				//console.log("response",response)
  				if(response.status == "success"){
  					let data = response.data
  					if(data.registered){
  					//if(true){
  						dispatch({type : "SHOW_MAIN_SCREEN"})
  					}else{
  						const goRegister = NavigationActions.reset({
						  	index: 0,
						  	actions: [
						    	NavigationActions.navigate({ routeName: 'Register',info: info})
						  	]
						})
						fetch(DEVICE_REGISTRATE_LINK,{
							method: "POST",
							headers: {
							    'Accept': 'application/json',
							    'Content-Type': 'application/json',				
							},  			
				  			body: JSON.stringify( {
				  				"device_token" : info.token,
				  				"device_type" : "ANDROID",
				  				"device_title" : info.device_title,
				  				"device_details" : device_details,
				  			})
						}).then(response => {
							this.props.navigation.dispatch(goRegister)
						}).catch(error => Alert.alert("Error",error))
 
  					}
  				}else{
  					Alert.alert("Error","Server Response Error")
  				}

  			}else{
  				Alert.alert("Error","Server error")
  			}
  		}).catch(e => console.log(e))
  	}

	openSureFiPage(url){
		Linking.canOpenURL(url).then(supported => {
			if (!supported) {
				console.log('Can\'t handle url: ' + url);
			} else {
				return Linking.openURL(url);
			}
		}).catch(err => console.error('An error occurred', err));
	} 	


	static navigationOptions = { title: 'Welcome', header: null };
  
  	render() {
  		
  		const { navigate } = this.props.navigation;
  		var {screen_status} = this.props
  		if(screen_status == "show_main_screen"){
  		//if(true){	
			return (
				<Background>
			  		<View style={styles.container}>
				  			<View style={styles.circleContainer}>
					  			<View style={styles.launchImage}>
					  				<Image source={require('./images/sure-fi_menu.imageset/sure-fi_menu.png')} style={{width:width-200,height:50,top:-15}}/>
					  			</View>
				  			</View>
				  			<Coverflow 
				  				onChange={(index) => null} 
				  				style={styles.coverflow}
				  				midRotation={50} //se queda
				  				initialSelection={0}
				  				spacing={230}
				  			>
								<View style={styles.textViewContainer}>
									<View style={{alignItems:"center",justifyContent:"center"}}>
										<TouchableHighlight onPress={() => navigate("Bridges")} >
											<Image source={require('./images/menu_bridge.imageset/menu_bridge.png')}>
											</Image>
										</TouchableHighlight>
									</View>
									<View style={styles.textView}>
										<Text style={styles.text}>
											Access Control
										</Text>
										<Text style={styles.text}>
											Bridges
										</Text>
									</View>
								</View>

								<View style={styles.textViewContainer}>
									<View>
										<Image source={require('./images/menu_hvac.imageset/menu_hvac.png')} >
										</Image>
									</View>
									<View>
									</View>
									<View style={styles.textView}>
										<Text style={styles.text}>
											HVAC Systems
										</Text>
									</View>
								</View>							

								<View style={styles.textViewContainer}>
									<View>
										<Image source={require('./images/menu_help.imageset/menu_help.png')} >
										</Image>
									</View>
									<View>
									</View>
									<View style={styles.textView}>
										<Text style={styles.text}>
											Help / Troubleshooting
										</Text>
									</View>
								</View>
								<View style={styles.textViewContainer}>
									<TouchableHighlight onPress={() => this.openSureFiPage("http://sure-fi.com/")}>
										<View>
											<View>
												<Image source={require('./images/menu_web.imageset/menu_web.png')} >
												</Image>
											</View>
											<View style={styles.textView}>
												
													<Text style={styles.text}>
														Visit Sure-Fi.com
													</Text>
											</View>
										</View>
									</TouchableHighlight>
								</View>
				  			</Coverflow>
			  		</View>
			  	</Background>
			);

  		}else{
  			return <ActivityIndicator />
  		}
  	}
}


const mapStateToProps = state => ({
	screen_status : state.mainScreenReducer.screen_status,
	contacts_permission : state.mainScreenReducer.contacts_permission,
	phone_state_permission : state.mainScreenReducer.phone_state_permission,
	sms_permission : state.mainScreenReducer.sms_permission
})


export default connect(mapStateToProps)(MainScreen)