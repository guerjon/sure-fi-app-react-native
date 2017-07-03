import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
} from 'react-native'
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'

class Template extends Component{
	
	static navigationOptions ={
		title : "Template",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	render(){	
		return(
			<ScrollView style={styles.pairContainer}>
				<Image  
					source={require('../images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>	
					<View style={styles.pairSectionsContainer}>
						<Text>
							Hola
						</Text>
					</View>
				</Image>
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Template);


/*

const initialState = {
}

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
*/