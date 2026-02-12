import { Button, Card, Col, Descriptions, Flex, Progress, Row, Space, Typography, Alert, Spin } from 'antd';
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
    const sourceCanvas = await html2canvas(containerRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const padding = 15;
    const contentWidth = pageWidth - 2 * padding;
    const contentHeight = pageHeight - 2 * padding;
    // One page of content in source image pixels (same scale as width)
    const contentHeightPx = (contentHeight * sourceCanvas.width) / contentWidth;
    let sourceY = 0;

    while (sourceY < sourceCanvas.height) {
      const sliceHeightPx = Math.min(contentHeightPx, sourceCanvas.height - sourceY);
      const sliceHeightMm = (sliceHeightPx * contentWidth) / sourceCanvas.width;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = sourceCanvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext('2d');
      if (!ctx) break;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(sourceCanvas, 0, sourceY, sourceCanvas.width, sliceHeightPx, 0, 0, sourceCanvas.width, sliceHeightPx);

      const imgData = pageCanvas.toDataURL('image/png');
      if (sourceY > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', padding, padding, contentWidth, sliceHeightMm);

      sourceY += sliceHeightPx;
    }
    pdf.save(`healthyme-ai-report-${report?.user.name || 'user'}-${Date.now()}.pdf`);
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
    <div>
      <Flex vertical gap={16} ref={containerRef}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Title level={3} style={{ marginBottom: 0 }}>
            HealthyMe AI – Personalized Health Report
          </Title>
          <Text type="secondary">
            For: {report.user.name} · Goal: {goalWeight.toFixed(1)} kg
          </Text>
        </Space>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={11}>
            <Card title="Summary & BMI">
              <Paragraph>
                <Text strong>BMI:</Text> {report.summary.bmi.toFixed(1)} (
                {report.summary.category})
              </Paragraph>
              <Paragraph>{report.summary.text}</Paragraph>
              <Descriptions
                bordered
                size="small"
                column={1}
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

          <Col xs={24} md={13}>
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
            <Card title="Activity Composition">
              <RadarChart
                data={activityCompositionData}
                xField="type"
                yField="value"
                height={305}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={24}>
            <Card title="Weight Progress">
              <LineChart
                data={weightProgressData}
                xField="week"
                yField="weightKg"
                height={260}
                point={{ size: 6 }}
                tooltip={{
                  formatter: (datum: { week: string; weightKg: number }) => ({
                    name: datum.week,
                    value: `${datum.weightKg.toFixed(1)} kg`,
                  }),
                }}
              />
              <Paragraph type="secondary" style={{ marginTop: 8 }}>
                Line shows expected weekly weight change toward goal.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Body Composition (Estimated)">
              <PieChart
                data={bodyCompositionData}
                angleField="value"
                colorField="type"
                radius={0.9}
                label={{
                  type: 'spider',
                  content: (datum: { type: string; value: number }) =>
                    `${datum.type} ${datum.value}%`,
                }}
                height={260}
              />
              <Paragraph style={{ marginTop: 8 }}>
                <Text style={{ opacity: 0, pointerEvents: 'none' }} strong>Estimated body composition: </Text>
                {/* use as place holder for spacing */}
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Daily Nutrition Breakdown">
              <PieChart
                data={nutritionData}
                angleField="value"
                colorField="type"
                radius={0.9}
                label={{
                  type: 'inner',
                  offset: '-30%',
                  content: (datum: { type: string; value: number }) =>
                    `${datum.type} ${datum.value}%`,
                }}
                height={260}
              />
              <Paragraph style={{ marginTop: 8 }}>
                <Text strong>Calories/day: </Text>
                {report.nutrition.dailyCalories}
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Flex>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Button type="primary" size="large" onClick={handleDownloadPdf}>
          Download report as PDF
        </Button>
      </div>
    </div>
  );
}

