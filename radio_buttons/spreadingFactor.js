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




class SpreadingFactor extends Component{
	
	handleTouchButton(spreading_factor){
		console.log("spreading updated to",spreading_factor)
		this.props.dispatch({type: "UPDATE_SPREADING_FACTOR",spreading_factor : spreading_factor})
	}

	getSpreadingFactorButtons(){
		return (
			<View>
				<View style={styles.row_style}>
					<Button text="SF7" active={this.props.current_value == "SF7"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="SF8" active={this.props.current_value == "SF8"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="SF9" active={this.props.current_value == "SF9"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>
				<View style={styles.row_style}>	
					<Button text="SF10" active={this.props.current_value == "SF10"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="SF11" active={this.props.current_value == "SF11"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="SF12" active={this.props.current_value == "SF12"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>
			</View>
		)
	}

	render(){	
		return(
			<View>
				<Title name="Spreading Factor" type=""/>
				{this.getSpreadingFactorButtons()}
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(SpreadingFactor);