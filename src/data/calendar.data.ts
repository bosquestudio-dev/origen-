export const SPECIAL_DAY = 24
export const SIMULATED_TODAY = 10

export const DAY_LABELS: Record<number, string> = {
  1: 'Mar 1',  2: 'Mié 2',  3: 'Jue 3',  4: 'Vie 4',
  5: 'Sáb 5',  6: 'Dom 6',  7: 'Lun 7',  8: 'Mar 8',
  9: 'Mié 9',  10: 'Jue 10', 11: 'Vie 11', 12: 'Sáb 12',
  13: 'Dom 13', 14: 'Lun 14', 15: 'Mar 15', 16: 'Mié 16',
  17: 'Jue 17', 18: 'Vie 18', 19: 'Sáb 19', 20: 'Dom 20',
  21: 'Lun 21', 22: 'Mar 22', 23: 'Mié 23', 24: 'Jue 24',
}

// Festivos — descanso aunque no sean fin de semana
export const HOLIDAY_DAYS = [8] // 8 dic: Inmaculada Concepción

// Derivado automáticamente de DAY_LABELS + festivos
export const DIGITAL_DETOX_DAYS = [
  ...Object.entries(DAY_LABELS)
    .filter(([, label]) => label.startsWith('Sáb') || label.startsWith('Dom'))
    .map(([day]) => Number(day)),
  ...HOLIDAY_DAYS,
]
