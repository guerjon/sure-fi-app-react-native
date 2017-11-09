import React, {
    Component
} from 'react'
import {
    Text,
    View,
    Image,
    ScrollView,
    Linking,
    Alert,
    TouchableHighlight
} from 'react-native'
import {
    styles,
    first_color,
    height,
    width,
    option_blue
} from '../styles/index.js'
import {
    connect
} from 'react-redux';
import {
    LOADING,
    GET_DEVICE_DOCUMENTS,
    MATCH_DEVICE
} from '../constants'
import Background from '../helpers/background'
import {
    WhiteRowLink
} from '../helpers/white_row_link'

interval = 0

class DeviceNotMatched extends Component {

    static navigatorStyle = {
        navBarBackgroundColor: first_color,
        navBarTextColor: "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }

    static navigatorButtons = {
        leftButtons: [{
            id: 'back',
            title: 'Back'
        }]
    }

    constructor(props) {
        super(props);
        this.path = ""
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.devices = this.props.devices
        this.manager = props.manager
    }


    componentDidMount() {
        console.log("this.props.navigator",this.props.navigator,this.props.cancel_scan)
        if(!this.props.cancel_scan){
            setTimeout(() => this.props.startScanning(this.manager),2000)
            this.createInterval()            
        }

    }

    componentWillUnmount() {
        this.eraseInterval()
        clearInterval(interval)

        this.props.dispatch({
            type: "ALLOW_SCANNING",
            allow_scanning: true
        })
    }

    createInterval() {

        console.log("createInterval()")
        if (interval == 0) {
            interval = setInterval(() => this.checkForDevice(), 2000)
            console.log("interval created")
        } else {
            console.log("the interval can't be created it was created previosly")
        }
    }

    eraseInterval(){
    	console.log("eraseInterval()");
    	if(interval){
    		clearInterval(interval)
    	}else{
    		console.log("The interval was erase previously");
    	}
    }

    checkForDevice() {
        console.log("checkForDevice()")
        var device_id = this.props.device_id
        var devices = this.props.devices

        this.matched_devices = MATCH_DEVICE(devices, device_id)

        if (this.matched_devices.length > 0) {
            this.props.dispatch({
                type: "DEVICE_FOUND",
                device_found: true
            })
        } else {
            this.props.dispatch({
                type: "DEVICE_FOUND",
                device_found: false
            })
        }
    }

    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        console.log("event", event)
        switch (event.id) {
            case "didDisappear":
                //if(this.props.showAlert)
                //this.props.startScanning()
                break
            default:
                break
        }

    }

    componentWillMount() {
        console.log("componentWillMount", this.props.device_id, );

        fetch(GET_DEVICE_DOCUMENTS, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hardware_serial: this.props.device_id
            })
        }).then(response => {
            let data = JSON.parse(response._bodyInit).data.documents

            if (data.length > 0) {

                let path = data[0].document_path

                this.path = data[0].document_path
                this.props.dispatch({
                    type: "SET_DOCUMENTATION_PATH",
                    documentation_path: path
                })

            } else {
                console.log("error", "the response array on documents its empty");
            }
            //let path = data.document.path

        }).catch(error => {
            Alert.alert("Error", error)
        })
    }

    goToAccessControlInstructions() {
        console.log("goToAccessControlInstructions()", this.props.documentation_path);
        if (this.path)
            Linking.openURL(this.path)
        else
            Alert.alert("Error", "The link wasn't found.")
    }

    renderDeviceNotFound() {
    	console.log("renderDeviceNotFound()");
    	
		return (
			<View style={{backgroundColor:"white",flexDirection:"row"}}>
			  <View style={{width:width * .20,alignItems:"center",justifyContent:"center"}}>
				<Image source={require('../images/menu_fail.imageset/menu_fail.png')} style={{width:50,height:50,margin:10}}/>
			  </View>
			  <View style={{margin:20,width: width * .75}}>
				<Text style={{color:"red"}}>
				  Sure-Fi was unable to find the Device  {this.props.device_id} via Bluetooth. 
				  Please make sure you are within range and the device is powered on.
				</Text>
			  </View>
			</View>
		)
    }

    renderDeviceFound(){
    	console.log("renderDeviceFound()");
    	return(
			<TouchableHighlight onPress={() => this.handleDeviceSelected()}>
				<View style={{backgroundColor:"white",flexDirection:"row"}}>
				  	<View style={{width:width * .20,alignItems:"center",justifyContent:"center"}}>
						<Image source={require('../images/menu_success.imageset/menu_success.png')} style={{width:50,height:50,margin:10}}/>
				  	</View>
				  	<View style={{margin:20,width: width * .75}}>
						<Text style={{color:"green"}}>
							Your Device: {this.props.device_id} has been discoverd via Bluetooth. Touch here to connect to your device.  	
						</Text>
				  	</View>
			  	</View>
			</TouchableHighlight>
    	)
    }

    handleDeviceSelected(){

        if(this.matched_devices){
            if(this.matched_devices.length > 0){
                var matched_device = this.matched_devices[0]
                delete matched_device._manager;
                this.props.navigator.pop()
                this.props.goToDeviceControl(matched_device)          
            }else{
                this.props.navigator.pop()    
            }
        }else{
            this.props.navigator.pop()    
        }
    }


    renderMessage(){
    	console.log("renderMessage()");
    	if(this.props.showAlert){
	    	if(this.props.device_found)
	    		return this.renderDeviceFound()
	    	
	    	return this.renderDeviceNotFound()    		
    	}

    	return null
    }

    render() {
        return (
	        <Background>
				<View style={{height:height}}>
                    <View>
                        {this.renderMessage()}
                    </View>
				  	<View>
						<Text style={styles.device_control_title}>AVAILABLE DOCUMENTS</Text>
                        <TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}} onPress={() => this.goToAccessControlInstructions()}>
                            <View style={{padding:15,flexDirection:"row"}}>
                                <View style={{width:(width * .75),justifyContent:"center"}}>
                                    <Text style={{fontSize:16,color:option_blue}}>
                                        Access Control Bridge Instructions
                                    </Text>
                                </View>
                                <View>
                                    <Text style={{fontSize:20,alignItems:"flex-end",justifyContent:"center",alignItems:"center"}}>
                                        >
                                    </Text>                                
                                </View>
                            </View>
                        </TouchableHighlight>
				  	</View>
				</View>
	  		</Background>
        );
    }
}

const mapStateToProps = state => ({
    documentation_path: state.loginReducer.documentation_path,
    device_found: state.loginReducer.device_found,
    devices : state.pairReducer.devices,
    manager : state.scanCentralReducer.manager,
});

export default connect(mapStateToProps)(DeviceNotMatched);