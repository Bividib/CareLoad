export function onboardingDestination(onboardingCompleted: boolean) {
  return onboardingCompleted ? "/patient/today" : "/onboarding/welcome";
}
