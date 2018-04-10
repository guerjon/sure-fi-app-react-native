import React, {Component} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import {
	first_color,
	styles,
	width,
	height
} from '../../styles'
import { connect } from 'react-redux';
import {
	Image,
	View,
	TouchableHighlight,
	Text,
	Alert
} from 'react-native'
import stripe from 'tipsi-stripe'
import Background from '../../helpers/background'
const lockIcon = (<Icon name="lock" size={50} color="black"/> )


class PaymentOptions extends Component {

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true, 
    }

	constructor(props) {
		super(props);
		this.device = this.props.device
	}

    componentWillMount(){
	    stripe.setOptions({
		  publishableKey: 'pk_test_DkfAPP0epveDUsdjCnc9c9Bz',
		  androidPayMode: 'test', // Optional, android only, 'production' by default
		})    	
    }


	goToAndroidPayment(){
		this.props.navigator.push({
			screen : "AndroidPayment",
			title : "Android Payment",
			passProps: {
				stripe: stripe
			}
		})
	}

	handleAndroidPayPress = async () => {
	 	console.log("handleAndroidPayPress()")
	    try {
	    	this.props.dispatch({
	    		type:"SET_PAYMENT_LOADING",
	    		payment_loading : true,
	    	})	 
	    	this.props.dispatch({
	    		type:"SET_PAYMENT_TOKEN",
	    		payment_token: null
	    	})	 
	    			
			const token = await stripe.paymentRequestWithCardForm()
			var data = {
				card_id : token.card.cardId,
				last4 : token.card.last4,
				created  : token.created,
				token_id : token.tokenId,
			}

	      	console.log("token",token)
	      	console.log("data",data)
	      	this.props.setDemoTimeTo0();
	      	Alert.alert(
	      		"Success",
	      		"The device has been activated.",
	      		[
	      			{text: "Great!", onPress: () => this.resetDemoUnitTimeAndPop(), style: 'cancel'}
	      		]
	      	)

	    } catch (error) {
	    	console.log("error",error)
	    }
	}

	resetDemoUnitTimeAndPop(){
		
		this.props.dispatch({
			type:"SET_DEMO_UNIT_TIME",
			demo_unit_time: 0
		})

		this.props.navigator.pop()
	}

	render(){
		return (
			
				<View style={{flex:1,flexDirection:"column",alignItems:"center"}}>
					<View style={{flexDirection:"row","justifyContent":"center",alignItems:"center",width:width-50,marginTop:20}}>
						{lockIcon}
					</View>
					<View>
						<Text style={{fontSize:40,margin:20,color:"black"}}>
							$ 500.00 USD
						</Text>
					</View>
					<TouchableHighlight onPress={() => this.handleAndroidPayPress()}>
						<Image source={require('../../images/credit_card/credit_card.png')} style={{width:width - 150,height: width - 150}}/>
					</TouchableHighlight>
					<View>
						<Image source={require('../../images/visa_mastercard/visa_mastercard_logo.png')} style={{marginTop:40}}/>
					</View>
				</View>
			
		)			
	}
}

const mapStateToProps = state => ({
	device: state.scanCentralReducer.central_device,
})
export default connect(mapStateToProps)(PaymentOptions)