import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Bodyweight } from "../types";


type Props = {
    bodyweightData: Bodyweight[];
};

const BodyweightGraph: React.FC<Props> = ({ bodyweightData }: Props) => {
    const formatDate = (dateString: string) => {
        const [day, month, year] = dateString.split('-');
        return `${day}/${month}`;
    };

    const labels = bodyweightData.map((entry) => formatDate(entry.date));
    const data = bodyweightData.map((entry) => entry.bodyWeight);

    return (
            bodyweightData.length < 1 ? (<Text>Add your bodyweight to start tracking your progress!</Text>)
            :
            (
                <View style={styles.card}>
                        <LineChart
                            data={{
                                labels,
                                datasets: [{ data }],
                            }}
                            width={280}
                            height={200}
                            yAxisSuffix="kg"
                            chartConfig={{
                                backgroundColor: "#FFF",
                                backgroundGradientFrom: "#FFF",
                                backgroundGradientTo: "#FFF",
                                decimalPlaces: 1,
                                color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: { borderRadius: 4 },
                            }}
                            style={{ marginVertical: 8, borderRadius: 8 }}
                        />
                </View>
            )
        )


};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F5F5F5",
    },
    title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 16,
    textAlign: "left",
    },
    card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 16,
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: "flex-start",
    },
    exerciseTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
    width: "100%",
    },
    progressText: {
    fontSize: 14,
    color: "#777",
    },
});

export default BodyweightGraph;