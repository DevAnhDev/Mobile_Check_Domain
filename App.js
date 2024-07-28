import React, { useEffect, useState } from 'react';
import {StyleSheet, Text, View, ImageBackground, PixelRatio, ScrollView} from 'react-native';
import { fetchData, createPost, updatePost, deletePost, updatePostNetwork } from './src/services/api';
import { DOMAIN, LONGPOLING, MOBI, VIETEL, VINA, apiURL, SSE } from './src/constain';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import moment from 'moment';
import EventSource from 'react-native-event-source';



function App() {
  const [data, setData] = useState([]);
  const [selectedValue, setselectedValue] = useState("Viettel");
  const [isSignal, setisSignal] = useState("false");

  useEffect(() => {
    console.log('Setting up SSE connection...',apiURL+SSE);
    //sigin SSE with api /sse
    const eventSource = new EventSource(apiURL+SSE);
    //connect
    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };
    //listerner signal from server
    eventSource.addEventListener('message', event => {
      console.log('Received message:', event.data);
      setisSignal(event.data);
      // Xử lý dữ liệu nhận được từ server SSE ở đây
    });
    //auto reconnect sigin api sse
    eventSource.onerror = error => {
      console.error('Error occurred:', error);
      reconnectSSE();
    };
    

    //close connect 
    return () => {
      eventSource.close();
      console.log('SSE connection closed');
    };
  }, []);

  // Fetch data initial
  useEffect(() => {
    console.log("initial loading data ....")
    getData();
  }, []);

    // Fetch data initial
    useEffect(() => {
      console.log("2 loading data ....",isSignal)
      if(isSignal == "true"){
        getData();
      }
    }, [isSignal]);


  const reconnectSSE = () => {
    //process reconnect
    setTimeout(() => {
      console.log('Reconnecting SSE...');
      // connect after 2s
    }, 2000);
  };

    const fectdataSignal = async()=>{
      try {
        const res = await fetchData(LONGPOLING);
        // const data = await res.text();
        console.log("signal: ", res)
      } catch (error) {
        console.log("signal: ", error)
      }
    }

    const getData = async () => {
      try {
        const data = await fetchData(DOMAIN);
        setData(data);
        const newData = data?.data;
        const netWork = selectedValue == "Viettel" ? VIETEL : selectedValue == "Vina" ? VINA : MOBI;
        //get time now
        const now = moment().format('HH:mm:ss DD/MM/YYYY');
        // console.log(newData);

        if(newData?.length > 0){
          for(let i = 0; i < newData.length; i++){
            //get id follow => network
            const idNetWork = selectedValue == "Viettel" ? newData[i]?.viettel?.id : selectedValue == "Vina" ? newData[i]?.vina?.id : newData[i]?.mobile?.id;
            //check domain
            const check = await checkDomainActive(newData[i].domanName);
            //get ipv4
            const ipv4 = await getIPv4(newData[i]?.domanName);
            //update list domain with network Viettel
            if(selectedValue == "Viettel"){
                await updatePost(DOMAIN ,newData[i]?.id, { 
                    "domanName": newData[i]?.domanName,
                    "ipAddress":ipv4,
                    "active": check,
                    "description": `${now}`,
                    "viettel":newData[i]?.viettel,
                    "mobile":newData[i]?.mobile,
                    "vina":newData[i]?.vina,
                })
            }
            //updaate toàn bộ
            //update detail network
            // if(!check){
              await updatePostNetwork(
                netWork,
                idNetWork,
                check,
                {
                "domainName":newData[i].domanName,
                "ipAddress":ipv4,
                "netWork":selectedValue,
                "active": check,
                "description": now
              })
            // } 
          }
        }
        setisSignal("false");
      } catch (error) {
       console.log("err: ",error)
      }
    };

    // check active domain
    const checkDomainActive = async(domain)=>{
      let isCheck = true;
      try {
        console.log("domain: ", `https://${domain}`)
        const response = await axios.get(`https://${domain}`);
        if(response.status === 200){
           isCheck = true;
        }else{
          isCheck = false;
        }
        console.log("check data: ",domain,"=>",isCheck)
      } catch (error) {
        isCheck = false;
        console.log("error1: ",error)
        // console.log("check data: ",domain,"=>",isCheck)

        return isCheck;
      }
      console.log("check data: ",domain,"=>",isCheck)
      return isCheck;
    }
    // get ipv4 domain 
    const getIPv4 = async (domain) => {
      let ipv4 = "";
      try {
        const addresses = await fetch('https://dns.google/resolve?name=' + domain + '&type=A');
        const json = await addresses.json();
        if (json.Answer && json.Answer.length > 0) {
          ipv4 = json.Answer[0].data;
        }else{
          ipv4 = 'IP address not found';
        }
        return ipv4;
      } catch (e) {
        console.error('Error getting IPv4:', e);
        return 'IP address not found';
      }
    };

  return (


    <ImageBackground source={require('./assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.text}>Select a Networks: </Text>
        <Picker
        selectedValue={selectedValue}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) => setselectedValue(itemValue)}
      >
          <Picker.Item label="Viettel" value="Viettel" />
          <Picker.Item label="Vina" value="Vina" />
          <Picker.Item label="Mobile" value="Mobile" />
      </Picker>
      </View>
    </ImageBackground>

  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch'
  },
  picker: {
    height: 50,
    width: 150,
    color:'#fff',
    borderWidth: 2, // Border width
    borderColor: 'yellow', // Border color
    borderRadius: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'row',
    justifyContent:'space-around'
  },
  text: {
    fontSize: 20,
    color: '#fff',
  },
});

export default App;
