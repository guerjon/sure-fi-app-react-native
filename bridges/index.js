import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	FlatList
	} from 'react-native';

import {styles,first_color} from '../styles/index.js'
import  {connect} from 'react-redux';

class Bridges extends Component{
	
	static navigationOptions ={
		title : "Sure-Fi Bridges",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	generateOptions(options){
		return (
			<View style={styles.bridgeImageContainer}>
				<TouchableHighlight onPress={options.route}>
					<View>
						<View style={styles.imageBridgesContainer}>
							<Image 
								source={options.image} 
								style={styles.bridgeImage}
							/>
						</View>
						<View style={styles.textBridgesContainer}>
							<Text style={styles.bridgeText}>
								{options.text}
							</Text>
						</View>
					</View>
				</TouchableHighlight>
			</View>
		)
	}

	

	render(){
		const options = [
			{
				image : require('../images/bluetooth_pairing_icon.imageset/bluetooth_pairing_icon.png'),
				route : () => this.props.navigation.navigate("PairBridge"),
				text : "Pair New Bridge"
			},
			{
				image : require('../images/settings_icon.imageset/settings_icon.png'),
				route : ()=> this.props.navigation.navigate("BridgesConfiguration"),
				text : "Configure Existing Bridge"
			},
			{
				image : require('../images/troubleshooting_icon.imageset/troubleshooting_icon.png'),
				route : ()=> this.props.navigation.navigate("RadioConfiguration"),
				text : "Troubleshoot Bridge"
			},
			{
				image : require('../images/purchase_icon.imageset/purchase_icon.png'),
				route : () => console.log("to do purchase_icon"),
				text : "Purchase Additional Bridges"
			}
		]

		return(
			<ScrollView style={styles.bridgeContainer}>
				<Image  
					source={require('../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_container}
				>	
					<FlatList data = {options} renderItem={({item}) => this.generateOptions(item)} keyExtractor={(item,index) => item.route}/>
				</Image>

			</ScrollView>
		);
	}
}

export default connect()(Bridges) 