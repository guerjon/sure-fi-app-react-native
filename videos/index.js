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
import Background from '../helpers/background'

class Videos extends Component{
	
	static navigationOptions ={
		title : "Videos",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	render(){	
		return(
			<Background>
				<View style={styles.pairSectionsContainer}>
					<Text>
						Hola
					</Text>
				</View>
			</Background>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Videos);
