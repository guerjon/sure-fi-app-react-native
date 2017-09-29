import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TextInput
} from 'react-native'
import {styles,first_color,width} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'
import Button from '../helpers/button'
import Title from '../helpers/title'




class HoppingTable extends Component{
	
	updateHoppingTable(hopping_table_selected){
		this.props.dispatch({type: "UPDATE_HOPPING_TABLE",hopping_table_selected:hopping_table_selected})
	}

	render(){
		return(
			<View>
				<View style={{alignItems:"center",paddingVertical:25}}>
					<Title name="Hopping Table Value" type=""/>
				    <TextInput
	    				style={{height: 40, borderColor: 'gray', borderWidth: 0.6,backgroundColor:"white",width:width -40}}
	    				keyboardType="numeric"
	    				maxLength = {3}
	    				onChangeText={(hopping_table_selected) => this.updateHoppingTable(hopping_table_selected)}
	    				underlineColorAndroid="transparent" 
	    				value={this.props.current_value.toString()}
	  				/>
  				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({
});

export default connect(mapStateToProps)(HoppingTable);