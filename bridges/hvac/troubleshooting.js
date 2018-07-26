import React, {Component} from 'react'
import {styles,first_color,success_green,option_blue,width} from '../../styles/'
import { connect } from 'react-redux';
import Background from '../../helpers/background'
import { ScrollView,View,Text} from 'react-native'
import {SWITCH} from '../../helpers/switch'
import {ADD_ZEROS_UNTIL_NUMBER} from '../../action_creators'

class Troubleshooting extends Component {

    static navigatorStyle = {
        navBarBackgroundColor : first_color,
        navBarTextColor : "white",
        navBarButtonColor: "white",
        orientation: 'portrait',
        navBarTitleTextCentered: true, 
    }

	constructor(props) {
		super(props);
	}

	componentWillMount(){
		this.props.activateManualMode()
		this.props.dispatch({type: "SET_MANUAL_RELAYS_STATE",manual_relays_state:[0x00]})
	}

	componentWillUnmount(){
		this.props.disableManualMode()
	}

	updateManualRelays(position,value){
		console.log("updateManualRelays()",position,value,this.props.manual_relays_state)
		
		let current_state = this.props.manual_relays_state[0]

		if(value) // switch the value 
			value = 0
		else 
			value = 1
		
		let	bytes_array = this.convertToBitsArray(current_state) 
		
		console.log("bytes_array before modify",bytes_array)

		bytes_array[position] = value
		
		console.log("bytes_array after modify",bytes_array)

		let reducer = (accumulator,currentValue) => {
			return (accumulator + currentValue.toString())
		}

		let byte_string = bytes_array.reduce(reducer,"")
		console.log("byte_string after reducer : ", byte_string)
		let byte = parseInt(byte_string,2)
		console.log("byte after parseInt : ", byte)

		this.props.dispatch({type: "SET_MANUAL_RELAYS_STATE",manual_relays_state: [byte]})
		this.props.writeManualRelaysState([byte])
	}

	renderItem(text,value,position){
		const text_style = {marginVertical:10}
		const item_style = {alignItems:"center",justifyContent:"center"}

		return (
			<View style={item_style}>
				<Text style={text_style}>{text}</Text>
				<SWITCH isActivated={value} onPress={() => this.updateManualRelays(position,value)}/>
			</View>
		)
	}

	convertToBitsArray(byte){
		let bytes_string = ADD_ZEROS_UNTIL_NUMBER(byte.toString(2),8) 
		return bytes_string.split("").map(x => parseInt(x))
	}

	render(){
		const style = {flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:20}

		const bytes_array = this.convertToBitsArray(this.props.manual_relays_state[0])
		console.log("render()",bytes_array)
		
		return (
			<Background>
				<ScrollView>

					<View>
                        <View style={{marginVertical:18,marginLeft:20}}>
                            <Text style={{fontSize:18}}>
                               HVAC Relays
                            </Text>
                        </View>					
                        {bytes_array && bytes_array.length > 7 && (
                        	<View>
								<View style={style}>
									{this.renderItem("R1 (W, O/B)",bytes_array[7],7)}
									{this.renderItem("R2 (Y)",bytes_array[6],6)}
									{this.renderItem("R3 (G)",bytes_array[5],5)}
									{this.renderItem("R4 (Y2)",bytes_array[4],4)}
								</View>
								<View style={style}>
									{this.renderItem("R5(W2,AUX)",bytes_array[3],3)}
									{this.renderItem("R6(E)",bytes_array[2],2)}
									{this.renderItem("R7",bytes_array[1],1)}
									{this.renderItem("R8",bytes_array[0],0)}
								</View>
							</View>
							)
						}
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

export default connect(mapStateToProps)(Troubleshooting)