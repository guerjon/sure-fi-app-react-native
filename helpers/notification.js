import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight
} from 'react-native'
import {styles,first_color,width,height} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'
import Icon from 'react-native-vector-icons/FontAwesome';

class Notification extends Component{
	
	static navigationOptions ={
		title : "Template",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}

	componentWillMount() {
		this.stateMistmach(this.props.indicatorNumber)
	}


	stateMistmach(indicator_number){
		switch (indicator_number) {
	    	case 13:
	        	this.title_notification = "Your Device Needs to be Paired"
	        	this.text_notification = "Touch the [Force Pair] Option Below"
	        	break
	    	case 14:
	        	this.title_notification = "Your Device Needs to be Deployed"
	        	this.text_notification = "Touch the [Force Pair] Option Below then continue and Deploy your device"
	        	break
	        case 23:
	        	this.title_notification = "Your Device Is Currently Pairing"
	        	this.text_notification = "If this state continues for more than 1 minute, power cycle device and try again"	        
	        	break
	    	case 24:
	        	this.title_notification = "Your Device Is Currently Pairing"
	        	this.text_notification = "If this state continues for more than 1 minute, power cycle device and try again"
	        	break
	        case 31:
	        	this.title_notification = "Your Device Needs to be Unpaired"
	        	this.text_notification = "Touch the [Force Unpair] Option Below"
	        	break
	    	case 41:
	        	this.title_notification = "Your Device Needs to be Unpaired"
	        	this.text_notification = "Touch the [Force Unpair] Option Below"
	        	break
	    	case 34:
	        	this.title_notification = "Your Device Needs to be Deployed"
	        	this.text_notification = "Touch the [Deploy Bridge] Option Below"
	        	break
	    	default:
	        	this.title_notification = "You should never see this Error: \(stateMismatch)"
	        	this.text_notification = "Please power cycle your device and try again"
	        	break
	    }
	}


	render(){	
		if(this.props.showNotification){
			return(
				<View>
					<View style={{width:width,height:100,backgroundColor:"#A52A2A",marginTop:5,justifyContent:"center",flexDirection:"row",alignItems:"center"}} onPress={() => this.props.handleNotification()}>
						<View style={{flex: 0.2,alignItems:"center",justifyContent:"center"}}>
							<Icon name="exclamation-triangle" color="white" size={60} />
						</View>
						<View style={{flex:0.8,borderRadius:20,height:80,alignItems:"center",justifyContent:"center"}}>
							<Text style={{color:"white",fontSize:18,marginRight:20}}>
								{this.title_notification}
							</Text>
							<Text style={{color:"white",fontSize:15}}> 
								{this.text_notification}
							</Text>
						</View>
					</View>
				</View>
			);	
		}
		return null
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Notification);