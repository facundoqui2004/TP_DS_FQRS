// Escapa los caracteres especiales de HTML para poder meter texto del usuario
// dentro de un string HTML (por ejemplo en los popups de Leaflet) sin que se ejecute.
export function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
