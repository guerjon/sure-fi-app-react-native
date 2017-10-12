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

	render(){	
		return(
			<View>
				<Title name="Spreading Factor" type=""/>
				<View>
					<View style={styles.row_style}>
						<Button text="SF7" active={this.props.current_value == 7} handleTouchButton={() => this.props.updateValue(7)}/>
						<Button text="SF8" active={this.props.current_value == 8} handleTouchButton={() => this.props.updateValue(8)}/>
						<Button text="SF9" active={this.props.current_value == 9} handleTouchButton={() => this.props.updateValue(9)}/>
					</View>
					<View style={styles.row_style}>	
						<Button text="SF10" active={this.props.current_value == 10} handleTouchButton={() => this.props.updateValue(10)}/>
						<Button text="SF11" active={this.props.current_value == 11} handleTouchButton={() => this.props.updateValue(11)}/>
						<Button text="SF12" active={this.props.current_value == 12} handleTouchButton={() => this.props.updateValue(12)}/>
					</View>
				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(SpreadingFactor);


/// estabas arreglando el bug con el spreading factor al parecer estos morros cambiaron los valores otra vez7