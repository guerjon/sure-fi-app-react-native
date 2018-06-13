import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TouchableHighlight,
  	TouchableOpacity,
  	Animated,
  	Easing,
	ActivityIndicator,
    FlatList
} from 'react-native'
import {
	styles,
	first_color,
	height,
	option_blue,
	width,
	success_green,
	gray_background
} from './styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	PRETY_VERSION,
	RADIO_FIRMWARE_UPDATE,
	APP_FIRMWARE_UDATE,
	BLUETOOTH_FIRMWARE_UPDATE
} from './constants'
import Background from './helpers/background'
import ProgressBar from 'react-native-progress/Bar';
import Icon from 'react-native-vector-icons/FontAwesome';
const check = (<Icon name="check" size={75} color="green"/>)

var filling_interval = 0
const FIRMWARE_UPDATE_AVAIBLE  = 0
const UPDATING_FIRMWARE = 1
const FINISHING_FIRMWARE_UDAPTE = 2
const SYSTEM_UPDATED = 3


class Template extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

    constructor(props) {
      super(props);
    
      this.state = {
      	animate: new Animated.Value(50),
      	animateXY: new Animated.ValueXY({x: (height/2) - 25, y:(width/2) - 25 }),
      	radius: new Animated.Value(0),
      	firmareButtonAnimation: new Animated.ValueXY({x: (height/2 + 50) ,y: ((width/2) - 125) }),
      	
        radioFirmwareUpdateBoxRadius: new Animated.Value(5),
        radioFirmwareUpdateBoxPosition: new Animated.ValueXY({x: width/4,y: width/8}),
        radioFirmwareUpdateBoxShape: new Animated.ValueXY({x: 300,y:300}),

        appFirmwareUpdateBoxRadius: new Animated.Value(5),
        appFirmwareUpdateBoxPosition: new Animated.ValueXY({x: width/4 ,y: width/8 }),
        appFirmwareUpdateBoxShape: new Animated.ValueXY({x: 300 ,y: 300 }),


        bluetoothFirmwareUpdateBoxRadius: new Animated.Value(5),
        bluetoothFirmwareUpdateBoxPosition: new Animated.ValueXY({x: width/4,y: width/8}),
        bluetoothFirmwareUpdateBoxShape: new Animated.ValueXY({x: 300,y:300}),
        
      };
    }

  	startRadioFirmwareUpdate(){
  		console.log("startRadioFirmwareUpdate()")
  		
  		this.props.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: UPDATING_FIRMWARE})
  		this.props.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: RADIO_FIRMWARE_UPDATE})

        Animated.timing(this.state.firmareButtonAnimation,{
            toValue: {x: height, y: ((width/2) - 125)},
            duration: 1000,
        }).start()


  		this.createPorcentageInterval()	
  	}

    finishRadioFirmwareUpdate(){


        Animated.timing(this.state.radioFirmwareUpdateBoxRadius,{
            toValue: 300,
            duration: 1000
        }).start()

        Animated.timing(this.state.radioFirmwareUpdateBoxPosition,{
            toValue: {x: 10,y: 10},
            duration: 1000
        }).start()

        Animated.timing(this.state.radioFirmwareUpdateBoxShape,{
            toValue: {x: 75,y: 75},
            duration: 1000
        }).start()

    }

    finishAppFirmwareUpdate(){
        Animated.timing(this.state.appFirmwareUpdateBoxRadius,{
            toValue: 300,
            duration: 1000
        }).start()

        Animated.timing(this.state.appFirmwareUpdateBoxPosition,{
            toValue: {x: 10,y: (width/2 - 37) },
            duration: 1000
        }).start()

        Animated.timing(this.state.appFirmwareUpdateBoxShape,{
            toValue: {x: 75,y: 75},
            duration: 1000
        }).start()        
    }

    finishBluetoothFirmwareUpdate(){
        
        this.props.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: FINISHING_FIRMWARE_UDAPTE})

        Animated.timing(this.state.bluetoothFirmwareUpdateBoxRadius,{
            toValue: 300,
            duration: 1000
        }).start()

        Animated.timing(this.state.bluetoothFirmwareUpdateBoxPosition,{
            toValue: {x: 10,y: (width - 75) },
            duration: 1000
        }).start()

        Animated.timing(this.state.bluetoothFirmwareUpdateBoxShape,{
            toValue: {x: 50,y: 50},
            duration: 1000
        }).start()

        setTimeout(() => {
            this.props.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: 0})
            this.props.dispatch({type: "SET_FIRMWARE_UPDATE_STATUS",firmware_update_status: SYSTEM_UPDATED})
        },1000)
    }

    startAppFirmwareUpdate(){
        console.log("startAppFirmwareUpdate()")
        this.props.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: APP_FIRMWARE_UDATE})

        this.props.dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage:0})
        this.createPorcentageInterval()

    }

    startBluetoothFirmwareUpdate(){
        this.props.dispatch({type: "SET_CURRENT_FIRMWARE_UPDATE",current_firmware_update: BLUETOOTH_FIRMWARE_UPDATE})

        this.props.dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage:0})
        this.createPorcentageInterval()
    }


    createPorcentageInterval(){
        console.log("createPorcentageInterval()",filling_interval)
        if(filling_interval == 0){
            filling_interval = setInterval(() => this.addToSliderPorcentage(),1000)            
        }
    }

    deletePorcentageInteval(){
        clearInterval(filling_interval)
        filling_interval = 0
    }

    addToSliderPorcentage(){
        if(this.props.filling_porcentage < 1){
            var new_porcentage = this.props.filling_porcentage + 0.20
            this.props.dispatch({type: "SET_FILLING_PORCENTAGE",filling_porcentage:new_porcentage})
        }else {
            this.deletePorcentageInteval()
            
            const type = this.props.current_firmware_update

            if(type == RADIO_FIRMWARE_UPDATE){
                this.finishRadioFirmwareUpdate()
                this.startAppFirmwareUpdate()
            }

            if(type == APP_FIRMWARE_UDATE){
                this.finishAppFirmwareUpdate()
                this.startBluetoothFirmwareUpdate()
            }

            if(type == BLUETOOTH_FIRMWARE_UPDATE){
                this.finishBluetoothFirmwareUpdate()
            }
        }
    }

    showDetails(){
    	this.props.dispatch({type: "SET_SHOW_FIRMWARE_UPDATE_DETAILS",show_firmware_update_details:true})
    }

    hideDetails(){

    	this.props.dispatch({type: "SET_SHOW_FIRMWARE_UPDATE_DETAILS",show_firmware_update_details:false})	

    }

    firmwareUpdateBox(){
        if(this.props.firmware_update_status == FIRMWARE_UPDATE_AVAIBLE){
        	return ( this.props.current_firmware_update == 0 && (
    				<View style={{alignItems:"center",justifyContent:"center",borderWidth:1,padding:30,width:300,height:300,backgroundColor:"white"}}>
        				<Text style={{fontSize:30,marginVertical:5}}>
        					Current Version  
        				</Text>
                        
                        <Text style={{fontSize:28,color:"black",fontWeight:'bold'}}>
                            2.0
                        </Text>
                    
	        			<Text style={{fontSize:30,borderTopWidth:1,marginVertical:5}}>
	        				Available Version
	        			</Text>
	        			<Text style={{fontSize:28,color:"black",fontWeight:'bold'}}>
	        				2.1
	        			</Text>
                        <View style={{alignItems:"center",marginVertical:10}}>
                            <Text style={{color:"black",fontSize:15}}>
                                The system can be updated.
                            </Text>
                        </View>                            
        			</View>
        			)
    			)		
        }

        if(this.props.firmware_update_status == SYSTEM_UPDATED){
        	return (
        		<View style={{width:300,height:300,backgroundColor:"white",borderRadius:5,borderWidth:1,alignItems:"center",justifyContent:"center"}}>
        			<Text style={{fontSize:32}}>
        				Current Version  
        			</Text>
    			
        			<Text style={{marginBottom:5,fontSize:24,color:"black",fontWeight:'bold'}}>
        				Version 2.0
        			</Text>

                    <View style={{marginVertical:10}}>
                        {check}
                    </View>
                    <View style={{alignItems:"center",paddingHorizontal:25}}>
                        <Text style={{color:"black",fontSize:15}}>
                            The system has the latest firmware version.
                        </Text>
                    </View>

        		</View>        	
        	)
        }

        return null
    }

    getHeader(){
    	if(this.props.firmware_update_status == FIRMWARE_UPDATE_AVAIBLE){
    		return(
				<View style={{width:width,backgroundColor:option_blue,alignItems:"center",justifyContent:"center"}}>	
					<Text style={{color:"black",padding:10,fontSize:18,color:"white"}}>
						A firmware update is available
					</Text>
				</View>
    		)
    	}

    	if(this.props.firmware_update_status == UPDATING_FIRMWARE){
    		return(
				<View style={{width:width,backgroundColor:"#F1C40F",alignItems:"center",justifyContent:"center"}}>	
					<Text style={{color:"white",padding:10,fontSize:18,color:"white"}}>
						Updating system ...
					</Text>
				</View>		
    		)
    	}

    	if(this.props.firmware_update_status == SYSTEM_UPDATED){
    		return(
				<View style={{width:width,backgroundColor:success_green,alignItems:"center",justifyContent:"center"}}>	
					<Text style={{color:"black",padding:10,fontSize:18,color:"white"}}>
						The system is updated
					</Text>
				</View>									
    		)
    	}
															
    	return null
    }

    renderFirmwareUpdateButton(){
    	var text = "Start Firmware Update"
    	
    	if(this.props.firmware_update_status == UPDATING_FIRMWARE){
    		text = "Staring Firmware Update"
    	}

    	if(this.props.firmware_update_status == SYSTEM_UPDATED){
    		text = "System updated"
    	}

    	return(
			<Animated.View style={{width:250,height:50,top:this.state.firmareButtonAnimation.x,left:this.state.firmareButtonAnimation.y,borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:success_green,marginTop:20,position:"absolute"}}>
				<TouchableOpacity onPress={() => this.startRadioFirmwareUpdate()} style={{width:250,height:50,alignItems:"center",justifyContent:"center"}}> 
					<Text style={{color:"white",alignItems:"center",justifyContent:"center"}}>
						{text}
					</Text>
				</TouchableOpacity>
			</Animated.View>
    	)

	    return null
    }

    renderRadioBox(){
        if(this.props.firmware_update_status == UPDATING_FIRMWARE || this.props.current_firmware_update == APP_FIRMWARE_UDATE || this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE){
            var text = "R"
            var box_color = success_green
            var text_color = "white"
            var little_check = <Icon name="check" size={15} color="white"/>
            if(this.props.current_firmware_update == RADIO_FIRMWARE_UPDATE){
                text = "Updating Radio Firmware"
                box_color = "white"
                text_color = "black"                
                little_check = null
            }

            return(
              <Animated.View style={{
                width:this.state.radioFirmwareUpdateBoxShape.x,
                height:this.state.radioFirmwareUpdateBoxShape.y,
                top:this.state.radioFirmwareUpdateBoxPosition.x,
                left:this.state.radioFirmwareUpdateBoxPosition.y,
                borderRadius:this.state.radioFirmwareUpdateBoxRadius,
                alignItems:"center",
                justifyContent:"center",
                borderWidth:1,
                position:"absolute",
                backgroundColor:box_color,
                borderColor:box_color
              }}>            

                    <View style={{width:300,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5}}>
                        <Text style={{fontSize:20,color:text_color}}>
                            {text}
                        </Text>
                        {little_check}
                        {this.props.current_firmware_update == RADIO_FIRMWARE_UPDATE && this.renderInfo()} 
                    </View>
              </Animated.View>
            )
        }
        return null
    }

    renderAppBox(){
        if(this.props.current_firmware_update == APP_FIRMWARE_UDATE || this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE){
            var text = "A"
            var box_color = success_green
            var text_color = "white"
            var little_check = <Icon name="check" size={15} color="white"/>
            if(this.props.current_firmware_update == APP_FIRMWARE_UDATE){
                text = "Updating App Firmware"
                box_color = "white"
                text_color = "black"
                little_check = null
            }

            return(
                <Animated.View style={{
                    width:this.state.appFirmwareUpdateBoxShape.x,
                    height:this.state.appFirmwareUpdateBoxShape.y,
                    top:this.state.appFirmwareUpdateBoxPosition.x,
                    left:this.state.appFirmwareUpdateBoxPosition.y,
                    borderRadius:this.state.appFirmwareUpdateBoxRadius,
                    alignItems:"center",
                    justifyContent:"center",
                    borderWidth:1,
                    position:"absolute",
                    backgroundColor:box_color,
                    borderColor:box_color
                  }}>            
                        <View style={{width:300,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5}}>
                            <Text style={{fontSize:20,color:text_color}}>
                                {text}
                            </Text>
                            {little_check}
                            {this.props.current_firmware_update == APP_FIRMWARE_UDATE && this.renderInfo()}
                        </View>
                  </Animated.View>
            )
        }

        return null
    }

    renderBluetoothBox(){
        

        if(this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE ){
            let text = "Updating Bluetooth Firmware"
            let backgroundColor = "white"
            let text_color = "black"
            if(this.props.firmware_update_status == FINISHING_FIRMWARE_UDAPTE ){
                text = "B"
                backgroundColor = success_green
                text_color = "white"
            }

            return(
                <Animated.View style={{
                    width:this.state.bluetoothFirmwareUpdateBoxShape.x,
                    height:this.state.bluetoothFirmwareUpdateBoxShape.y,
                    top:this.state.bluetoothFirmwareUpdateBoxPosition.x,
                    left:this.state.bluetoothFirmwareUpdateBoxPosition.y,
                    borderRadius:this.state.bluetoothFirmwareUpdateBoxRadius,
                    alignItems:"center",
                    justifyContent:"center",
                    borderWidth:1,
                    position:"absolute",
                    backgroundColor:backgroundColor,
                    borderColor: backgroundColor
                  }}>            
                        <View style={{width:300,height:300,padding:20,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:5}}>
                            <Text style={{fontSize:18,color:text_color}}>
                                {text}
                            </Text>
                            {(this.props.current_firmware_update == BLUETOOTH_FIRMWARE_UPDATE) && (this.props.firmware_update_status != FINISHING_FIRMWARE_UDAPTE) && this.renderInfo()}
                        </View>
                </Animated.View>
            )
        }
    }

    renderInfo(){
        return(
            <View style={{alignItems:"center",marginBottom:20}}>
                <View style={{marginVertical:20,alignItems:"center"}}>
                    <Text>
                        Updating Version 2.0 
                    </Text>
                    <Text>
                        To
                    </Text>
                    <Text>
                        Version 2.1
                    </Text>
                </View>
                <ProgressBar progress={this.props.filling_porcentage} width={width-200} height={5} borderRadius={5} color={option_blue}/>
                <Text>
                    {parseInt(this.props.filling_porcentage  * 100)} %
                </Text>
            </View>
        )        
    }

    renderShowLogsButton(){
        let action = () => this.showDetails()
        var details_text = "Show Details"

        if(this.props.show_firmware_update_details){
            details_text = "Hide Details"
            action = () => this.hideDetails()
        }

        if(this.props.firmware_update_status == UPDATING_FIRMWARE){
            return(
                <View style={{width:250,height:50,top:(height/2 + 50),left:((width/2) - 125),borderRadius:10,alignItems:"center",justifyContent:"center",backgroundColor:gray_background,marginTop:20,position:"absolute"}}>
                    <TouchableOpacity onPress={action} style={{width:250,height:50,alignItems:"center",justifyContent:"center"}}> 
                        <Text style={{color:"blue",alignItems:"center",justifyContent:"center"}}>
                            {details_text}
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return null
    }

    renderItem(item){
        return (
            <View>
                <Text>
                    {item.index}
                </Text>
            </View>
        )
    }

    renderDetails(){
        if(this.props.firmware_update_status == UPDATING_FIRMWARE && this.props.show_firmware_update_details){
            return(
                <ScrollView style={{height:height,width:width,backgroundColor:"white",top:((height - 200)),position:"absolute"}}>
                    <FlatList data={[]} renderItem={item => renderItem(item)}/>
                </ScrollView>
            )
        }
        return null
    }

	render(){	
		return(
			<View style={{backgroundColor:gray_background,height:height}}>
				{this.getHeader()}
				<View style={{width:width,height:(height - 200),alignItems:"center",justifyContent:"center"}}>
					{this.firmwareUpdateBox()}
					{this.renderRadioBox()}
                    {this.renderAppBox()}
                    {this.renderBluetoothBox()}
					{this.renderFirmwareUpdateButton()}
                    {this.renderShowLogsButton()}
                    {this.renderDetails()}
				</View>
			</View>	
		);	
	}
}

const mapStateToProps = state => ({
	app_version : state.setupCentralReducer.app_version,
	filling_porcentage : state.updateFirmwareCentralReducer.filling_porcentage,
	show_firmware_update_details : state.updateFirmwareCentralReducer.show_firmware_update_details,
	need_firmware_update: state.updateFirmwareCentralReducer.need_firmware_update,
	animated_value: state.updateFirmwareCentralReducer.animated_value,
	second_animated_value: state.updateFirmwareCentralReducer.second_animated_value,
	firmware_update_status : state.updateFirmwareCentralReducer.firmware_update_status,
	current_firmware_update: state.updateFirmwareCentralReducer.current_firmware_update,
	show_current_firmware_update: state.updateFirmwareCentralReducer.show_current_firmware_update,

});

export default connect(mapStateToProps)(Template);