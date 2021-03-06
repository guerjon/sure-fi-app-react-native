import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight
} from 'react-native'
import {styles,first_color,success_green,option_blue} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'

class SmallButton extends Component{
	render(){	
		var big_button_style ={
			borderWidth: 0.3,
			width:60,
			height: 30,
			alignItems: "center",
			justifyContent:"center",
			borderRadius: 10,
			marginHorizontal: 5,
		}
		var big_button_text_style = {
			fontSize: 10,
			color:"black"
		}

		var active_button_style = {
			width:60,
			height: 30,
			alignItems: "center",
			justifyContent:"center",
			borderRadius: 10,
			marginHorizontal: 5,
			backgroundColor: option_blue,
		}

		var active_button_text_style = {
			fontSize: 10,
			color:"white"
		}
		
		if(this.props.active){
			return (
				<TouchableHighlight style={active_button_style} >
					<Text style={active_button_text_style}>
						{this.props.text}
					</Text>
				</TouchableHighlight>
			)

		}

		return (
			<TouchableHighlight style={big_button_style} onPress={() => this.props.handleTouchButton(this.props.text)}>
				<Text style={big_button_text_style}>
					{this.props.text}
				</Text>
			</TouchableHighlight>
		)
	}
}


const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(SmallButton);