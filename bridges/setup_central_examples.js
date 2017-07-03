import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	Dimensions
} from 'react-native'
import {styles,first_color,success_green} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'
var {width,height} = Dimensions.get('window')

class SetupCentralExamples extends Component{
	
	static navigationOptions ={
		title : "Examples Central",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	render(){	
		return(
			<ScrollView style={styles.pairContainer}>
				<View style={{marginVertical:10,marginHorizontal: 20}}>
					<View style={{alignItems:"center"}}>
				        <Image
				          style={{width: 220 , height: 220,margin:20,borderColor:success_green,borderWidth:1}}
				          source={require('../images/temp_background.imageset/temp_background.png')} 
				        >
		                </Image>
					</View>
					<View>
						<Text>
							Since this image will be used for support in the future, your image should clearly show how the Sure-Fi bridge is integrated with the control system.
						</Text>
					</View>
					<View style={{flexDirection:"row"}}>
						<View style={{flex:1,alignItems:"center"}}>
					        <Image
					          style={{width: 120 , height: 120,margin:20,borderColor:"red",borderWidth:1}}
					          source={require('../images/temp_background.imageset/temp_background.png')} 
					        >
			                </Image>
						</View>
						<View style={{flex:1,alignItems:"center"}}>
					        <Image
					          style={{width: 120 , height: 120,margin:20,borderColor:"red",borderWidth:1}}
					          source={require('../images/temp_background.imageset/temp_background.png')} 
					        >
			                </Image>
						</View>						
					</View>
					<View>
						<Text>
							Do NOT take a picture of the entire room where the Sure-Fi bridge is located, or just a picture of the Sure-Fi bridge itself.
						</Text>
					</View>
				</View>
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({
	screen_status : state.setupCentralReducer.screen_status
});

export default connect(mapStateToProps)(SetupCentralExamples);
