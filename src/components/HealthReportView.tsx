import { Card, Col, Descriptions, Flex, Progress, Row, Space, Typography, Alert, Spin } from 'antd';
import {
  Pie as PieChart,
  Line as LineChart,
  Column as ColumnChart,
  Radar as RadarChart,
} from '@ant-design/charts';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAppSelector } from '../store';
import type { RootState } from '../store';

const { Title, Paragraph, Text } = Typography;

export function HealthReportView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { report, loading, error } = useAppSelector(
    (state: RootState) => state.report,
  );

  const handleDownloadPdf = async () => {
    if (!containerRef.current) return;
    const canvas = await html2canvas(containerRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('healthyme-ai-report.pdf');
  };

  if (loading) {
    return (
      <Card>
        <Spin tip="Generating health report..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Failed to generate report"
        description={error}
        showIcon
      />
    );
  }

  if (!report) {
    return (
      <Card>
        <Paragraph type="secondary">
          Fill in your details and generate a report to see insights here.
        </Paragraph>
      </Card>
    );
  }

  const nutritionData = [
    { type: 'Protein', value: report.nutrition.macrosPercent.protein },
    { type: 'Carbs', value: report.nutrition.macrosPercent.carbs },
    { type: 'Fat', value: report.nutrition.macrosPercent.fat },
  ];

  const exerciseEffortData = report.exerciseCalendar.map((d) => ({
    day: d.day,
    calories: d.caloriesBurned,
    duration: d.durationMinutes,
  }));

  const weightProgressData = report.weightProgress.points.map((p) => ({
    week: `W${p.week}`,
    weightKg: p.weightKg,
  }));

  const activityCompositionData = [
    { type: 'Cardio', value: report.activityComposition.cardioMinutes },
    { type: 'Strength', value: report.activityComposition.strengthMinutes },
    { type: 'Stretching', value: report.activityComposition.stretchingMinutes },
    { type: 'Rest', value: report.activityComposition.restMinutes },
  ];

  const bodyCompositionData = [
    { type: 'Muscle', value: report.bodyComposition.musclePercent },
    { type: 'Fat', value: report.bodyComposition.fatPercent },
    { type: 'Water', value: report.bodyComposition.waterPercent },
    { type: 'Bone', value: report.bodyComposition.bonePercent },
  ];

  const currentWeight =
    report.weightProgress.points[0]?.weightKg ?? report.user.weightKg;
  const goalWeight = report.weightProgress.goalWeightKg;
  const totalDiff = currentWeight - goalWeight;
  const latestWeight =
    report.weightProgress.points[report.weightProgress.points.length - 1]
      ?.weightKg ?? goalWeight;
  const progressed = currentWeight - latestWeight;
  const progressPercent =
    totalDiff <= 0 ? 100 : Math.min(100, Math.max(0, (progressed / totalDiff) * 100));

  return (
    <div ref={containerRef}>
      JSON Health Report:
      <pre style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8 }}>
        {JSON.stringify(report, null, 2)}
      </pre>

      <Flex vertical gap={16}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={3} style={{ marginBottom: 0 }}>
            HealthyMe AI – Personalized Health Report
          </Title>
          <Text type="secondary">
            For: {report.user.name} · Goal: {goalWeight.toFixed(1)} kg
          </Text>
        </Space>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Card title="Summary & BMI">
              <Paragraph>
                <Text strong>BMI:</Text> {report.summary.bmi.toFixed(1)} (
                {report.summary.category})
              </Paragraph>
              <Paragraph>{report.summary.text}</Paragraph>
              <Descriptions
                bordered
                size="small"
                column={2}
                style={{ marginTop: 12 }}
              >
                <Descriptions.Item label="Age">
                  {report.user.age}
                </Descriptions.Item>
                <Descriptions.Item label="Height">
                  {report.user.heightCm} cm
                </Descriptions.Item>
                <Descriptions.Item label="Current weight">
                  {currentWeight.toFixed(1)} kg
                </Descriptions.Item>
                <Descriptions.Item label="Goal weight">
                  {goalWeight.toFixed(1)} kg
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card title="Timeline to Goal">
              <Paragraph>
                Estimated time to goal: {report.timeline.totalWeeks} weeks
              </Paragraph>
              <Progress percent={Math.round(progressPercent)} />
              <ul style={{ marginTop: 12, paddingLeft: 18 }}>
                {report.timeline.steps.slice(0, 4).map((s) => (
                  <li key={s.week}>
                    <Text strong>{`Week ${s.week}: `}</Text>
                    <Text>
                      {s.expectedWeightKg.toFixed(1)} kg – {s.note}
                    </Text>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Card title="Weekly Exercise Calendar">
              <ColumnChart
                data={exerciseEffortData}
                xField="day"
                yField="calories"
                seriesField="day"
                height={260}
                tooltip={{
                  formatter: (item: { day: string; calories: number }) => ({
                    name: `${item.day} – kcal`,
                    value: item.calories,
                  }),
                }}
              />
              <Paragraph type="secondary" style={{ marginTop: 8 }}>
                Bars show estimated calories burned per day. Session duration is
                factored into the plan.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card title="Daily Nutrition Breakdown">
              <PieChart
                data={nutritionData}
                angleField="value"
                colorField="type"
                radius={0.9}
                label={{ type: 'inner', offset: '-30%', content: '{value}%' }}
                height={260}
              />
              <Paragraph style={{ marginTop: 8 }}>
                <Text strong>Calories/day: </Text>
                {report.nutrition.dailyCalories}
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Card title="Weight Progress">
              <LineChart
                data={weightProgressData}
                xField="week"
                yField="weightKg"
                height={260}
                point={{ size: 4 }}
                tooltip={{
                  formatter: (item: { weightKg: number }) => ({
                    name: 'Weight (kg)',
                    value: item.weightKg.toFixed(1),
                  }),
                }}
              />
              <Paragraph type="secondary" style={{ marginTop: 8 }}>
                Line shows expected weekly weight change toward goal.
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card title="Activity Composition">
              <RadarChart
                data={activityCompositionData}
                xField="type"
                yField="value"
                height={260}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Card title="Body Composition (Estimated)">
              <PieChart
                data={bodyCompositionData}
                angleField="value"
                colorField="type"
                radius={0.9}
                label={{ type: 'spider', content: '{name} {value}%' }}
                height={260}
              />
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card
              title="Export"
              actions={[
                <a key="download" onClick={handleDownloadPdf}>
                  Download report as PDF
                </a>,
              ]}
            >
              <Paragraph>
                Export this full report layout as a PDF to share with the user.
              </Paragraph>
              <Paragraph type="secondary">
                For production, you may want a dedicated PDF template and
                typography tuned specifically for print.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Flex>
    </div>
  );
}

