import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, Text, TouchableOpacity } from 'react-native';
// @ts-ignore
import getStartedImage from '../assets/images/getStarted.jpg';

const GetStarted = () => {
  return (
    <ImageBackground
      source={getStartedImage}
      style={{ width: '100%', height: '100%' }}
      resizeMode='cover'>
      <Text style={{ color: 'white', fontSize: 30, textAlign: 'center', marginTop: 370, fontFamily: "Itim" }}>
        Updater
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: "#3A7BD5",
          paddingVertical: 10,
          borderRadius: 25,
          width: "80%",
          alignSelf: "center",
          marginTop: 250
        }}
        onPress={() => router.push("/Login")}>

        <Text style={{
          color: "white",
          fontSize: 18,
          fontWeight: "600",
          textAlign: "center",
        }}>Get Started</Text>

      </TouchableOpacity>
    </ImageBackground>
  )
}

export default GetStarted
