import {StyleSheet,Dimensions} from 'react-native'

var {width, height} = Dimensions.get('window'); 

const margin = 20
const title_margin  = 15
export const success_green = "#00DD00"
const medium_font_size = 18
const cancel_red = "red"
export const first_color = "#2a323d"
export const option_blue = "#5AB0E3"
export const link_color  = "#000099" 

export  const styles = StyleSheet.create({
  	mainContainer: {
      marginVertical:30,
      flex:1
    },
    container: {
		  flex:1
  	},
  	image_container:{
      flex:1,
      width:null,
      height:null
  	},
    image_complete_container:{
      
      height:height,
      width:width,
    },
  	circleContainer:{
  		width: width,
  		height: 170,
  		alignItems:"center",
  		top:-930
  	},
  	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
  	},
  	
  	coverflow: {
  		width: width,
  		height: 350,
  	},
  	launchImage:{
  		width: 1000,
    	height: 1000,
    	borderRadius: 500,
  		alignItems:"center",
  		justifyContent:"flex-end",
  		backgroundColor: first_color
  	},
  	textView:{ 
  		alignItems:"center",
  	},
  	text:{
  		marginTop:40,
  		fontSize: 20
  	},
    bridgeContainer:{
      flex:1
    },
    bridgeImageContainer:{
      width:width,
      marginVertical:25,
    },
    bridgeImage:{
      height:height/4,
      width:width/2,
      
    },
    imageBridgesContainer : {
      alignItems : "center"
    },
    textBridgesContainer : {
      alignItems : "center"
    },
    bridgeText:{
      fontSize:18
    },
    touchableSectionContainer:{
      backgroundColor:"white",
      width:width,
      alignItems:"center",
    },
    pairSectionsContainer:{
      marginVertical:5,
    },
    touchableSection:{
      width:width,
      
    },
    touchableSectionInner:{
      flexDirection:"row",
      alignItems:"center",
      
    },
    touchableSectionInnerImage:{
      width:width/5,
      height:height/6,
      marginHorizontal:20,
      
    },
    touchableSectionInnerText:{
      fontSize:medium_font_size
    },
    titleContainer:{
       margin:  title_margin
    },
    title:{
      fontSize: 18,
    },
    bigTitle:{
      fontSize: 22
    },
    preview: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    bigButtonContainer:{
      alignItems:"center",
      justifyContent: "center",      
      flexDirection: "row",
      margin:20
    },
    bigGreenButton:{
      backgroundColor: success_green,
      marginHorizontal:10,
      padding: 20,
      borderRadius: 10
    },
    bigRedButton:{
      backgroundColor: cancel_red,
      marginHorizontal:10,
      padding: 20
    },    
    bigGreenButtonText:{
      color: "white",
      fontSize:medium_font_size
    },
    rowContainer:{
      marginVertical: 10
    },
    rowContainerContainer:{
      backgroundColor: "white",
      marginVertical: 10,

    },
    simpleRow: {
      borderBottomWidth: 0.5,
      flexDirection: "row",
      
    },
    simpleRowText:{
      fontSize: 18,
      padding: 10
    }, 
    white_row : {
      padding: 15,
      borderBottomWidth: 0.2,
    },
    white_row_text: {
      fontSize: 18,
    },
    link : {
      color: "#000099"
    }
});

