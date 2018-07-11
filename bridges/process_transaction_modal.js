import React, {Component} from 'react'
import {
	Text,
	View,
	StyleSheet,
	Dimensions,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	TextInput,
	Alert
} from 'react-native'
import { connect } from 'react-redux';
import {styles,width,height,light_gray_background} from "../styles"

class ProcessTransactionModal extends Component{
	
	constructor(props) {
		super(props);
		this.state = {
			email: ""
		}
	}

	closeModal() {
		this.props.navigator.dismissLightBox();
  	}

	validateEmail(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(String(email).toLowerCase());
	}

  	reviewEmail(){
  		const email = this.state.email
  		if(this.validateEmail(email))
  			this.props.doPaymentOnTheServer(email)
  		else 
  			Alert.alert("Email incorrect","The email address is incorrect.")
  	}

	render() {
		return(                                     
			<View style={{backgroundColor: light_gray_background,height:height, alignItems:"center"}}>
				<View style={{width:width-40,marginTop:20,borderWidth:1,borderRadius:5}}>
					<View>
						<View style={{padding:20}}>
						  <Text style={{fontSize:20}}>
								Process transaction for $ { this.props.demo_unit_price } on card ending in ...{this.props.card_ending} 
						  </Text>
						</View>
					</View>
					<View style={{padding:20}}>
						<Text style={{fontSize:22}}>
							Please Introduce a Email address to recieve
						</Text>
						<Text style={{color:"black"}}>
							Email Addrees:
						</Text>
						<View>
					      <TextInput
					      	keyboardType="email-address"
					        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
					        onChangeText={(text) => this.setState({email:text})}
					        value={this.state.email}
					      />		
					     </View>
				    </View>
					<View style={{padding:20,flexDirection:"row"}}>
						<TouchableOpacity onPress={() => this.props.navigator.pop()} style={{backgroundColor:"red",width:120,alignItems:"center",borderRadius:5,justifyContent:"center"}}>
							<Text style={{padding:20,fontSize:18,color:"white"}}>
								Cancel
							</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => this.reviewEmail()} style={{backgroundColor:"green",width:180,alignItems:"center",borderRadius:5,marginLeft:20,justifyContent:"center"}}>
							<Text style={{padding:20,fontSize:18,color:"white"}}>
								Do payment
							</Text>
						</TouchableOpacity>
					</View>			
				</View>
			</View>                 
		)	
	}
}

const mapStateToProps = state => ({
	demo_unit_price: state.scanCentralReducer.demo_unit_price,
});

export default connect(mapStateToProps)(ProcessTransactionModal);
