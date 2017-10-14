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
	
	render(){	
		return(
			<View>
				<Title name="BandWidth" type=""/>
				<View>
					<View style={styles.row_style}>
						<Button text="31.25 kHz" active={this.props.current_value == 1} handleTouchButton={() => this.props.updateValue(1)}/>
						<Button text="62.50 kHz" active={this.props.current_value == 2} handleTouchButton={() => this.props.updateValue(2)}/>
						<Button text="125 kHz" active={this.props.current_value == 3} handleTouchButton={() => this.props.updateValue(3)}/>
					</View>
					<View style={styles.row_style}>	
						<Button text="250 kHz" active={this.props.current_value == 4} handleTouchButton={() => this.props.updateValue(4)}/>
						<Button text="500 kHz" active={this.props.current_value == 5} handleTouchButton={() => this.props.updateValue(5)}/>
					</View>		
				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(BandWidth);