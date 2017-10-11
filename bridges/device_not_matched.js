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
        console.log("props device not matched",props);
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

    componentWillUnmount() {
      console.log("componentWillUnmount()");
      this.props.dispatch({type:"ALLOW_SCANNING",allow_scanning:true})
    }

    componentWillMount() {
      console.log("componentWillMount",this.props.device_id,);
      	
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
          console.log("response---",response);
      		let data = JSON.parse(response._bodyInit).data.documents
          if(data.lenght > 0){
            let path = data.document_path
            
            this.path = path            
          }else{
            console.log("error","the response array on documents its empty");
          }
      		//let path = data.document.path
          
      	}).catch(error => {
      		Alert.alert("Error",error)
      	})
    }

    goToAccessControlInstructions(){
      console.log("goToAccessControlInstructions()");
      if(this.path)
    	 Linking.openURL(this.path)
      else
        Alert.alert("Error","The link wasn't found.")
    }

	render(){	
		return(
			<Background>
				<View style={{height:height}}>
					{this.props.showAlert &&
						(<View style={{marginVertical:30,backgroundColor:"white",flexDirection:"row"}}>
							<View style={{width:width * .20,alignItems:"center",justifyContent:"center"}}>
								<Image source={require('../images/menu_fail.imageset/menu_fail.png')} style={{width:50,height:50,margin:10}}/>
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

