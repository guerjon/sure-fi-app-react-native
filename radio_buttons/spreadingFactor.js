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
		if(this.props.sfb_table_selected  === 0)
			return(
				<View>
					<Title name="Spreading Factor" type=""/>
					<View>
						<View style={styles.row_style}>
							<Button text="SF7" active={this.props.current_value == 1} handleTouchButton={() => this.props.updateValue(1)}/>
							<Button text="SF8" active={this.props.current_value == 2} handleTouchButton={() => this.props.updateValue(2)}/>
							<Button text="SF9" active={this.props.current_value == 3} handleTouchButton={() => this.props.updateValue(3)}/>
						</View>
						<View style={styles.row_style}>	
							<Button text="SF10" active={this.props.current_value == 4} handleTouchButton={() => this.props.updateValue(4)}/>
							<Button text="SF11" active={this.props.current_value == 5} handleTouchButton={() => this.props.updateValue(5)}/>
							<Button text="SF12" active={this.props.current_value == 6} handleTouchButton={() => this.props.updateValue(6)}/>
						</View>
					</View>
				</View>	
			);	

		return null
	}
}

const mapStateToProps = state => ({
	sfb_table_selected : state.configureRadioCentralReducer.sfb_table_selected,
});

export default connect(mapStateToProps)(SpreadingFactor);


/// estabas arreglando el bug con el spreading factor al parecer estos morros cambiaron los valores otra vez7