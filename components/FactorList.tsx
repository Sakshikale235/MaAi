import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RiskFactor } from '../utils/RiskEngine';

interface FactorListProps {
  factors: RiskFactor[];
}

export default function FactorList({ factors }: FactorListProps) {
  if (!factors || factors.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Why this result?</Text>
      <View style={styles.list}>
        {factors.map((f, i) => (
          <View key={i} style={styles.factorRow}>
            <Text style={styles.factorName}>• {f.name}</Text>
            <Text style={styles.implicationText}>→ {f.implication}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#334155',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: 12,
  },
  factorRow: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  factorName: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '800',
    marginBottom: 4,
  },
  implicationText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '600',
    paddingLeft: 12, // Indent visual heirarchy
  }
});
