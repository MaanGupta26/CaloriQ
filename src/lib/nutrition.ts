export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'cut' | 'maintain' | 'bulk';

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  cut: -500,
  maintain: 0,
  bulk: 300,
};

const MACRO_SPLITS: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  cut: { protein: 0.35, carbs: 0.40, fat: 0.25 },
  maintain: { protein: 0.25, carbs: 0.50, fat: 0.25 },
  bulk: { protein: 0.30, carbs: 0.45, fat: 0.25 },
};

export function calculateGoals(profile: {
  age: number;
  sex: 'male' | 'female' | 'other';
  weight_kg: number;
  height_cm: number;
  activity_level: ActivityLevel;
  goal: Goal;
}) {
  // Mifflin-St Jeor
  let bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * profile.age);
  if (profile.sex === 'male') {
    bmr += 5;
  } else if (profile.sex === 'female') {
    bmr -= 161;
  }

  const tdee = bmr * ACTIVITY_FACTORS[profile.activity_level];
  const calorieGoal = Math.round(tdee + GOAL_ADJUSTMENTS[profile.goal]);
  
  const split = MACRO_SPLITS[profile.goal];
  const proteinGoal = Math.round((calorieGoal * split.protein) / 4);
  const carbsGoal = Math.round((calorieGoal * split.carbs) / 4);
  const fatGoal = Math.round((calorieGoal * split.fat) / 9);

  return {
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
  };
}
