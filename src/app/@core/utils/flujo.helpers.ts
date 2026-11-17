import * as moment from 'moment';

export function estadoLabel(estado: string): string {
  const labels: { [key: string]: string } = {
    asignado: 'Asignado (edición)',
    en_revision: 'En revisión',
    rechazado: 'Rechazado',
    expirado: 'Expirado',
    cancelado: 'Cancelado',
    activo: 'Activo',
  };
  return labels[estado] || estado;
}

// Muestra la fecha en la zona horaria del navegador. Acepta tanto timestamps
// con offset (-05:00) como UTC (Z); evita el desfase de día al recortar por 'T'.
export function fechaCorta(fecha: string | undefined | null): string {
  if (!fecha) {
    return 'Sin definir';
  }
  const parsed = moment(fecha);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : String(fecha).split('T')[0];
}

export function esEditable(draft: any): boolean {
  return draft?.estado === 'asignado' || draft?.estado === 'rechazado';
}
