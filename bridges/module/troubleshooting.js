/*import React, {Component} from 'react'
import {styles,first_color,success_green,option_blue,width} from '../../styles/'
import { connect } from 'react-redux';
import Background from '../../helpers/background'
import { ScrollView,View,Text,TextInput,Switch} from 'react-native'
import {SWITCH} from '../../helpers/switch'
import {ADD_ZEROS_UNTIL_NUMBER} from '../../action_creators'

class TroubleshootingModule extends Component 
{

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true, 
    }

	constructor(props) {
		super(props);
		this.state = {
			bit_type: false,
			facility : 0,
			code: 0
		}
	}

	componentWillMount(){
		this.props.activateManualMode()
		this.props.dispatch({type: "SET_MANUAL_RELAYS_STATE",manual_relays_state:[0x00]})
	}

	componentWillUnmount(){
		this.props.disableManualMode()
	}

	//writeOutPutWiegand: (value) => this.writeOutPutWiegand(value),
	//updateOutputWiegand: (value) => this.updateOutputWiegand(value)


	updateManualRelays(position,value){
		console.log("updateManualRelays()",position,value,this.props.manual_relays_state)
		
		let current_state = this.props.manual_relays_state[0]

		if(value) // switch the value 
			value = 0
		else 
			value = 1
		
		let	bytes_array = this.convertToBitsArray(current_state) 
		bytes_array[position] = value

		let reducer = (accumulator,currentValue) => {
			return (accumulator + currentValue.toString())
		}

		let byte_string = bytes_array.reduce(reducer,"")
		let byte = parseInt(byte_string,2)

		this.props.dispatch({type: "SET_MANUAL_RELAYS_STATE",manual_relays_state: [byte]})
		this.props.writeManualRelaysState([byte])
	}

	renderItem(text,value,position){
		const text_style = {marginVertical:10}
		const item_style = {alignItems:"center",justifyContent:"center",paddingHorizontal:10}

		return (
			<View style={item_style}>
				<View style={{width:(width/3)- 20,justifyContent:"center"}}>
					<Text style={text_style}>{text}</Text>
				</View>
				<View style={{width:(width/3) - 20 ,justifyContent:"center"}}>
					<SWITCH isActivated={value} onPress={() => this.updateManualRelays(position,value)}/>
				</View>
			</View>
		)
	}

	convertToBitsArray(byte){
		let bytes_string = ADD_ZEROS_UNTIL_NUMBER(byte.toString(2),8) 
		return bytes_string.split("").map(x => parseInt(x))
	}

	renderRelays(){
		const style = {flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:20}
		const bytes_array = this.convertToBitsArray(this.props.manual_relays_state[0])

		if(bytes_array && bytes_array.length > 7){
			return(
            	<View>
                    <View style={{marginVertical:18,marginLeft:20}}>
                        <Text style={{fontSize:18}}>
                           Relays
                        </Text>
                    </View>					
					<View style={style}>
						{this.renderItem("Relay 1",bytes_array[7],7)}
						{this.renderItem("Relay 2",bytes_array[6],6)}
						{this.renderItem("Relay 3",bytes_array[5],5)}
					</View>
				</View>
			)
		}

		return null;
	}

	updateFacility(value){

	}

	updateCode(value){

	}

	renderPrettyInput(text,action,placeholder){
		return(
    		<View style={{width:200,flexDirection:"row",alignItems:"center",justifyContent:"center",marginBottom:20}}>
    			<View style={{marginRight:20}}>
            		<Text>
            			{text
            				Facility
            			}
            		</Text>
            	</View>
				<View style={{backgroundColor:"white",width:200,borderRadius:10}}>
					<View style={{flexDirection:"row"}}>
						<View style={{width:200,height:40,backgroundColor:"white",alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10}}>
							<View style={{alignItems:"center",justifyContent:"center",height:50,width:180}}>
								<TextInput 
									maxLength={20}
									style={{flex:1,justifyContent:"center",fontSize:25,width:180,textAlign:"center"}} 
									keyboardType="numeric" 
									underlineColorAndroid="transparent" 
									onChangeText={action}
									placeholder={}
								/>
							</View>
						</View>
					</View>
				</View>		            		
        	</View>		
		)
	}

	renderOutputWiegand(){
		console.log("this.state.bit_type",this.state.bit_type)
		const t26_style = this.state.bit_type ? {fontSize:14} : {color:"green",fontSize:24}
		const t32_style = this.state.bit_type ? {fontSize:24,color:"green"} : {fontSize:14}
		const facility = (text) => 
		{
			this.updateFacility({text})
		}
		
		return(
			<View>
	            <View style={{marginVertical:18,marginLeft:20}}>
	                <Text style={{fontSize:18}}>
	                   Relays
	                </Text>
	            </View>									
	            <View>

	            	<View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
	            		
	            		<Text style={t26_style}>
	            			26
	            		</Text>
	            		<Switch 
	            			value={this.state.bit_type} 
	            			onValueChange={(value) => this.setState({bit_type: value})}
	            			onTintColor='rgb(100,100, 100)'
	            			tintColor='rgb(100,100,100)'
	            			thumbTintColor="white"
	            		/>
	            		<Text style={t32_style}>
	            			37
	            		</Text>
	            	</View>
	            	<View style={{alignItems:"center",marginTop:20}}>
	            		{this.renderPrettyInput("Facility",(text) => this.updateFacility({text}), )}
	            		<View style={{width:200,flexDirection:"row",alignItems:"center",justifyContent:"center",marginBottom:20}}>
	            			<View style={{marginRight:20}}>
			            		<Text>
			            			Facility
			            		</Text>
			            	</View>
							<View style={{backgroundColor:"white",width:200,borderRadius:10}}>
								<View style={{flexDirection:"row"}}>
									<View style={{width:200,height:40,backgroundColor:"white",alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10}}>
										<View style={{alignItems:"center",justifyContent:"center",height:50,width:180}}>
											<TextInput 
												maxLength={20}
												style={{flex:1,justifyContent:"center",fontSize:25,width:180,textAlign:"center"}} 
												keyboardType="numeric" 
												underlineColorAndroid="transparent" 
												onChangeText={(text) => this.updateFacility({text})}
												placeholder="00"
											/>
										</View>
									</View>
								</View>
							</View>		            		
		            	</View>
		            	<View style={{width:200,flexDirection:"row",alignItems:"center",justifyContent:"center",marginBottom:20}}>
		            		<Text style={{marginRight:20}}>
		            			Code
		            		</Text>
							<View style={{backgroundColor:"white",width:200,borderRadius:10}}>
								<View style={{flexDirection:"row"}}>
									<View style={{width:200,height:40,backgroundColor:"white",alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10}}>
										<View style={{alignItems:"center",justifyContent:"center",height:50,width:180}}>
											<TextInput 
												maxLength={20}
												style={{flex:1,justifyContent:"center",fontSize:25,width:180,textAlign:"center"}} 
												keyboardType="numeric" 
												underlineColorAndroid="transparent" 
												onChangeText={(text) => this.updateCode({text})}
												placeholder="00000"
											/>
										</View>
									</View>
								</View>
							</View>			            			            		
		            	</View>
	            	</View>
	            </View>
			</View>
		)

	}

	render(){
		return (
			<Background>
				<ScrollView>
					<View>
						{this.renderRelays()}
						{this.renderOutputWiegand()}
					</View>
				</ScrollView>											
			</Background>
		)
	}
}

const mapStateToProps = state => ({
    device: state.scanCentralReducer.central_device,
    manual_relays_state: state.scanCentralReducer.manual_relays_state
});

export default connect(mapStateToProps)(TroubleshootingModule)*/