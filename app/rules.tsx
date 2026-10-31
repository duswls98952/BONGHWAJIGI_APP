import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../src/api';
import type { Schema } from '../src/api/types';
import { Body, Card, Screen } from '../src/components/ui';
export default function RulesScreen() {
  const { disasterType } = useLocalSearchParams<{ disasterType?: string }>();
  const kind = (['flood', 'fire', 'wildfire', 'earthquake', 'heatwave', 'other'].includes(disasterType ?? '') ? disasterType : 'other') as Schema<'Rules'>['disaster_type'];
  const rules = useQuery({ queryKey: ['rules', kind], queryFn: ({ signal }) => api.rules(kind, signal) });
  return <Screen><Card title="재난별 기본 행동수칙">
    {rules.isPending && <Body>수칙을 확인하고 있습니다.</Body>}
    {(rules.isError || rules.data?.data.status === 'unavailable') && <Body>현재 제공되는 수칙을 확인할 수 없습니다.</Body>}
    {rules.data?.data.items.map((item) => <Body key={item.id}>{item.order}. {item.text}</Body>)}
    {rules.data?.data.sources.map((source) => <Body key={source.id} muted>출처: {source.agency}</Body>)}
  </Card></Screen>;
}
