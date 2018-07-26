import React, {Component} from 'react'
import {
  	Text,
  	TouchableOpacity,
} from 'react-native'


export const SWITCH = params => {
	if(params.isActivated)
		return (
			<TouchableOpacity 
				style={{backgroundColor:"#02AF02",width:50,height:40,marginRight:20,alignItems:"center",borderRadius:10,justifyContent:"center"}}
				onPress={() => params.onPress(1)}
			>
				<Text style={{color:"white",fontSize:18}}>
					On
				</Text>
			</TouchableOpacity> 
		)

	return (
		<TouchableOpacity 
			style={{backgroundColor:"#E2E2E2",width:50,height:40,marginRight:20,borderRadius:10,alignItems:"center",justifyContent:"center"}}
			onPress={() => params.onPress(0)}
		>
			<Text style={{color:"white",fontSize:18}}>
				Off
			</Text>
		</TouchableOpacity>
	)
}
