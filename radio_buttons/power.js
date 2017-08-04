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


class Power extends Component{
	

	handleTouchButton(power){
		console.log("power updated to:", power)
		this.props.dispatch({type: "UPDATE_POWER",power : power})
	}

	getPowerButtons(){
		return(
			<View style={styles.row_style}>
				<Button text="1/8 Watt" active={this.props.current_value == "1/8 Watt"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				<Button text="1/4 Watt" active={this.props.current_value == "1/4 Watt"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				<Button text="1/2 Watt" active={this.props.current_value == "1/2 Watt"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				<Button text="1 Watt" active={this.props.current_value == "1 Watt"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
			</View>
		)
	}

	render(){	
		return(
			<View>
				<Title name="Power" type="Watts"/>
				{this.getPowerButtons()}
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Power);