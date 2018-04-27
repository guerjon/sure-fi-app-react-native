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

class Button extends Component{
	render(){	
		let width = this.props.width ? this.props.width : 80
		let height = this.props.height ? this.props.height : 40
		let marginHorizontal = this.props.marginHorizontal ? this.props.marginHorizontal : 5
		let basic_style = {
			width:width,
			height: height,
			alignItems: "center",
			justifyContent:"center",
			borderRadius: 10,
			marginHorizontal: marginHorizontal,
			borderWidth: 0.3,
			backgroundColor: "white"
		}

		let basic_text_style = {
			fontSize: 16,
			color:"black"
		}


		if(this.props.active){
			basic_style.backgroundColor = option_blue
			basic_text_style.fontSize = 16
			basic_text_style.color = "white"
		}

		return(
			<TouchableHighlight style={basic_style} onPress={() => this.props.handleTouchButton(this.props.text)}>
				<Text style={basic_text_style}>
					{this.props.text}
				</Text>
			</TouchableHighlight>
		)
	}
}


const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Button);