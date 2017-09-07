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
import Background from './helpers/background'

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
				<Background>
					<View style={styles.pairSectionsContainer}>
						<Text>
							Hola
						</Text>
					</View>
				</Background>
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