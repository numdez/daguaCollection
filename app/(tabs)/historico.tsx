import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, View, TouchableOpacity, Text } from 'react-native';
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

  const formattedTimestamps = filteredData.map(item => new Date(item.timestamp).toLocaleDateString());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Histórico de Dados
      </ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.filterButton, filter === 'day' && styles.activeFilter]} onPress={() => setFilter('day')}>
          <Text style={styles.buttonText}>Últimos Dias</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'week' && styles.activeFilter]} onPress={() => setFilter('week')}>
          <Text style={styles.buttonText}>Últimas Semanas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterButton, filter === 'month' && styles.activeFilter]} onPress={() => setFilter('month')}>
          <Text style={styles.buttonText}>Últimos Meses</Text>
        </TouchableOpacity>
      </View>
      
      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
          Histórico do Nível da Água (Média: {avgLevel}%)
        </ThemedText>
        <LineChart
          data={{
            labels: formattedTimestamps,
            datasets: [{ data: levelData }],
          }}
          width={screenWidth - 80}
          height={220}
          yAxisSuffix="%"
          chartConfig={chartConfigWaterLevel}
          style={styles.chart}
        />
      </ThemedView>
        
      <ThemedView style={styles.chartContainer}>
        <ThemedText type="subtitle" style={styles.chartTitle}>
          Histórico da Temperatura (Média: {avgTemperature}°C)
        </ThemedText>
        <LineChart
          data={{
            labels: formattedTimestamps,
            datasets: [{ data: temperatureData }],
          }}
          width={screenWidth - 80}
          height={220}
          yAxisSuffix="°C"
          chartConfig={chartConfigTemperature}
          style={styles.chart}
        />
      </ThemedView>
    </ScrollView>
  );
}

const chartConfigWaterLevel = {
  backgroundColor: '#E6F7FF',
  backgroundGradientFrom: '#E6F7FF',
  backgroundGradientTo: '#B3E0FF',
  color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

const chartConfigTemperature = {
  backgroundColor: '#FFE0CC',
  backgroundGradientFrom: '#FFE0CC',
  backgroundGradientTo: '#FFB399',
  color: (opacity = 1) => `rgba(255, 102, 51, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#e0f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#0077be',
    textAlign: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#0077be',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#B3E0FF',
    marginHorizontal: 5,
  },
  activeFilter: {
    backgroundColor: '#007ACC',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
