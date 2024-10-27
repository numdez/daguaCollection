import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
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

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.headerText}>
        Dados Recentes da Caixa d'Água
      </ThemedText>

      {/* Gráfico de Nível da Água e Volume Atual lado a lado */}
      <View style={styles.rowContainer}>
        <View style={styles.chartContainer}>
          <ThemedText style={styles.chartTitle}>Nível da Água</ThemedText>
          <LineChart
            data={{
              labels: data.map((item) => item.timestamp),
              datasets: [{ data: levelData }],
            }}
            width={160} // Ajuste a largura
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#e0f7fa',
              backgroundGradientTo: '#e0f7fa',
              color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`, // Azul claro
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
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
            width={160} // Ajuste a largura
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#e0f7fa',
              backgroundGradientTo: '#e0f7fa',
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Verde
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>
      </View>

      {/* Gráfico de Temperatura e Pureza da Água lado a lado */}
      <View style={styles.rowContainer}>
        <View style={styles.chartContainer}>
          <ThemedText style={styles.chartTitle}>Temperatura</ThemedText>
          <PieChart
            data={[
              { name: 'Temperatura', value: temperatureData[temperatureData.length - 1], color: '#ffcc00', legendFontColor: '#7F7F7F', legendFontSize: 15 },
              { name: 'Outros', value: 100 - temperatureData[temperatureData.length - 1], color: '#f1f1f1', legendFontColor: '#7F7F7F', legendFontSize: 15 },
            ]}
            width={160} // Ajuste a largura
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#e0f7fa',
              backgroundGradientTo: '#e0f7fa',
              color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`, // Laranja
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <ThemedText style={styles.chartTitle}>Pureza da Água</ThemedText>
          <LineChart
            data={{
              labels: data.map((item) => item.timestamp),
              datasets: [{ data: purityData }],
            }}
            width={160} // Ajuste a largura
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#e0f7fa',
              backgroundGradientTo: '#e0f7fa',
              color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`, // Vermelho
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5', // Cor de fundo clara para um visual mais moderno
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#ffffff', // Cor de fundo dos gráficos
    borderRadius: 16,
    padding: 16, // Preenchimento interno para os gráficos
    shadowColor: '#000', // Sombra para adicionar profundidade
    shadowOffset: { width: 0, height: 2 }, // Offset da sombra
    shadowOpacity: 0.2, // Opacidade da sombra
    shadowRadius: 4, // Raio da sombra
    elevation: 2, // Elevation para Android
    flex: 1, // Para que os gráficos ocupem a mesma largura
    marginHorizontal: 5, // Margem horizontal entre gráficos
  },
  chartTitle: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: 'bold', // Destacar o título do gráfico
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});
