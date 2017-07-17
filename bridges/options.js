import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	ActivityIndicator,
  	TouchableHighlight
} from 'react-native'
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'


class Options extends Component{
	
	static navigationOptions ={
		title : "Template",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}


	constructor(props) {
		super(props);		
	}

	renderUnpairedOptions(){
		return (
			<View style={{marginTop:10}}>
				<TouchableHighlight style={styles.white_touchable_highlight}>
					<View style={styles.white_touchable_highlight_inner_container}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_pair.imageset/menu_pair.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Pair Bridge
							</Text>
						</View>
					</View>
				</TouchableHighlight>
				<TouchableHighlight style={styles.white_touchable_highlight}>
					<View style={styles.white_touchable_highlight_inner_container}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_flash_firmware.imageset/menu_flash_firmware.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Update Firmware
							</Text>
						</View>
					</View>
				</TouchableHighlight>				
				<TouchableHighlight style={styles.white_touchable_highlight}>
					<View style={{flexDirection:"row",padding:5,alignItems:"center"}}>
						<View style={styles.white_touchable_highlight_image_container}>
							<Image source={require('../images/menu_radio_settings.imageset/menu_radio_settings.png')} style={styles.white_touchable_highlight_image}/>
						</View>
						<View style={styles.white_touchable_text_container}>
							<Text style={styles.white_touchable_text}>
								Configure Radio
							</Text>
						</View>
					</View>
				</TouchableHighlight>	
			</View>
		)
	}

	renderPairedOptions(){

	}

	renderDeployedOptions(){

	}

	renderOptions(status){
		switch(status){
			case 0:
			return <ActivityIndicator />
			
			case 1:
			return <View>{this.renderUnpairedOptions()}</View>
			
			case 3: 
			return this.renderPairedOptions()
			
			case 4:
			return this.renderDeployedOptions()
			
			default:
			return null;
		}
	}

	render(){	

		var options = this.renderOptions(this.props.device_status)

		return <View>{options}</View>
		
	}
}

const mapStateToProps = state => ({
	device_status : state.setupCentralReducer.device_status
});

export default connect(mapStateToProps)(Options);