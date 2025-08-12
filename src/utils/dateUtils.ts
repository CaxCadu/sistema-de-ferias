export function format(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatMonth(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function calculateBusinessDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let businessDays = 0;
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    if (!isWeekend(currentDate)) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
}