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

export function fechaCorta(fecha: string | undefined | null): string {
  return fecha ? String(fecha).split('T')[0] : 'Sin definir';
}

export function esEditable(draft: any): boolean {
  return draft?.estado === 'asignado' || draft?.estado === 'rechazado';
}
