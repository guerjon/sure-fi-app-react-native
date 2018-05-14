import React, {Component} from 'react'
import {
  	Text,
  	TouchableHighlight,
} from 'react-native'

export const SWITCH = params => {
	if(params.isActivated)
		return (
			<TouchableHighlight 
				style={{backgroundColor:"#00DD00",width:30,height:30,marginHorizontal:2,alignItems:"center",borderRadius:50}}
				onPress={() => params.onPress(1)}
			>
				<Text style={{color:"white",marginTop:5}}>
					On
				</Text>
			</TouchableHighlight> 
		)

	return (
		<TouchableHighlight 
			style={{backgroundColor:"red",width:30,height:30,marginHorizontal:2,borderRadius:50,alignItems:"center"}}
			onPress={() => params.onPress(0)}
		>
			<Text style={{color:"white",marginTop:5}}>
				Off
			</Text>
		</TouchableHighlight>
	)
}
