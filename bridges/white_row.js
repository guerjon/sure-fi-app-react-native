import React, { Component } from 'react';
import {
  	Text,
  	View,
  	TouchableHighlight
} from 'react-native'
import {width} from '../styles'

export const WhiteRow = (params) => {
	return (
		<TouchableHighlight style={{backgroundColor:"white",width:width,alignItems:"center"}}>
			<View style={{padding:10,flexDirection:"row"}}>
				<View style={{flex:0.7}}>
					<Text style={{fontSize:16}}>
						{params.name}
					</Text>
				</View>
				<View style={{flex:1}}>
					<Text style={{fontSize:16}}>
						{params.value}
					</Text>
				</View>				
			</View>
		</TouchableHighlight>
	)
}