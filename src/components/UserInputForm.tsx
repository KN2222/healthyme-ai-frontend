import { Form, Input, InputNumber, Button, Card, Space } from 'antd';
import { useState } from 'react';
import { useAppDispatch } from '../store';
import { generateReportThunk, setUserInput } from '../store/reportSlice';
import type { UserProfileInput } from '../types/report';

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

export function UserInputForm() {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: UserProfileInput) => {
    const payload: UserProfileInput = {
      name: values.name.trim(),
      age: Number(values.age),
      weightKg: Number(values.weightKg),
      heightCm: Number(values.heightCm),
      goalWeightKg: Number(values.goalWeightKg),
      minutesPerDay: Number(values.minutesPerDay),
    };

    setSubmitting(true);
    dispatch(setUserInput(payload));
    await dispatch(generateReportThunk(payload));
    setSubmitting(false);
  };

  return (
    <Card title="User Profile" bordered style={{ marginBottom: 24 }}>
      <Form
        {...layout}
        name="userProfile"
        onFinish={onFinish}
        initialValues={{ minutesPerDay: 45 }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>

        <Form.Item
          label="Age"
          name="age"
          rules={[{ required: true, type: 'number', min: 16, max: 90 }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Weight (kg)"
          name="weightKg"
          rules={[{ required: true, type: 'number', min: 30, max: 300 }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Height (cm)"
          name="heightCm"
          rules={[{ required: true, type: 'number', min: 120, max: 220 }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Goal Weight (kg)"
          name="goalWeightKg"
          rules={[{ required: true, type: 'number', min: 30, max: 300 }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Time per day (min)"
          name="minutesPerDay"
          rules={[{ required: true, type: 'number', min: 10, max: 240 }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item wrapperCol={{ span: 24 }}>
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Generate Health Report
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

