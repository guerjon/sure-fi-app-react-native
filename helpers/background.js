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

class Background extends Component{
	
	

	render(){	
		return(
			<View style={{flex:1}}>
				<Image source={
					require('../images/temp_background.imageset/temp_background.png')} 
					style={{
						flex:1,
						width:undefined,
						height: undefined,
						backgroundColor:'transparent',
					}}>
					{this.props.children}
				</Image>
			</View>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Background);