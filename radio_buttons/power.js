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
	
	render(){	
		console.log("ths.props",this.props)
		return(
			<View>
				<Title name="Power" type=""/>
				<View style={styles.row_style}>
					<Button text="1/8 Watt" active={this.props.current_value == 1} handleTouchButton={() => this.props.updateValue(1)}/>
					<Button text="1/4 Watt" active={this.props.current_value == 2} handleTouchButton={() => this.props.updateValue(2)}/>
					<Button text="1/2 Watt" active={this.props.current_value == 3} handleTouchButton={() => this.props.updateValue(3)}/>
					<Button text="1 Watt" active={this.props.current_value == 4} handleTouchButton={() => this.props.updateValue(4)}/>
				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({
});

export default connect(mapStateToProps)(Power);