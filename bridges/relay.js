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
	SET_CHAR_AT
} from '../constants'
import Background from '../helpers/background'
import {
	WRITE_COMMAND,
} from '../action_creators'
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class Relay extends Component{

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }	

    constructor(props) {
    	super(props);
    	this.device = this.props.device
    	this.handleCharacteristicNotification = this.handleCharacteristicNotification.bind(this)
    	this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        
        if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
            switch(event.id){
                case "update":
                    this.save()
                break
                default:
                break
            }
        } 
    }


	handleCharacteristicNotification(data){
		var value = data.value[0]
		
		switch(value){
			case 0x02:
				data.value.shift()
				console.log("old_value",data.value);
				


				this.updateQsValues(data.value[0])

				
				break
			case 0x18:
				data.value.shift()
				this.updateRelayValues(data.value)
				this.props.saveOnCloudLog(data.value,"FAILSAFES")
				break
			default:
			break
		}
	}


    componentWillMount() {
    	this.props.dispatch({type :"RESET_RELAY_REDUCER"});
    	this.handleCharacteristic = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleCharacteristicNotification)
    	this.getRelayValues() 
    }

    componentWillUnmount() {
      this.props.activateHandleCharacteristic()
    }

    updateRelayValues(values){
    	console.log("updateRelayValues",values);
    	let props = this.props
    	let dispatch = props.dispatch
    	
    	dispatch({type: "SET_SLIDER_VALUE",slider_value: values[0]})
    	dispatch({type: "SET_RELAY_IMAGE_1_STATUS",relay_1_image_status : values[1]})
    	dispatch({type: "SET_RELAY_IMAGE_2_STATUS",relay_2_image_status : values[2]})
    	this.getQosConfig()

    }

    getQosConfig(){
    	WRITE_COMMAND(this.device.id,[0x0B])
    	.catch(error => Alert.alert("Error",error))
    }

    updateQsValues(value){
    	console.log("updateQsValues",value);
    	var binary_value = DEC2BIN(value)
    	console.log("bynay_value",binary_value);
    	
    	console.log("binary_value.substr(0,1)",binary_value.substr(0,1));

    	if(binary_value.substr(3,1) == "0")
    		this.props.dispatch({type: "SHOW_QUALITY_DEPENDES",show_quality_dependes: false})
    	else
    		this.props.dispatch({type: "SHOW_QUALITY_DEPENDES",show_quality_dependes: true})
    		

    	this.props.dispatch({type: "SET_QS",qs : binary_value})
    	this.props.dispatch({type: "SET_RELAY_LOADING",relay_loading: false})
    }

	getRelayValues(){
		console.log("getRelayValues()");
		WRITE_COMMAND(this.device.id,[0x24])
		.then(response => {
		})
		.catch(error =>  Alert.alert("Error",error))		
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


	save(){		

		WRITE_COMMAND(this.device.id,[0x23, this.props.slider_value,this.props.relay_1_image_status,this.props.relay_2_image_status])
		.then(() => {
			setTimeout(() => {
				var number = parseInt(this.props.qs,2)

				WRITE_COMMAND(this.device.id,[0x0C,number])
				.then(() =>{
					Alert.alert("Update Complete","Sure-Fi Relay Settings successfully updated.")
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
					<Image source={require('../images/relay_no.imageset/relay_no.png')} style={{width:100,height:100}}/>
				</TouchableHighlight>
			)
		}else{
			return (
				<TouchableHighlight 
					onPress={() => this.updateRelayImage(image,1)}
				> 
					<Image source={require('../images/relay_nc.imageset/relay_nc.png')} style={{width:100,height:100}}/>
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
		
		var relay_1_image = this.getRelayImage(this.props.relay_1_image_status,1) 
		var relay_2_image = this.getRelayImage(this.props.relay_2_image_status,2)

		return(
			<View>
				<View style={{flexDirection:"row"}}>
					<View style={{flexDirection:"row"}}>
						<View style={{width: (width/2 -20)}}>
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
		//we need change the value before save it!
		var value = this.props.qs.substr(pos,1)
		console.log("value before",value);
		
		if(value == "1")
			value = "0"
		else
			value = "1"

		var new_qs = this.props.qs.substr(0, pos) + value + this.props.qs.substr(pos + value.length);
				
		if(pos == 3){
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
							onValueChange={slider_value => this.updateQs(0)} 
							onTintColor={option_blue}
							tintColor="orange"
							value={this.props.qs.substr(0,1) == "1" ? true : false}
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

	render(){	
		console.log("relay_loading",this.props.relay_loading);
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
						<View style={{justifyContent:"center",alignItems:"center",marginTop:30}}>
							<Text style={{fontSize:20}}>
								LED SETTINGS
							</Text>
						</View>
						<View style={{marginBottom:30,backgroundColor:"white"}}>

							<View style={styles.relay_option}>
								<Switch 
									onValueChange={slider_value => this.updateQs(1)} 
									onTintColor={option_blue}
									tintColor="orange"
									value={this.props.qs.substr(1,1) == "1" ? true : false}
								/>
								<Text style={{marginLeft:20,fontSize:18}}>
									Active for Status Indications
								</Text>
							</View>

							<View style={styles.relay_option}>
								<Switch 
									onValueChange={slider_value => this.updateQs(3)} 
									onTintColor={option_blue}
									tintColor="orange"
									value={this.props.qs.substr(3,1) == "1" ? true : false}
								/>
								<Text style={{marginLeft:20,fontSize:18}}>
									Quality of Service Lights
								</Text>
							</View>


							{this.renderQualityDependes()}

						</View>
						<View>
							<View style={{alignItems:"center",justifyContent:"center"}}>
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
	device : state.scanCentralReducer.central_device,

});

export default connect(mapStateToProps)(Relay);