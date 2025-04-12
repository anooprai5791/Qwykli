import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export const generate2FASecret = () => {
  return speakeasy.generateSecret({ length: 20 });
};

export const verify2FAToken = (secret, token) => {
  return speakeasy.totp.verify({ secret, encoding: 'base32', token,window:1, });
};

export const generateQRCode = async (secret, email) => {
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `Service Marketplace:${email}`,
    issuer: 'Service Marketplace',
  });
  return await qrcode.toDataURL(otpauthUrl);
};