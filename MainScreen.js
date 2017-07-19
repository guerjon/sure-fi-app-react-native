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
  	NativeEventEmitter
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

  		/*PushNotification.getBuildInfo(data => { //data is a json
  			this.sendInformation(data)
  		})
		*/
  	}

  	sendInformation(info){
  		var {dispatch} = this.props
  		var device_details = info.model + "-" + info.android_version + "-" + info.language + "-" + info.country + "-" + info.app_version
  		
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
  				if(response.status == "success"){
  					let data = response.data
  					if(data.registered){
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
  		//if(screen_status == "show_main_screen"){ change_this_to_production
  		if(true){	
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
											Access Controll 
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
	screen_status : state.mainScreenReducer.screen_status
})


export default connect(mapStateToProps)(MainScreen)