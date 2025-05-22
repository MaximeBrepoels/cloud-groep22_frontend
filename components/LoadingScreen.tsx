import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import { View, StyleSheet } from "react-native";

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ContentLoader
        speed={4}
        width={300}
        height={600}
        viewBox="0 0 300 600"
        backgroundColor="#f3f3f3"
        foregroundColor="#A3A3A3"
      >
        {/* Streak Section */}
        <Rect x="0" y="20" rx="8" ry="8" width="100" height="30" />
        <Rect x="0" y="60" rx="8" ry="8" width="300" height="80" />

        {/* My Workouts Section */}
        <Rect x="0" y="170" rx="8" ry="8" width="100" height="30" />
        <Rect x="0" y="210" rx="8" ry="8" width="150" height="80" />
        <Rect x="155" y="210" rx="8" ry="8" width="145" height="80" />
        <Rect x="0" y="295" rx="8" ry="8" width="150" height="80" />
        <Rect x="155" y="295" rx="8" ry="8" width="145" height="80" />

        {/* Progress Section */}
        <Rect x="0" y="405" rx="8" ry="8" width="100" height="30" />
        <Rect x="0" y="445" rx="8" ry="8" width="300" height="160" />
      </ContentLoader>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible"
  },
});


export default LoadingScreen;
