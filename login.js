import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
  	TextInput,
  	Alert,
  	TouchableHighlight
} from 'react-native'
import {styles,first_color,width,success_green} from './styles/index.js'
import { connect } from 'react-redux';
import { 
	USER_LOGIN,
	SESSION_START
} from './constants'
var validator = require("email-validator");
import Icon from 'react-native-vector-icons/FontAwesome';

class Login extends Component{
	
	static navigationOptions ={
		title : "Your Sure-Fi Account",
		headerStyle: {backgroundColor: first_color},
		headerTitleStyle : {color :"white"},
		headerBackTitleStyle : {color : "white",alignSelf:"center"},
		headerTintColor: 'white',
	}
	constructor(props) {
		super(props);
		this.session_key = props.navigation.state.params.session_key;
	}

	componentWillMount() {

		fetch(SESSION_START,{
			method : "get"
		}).then(response => {
			console.log("response",response)
		})
	}

	login(){
		if(validator.validate(this.email)){
			let body = JSON.stringify({
				user_login: this.email,
				user_password: this.password,
				session_key : this.session_key 
			})
			console.log("body",body)
			let headers = 
				{
				    'Accept': 'application/json',
				    'Content-Type': 'application/json',				
				}

			fetch(USER_LOGIN,{
				method: "post",
				body: body,
				headers : headers

			})
			.then(response => {
				console.log(response)
				var data = JSON.parse(response._bodyInit)
				if(data.status == "success"){
					this.user_data = data.data.user_data
					this.props.dispatch({type: "USER_LOGIN",user_login_status:"loggin",user: this.user_data})
					Alert.alert("Success","You are loggin");

				}else{
					Alert.alert("Error",data.msg)
				}
			})
			.catch(error => Alert.alert("Error",error))
		}else{
			Alert.alert("Error","The email is not correct.")
		}
	}

	render(){	
		return(
			<ScrollView style={styles.pairContainer}>
				<Image  
					source={require('./images/temp_background.imageset/temp_background.png')} 
					style={styles.image_complete_container}
				>	
					<View style={{marginVertical:20}}>
						<View>
							<Text style={styles.device_control_title}>
								USER LOGIN
							</Text>							
						</View>
						<View style={{backgroundColor:"white"}}>
							<View style={{margin:50}}>
								<View style={{height:40,borderWidth:0.5,marginVertical:10,flexDirection:"row"}}>
									<View style={{flex:0.2}}>
										<Icon name="user" size={30} color="gray" style={{margin:5}}/>
									</View>
									<View style={{width:200,height:200,flex:0.8}}>
										<TextInput
											onChangeText={t => this.email = t } 
											underlineColorAndroid="transparent"
											keyboardType = "email-address"
											placeholder = "Email address"
										/>
									</View>
								</View>

								<View style={{height:40,borderWidth:0.5,marginVertical:10,flexDirection:"row"}}>
									<View style={{flex:0.2}}>
										<Icon name="lock" size={30} color="gray" style={{margin:5}}/>
									</View>
									<View style={{width:200,height:200,flex:0.8}}>
										<TextInput 
											secureTextEntry={true}
											password={true}
											style={{height:40,width:200}}
											onChangeText={t => this.password = t} 
											underlineColorAndroid="transparent"
											placeholder = "Password"
										/>
									</View>
								</View>
								<View style={{marginTop:20}}>
									<TouchableHighlight onPress={() => this.login()} style={{backgroundColor: success_green,height:40,alignItems:"center",justifyContent:"center"}}>
										<Text style={styles.bigGreenButtonText}>
											Log In
										</Text>
									</TouchableHighlight>
								</View>
							</View>
						</View>
					</View>
				</Image>
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(Login);


