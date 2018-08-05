import React, {Component} from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import {
	first_color,
	styles,
	width,
	height,
	success_green
} from '../../styles'
import { connect } from 'react-redux';
import {
	Image,
	View,
	TouchableHighlight,
	Text,
	Alert,
	FlatList,
	ActivityIndicator,
	Linking
} from 'react-native'
import stripe from 'tipsi-stripe'
import Background from '../../helpers/background'
import {GET_PRICE_URL,COMPLETE_DIRECT_UNIT_PURCHASE,CHECK_STATUS} from '../../constants'
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
		this.price = 0
	}
	//fake key --> pk_test_DkfAPP0epveDUsdjCnc9c9Bz
	
    componentWillMount(){
	    stripe.setOptions({
		  publishableKey: 'pk_live_eBINMcXVt60GGZy3ZK42rHld',
		})   
		//this.getPrice() 
		this.fetchDeviceActivationStatus(this.device.manufactured_data.device_id.toUpperCase())	
    }

	fetchDeviceActivationStatus(device_id){
		console.log("fetchDeviceActivationStatus",device_id)
		fetch(CHECK_STATUS,{
			method: "POST",
			headers: {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},		
			body: JSON.stringify({serial: device_id})
		}).then(response => {
			
			var data = JSON.parse(response._bodyInit)
			console.log("fetchDeviceActivationStatus()",data.data.system)

			if(data.status == "success"){
				var system = data.data

				if(system){
						var status = parseInt(system.system.on_demand_unit_status)
						
						this.props.dispatch({type:"SET_DEMO_UNIT_PRICE",demo_unit_price: system.system.product_direct_price})	 
						if(status){
							Alert.alert("Success","The other side has been actived.")
							this.resetDemoUnitTimeAndPop()
						}

						var partners = system.partners
						this.props.dispatch({
							type:"SET_PARTNERS",
							partners: partners
						})	 

				}else{
					Alert.alert("Server Error","The response of the server isn't correct.")
				}
			}else{

				if(typeof data.status == "string" && typeof data.msg == "string"){

					Alert.alert(data.status.toUpperCase(),data.msg)	
					
				}else{
					Alert.alert("Server Error","The response of the server isn't correct.")
				}
			}
		})
	}

    getPrice(){
    	var price = 0
		fetch(GET_PRICE_URL,{
			method: "POST",
			headers: {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify({serial: this.device.manufactured_data.device_id.toUpperCase()}) 
		})
		.then(response => {
			var data = JSON.parse(response._bodyInit)
			
			if(data.status == "success"){
				data = data.data

				if(data){
					let system = data.system
					if(system){
						this.props.dispatch({type:"SET_DEMO_UNIT_PRICE",demo_unit_price: system.product_direct_price})	 
					}else{
						Alert.alert("Server Error","The format of the response isn't correct.")		
					}
				}else{
					Alert.alert("Server Error","The format of the response isn't correct.")	
				}

			}else{
				Alert.alert("Server Error",data.msg)
			}
			
		})
		.catch(error => console.log("error on getPrice",error))    		

    	return price
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

			this.showProcessTransactionAlert(token.card.last4,token.tokenId)

	    } catch (error) {
	    	console.log("error",error)
	    }
	}


	showProcessTransactionAlert(card_ending,tokenId){
		console.log("showProcessTransactionAlert()",card_ending,tokenId)
		this.props.navigator.push({
			screen : 'ProcessTransactionModal',
			title: "Process Transaction",
			animated: false,
			passProps: {
				card_ending: card_ending,
				cancelTransaction: () => this.cancelTransaction(),
				doPaymentOnTheServer: (email) => this.doPaymentOnTheServer(email,tokenId)
			}
		})
/*
		Alert.alert(
			"Process Transaction",
			,
			[
				{
					text: "Cancel", 
					onPress:() => this.cancelTransaction(),
					style: 'cancel'
				},
				{
					text: "Accept", onPress: () => this.doPaymentOnTheServer(data)
				}
			]
		)*/
	}

	cancelTransaction(){

	}

	doPaymentOnTheServer(email,tokenId){
		console.log("doPaymentOnTheServer()",data,email)
		//test: "something"
		var data = {
			price : this.props.demo_unit_price,
			serial  : this.props.device.manufactured_data.device_id.toUpperCase(),
			tokenId : tokenId,
			email : email
		}		


		fetch(COMPLETE_DIRECT_UNIT_PURCHASE,{
			method: "POST",
			headers: {
				'Accept' : 'application/json',
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify(data) 
		})
		.then(response => {
			console.log("response",response)
			var data = JSON.parse(response._bodyInit)
			if(data.status == "success"){
		      	Alert.alert(
		      		"Success",
		      		data.msg,
		      		[
		      			{text: "Great!", onPress: () => this.resetDemoUnitTimeAndPop(), style: 'cancel'}
		      		]
		      	)
			}else{
				Alert.alert("Server Error",data.msg)
			}
			
		})
		.catch(error => console.log("error on fetchDeviceName 2",error))   
	}

	resetDemoUnitTimeAndPop(){
		this.props.dispatch({
			type:"SET_DEMO_UNIT_TIME",
			demo_unit_time: 0
		})
		this.props.dispatch({
			type:"SET_SHOW_TO_ACTIVATE_OPTION",
			show_activate_option: false
		})	 

		this.props.setDemoModeTime([0,0,0,0]);
		setTimeout(() => this.props.getDemoModeTime(),1000)
		
		this.props.navigator.pop()
		this.props.navigator.pop()
	}

	renderPartner(partner){
		var uri = "https://admin.sure-fi.com/images/distributors/"+ partner.distributor_id +"/app_logo.png"
		return (
			<View style={{width: (width / 2)}}>
				<TouchableHighlight onPress={() => Linking.openURL(partner.distributor_website)} style={{backgroundColor:"gray",width: (width/2) -10,height:width/2,alignItems:"center",justifyContent:"center",margin:5}}>
					<Image source={{uri: uri }} style={{width: (width/2)-20, height: 80}}></Image>
				</TouchableHighlight>
			</View>
		)
	}

	renderPartners(){
		//console.log("renderPartners",this.props.partners)
		if(this.props.partners && this.props.partners.length > 0){
			return (
				<View>
					<FlatList 
						data={this.props.partners} 
						numColumns={2}
						horizontal={false}
						renderItem={({item}) => this.renderPartner(item)}
						keyExtractor={(item,index) => index}
					/>
				</View>
			)			
		}

		return (
			<View>
				<Text>
					Loading partners...
				</Text>
				<ActivityIndicator />
			</View>
		)
	}

	render(){
		return (
			<View style={{flex:1,flexDirection:"column",alignItems:"center"}}>
				<View style={{"justifyContent":"center",alignItems:"center",width:width,marginTop:20}}>
					<Text style={{fontSize:40,color:"black",marginVertical:20}}>
						$ {this.props.demo_unit_price} USD
					</Text>
				</View>
				<View style={{width:width,alignItems:"center",justifyContent:"center"}}>
					<TouchableHighlight onPress={() => this.handleAndroidPayPress()} style={{width:width-100,padding:15,backgroundColor:success_green,borderRadius:10,alignItems:"center"}}>	
						<Text style={{color:"white",fontSize:18}}>
							Proceed with Purchase
						</Text>
					</TouchableHighlight>
				</View>
				<View >
					<Text style={{width:width-50,margin:30,fontSize:18}}>
						Save money by purchasing your next system from one of our partners
					</Text>
				</View>
				<View style={{flex:1,width:width}}>
					{this.renderPartners()}
				</View>
			</View>
		)			
	}
}

const mapStateToProps = state => ({
	device: state.scanCentralReducer.central_device,
	demo_unit_price: state.scanCentralReducer.demo_unit_price,
	partners: state.scanCentralReducer.partners
})
export default connect(mapStateToProps)(PaymentOptions)