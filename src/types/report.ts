export type ActivityType = 'cardio' | 'strength' | 'stretching' | 'rest';

export interface UserProfileInput {
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  goalWeightKg: number;
  minutesPerDay: number;
}

export interface BmiSummary {
  bmi: number;
  category: string;
  text: string;
}

export interface ExerciseDay {
  day: string;
  activityType: ActivityType;
  description: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface NutritionBreakdown {
  dailyCalories: number;
  macrosPercent: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface WeightProgressPoint {
  week: number;
  weightKg: number;
}

export interface TimelineStep {
  week: number;
  label: string;
  expectedWeightKg: number;
  note: string;
}

export interface ActivityComposition {
  cardioMinutes: number;
  strengthMinutes: number;
  stretchingMinutes: number;
  restMinutes: number;
}

export interface BodyComposition {
  musclePercent: number;
  fatPercent: number;
  waterPercent: number;
  bonePercent: number;
}

export interface HealthReport {
  user: UserProfileInput;
  summary: BmiSummary;
  exerciseCalendar: ExerciseDay[];
  nutrition: NutritionBreakdown;
  weightProgress: {
    points: WeightProgressPoint[];
    goalWeightKg: number;
  };
  timeline: {
    totalWeeks: number;
    steps: TimelineStep[];
  };
  activityComposition: ActivityComposition;
  bodyComposition: BodyComposition;
}

