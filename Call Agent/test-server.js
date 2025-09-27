const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test Call Agent Server is running',
    port: PORT
  });
});

// Mock call endpoint
app.post('/call', (req, res) => {
  console.log('Call endpoint hit!');
  res.json({
    success: true,
    callSid: 'test-call-sid-123',
    message: 'Test call initiated successfully!'
  });
});

// Mock WhatsApp endpoint
app.post('/send-whatsapp', (req, res) => {
  console.log('WhatsApp endpoint hit!');
  res.json({
    success: true,
    messageSid: 'test-whatsapp-sid-123',
    message: 'Test WhatsApp message sent successfully!'
  });
});

// Mock SMS endpoint
app.post('/send-sms', (req, res) => {
  console.log('SMS endpoint hit!');
  res.json({
    success: true,
    messageSid: 'test-sms-sid-123',
    message: 'Test SMS sent successfully!'
  });
});

app.listen(PORT, () => {
  console.log(`🧪 Test Call Agent Server running on port ${PORT}`);
  console.log(`📞 Test endpoints available:`);
  console.log(`   POST http://localhost:${PORT}/call`);
  console.log(`   POST http://localhost:${PORT}/send-whatsapp`);
  console.log(`   POST http://localhost:${PORT}/send-sms`);
});
