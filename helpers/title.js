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

export default class Title extends Component{
	
	render(){	
		var title_container = {
			backgroundColor:"white",
			marginTop:10,
			justifyContent:"center",
			alignItems:"center",
			flexDirection:"row"
		}		
		var simple_text = {
			fontSize:20,
			padding:5,
			marginLeft:5,
		}	
		var red_text = {
			fontSize:14,
			color : "red"			
		}
			
		return (
			<View style={title_container}>
				<Text style={simple_text}>
					{this.props.name}
				</Text>
				<Text style={red_text}>
					{this.props.type}
				</Text>
			</View>	
		)	
	}
}