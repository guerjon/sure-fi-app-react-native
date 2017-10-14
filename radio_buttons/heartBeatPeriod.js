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
	render(){	
		return(
			<View>
				<Title name="Heartbeat Period" type=""/>
				<View>
					<View style={styles.row_style}>
						<Button text="0 Sec" active={this.props.current_value == 0} handleTouchButton={() => this.props.updateValue(0)}/>
						<Button text="15 Sec" active={this.props.current_value == 15} handleTouchButton={() => this.props.updateValue(15)}/>
						<Button text="30 Sec" active={this.props.current_value == 30} handleTouchButton={() => this.props.updateValue(30)}/>
						<Button text="1 min" active={this.props.current_value == 60} handleTouchButton={() => this.props.updateValue(60)}/>
					</View>
					<View style={styles.row_style}>	
						<Button text="2 min" active={this.props.current_value == 120} handleTouchButton={() => this.props.updateValue(120)}/>
						<Button text="4 min" active={this.props.current_value == 240} handleTouchButton={() => this.props.updateValue(240)}/>
						<Button text="5 min" active={this.props.current_value == 300} handleTouchButton={() => this.props.updateValue(300)}/>
						<Button text="10 min" active={this.props.current_value == 600} handleTouchButton={() => this.props.updateValue(600)}/>
						
					</View>
					<View style={styles.row_style}>	
						<Button text="15 min" active={this.props.current_value == 900} handleTouchButton={() => this.props.updateValue(900)}/>
						<Button text="30 min" active={this.props.current_value == 1800} handleTouchButton={() => this.props.updateValue(1800)}/>
						<Button text="1 hour" active={this.props.current_value == 3600} handleTouchButton={() => this.props.updateValue(3600)}/> 
						<Button text="2 hours" active={this.props.current_value == 7200} handleTouchButton={() => this.props.updateValue(7200)}/>
						
					</View>
					<View style={styles.row_style}>	
						<Button text="4 hours" active={this.props.current_value == 14400} handleTouchButton={() => this.props.updateValue(14400)}/>
						<Button text="8 hours" active={this.props.current_value == 28800} handleTouchButton={() => this.props.updateValue(28800)}/>
						<Button text="12 hours" active={this.props.current_value == 43200} handleTouchButton={() => this.props.updateValue(43200)}/>
					</View>
				</View>
			</View>	

		);	
	}
}

const mapStateToProps = state => ({
});

export default connect(mapStateToProps)(HeartbeatPeriod);