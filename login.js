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
import {styles,first_color,width,success_green,option_blue} from './styles/index.js'
import { connect } from 'react-redux';
import { 
	USER_LOGIN,
	SESSION_START,
	MAKE_ID
} from './constants'
var validator = require("email-validator");
import Icon from 'react-native-vector-icons/FontAwesome';
import Background from './helpers/background';
import * as KeyChain from 'react-native-keychain';
import {UserInfo,AccountInformation} from './helpers/user_info'

const api_key = "52a9"



class Login extends Component{

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait'
    }	

	constructor(props) {
		super(props);
		this.session_key = props.session_key;
	}

	componentWillMount() {
		let user = this.props.user
		let password = this.props.password

		console.log("user",user)
		console.log("password",password)
		
		if(user)
			this.login(user,password)
	}

	login(email,password){
		console.log("login()",email,password)
		if(validator.validate(email)){
			let body = JSON.stringify({
				user_login: email,
				user_password: password,
				session_key : this.session_key
			})
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
				
				var data = JSON.parse(response._bodyInit)

				if(data.status == "success"){
					this.user_data = data.data.user_data
					this.props.dispatch({type: "SET_USER_DATA",user_data:this.user_data})
					this.props.dispatch({type: "SET_USER_STATUS",user_status : "logged"})
					if(email != null && password != null ){
						KeyChain.setGenericPassword(email,password)
					}

				}else{
					Alert.alert("Error",data.msg)
				}
			})
			.catch(error => Alert.alert("Error",error))
		}else{
			Alert.alert("Error","The email is not correct.")
		}
	}

	logout(){
		console.log("logout()")
		KeyChain.resetGenericPassword()
		.then(response => {
			this.props.dispatch({type: "SET_USER_DATA",user_data: null})
			this.props.dispatch({type: "SET_USER_STATUS",user_status : "logout"})
		})
	}

	getLoginInputs(){
		return (
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
							<TouchableHighlight onPress={() => this.login(this.email,this.password)} style={{backgroundColor: success_green,height:40,alignItems:"center",justifyContent:"center"}}>
								<Text style={styles.bigGreenButtonText}>
									Log In
								</Text>
							</TouchableHighlight>
						</View>
					</View>
				</View>
			</View>
		)
	}

	getUserInformation(user){
		return (
			<ScrollView>
				<View style={{marginVertical:20}}>
					<Text style={styles.device_control_title}>
						USER DETAILS
					</Text>					
					<UserInfo email={user.user_email} last_name={user.user_last_name} first_name={user.user_first_name} />
				</View>
				<View style={{marginBottom:20}}>
					<Text style={styles.device_control_title}>
						ACCOUNT INFORMATION
					</Text>
					<AccountInformation 
						user_login={user.user_login} 
						user_key={user.user_key}
						user_type={user.user_type}
						user_auth_level={user.user_auth_level}
					/>
					<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center",borderBottomWidth:0.3,}} onPress={() => this.logout()}>
						<View style={{padding:15,flexDirection:"row"}}>
							<View style={{flex:1,alignItems:"center"}}>
								<Text style={{fontSize:16,color:option_blue}}>
									Log Out
								</Text>
							</View>
						</View>
					</TouchableHighlight>					
				</View>
			</ScrollView>
		)
		
	}

	render(){
		let user = this.props.user_data
		if(user != null){
			var content = this.getUserInformation(user)
		}else{
			var content = this.getLoginInputs()
		}

		return(
			<Background>
				{content}
			</Background>
		);	
	}
}

const mapStateToProps = state => ({
	session_token : state.loginReducer.session_token,
	user_login_status : state.loginReducer.session_token,
	user_data : state.loginReducer.user_data
});

export default connect(mapStateToProps)(Login);