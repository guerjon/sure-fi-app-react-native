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




class BandWidth extends Component{
	
	handleTouchButton(band_width){
		console.log("bandWidth update to:", band_width)
		this.props.dispatch({type: "UPDATE_BAND_WIDTH",band_width : band_width})
	}

	getBandWidthButtons(){
		
		return(
			<View>
				<View style={styles.row_style}>
					<Button text="31.25 kHz" active={this.props.current_value == "31.25 kHz"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="62.50 kHz" active={this.props.current_value == "62.50 kHz"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="125 kHz" active={this.props.current_value == "125 kHz"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>
				<View style={styles.row_style}>	
					<Button text="250 kHz" active={this.props.current_value == "250 kHz"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
					<Button text="500 kHz" active={this.props.current_value == "500 kHz"} handleTouchButton={(text) => this.handleTouchButton(text)}/>
				</View>		
			</View>
		)
	}

	render(){	
		return(
			<View>
				<Title name="BandWidth" type="kHz"/>
				{this.getBandWidthButtons()}
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(BandWidth);