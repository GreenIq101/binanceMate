import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as w ,heightPercentageToDP as h} from 'react-native-responsive-screen';

const FindChange = () => {

    const[total,setTotal] = useState('0');
    const[crossTarget,SetCrossTarget] = useState('0');
    const[crossTime,SetCrossTime] = useState('');
    const[bellowTarget,setBellowTarget] = useState('');
    const[bellowTime,setBellowTime] = useState('');
    const[Accuracy,setAccuracy] = useState('');


    const livePrice = ["62912.91","2462.28","146.15","572.9","8.546","65.54","0.01146","8.422","8.347",
        "8.431","62760","62761.54","2460.5","2460.94","574.6","572.3","0.7784","0.7795","0.783","0.008521"];


    const prdectedPrice = ["62959.43","2468.25","146.31","575.53","7.86","65.91","0.010735","8.13","7.84","62854.99",
        "62943.93","2464.488","2468.11","574.952","573.4","0.78775","0.8","0.8","0.009347","587.926774279"];


    const resultPrice = ["62889.48","2467.34","146.67","574.6","9.28","65.51","0.01151","9.05","9.05","62818.14","62818.14","2463",
        "2463","573","574.14","0.7855","0.7855","0.7801","0.009833","587.3"];
       
       
       
        const setTotalOrder = () =>
        {
            setTotal(livePrice.length);    
            // console.log("Predected Length  " + parseInt(prdectedPrice.length) );
            // console.log("Predected Length  " + parseInt(resultPrice.length) );
        }

        const CheckCrossedTargetOrders = () =>

        {
            var lowernum = 0;
            var uppernum = 0;

            for (i=0 ; i < prdectedPrice.length;i++)
            {
                // console.log("Predected  " + prdectedPrice[i]);
                // console.log("Resultent  " + resultPrice[i]);


                if(prdectedPrice[i] < resultPrice[i] )
                {
                    console.log("less");
                    lowernum += 1;
                }else
                
                {
                    uppernum += 1;
                    console.log("hight");
                }

                SetCrossTarget(uppernum);
                setBellowTarget(lowernum);
            }
        }

        

  return (
    <View style={styles.mainContainer} >
        <View style={styles.card} >
            <View style={styles.cardHeader} >
                <Text style={styles.cardHeaderText} >Total Orders</Text>
            </View>
            <View style={styles.cardBody} >
                <Text style={styles.cardText} onPress={setTotalOrder} >{total}</Text>
            </View>
        </View>

        <View style={styles.card} >
            <View style={styles.cardHeader} >
                <Text style={styles.cardHeaderText} >Cross Target</Text>
            </View>
            <View style={styles.cardBody} >
                <Text style={styles.cardText} onPress={CheckCrossedTargetOrders} >{crossTarget}</Text>
            </View>
        </View>

        <View style={styles.card} >
            <View style={styles.cardHeader} >
                <Text style={styles.cardHeaderText} >Bellow Target</Text>
            </View>
            <View style={styles.cardBody} >
                <Text style={styles.cardText} >{bellowTarget}</Text>
            </View>
        </View>

        <View style={styles.card} >
            <View style={styles.cardHeader} >
                <Text style={styles.cardHeaderText} >On Time</Text>
            </View>
            <View style={styles.cardBody} >
                <Text style={styles.cardText} >0</Text>
            </View>
        </View>

        <View style={styles.card} >
            <View style={styles.cardHeader} >
                <Text style={styles.cardHeaderText} >Bellow Time</Text>
            </View>
            <View style={styles.cardBody} >
                <Text style={styles.cardText} >0</Text>
            </View>
        </View>

        <View style={styles.card} >
            <View style={styles.cardHeader} >
                <Text style={styles.cardHeaderText} >Accuracy</Text>
            </View>
            <View style={styles.cardBody} >
                <Text style={styles.cardText} >0</Text>
            </View>
        </View>

        
    </View>
  )
}

export default FindChange

const styles = StyleSheet.create({
    mainContainer:
    {
        height:h("40%"),
        width:w("100%"),
        backgroundColor:'orange',
        justifyContent:'space-evenly',
        alignItems:'center',
        flexDirection:'row'
    },
    card:
    {
        height:h("35%"),
        width:w("15%"),
        backgroundColor:'whitesmoke',
        justifyContent:'space-evenly',
        alignItems:'center'
    },
    cardHeader:
    {
        height:"40%",
        width:"100%",
        // backgroundColor:'orange',
        justifyContent:'space-around',
        alignItems:'center'
    },
    cardHeaderText:
    {
        fontSize:28,
    },
    cardBody:
    {
        height:"40%",
        width:"100%",
        // backgroundColor:'orange',
        justifyContent:'space-around',
        alignItems:'center'
    },
    cardText:
    {
        fontSize:20,
    }
})