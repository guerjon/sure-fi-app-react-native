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
	
	render(){	
		return(
			<View>
				<Title name="Retry Count" type=""/>
				<View>
					<View style={styles.row_style}>
						<Button text="0" active={this.props.current_value == 0} handleTouchButton={() => this.props.updateValue(0)}/>
						<Button text="1" active={this.props.current_value == 1} handleTouchButton={() => this.props.updateValue(1)}/>
						<Button text="2" active={this.props.current_value == 2} handleTouchButton={() => this.props.updateValue(2)}/>
					</View>
					<View style={styles.row_style}>	
						<Button text="3" active={this.props.current_value == 3} handleTouchButton={() => this.props.updateValue(3)}/>
						<Button text="4" active={this.props.current_value == 4} handleTouchButton={() => this.props.updateValue(4)}/>
						<Button text="5" active={this.props.current_value == 5} handleTouchButton={() => this.props.updateValue(5)}/>
					</View>			
				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(RetryCount);