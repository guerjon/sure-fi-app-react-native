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




class RetryCount extends Component{
	
	handleTouchButton(retry_count){
		this.props.dispatch({type: "UPDATE_RETRY_COUNT",retry_count : retry_count})
	}

	getRetryCountButtons(){
		return(
			<View>
				<View style={styles.row_style}>
					<Button text="0" active={this.props.current_value == 0} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="1" active={this.props.current_value == 1} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="2" active={this.props.current_value == 2} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>
				<View style={styles.row_style}>	
					<Button text="3" active={this.props.current_value == 3} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="4" active={this.props.current_value == 4} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="5" active={this.props.current_value == 5} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>			
			</View>
		)		
	}

	render(){	
		return(
			<View>
				<Title name="Retry Count" type=""/>
				{this.getRetryCountButtons()}
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(RetryCount);