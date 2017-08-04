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
import Button from '../helpers/button'
import Title from '../helpers/title'


class Acknowledments extends Component{
	
	handleTouchButton(acknowledments){
		this.props.dispatch({type: "UPDATE_ACKNOWLEDMENTS",acknowledments : acknowledments})
	}
		
	getAcknowledmentsButtons(){
		
		return(
			<View style={styles.row_style}>
				<Button text="Disabled" active={this.props.current_value == "Disabled"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				<Button text="Enabled" active={this.props.current_value == "Enabled"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
			</View>
		)
	}


	render(){	
		return(
			<View>
				<Title name="Acknowledments" type=""/>
				{this.getAcknowledmentsButtons()}
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Acknowledments);