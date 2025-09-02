const axios = require('axios');
const https = require('https');

class SAPConnector {
  constructor() {
    this.config = {
      baseURL: process.env.SAP_BASE_URL,
      client: process.env.SAP_CLIENT,
      username: process.env.SAP_USERNAME,
      password: process.env.SAP_PASSWORD,
      language: process.env.SAP_LANGUAGE || 'EN'
    };

    this.session = null;
    this.authToken = null;
    this.tokenExpiry = null;

    // Create HTTPS agent with proper certificates
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      // Add SAP-specific certificates if needed
      // ca: fs.readFileSync('path/to/sap-certificate.crt')
    });
  }

  async authenticate() {
    if (this.authToken && this.tokenExpiry > Date.now()) {
      return this.authToken;
    }

    try {
      const response = await axios.post(
        `${this.config.baseURL}/sap/bc/sec/oauth2/token`,
        `grant_type=client_credentials&client_id=${this.config.username}&client_secret=${this.config.password}`,
        {
          httpsAgent: this.httpsAgent,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.authToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

      return this.authToken;
    } catch (error) {
      throw new Error(`SAP authentication failed: ${error.message}`);
    }
  }

  async createAccountingDocument(documentData) {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${this.config.baseURL}/sap/opu/odata/sap/API_ACCOUNTINGDOCUMENT`,
        documentData,
        {
          httpsAgent: this.httpsAgent,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-csrf-token': 'fetch'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`SAP document creation failed: ${error.response?.data?.error?.message?.value || error.message}`);
    }
  }

  async getAccountingDocument(documentId) {
    try {
      const token = await this.authenticate();

      const response = await axios.get(
        `${this.config.baseURL}/sap/opu/odata/sap/API_ACCOUNTINGDOCUMENT('${documentId}')`,
        {
          httpsAgent: this.httpsAgent,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`SAP document retrieval failed: ${error.message}`);
    }
  }

  async callBAPI(bapiName, parameters) {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${this.config.baseURL}/sap/bapirest/${bapiName}`,
        parameters,
        {
          httpsAgent: this.httpsAgent,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`BAPI ${bapiName} call failed: ${error.message}`);
    }
  }

  async createIdoc(idocType, idocData) {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${this.config.baseURL}/sap/idoc`,
        {
          IDOCTYPE: idocType,
          DATA: idocData
        },
        {
          httpsAgent: this.httpsAgent,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`IDoc creation failed: ${error.message}`);
    }
  }

  async queryTable(tableName, options = {}) {
    try {
      const token = await this.authenticate();

      const queryParams = new URLSearchParams();
      if (options.filter) {
        queryParams.append('$filter', options.filter);
      }
      if (options.select) {
        queryParams.append('$select', options.select.join(','));
      }
      if (options.top) {
        queryParams.append('$top', options.top.toString());
      }

      const response = await axios.get(
        `${this.config.baseURL}/sap/opu/odata/sap/${tableName}?${queryParams.toString()}`,
        {
          httpsAgent: this.httpsAgent,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Table query failed: ${error.message}`);
    }
  }
}

module.exports = new SAPConnector();