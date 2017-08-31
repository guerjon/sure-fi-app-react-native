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
  	PermissionsAndroid,
  	Animated,
  	TouchableWithoutFeedback,
  	TouchableNativeFeedback
} from 'react-native';

import {
	DEVICE_REGISTRATION_LINK,
	DEVICE_REGISTRATE_LINK,
	SESSION_START,
	MAKE_ID,
	GET_HEADERS
} from './constants'
import { StackNavigator } from 'react-navigation';
import Coverflow from 'react-native-coverflow'
import {styles} from './styles'
import { connect } from 'react-redux';
import RNFirebase from 'react-native-firebase'
import { NavigationActions } from 'react-navigation'
import ActivityIndicator from './helpers/centerActivityIndicator'
import Background from './helpers/background'
import Register from './bridges/register'
import Icon from 'react-native-vector-icons/FontAwesome';
//import * as KeyChain from 'react-native-keychain'
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

class FadeInView extends React.Component {
  state = {
    fadeAnim: new Animated.Value(0),  // Initial value for opacity: 0
  }

  componentDidMount() {
    Animated.timing(                  // Animate over time
      this.state.fadeAnim,            // The animated value to drive
      {
        toValue: 1,                   // Animate to opacity: 1 (opaque)
        duration: 2000,              // Make it take a while
      }
    ).start();                        // Starts the animation
  }

  render() {
    let { fadeAnim } = this.state;

    return (
      <Animated.View                 // Special animatable View
        style={{
          ...this.props.style,
          opacity: fadeAnim,         // Bind opacity to animated value
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}


class MainScreen extends Component {
  
  	constructor(props) {
		super(props);	
  	}

  	componentWillMount() {
  		this.props.dispatch({type: "SHOW_MAIN_SCREEN"})
  		this.getSessionKey()
  		this.checkRegister()
  	}

  	getSessionKey(){
  		let random_string = MAKE_ID()
  		
  		let body = JSON.stringify({
  			random_string : random_string,
  		})
			let headers = 
				{
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',				
				}

  		fetch(SESSION_START,{
  			method: "POST",
  			headers: headers,
  			body : body
  		}).then(response => {
  			var data = JSON.parse(response._bodyText) 
  			
  			if(data.status == "success"){
  				this.session_key = data.data.session_key
  			}else{
  				Alert.alert("Error","Error connecting with the server.")
  			}
  		}).catch(error => Alert.alert("Error",error))

  	}

  	sendPushNotification(){
  		//console.log("sendPushNotification()")
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

  	checkRegister(){
  		var {dispatch} = this.props

  		PushNotification.getBasicInfo(info => {
  			this.info = info

  			var device_details = info.model + "-" + info.android_version + "-" + info.language + "-" + info.country + "-" + info.app_version
	  		var body = JSON.stringify({
	  				"device_push_token" : info.token,
	  				"device_uuid" : info.device_id,
	  				"device_type" : "ANDROID",
	  				"device_title" : info.device_title,
	  				"device_details" : device_details,
	  		})
	  		
	  		console.log("body",body)

	  		fetch(DEVICE_REGISTRATION_LINK,{
	  			method: "POST",
				headers: {
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',				
				},  			
	  			body: body	  			
	  		}).then(data => {

				console.log("response",data)

	  			var response = JSON.parse(data._bodyText)
	  			
	  			if(response.status == "success"){
  					let data = response.data
  					if(data.registered){
  					//if(true){
  					//if(false){
  						dispatch({type : "SHOW_MAIN_SCREEN"})
  					}else{
  						dispatch({type:"SHOW_REGISTER_SCREEN",info : info})
  						dispatch({type: "SHOW_WELCOME_SCREEN"})
  					}
  				}else{
  					Alert.alert("Error","Server Response Error")
  				}
	  		})

  		})
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

	showMainScreen(){
		this.props.dispatch({type: "SHOW_REGISTER_SCREEN"})
	}

	navigateToLogin(){
		this.props.navigator.push(
			{
				screen : "Login",
				title : "Login",
				passProps:{
					session_key: this.session_key
				}
			})
	}

	openScanModal(){
		this.props.navigator.showModal({
			screen : "Bridges",
			title: "Scan Sure-Fi Bridge",
			animationType: 'slide-up'
		})
	}

	static navigationOptions = { title: 'Welcome', header: null };
  
	renderWelcomeScreen(){
		return (
			<View style={{backgroundColor:"white",flex:1}}>
				<View style={{marginHorizontal:10}}>
					<View style={{alignItems:"center",height:height/4}}>
						<Text style={{fontSize:25,marginTop:20}}>
							Welcome to Sure-Fi App
						</Text>
					</View>
					<FadeInView style={{alignItems:"center",justifyContent:"center",height:height/2}}>
						<Image source={require('./images/sure-fi_logo.imageset/sure-fi_logo.png')}>

						</Image>
					</FadeInView>
					<View style={{alignItems:"center",justifyContent:"center",height:height/4}}>
						<TouchableHighlight style={{borderWidth:1,padding:15,borderRadius:10}} onPress={() => this.showMainScreen()}>
							<Text>
								Start Setup 
							</Text>
						</TouchableHighlight>
					</View>
				</View>
			</View>
		)
	}

	renderMainScreen(){
		return (
			<Background>
		  		<View style={styles.container}>
			  			<View style={styles.circleContainer}>
				  			<View style={styles.launchImage}>
				  				<View style={{flexDirection:"row",alignItems:"flex-start",justifyContent:"flex-start"}}>
					  				<View style={{alignItems:"center"}}>
					  					<Image source={require('./images/sure-fi_menu.imageset/sure-fi_menu.png')} style={{width:250,height:50,top:-30}}/>
					  				</View>
					  				<View style={{alignItems:"flex-end",right:-30}}>
										<TouchableHighlight style={{top:-20}} onPress={() =>  this.navigateToLogin()}>
											<Icon name="sign-in" size={30} color="white" />
										</TouchableHighlight>
					  				</View>
				  				</View>
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
									<TouchableNativeFeedback onPress={() => this.openScanModal()} >
										<Image source={require('./images/menu_bridge.imageset/menu_bridge.png')}>
										</Image>
									</TouchableNativeFeedback>
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
	}

	renderRegister(){
		let info = this.info
		return <Register info = {info} navigation={this.props.navigation}/>
	}

  	render() {
  		console.log("this.props",this.props)
  		var {screen_status} = this.props
  		return this.renderMainScreen()
  		switch(screen_status){
  			case "show_main_screen":
  			return this.renderMainScreen()
  			case "show_welcome_screen":
  			return this.renderWelcomeScreen()
  			case "show_register_screen":
  			return this.renderRegister()
  			default:
  			return <ActivityIndicator />
  		}
  	}
}


const mapStateToProps = state => ({
	screen_status : state.mainScreenReducer.screen_status,
	contacts_permission : state.mainScreenReducer.contacts_permission,
	phone_state_permission : state.mainScreenReducer.phone_state_permission,
	sms_permission : state.mainScreenReducer.sms_permission,
	info : state.mainScreenReducer.info
})


export default connect(mapStateToProps)(MainScreen)
//export default MainScreen