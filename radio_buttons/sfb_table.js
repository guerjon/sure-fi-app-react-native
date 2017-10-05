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


class SFBTable extends Component{
	constructor(props) {
	  	super(props);
	
	 	console.log("this.props on SFBTable",props);
	}
	render(){	
		return(
			<View>
				<Title name="SFBTable" type=""/>
				<View style={styles.row_style}>
					<Button text="Disabled" active={this.props.current_value == 0} handleTouchButton={(text) => this.props.updateValue(0)}/>
					<Button text="Enabled" active={this.props.current_value == 1} handleTouchButton={(text) => this.props.updateValue(1)}/>
				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(SFBTable);