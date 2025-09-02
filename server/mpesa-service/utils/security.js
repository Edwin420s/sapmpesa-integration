const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class Security {
  generatePassword(timestamp) {
    const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    
    const passwordString = businessShortCode + passkey + timestamp;
    return Buffer.from(passwordString).toString('base64');
  }

  getSecurityCredential() {
    if (process.env.MPESA_ENVIRONMENT === 'sandbox') {
      // For sandbox, use the provided test credential
      return process.env.MPESA_TEST_CREDENTIAL;
    }

    // For production, use RSA encryption
    const initiatorPassword = process.env.MPESA_INITIATOR_PASSWORD;
    const publicKeyPath = process.env.MPESA_PUBLIC_KEY_PATH;
    
    if (!publicKeyPath || !fs.existsSync(publicKeyPath)) {
      throw new Error('M-Pesa public key not found');
    }

    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    const buffer = Buffer.from(initiatorPassword);
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );

    return encrypted.toString('base64');
  }

  validateIPNRequest(body, signature) {
    // Validate incoming IPN request signature
    const secret = process.env.MPESA_IPN_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  generateSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}

module.exports = new Security();