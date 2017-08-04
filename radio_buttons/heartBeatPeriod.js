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




class HeartbeatPeriod extends Component{
	
	handleTouchButton(heartbeat_period){
		this.props.dispatch({type: "UPDATE_HEARTBEAT_PERIOD",heartbeat_period : heartbeat_period})
	}

	getHeartbeatPeriodButtons(){
		return (
			<View>
				<View style={styles.row_style}>
					<Button text="0 Sec" active={this.props.current_value == "0 Sec"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="15 Sec" active={this.props.current_value == "15 Sec"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="30 Sec" active={this.props.current_value == "30 Sec"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>
				<View style={styles.row_style}>	
					<Button text="60 Sec" active={this.props.current_value == "60 Sec"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="90 Sec" active={this.props.current_value == "90 Sec"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="120 Sec" active={this.props.current_value == "120 Sec"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>
			</View>
		)		
	}

	render(){	
		return(
			<View>
				<Title name="Heartbeat Period" type="Seconds"/>
				{this.getHeartbeatPeriodButtons()}
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(HeartbeatPeriod);