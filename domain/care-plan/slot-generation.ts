import { plannerConfig } from "./config";

export const toMinutes = (time: string) => { const [hours, minutes] = time.split(":").map(Number); return hours * 60 + minutes; };
export const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
export const overlaps = (startA: number, endA: number, startB: number, endB: number) => startA < endB && endA > startB;

export function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  for (let minute = toMinutes(start); minute + duration <= toMinutes(end); minute += plannerConfig.slotMinutes) slots.push(toTime(minute));
  return slots;
}
