import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	StyleSheet,
  	Dimensions,
  	Button,
  	TouchableHighlight,
  	TextInput,
  	Alert
} from 'react-native'
import { connect } from 'react-redux';
import {
	GET_USERS_FROM_PIN,
	INT_TO_BYTE_ARRAY,
	MODULE_WIEGAND_CENTRAL,
	MODULE_WIEGAND_REMOTE,
	EQUIPMENT_TYPE,
	THERMOSTAT_TYPE
} from '../constants'


const option_blue = "#5AB0E3"

var modal_width = Dimensions.get('window').width * 0.8
var height = Dimensions.get('window').height


class SetDemoUnitTimeModal extends Component{
	
	constructor(props) {
	  	super(props);
	  	this.text = ""
	  	this.hardware_type = props.device.manufactured_data.hardware_type
	}

	handleNumberChange(text){
		this.text = text
	}

	handleEnterButton(){
		const hardware_type = this.hardware_type;
		if(this.text.length){
			var number_of_days = parseInt(this.text) 
			if(hardware_type == MODULE_WIEGAND_CENTRAL || hardware_type == MODULE_WIEGAND_REMOTE || hardware_type == EQUIPMENT_TYPE ||  hardware_type == THERMOSTAT_TYPE){
				var numer_seconds = number_of_days * 86400
				var number_seconds_bytes = INT_TO_BYTE_ARRAY(numer_seconds)
				this.props.setDemoModeTime(number_seconds_bytes)

			}else{
				this.props.setDemoModeTime(number_of_days)
			}

			setTimeout(() => this.props.getDemoModeTime(),2000)
			this.closeModal()

		}else{
			Alert.alert("Error","The field can't be empty.")
		}
	}

	longToByteArray (long) {
	    // we want to represent the input as a 8-bytes array
	    var byteArray = [0, 0];

	    for ( var index = byteArray.length -1; index >= 0; index -- ) {
	        var byte = long & 0xff;
	        byteArray [ index ] = byte;
	        long = (long - byte) / 256 ;
	    }

	    return byteArray;
	};

	closeModal() {
        this.props.navigator.dismissLightBox();
    }

  	render() {
	    return (
	      	<View style={styles.container}>
	      		<View style={{marginTop:150}}>
		        	<View
		        		
		        		style={{backgroundColor:"white",borderTopRightRadius:10, borderTopLeftRadius: 10}} 
		        	>
		        		<View style={{flexDirection:"row",padding:10,width: modal_width,alignItems:"center",justifyContent:"center"}}>
			        		<View style={{justifyContent:"flex-start"}}>
				        		<Text style={{fontSize:20,textAlign:"center"}}>
				        			Set Demo Unit Time (days)
				        		</Text>
			        		</View>
		        		</View>
		        	</View>
					<View style={{backgroundColor:"white"}}>
						<View style={{flexDirection:"row"}}>
							<View style={{width:modal_width-20,height:40,backgroundColor:"white",margin:10,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10}}>
								<View style={{alignItems:"center",justifyContent:"center",height:50,width:200}}>
									<TextInput 
										maxLength={20}
										style={{flex:1,justifyContent:"center",fontSize:25,width:200,textAlign:"center"}} 
										keyboardType="numeric" 
										underlineColorAndroid="transparent" 
										onChangeText={(t) => this.handleNumberChange(t)}
										placeholder="DAYS"
									/>
								</View>
							</View>
						</View>
					</View>
					<View style={{flexDirection:"row"}}>
			        	<TouchableHighlight
			        		onPress={() => this.closeModal()}
			        		style={{backgroundColor:"white",height:60, borderBottomLeftRadius: 10}} 
			        	>
			        		<View style={{flexDirection:"row",padding:10,width: modal_width/2,alignItems:"center",justifyContent:"center"}}>
				        		<Text style={{fontSize:20,color:"red"}}>
				        			Cancel
				        		</Text>
			        		</View>
			        	</TouchableHighlight>
			        	<TouchableHighlight
			        		onPress={() => this.handleEnterButton()}
			        		style={{backgroundColor:"white",height:60,borderBottomRightRadius:10}} 
			        	>
			        		<View style={{flexDirection:"row",padding:10,width: modal_width/2,alignItems:"center",justifyContent:"center"}}>
				        		<Text style={{fontSize:20,color:option_blue}}>
				        			Enter
				        		</Text>
			        		</View>
			        	</TouchableHighlight>
		        	</View>
	        	</View>
	      	</View>
	    );
	}
}

const styles = StyleSheet.create({
  container: {
    width: modal_width,
    borderTopRightRadius:10,
    borderTopLeftRadius: 10,
    borderRadius: 5,
    flex:1
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    marginTop: 8,
  },
});

const mapStateToProps = state => ({
	device: state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(SetDemoUnitTimeModal);
