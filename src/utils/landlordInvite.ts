export const getLandlordWhatsAppInviteUrl = () => {
  const registrationUrl = `${window.location.origin}/register?account=landlord&utm_source=area_reviews&utm_medium=whatsapp`;
  const invitation = `Hello, I thought LagosRentHelp might be useful to you. Landlords, property developers and authorised caretakers can verify their account and list available properties here: ${registrationUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(invitation)}`;
};
