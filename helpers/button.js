import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableNativeFeedback
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
			borderRadius: 5,
			marginHorizontal: marginHorizontal,
			borderWidth: 1,
			backgroundColor: "white",
			borderColor:option_blue,
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
			<TouchableNativeFeedback  onPress={() => this.props.handleTouchButton(this.props.text)}>
				<View style={basic_style}>
					<Text style={basic_text_style}>
						{this.props.text}
					</Text>
				</View>
			</TouchableNativeFeedback>
		)
	}
}


const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Button);