import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	Switch,
  	TouchableHighlight,
  	Slider,
  	Alert
} from 'react-native'
import {styles,first_color,width,height,success_green,red_error,option_blue} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,

} from '../constants'
import Background from '../helpers/background'
import {
	WRITE_COMMAND,
} from '../action_creators'

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
			Alert.alert("Update Complete","Sure-Fi Relay Settings successfully updated.")
		})
	}

	refresh(){
		this.props.navigator.dismissModal({
			 animationType: 'slide-down' 
		})
		this.props.getRelayValues()
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

	render(){	
		console.log("this.props",this.props.relay_1_image_status,this.props.relay_2_image_status,this.props.slider_value)
		
		return(
			<ScrollView style={styles.pairContainer}>
				<Background>
					<View style={{height: height}}>
						<View style={{marginVertical:30,backgroundColor:"white"}}>
							<View style={{flexDirection:"row",marginVertical:20,marginHorizontal:20}}>
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
							{this.props.slider_value ? this.renderRelayOptions(this.props.slider_value) : null}
							<View style={{flexDirection:"row",marginHorizontal:20}}>
								<TouchableHighlight 
									style={{backgroundColor:success_green,width:width/2,marginVertical:20,marginHorizontal:10,height:40,alignItems:"center",justifyContent:"center",borderRadius:10}}
									onPress={() => this.save()}
								>
									<Text style={{color:"white",fontWeight:'900'}}>
										Save
									</Text>
								</TouchableHighlight>
								<TouchableHighlight 
									style={{backgroundColor:red_error,height:40,width:width/4,marginVertical:20,marginHorizontal:10,alignItems:"center",justifyContent:"center",borderRadius:10}}
									onPress={() => this.refresh()}
								>
									<Text style={{color:"white",fontWeight:'900'}}>
										Refresh
									</Text>
								</TouchableHighlight>
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
	device: state.scanCentralReducer.central_device,
});

export default connect(mapStateToProps)(Relay);