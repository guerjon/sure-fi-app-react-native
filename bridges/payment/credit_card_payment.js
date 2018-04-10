import React, {Component} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import {
	first_color,
	width,
	height,

} from '../../styles'
import { connect } from 'react-redux';
import {
	Image,
	View,
	TouchableHighlight,
	StyleSheet
} from 'react-native'

import Background from '../../helpers/background'

class CreditCardPayment extends Component {

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

    async componentWillMount() {
    	var stripe = this.props.stripe

    	const allowed = await stripe.deviceSupportsAndroidPay()
    	console.log("allowed",allowed)
    	this.props.dispatch({
    		type:"SET_PAYMENT_ALLOWED",
    		payment_allowed: allowed
    	})	

    	this.handleAndroidPayPress()
  	}

	goToAndroidPayment(){
		this.props.navigator.push({
			screen : "AndroidPayment",
			title : "Android Payment",
		})
	}

	goToCreditCardPayment(){
		this.props.navigator.push({
			screen : "Credit Card Payment",
			title : "Credit Card Payment",
		})
	}

	render(){
		const { loading, allowed, token } = this.props

		return (
			<Background>
				<View style={{flexDirection:"column",alignItems:"center",justifyContent:'center'}}>
					<TouchableHighlight style={{marginTop:50}} onPress={() => this.handleAndroidPayPress()}>
						<Image source={require('../../images/android_pay/android_pay.png')} style={{width:width - 150,height: width - 150}}/>
					</TouchableHighlight>
				</View>
			</Background>
		)			
	}
}

const mapStateToProps = state => ({
	payment_loading: state.paymentReducer.payment_allowed,
    payment_allowed: state.paymentReducer.payment_allowed,
    payment_token: state.paymentReducer.payment_token,
})

export default connect()(CreditCardPayment)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instruction: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  token: {
    height: 20,
  },
})