import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight
} from 'react-native';

import {styles} from '../styles/index.js'
import  {connect} from 'react-redux';

class Bridges extends Component{
	
	static navigationOptions ={
		title : "Sure-Fi Bridges"
	}

	render(){
		return(
			<ScrollView style={styles.bridgeContainer}>
				<Image  
					source={require('../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_container}
				>	
					<View style={styles.bridgeImageContainer}>
						<TouchableHighlight onPress={()=> this.props.navigation.navigate("PairBridge")}>
							<View>
								<Image 
									source={require('../images/bluetooth_pairing_icon.imageset/bluetooth_pairing_icon.png')} 
									style={styles.bridgeImage}
								>
								</Image>
								<Text style={styles.bridgeText}>
									Pair New Bridge
								</Text>
							</View>
						</TouchableHighlight>
					</View>
					<View style={styles.bridgeImageContainer}>
						<TouchableHighlight onPress={()=> this.props.navigation.navigate("BridgesConfiguration")}>
							<View>
								<Image 
									source={require('../images/settings_icon.imageset/settings_icon.png')} 
									style={styles.bridgeImage}
								>
								</Image>
								<Text style={styles.bridgeText}>
									Configure Existing Bridge
								</Text>
							</View>
						</TouchableHighlight>
					</View>
					<View style={styles.bridgeImageContainer}>
						<Image 
							source={require('../images/troubleshooting_icon.imageset/troubleshooting_icon.png')} 
							style={styles.bridgeImage}
						>
						</Image>
						<Text style={styles.bridgeText}>
							Troubleshoot Bridge
						</Text>
					</View>
					<View style={styles.bridgeImageContainer}>
						<Image 
							source={require('../images/purchase_icon.imageset/purchase_icon.png')} 
							style={styles.bridgeImage}
						>
						</Image>
						<Text style={styles.bridgeText}>
							Purchase Additional Bridges
						</Text>
					</View>

				</Image>

			</ScrollView>
		);
	}
}

export default connect()(Bridges) 