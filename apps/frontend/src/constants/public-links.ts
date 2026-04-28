export const instagramUrl = 'https://www.instagram.com/elocpratasesemijoias/';

export const whatsappDisplayPhone = '61 99257-3301';
export const whatsappPhone = '5561992573301';

export function buildWhatsAppUrl(message?: string) {
  const searchParams = new URLSearchParams();

  if (message) {
    searchParams.set('text', message);
  }

  const queryString = searchParams.toString();

  return `https://wa.me/${whatsappPhone}${queryString ? `?${queryString}` : ''}`;
}
