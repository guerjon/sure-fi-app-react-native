import React, {Component} from 'react'
import {
  	StyleSheet,
  	Text,
  	View,
  	Image,
  	Dimensions,
  	TouchableHighlight,
  	Linkingm,
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
const PushNotification = NativeModules.PushNotification




var {width,height} = Dimensions.get("window")


class MainScreen extends Component {
  
  	constructor(props) {
		super(props);
		
  	}


  	componentWillMount() {

  		PushNotification.getBuildInfo(data => { //data is a json
  			this.sendInformation(data)
  		})

  	}

  	sendInformation(info){
  		var {dispatch} = this.props
  		var device_details = info.model + "-" + info.android_version + "-" + info.language + "-" + info.country + "-" + info.app_version
  		console.log("info",info)
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
  		if(screen_status == "show_main_screen"){
			return (
		  		<View style={styles.container}>
					<Image source={require('./images/temp_background.imageset/temp_background.png')} style={styles.image_container}>
			  			<View style={styles.circleContainer}>
				  			<View style={styles.launchImage}>
				  				<Image source={require('./images/sure-fi_menu.imageset/sure-fi_menu.png')} style={{width:width-200,height:50,top:-15}}/>
				  			</View>
			  			</View>
			  			<Coverflow 
			  				onChange={(index) => null} 
			  				style={styles.coverflow}
			  				spacing={200}
			  				scaleDown={0.7}
			  				rotation={1}
			  			>
							<View>
								<View>
									<TouchableHighlight onPress={() => navigate("Bridges") }>
										<Image source={require('./images/menu_bridge.imageset/menu_bridge.png')} >
										</Image>
									</TouchableHighlight>
								</View>
								<View style={styles.textView}>
									<Text style={styles.text}>
										Access Controll Bridges
									</Text>
								</View>
							</View>
							<View>
								<View>
									<Image source={require('./images/menu_access_control.imageset/menu_access_control.png')} >
									</Image>
								</View>
								<View>
								</View>
								<View style={styles.textView}>
									<Text style={styles.text}>
										Access Control Systems (Coming 2018)
									</Text>
								</View>
							</View>
							<View>
								<View>
									<Image source={require('./images/menu_hvac.imageset/menu_hvac.png')} >
									</Image>
								</View>
								<View>
								</View>
								<View style={styles.textView}>
									<Text style={styles.text}>
										HVAC Systems (Coming Q4 2017)
									</Text>
								</View>
							</View>
							<View>
								<View>
									<Image source={require('./images/menu_account.imageset/menu_account.png')} >
									</Image>
								</View>
								<View>
								</View>
								<View style={styles.textView}>
									<Text style={styles.text}>
										Account Access
									</Text>
								</View>
							</View>
							<View>
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
							<View>
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
					</Image>
		  		</View>
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