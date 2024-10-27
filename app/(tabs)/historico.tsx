import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, View, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const DATA_KEY = 'waterData';

const fetchData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const calculateAverage = (data) => {
  const total = data.reduce((sum, value) => sum + value, 0);
  return total / data.length;
};

const getFilteredData = (data, filter) => {
  const today = new Date();
  return data.filter(item => {
    const itemDate = new Date(item.timestamp);
    if (filter === 'day') {
      return itemDate.toDateString() === today.toDateString();
    } else if (filter === 'week') {
      return itemDate >= new Date(today.setDate(today.getDate() - 7));
    } else if (filter === 'month') {
      return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
    }
    return true;
  });
};

export default function HistoryScreen() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('day');

  useEffect(() => {
    const loadData = async () => {
      const waterData = await fetchData();
      setData(waterData || []);
    };
    loadData();
  }, []);

  if (!data) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Carregando dados...</ThemedText>
      </ThemedView>
    );
  }

  const filteredData = getFilteredData(data, filter);
  const levelData = filteredData.map(item => item.level);
  const temperatureData = filteredData.map(item => item.temperature);
  
  const avgLevel = calculateAverage(levelData).toFixed(2) || 0;
  const avgTemperature = calculateAverage(temperatureData).toFixed(2) || 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Histórico de Dados</ThemedText>
      </ThemedView>

      <View style={styles.buttonContainer}>
        <Button title="Últimos Dias" onPress={() => setFilter('day')} />
        <Button title="Últimas Semanas" onPress={() => setFilter('week')} />
        <Button title="Últimos Meses" onPress={() => setFilter('month')} />
      </View>

      <ThemedText type="subtitle" style={styles.chartTitle}>
        Histórico do Nível da Água (Média: {avgLevel}%)
      </ThemedText>
      <LineChart
        data={{
          labels: filteredData.map(item => new Date(item.timestamp).toLocaleDateString()),
          datasets: [{ data: levelData }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />

      <ThemedText type="subtitle" style={styles.chartTitle}>
        Histórico da Temperatura (Média: {avgTemperature}°C)
      </ThemedText>
      <LineChart
        data={{
          labels: filteredData.map(item => new Date(item.timestamp).toLocaleDateString()),
          datasets: [{ data: temperatureData }],
        }}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="°C"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
});
