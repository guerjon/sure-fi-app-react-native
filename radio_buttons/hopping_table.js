import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TextInput
} from 'react-native'
import {styles,first_color,width,success_green} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'
import Button from '../helpers/button'
import Title from '../helpers/title'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
 
var radio_props = [
  	{label: 'Default', value: 0 },
  	{label: 'Other   ', value: 1 }
];

class HoppingTable extends Component{
	
	componentWillMount() {

	  	if(this.props.current_value == 255){
	  		console.log("no etra?")
	  		this.props.dispatch({type:"UPDATE_CHECKBOX_SELECTED",checkbox_selected:0})
	  		this.props.dispatch({type: "TEXT_INPUT_EDITABLE",text_input_editable:false})
	  	}
	}

	updateHoppingTable(hopping_table_selected){
		this.props.dispatch({type: "UPDATE_HOPPING_TABLE",hopping_table_selected:hopping_table_selected})
	}

	handleCheckBoxSelected(checkbox_selected){
		console.log("checkbox_selected",checkbox_selected);

		
		this.props.dispatch({type:"UPDATE_CHECKBOX_SELECTED",checkbox_selected:checkbox_selected})
		
		if(checkbox_selected == 0){

			this.updateHoppingTable(255)
			this.props.dispatch({type:"TEXT_INPUT_EDITABLE",text_input_editable: false})
		}else{
			this.props.dispatch({type:"TEXT_INPUT_EDITABLE",text_input_editable: true})
		}
	}

	render(){
		
		console.log("this.props.checkbox_selected",this.props.checkbox_selected);
		console.log("this.props.text_input_editable",this.props.text_input_editable);

		return(
			<View>
				<View style={{alignItems:"center",paddingVertical:25}}>
					<Title name="Hopping Table Value" type=""/>
					<View style={{flexDirection:"row",paddingTop:10,width:width}}>
						<View style={{width:width/2,justifyContent:"center",alignItems:"center"}}>
							<RadioForm
							  radio_props={radio_props}
							  initial={this.props.checkbox_selected}
							  formHorizontal={false}
							  labelHorizontal={true}
							  buttonColor={success_green}
							  onPress={(value) => this.handleCheckBoxSelected(value)}
							/>	
						</View>
						<View style={{width:width/2,alignItems:"center",justifyContent:"center"}}>
						    <TextInput
			    				style={{height: 40, borderColor: 'gray', borderWidth: 0.6,backgroundColor:"white",width:80,textAlign:"center",fontSize:18,marginHorizontal:40}}
			    				keyboardType="numeric"
			    				maxLength = {3}
			    				editable={this.props.text_input_editable}
			    				onChangeText={(hopping_table_selected) => this.updateHoppingTable(hopping_table_selected)}
			    				underlineColorAndroid="transparent" 
			    				value={this.props.current_value ?  this.props.current_value.toString() : ""}
			    				placeholder="XXX"
			  				/>
		  				</View>
					</View>				
  				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(HoppingTable);