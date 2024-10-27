import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function HomeScreen() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      const waterData = await fetchData();
      if (!waterData || waterData.length === 0) {
        setData(generateFakeData());
      } else {
        setData(waterData);
      }
    };

    loadData();
  }, []);

  const generateFakeData = () => {
    return [
      {
        timestamp: new Date().toISOString(),
        level: 0,
        currentVolume: 0,
        totalVolume: 1000,
        temperature: 0,
        purity: 0,
      },
    ];
  };

  if (!data) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Carregando dados...</ThemedText>
      </ThemedView>
    );
  }

  const levelData = data.map((item) => item.level);
  const volumeData = data.map((item) => item.currentVolume);
  const temperatureData = data.map((item) => item.temperature);
  const purityData = data.map((item) => item.purity);
  
  // Formata a hora para ser exibida na HomeScreen
  const formattedTimestamps = data.map((item) => new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Dados Recentes da Caixa d'Água</ThemedText>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Nível da Água</ThemedText>
        <LineChart
          data={{
            labels: formattedTimestamps,
            datasets: [{ data: levelData }],
          }}
          width={320}
          height={220}
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
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Volume Atual</ThemedText>
        <BarChart
          data={{
            labels: ['Volume'],
            datasets: [
              {
                data: [volumeData[volumeData.length - 1], data[0].totalVolume],
              },
            ],
          }}
          width={320}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Temperatura</ThemedText>
        <PieChart
          data={[
            { name: 'Temperatura', value: temperatureData[temperatureData.length - 1], color: '#ffcc00', legendFontColor: '#7F7F7F', legendFontSize: 15 },
            { name: 'Outros', value: 100 - temperatureData[temperatureData.length - 1], color: '#f1f1f1', legendFontColor: '#7F7F7F', legendFontSize: 15 },
          ]}
          width={320}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 153, 51, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>Pureza da Água</ThemedText>
        <LineChart
          data={{
            labels: formattedTimestamps,
            datasets: [{ data: purityData }],
          }}
          width={320}
          height={220}
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
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    marginVertical: 10,
    fontSize: 18,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
