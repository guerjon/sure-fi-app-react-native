import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
} from 'react-native'
import {styles,first_color,light_gray_background} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'

class Background extends Component{
	
	

	render(){	
		return(
			<View style={{flex:1,backgroundColor:light_gray_background}}>
				{this.props.children}
			</View>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Background);