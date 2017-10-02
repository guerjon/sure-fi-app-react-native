import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	Linking,
  	Alert
} from 'react-native'
import {styles,first_color,height,width} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
	GET_DEVICE_DOCUMENTS
} from '../constants'
import Background from '../helpers/background'
import {WhiteRowLink} from '../helpers/white_row_link'

class DeviceNotMatched extends Component{
	
    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
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
    }


    onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
        console.log("event",event)
        switch(event.id){
            case "didDisappear":
            	//if(this.props.showAlert)
                	//this.props.startScanning()
            break
            default:
            break
        }
        
    }

    
    componentWillMount() {
      	fetch(GET_DEVICE_DOCUMENTS,{
      		method: "post",
      		headers: {
      			'Accept' : 'application/json',
      			'Content-Type' : 'application/json'
      		},
      		body: JSON.stringify({
      			hardware_serial: this.props.device_id
      		})
      	}).then(response => {
      		let data = JSON.parse(response._bodyInit).data.documents[0]
      		let path = data.document_path
      		
      		this.path = path
      		//let path = data.document.path

      	}).catch(error => {
      		Alert.alert("Error",error)
      	})
    }

    goToAccessControlInstructions(){
    	Linking.openURL(this.path)
    }

	render(){	
		return(
			<Background>
				<View style={{height:height}}>
					{this.props.showAlert &&
						(<View style={{marginVertical:30,backgroundColor:"white",flexDirection:"row"}}>
							<View style={{width:width * .25}}>
								<Image source={require('../images/account_icon.imageset/account_icon.png')} style={{width:100,height:50,margin:10}}/>
							</View>
							<View style={{margin:20,width: width * .75}}>
								<Text style={{color:"red"}}>
									Sure-Fi was unable to find the Device  {this.props.device_id} via Bluetooth. 
									Please make sure you are within range and the device is powered on.
								</Text>
							</View>
						</View>)
					}
					<View>
						<Text style={styles.device_control_title}>AVAIBLE DOCUMENTS</Text>
						<WhiteRowLink callback={() => this.goToAccessControlInstructions()}  name="Access Control Bridge Instructions"/>
					</View>
				</View>
			</Background>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(DeviceNotMatched);

