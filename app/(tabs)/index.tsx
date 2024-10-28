import React from 'react';
import { StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const DATA_KEY = 'waterData';

const fetchData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DATA_KEY);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const generateFakeData = () => [
  {
    timestamp: new Date().toISOString(),
    level: 75,  // Nível em porcentagem
    volume: 750,  // Volume atual
    totalVolume: 1000,
    temperature: 22,  // Temperatura em °C
    purity: 0,  // Pureza em porcentagem
  },
];

export default function HomeScreen() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      const waterData = await fetchData();
      setData(waterData || generateFakeData());
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

  const latestData = data[data.length - 1];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Monitoramento Recente da Caixa d'Água
      </ThemedText>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Nível da Água</ThemedText>
        <LineChart
          data={{
            labels: [''],
            datasets: [{ data: [latestData.level] }],
          }}
          width={screenWidth - 80}
          height={220}
          yAxisSuffix="%"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Volume da Água</ThemedText>
        <PieChart
          data={[
            { name: 'Volume Atual', population: latestData.volume, color: '#0077be', legendFontColor: '#0077be', legendFontSize: 15 },
            { name: 'Capacidade Livre', population: latestData.totalVolume - latestData.volume, color: '#add8e6', legendFontColor: '#add8e6', legendFontSize: 15 },
          ]}
          width={screenWidth - 80}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Temperatura da Água</ThemedText>
        <BarChart
          data={{
            labels: [''],
            datasets: [{ data: [latestData.temperature] }],
          }}
          width={screenWidth - 80}
          height={220}
          yAxisSuffix="°C"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Pureza da Água</ThemedText>
        <LineChart
          data={{
            labels: [''],
            datasets: [{ data: [latestData.purity] }],
          }}
          width={screenWidth - 80}
          height={220}
          yAxisSuffix="%"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </ThemedView>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#e0f7fa',
  backgroundGradientTo: '#e0f7fa',
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  barPercentage: 0.5,
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
});
