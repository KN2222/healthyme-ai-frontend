import { Layout, Typography } from 'antd';
import { UserInputForm } from './components/UserInputForm';
import { HealthReportView } from './components/HealthReportView';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#001529',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          HealthyMe AI – Smart Health Insight & Planner
        </Title>
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Enter basic health details to generate AI‑powered insights, an
          exercise calendar, nutrition breakdown, and a progress timeline toward
          your goal weight.
        </Paragraph>
        <UserInputForm />
        <HealthReportView />
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        HealthyMe AI · Demo technical test implementation
      </Footer>
    </Layout>
  );
}

export default App;
