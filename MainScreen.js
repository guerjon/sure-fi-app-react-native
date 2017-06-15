import React, {Component} from 'react'
import {
  	StyleSheet,
  	Text,
  	View,
  	Image,
  	Dimensions,
  	TouchableHighlight,
  	Linking
} from 'react-native';

import { StackNavigator } from 'react-navigation';
import Coverflow from 'react-native-coverflow'
import SplashScreen from 'react-native-splash-screen'
import {styles} from './styles'
import { connect } from 'react-redux';

var {width,height} = Dimensions.get("window")


class MainScreen extends Component {
  
  	constructor(props) {
		super(props);
  	}

	openSureFiPage(url){
		console.log(url)
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
  	}
}


export default connect()(MainScreen)