import React, {Component} from 'react'
import {
  	Text,
  	View,
  	Image,
  	ScrollView,
} from 'react-native'
import {styles,first_color} from '../styles/index.js'
import { connect } from 'react-redux';
import { 
	LOADING,
} from '../constants'
import Camera from 'react-native-camera';

class CameraHelper extends Component{
	
	render(){	
		return(
			<ScrollView style={styles.pairContainer}>			
				<Camera
	            style={styles.preview}
	            aspect={Camera.constants.Aspect.fill}
	            >
	              <View/>
	          </Camera>				
			</ScrollView>
		);	
	}
}

const mapStateToProps = state => ({

});

export default connect(mapStateToProps)(CameraHelper);


/*
import { FETCHING_DATA, FETCHING_DATA_SUCCESS, FETCHING_DATA_FAILURE } from '../constants'
const initialState = {
}

export default function dataReducer (state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
*/