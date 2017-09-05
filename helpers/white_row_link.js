import React, { Component } from 'react';
import {
  	Text,
  	View,
  	TouchableHighlight
} from 'react-native'
import {
	styles,
	first_color,
	height,
	width,
	option_blue
} from '../styles/index.js'

export const WhiteRowLink = params => {
	return(
		<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}} onPress={() => params.callback()}>
			<View style={{padding:15,flexDirection:"row"}}>
				<Text style={{fontSize:16,color:option_blue}}>
					{params.name}
				</Text>
			</View>
		</TouchableHighlight>						
	)

}