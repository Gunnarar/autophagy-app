import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { theme } from '../utils/theme';

const CHART_HEIGHT = 220;
const CONTAINER_PADDING = theme.spacing.sm * 2; // horizontal padding inside card
const CHART_WIDTH = Dimensions.get('window').width - theme.spacing.lg * 2 - CONTAINER_PADDING * 2;
const MARGIN = { top: 16, right: 20, bottom: 32, left: 36 };

const seriesConfig = {
  ketones: { color: theme.colors.info, label: 'Ketones (mmol)' },
  symptoms: { color: theme.colors.error, label: 'Symptom severity' },
  fastDays: { color: theme.colors.success, label: 'Fasting days' },
  redMeat: { color: theme.colors.brandPrimary, label: 'Red meat servings' },
};

function buildPoints(values, scaleX, scaleY) {
  return values
    .map((value, index) => {
      if (value == null) {return null;}
      const x = scaleX(index);
      const y = scaleY(value);
      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(' ');
}

export default function InsightChart({ data = [] }) {
  const transformed = useMemo(() => {
    if (!data.length) {
      return null;
    }

    const ketones = data.map(item => (item.ketones ?? null));
    const symptoms = data.map(item => (item.symptoms ?? null));
    const fastDays = data.map(item => (item.fastDays ?? null));
    const redMeat = data.map(item => (item.redMeat ?? null));

    const numericValues = [...ketones, ...symptoms, ...fastDays, ...redMeat].filter(v => typeof v === 'number' && !Number.isNaN(v));
    const maxValue = numericValues.length ? Math.max(...numericValues, 1) : 1;
    const xStep = data.length > 1 ? (CHART_WIDTH - MARGIN.left - MARGIN.right) / (data.length - 1) : 0;

    const scaleX = (index) => MARGIN.left + index * xStep;
    const scaleY = (value) => {
      const normalized = value / maxValue;
      return MARGIN.top + (1 - normalized) * (CHART_HEIGHT - MARGIN.top - MARGIN.bottom);
    };

    return {
      dates: data.map(item => item.date),
      points: {
        ketones: buildPoints(ketones, scaleX, scaleY),
        symptoms: buildPoints(symptoms, scaleX, scaleY),
        fastDays: buildPoints(fastDays, scaleX, scaleY),
        redMeat: buildPoints(redMeat, scaleX, scaleY),
      },
      dots: {
        ketones: ketones.map((value, index) => (value == null ? null : { x: scaleX(index), y: scaleY(value) })),
        symptoms: symptoms.map((value, index) => (value == null ? null : { x: scaleX(index), y: scaleY(value) })),
        fastDays: fastDays.map((value, index) => (value == null ? null : { x: scaleX(index), y: scaleY(value) })),
        redMeat: redMeat.map((value, index) => (value == null ? null : { x: scaleX(index), y: scaleY(value) })),
      },
      maxValue,
      scaleX,
      scaleY,
    };
  }, [data]);

  if (!transformed) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Not enough data yet</Text>
        <Text style={styles.placeholderSubtitle}>Log ketones, symptoms, and meals to see trends.</Text>
      </View>
    );
  }

  const { points, dots, dates, maxValue, scaleX } = transformed;
  const activeSeries = Object.entries(points).filter(([, value]) => Boolean(value));

  return (
    <View style={styles.chartWrapper}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Line
          x1={MARGIN.left}
          y1={CHART_HEIGHT - MARGIN.bottom}
          x2={CHART_WIDTH - MARGIN.right}
          y2={CHART_HEIGHT - MARGIN.bottom}
          stroke={theme.colors.border}
          strokeWidth={1}
        />
        <Line
          x1={MARGIN.left}
          y1={MARGIN.top}
          x2={MARGIN.left}
          y2={CHART_HEIGHT - MARGIN.bottom}
          stroke={theme.colors.border}
          strokeWidth={1}
        />

        {activeSeries.map(([key, value]) => (
          <Polyline
            key={key}
            points={value}
            fill="none"
            stroke={seriesConfig[key].color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {Object.entries(dots).map(([key, entries]) => (
          entries.map((entry, index) =>
            entry ? (
              <Circle key={`${key}-${index}`} cx={entry.x} cy={entry.y} r={3.5} fill={seriesConfig[key].color} />
            ) : null
          )
        ))}

        {dates.map((label, index) => {
          const x = scaleX(index);
          const y = CHART_HEIGHT - MARGIN.bottom + 14;
          return (
            <SvgText
              key={label + index}
              x={x}
              y={y}
              fontSize={10}
              fill={theme.colors.textMuted}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}

        {[0.5, 1].map((ratio, idx) => (
          <Line
            key={`grid-${idx}`}
            x1={MARGIN.left}
            y1={MARGIN.top + (CHART_HEIGHT - MARGIN.top - MARGIN.bottom) * (1 - ratio)}
            x2={CHART_WIDTH - MARGIN.right}
            y2={MARGIN.top + (CHART_HEIGHT - MARGIN.top - MARGIN.bottom) * (1 - ratio)}
            stroke={theme.colors.border}
            strokeDasharray="4 6"
            strokeWidth={0.8}
            opacity={0.5}
          />
        ))}

        {[0, Math.round(maxValue / 2), Math.round(maxValue)].map((value, idx) => (
          <SvgText
            key={`y-${idx}`}
            x={MARGIN.left - 10}
            y={MARGIN.top + (CHART_HEIGHT - MARGIN.top - MARGIN.bottom) * (1 - value / maxValue)}
            fontSize={10}
            fill={theme.colors.textMuted}
            textAnchor="end"
          >
            {value}
          </SvgText>
        ))}
      </Svg>

      <View style={styles.legend}>
        {activeSeries.map(([key]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: seriesConfig[key].color }]} />
            <Text style={styles.legendLabel}>{seriesConfig[key].label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    marginBottom: theme.spacing.lg,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  placeholderTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.tiny,
  },
  placeholderSubtitle: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.tiny,
  },
  legendLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
});
