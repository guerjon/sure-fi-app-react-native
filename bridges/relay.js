import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	Switch,
  	TouchableHighlight,
  	Slider,
  	Alert,
  	ActivityIndicator,
  	NativeModules,
  	NativeEventEmitter
} from 'react-native'
import {styles,first_color,width,height,success_green,red_error,option_blue} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	DEC2BIN,
	NOTIFICATION,

} from '../constants'
import Background from '../helpers/background'
import {
	WRITE_COMMAND,
	LOG_INFO
} from '../action_creators'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class Relay extends Component{

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
    	this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    	this.updating = false
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "update":
                	this.props.dispatch({type: "SET_SAVING",saving:true})
                    this.update()
                break
                default:
                break
            }
        } 
    }

	updateSliderValue(slider_value){
		if(this.slider_value === true)
			slider_value = this.slider.value ? this.slider.value : 10

		else if(this.slider_value === false)
			slider_value = 0

		this.props.dispatch({type: "SET_SLIDER_VALUE",slider_value: slider_value})
	}

	updateSwitch(value){
		if(value){
			this.props.dispatch({type: "SET_SLIDER_VALUE",slider_value: 10})
		}else{
			this.props.dispatch({type: "SET_SLIDER_VALUE",slider_value: 0 })
		}
	}


	update(){		
		console.log("----------")
		console.log(this.device.id)
		console.log(this.props.slider_value)
		console.log(this.props.relay_1_image_status)
		console.log(this.props.relay_2_image_status)
		console.log("----------")
		
		WRITE_COMMAND(this.device.id,[0x23, this.props.slider_value,this.props.relay_1_image_status,this.props.relay_2_image_status])
		.then(() => {
			setTimeout(() => {
				WRITE_COMMAND(this.device.id,[0x0C,this.props.qs])
				.then(() =>{
					Alert.alert("Update Complete","Sure-Fi Relay Settings successfully updated.")
					this.props.dispatch({type: "SET_SAVING",saving:false})
				})
				.catch(error => {
					Alert.alert("Error",error)
				})

			},1000)
			
		})
	}

	refresh(){
		this.getRelayValues()
	}

	updateComple(){
		Alert.alert("Update Complete","Sure-Fi Relay Settings successfully updated.")
	}

	getRelayImage(value,image){
		if(value == 1){
			return (
				<TouchableHighlight 
					onPress={() => this.updateRelayImage(image,2)}
				> 
					<Image source={require('../images/relay_nc.imageset/relay_nc.png')} style={{width:100,height:100}}/>
				</TouchableHighlight>
			)
		}else{
			return (
				<TouchableHighlight 
					onPress={() => this.updateRelayImage(image,1)}
				> 
					<Image source={require('../images/relay_no.imageset/relay_no.png')} style={{width:100,height:100}}/>
					
				</TouchableHighlight>)
		}
	}

	updateRelayImage(image,value){
		
		if(image == 1){
			this.props.dispatch({type: "SET_RELAY_IMAGE_1_STATUS",relay_1_image_status: value})
		}else{
			this.props.dispatch({type: "SET_RELAY_IMAGE_2_STATUS",relay_2_image_status: value})
		}
	}


	renderRelayOptions(slider_value){
		console.log("renderRelayOptions()",slider_value)
		var relay_1_image = this.getRelayImage(this.props.relay_1_image_status,1) 
		var relay_2_image = this.getRelayImage(this.props.relay_2_image_status,2)

		return(
			<View>
				<View style={{flexDirection:"row",width:width,alignItems:"center",justifyContent:"center",marginTop:10}}>
						<View style={{width: (width/2 -20),justifyContent:"center",alignItems:"center"}}>
							<Text style={{marginHorizontal:20}}>
								Relay 1 Default
							</Text>
							<View>
								{relay_1_image}
							</View>				
						</View>
						<View style={{width: (width/2 -20)}}>
							<Text style={{marginHorizontal:20}}>
								Relay 2 Default
							</Text>
							<View>
								{relay_2_image}
							</View>
						</View>						
					
				</View>
				<View style={{marginHorizontal:20,marginVertical:20}}>
					<Text>
						Timeout Delay Duration
					</Text>
					<Slider 
						onValueChange={(value) => this.updateSliderValue(value)}
						value={slider_value} 
						href = {slider => this.slider = slider}
						minimumValue={1}
						maximumValue={30}
						step={1}
					/>
					<Text>
						{this.props.slider_value} Minutes
					</Text>
				</View>
			</View>
		)
		console.log("this.slider",this.slider)
	}

	updateQs(pos){
		console.log("pos",pos);
		console.log("this.props.qs.substr",this.props.qs);
		var value = this.props.qs.substr(pos,1)

		console.log("value before",value);
		
		if(value == "1")
			value = "0"
		else
			value = "1"

		var new_qs = this.props.qs.substr(0, pos) + value + this.props.qs.substr(pos + value.length);
				
		if(pos == 0){
			if(value == "1")
				this.props.dispatch({type: "SHOW_QUALITY_DEPENDES",show_quality_dependes: true})
			else
				this.props.dispatch({type: "SHOW_QUALITY_DEPENDES", show_quality_dependes: false})
		}

		console.log("new_qs",new_qs);

		this.props.dispatch({type: "SET_QS",qs: new_qs})

	}

	renderQualityDependes(){
		if(this.props.show_quality_dependes){
			return (
				<View>
					<View style={styles.relay_option}>
						<Switch 
							onValueChange={slider_value => this.updateQs(2)} 
							onTintColor={option_blue}
							tintColor="orange"
							value={this.props.qs.substr(2,1) == "1" ? true : false}
						/>
						<Text style={{marginLeft:20,fontSize:18}}>
							Activate for All Messages
						</Text>
					</View>


					<View style={styles.relay_option}>
						<Switch 
							onValueChange={slider_value => this.updateQs(1)} 
							onTintColor={option_blue}
							tintColor="orange"
							value={this.props.qs.substr(1,1) == "1" ? true : false}
						/>
						<Text style={{marginLeft:20,fontSize:18}}>
							Enable Long Duration
						</Text>
					</View>				
				</View>
			)
		}

		return null
	}

	updateQsValues(new_value){
		console.log("new_value",new_value)
		let dispatch_body = {
			type: "SET_QS",
			qs: 0
		}

		if(new_value){
			dispatch_body.qs = 9
		}
		
		this.props.dispatch(dispatch_body)
	}

	render(){	
		console.log("this.props.qs",this.props.qs);
		let led_string = "LEDS - DISABLED"
		if(this.props.qs){
			led_string = "LEDS - ENABLED"
		}

		if(this.props.relay_loading){
			return (
				<Background> 
					<View style={{height:height}}>
						<ActivityIndicator /> 
					</View>
				</Background>
			)
		}

		return(
			<ScrollView style={styles.pairContainer}>
				<Background>
					<View style={{height: height}}>
						<View style={{justifyContent:"center",alignItems:"center",marginVertical:20}}>
							<Text style={{fontSize:20}}>
								LED SETTINGS
							</Text>
						</View>
						<View style={{marginBottom:20,backgroundColor:"white"}}>
							<View style={styles.relay_option}>
								<Switch 
									onValueChange={slider_value => this.updateQsValues(slider_value)} 
									onTintColor={option_blue}
									tintColor="orange"
									value={this.props.qs ? true : false}
								/>

								<Text style={{marginLeft:20,fontSize:18}}>
									{led_string}
								</Text>
							</View>
						</View>
						<View>
							<View style={{alignItems:"center",justifyContent:"center",marginBottom:20}}>
								<Text style={{fontSize:20}}>
									RELAY SETTINGS
								</Text>
							</View>
							<View style={{backgroundColor:"white"}}>
								<View style={styles.relay_option}>
									<Switch 
										onValueChange={slider_value => this.updateSwitch(slider_value)} 
										onTintColor={option_blue}
										tintColor="orange"
										value={this.props.slider_value > 0 ? true : false}
									/>
									<Text style={{marginLeft:20,fontSize:18}}>
										Relay Defaults - {this.props.slider_value ? "ENABLED" : "DISABLED"} 
									</Text>
								</View>
								<View>
									{this.props.slider_value ? this.renderRelayOptions(this.props.slider_value) : null}	
								</View>
							</View>
						</View>

						{this.props.saving && <ActivityIndicator  style={{marginTop:30}}/>}
					</View>
				</Background>
			</ScrollView>
		);
	}
}


const mapStateToProps = state => ({
	slider_value: state.relayReducer.slider_value,
	relay_1_image_status : state.relayReducer.relay_1_image_status,
	relay_2_image_status : state.relayReducer.relay_2_image_status,
	relay_loading : state.relayReducer.relay_loading,
	qs : state.relayReducer.qs,
	show_quality_dependes : state.relayReducer.show_quality_dependes,
	saving: state.relayReducer.saving,
	device : state.scanCentralReducer.central_device,


});

export default connect(mapStateToProps)(Relay);