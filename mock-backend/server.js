const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database
let users = [];
let karyawan = [
  {
    id: 1,
    nama: 'John Doe',
    email: 'john.doe@company.com',
    jabatan_id: 1,
    kantor_id: 1,
    foto: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nama: 'Jane Smith',
    email: 'jane.smith@company.com',
    jabatan_id: 2,
    kantor_id: 1,
    foto: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let jabatan = [
  {
    id: 1,
    nama_jabatan: 'Software Engineer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nama_jabatan: 'Project Manager',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    nama_jabatan: 'UI/UX Designer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let kantor = [
  {
    id: 1,
    nama_kantor: 'Jakarta Office',
    alamat: 'Jl. Sudirman No. 123, Jakarta',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    nama_kantor: 'Bandung Office',
    alamat: 'Jl. Asia Afrika No. 456, Bandung',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper function to create success response
const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const errorResponse = (message, status = 400) => ({
  success: false,
  message,
  error: message
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Employee Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      karyawan: '/api/karyawans',
      jabatan: '/api/jabatans',
      kantor: '/api/kantors'
    }
  });
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, full_name } = req.body;
  
  // Validate required fields
  if (!username || !email || !password || !full_name) {
    return res.status(400).json(errorResponse('All fields are required'));
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json(errorResponse('User already exists'));
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    email,
    full_name,
    password, // In real app, this should be hashed
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Return user without password
  const { password: _, ...userResponse } = newUser;
  res.status(201).json(successResponse(userResponse, 'User registered successfully'));
});

app.post('/api/auth/login', (req, res) => {
  const { username_or_email, password } = req.body;
  
  // Find user
  const user = users.find(u => 
    (u.username === username_or_email || u.email === username_or_email) && 
    u.password === password
  );
  
  if (!user) {
    return res.status(401).json(errorResponse('Invalid credentials'));
  }
  
  // Generate mock token
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
  
  // Return user and token
  const { password: _, ...userResponse } = user;
  res.json(successResponse({
    user: userResponse,
    token
  }, 'Login successful'));
});

app.get('/api/user/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json(errorResponse('No token provided'));
  }
  
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId] = decoded.split(':');
    const user = users.find(u => u.id === parseInt(userId));
    
    if (!user) {
      return res.status(401).json(errorResponse('Invalid token'));
    }
    
    const { password: _, ...userResponse } = user;
    res.json(successResponse(userResponse));
  } catch (error) {
    res.status(401).json(errorResponse('Invalid token'));
  }
});

// Karyawan endpoints
app.get('/api/karyawan', (req, res) => {
  const karyawanWithDetails = karyawan.map(k => ({
    ...k,
    jabatan: jabatan.find(j => j.id === k.jabatan_id),
    kantor: kantor.find(o => o.id === k.kantor_id)
  }));
  res.json(successResponse(karyawanWithDetails));
});

app.get('/api/karyawan/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const employee = karyawan.find(k => k.id === id);
  
  if (!employee) {
    return res.status(404).json(errorResponse('Employee not found'));
  }
  
  const employeeWithDetails = {
    ...employee,
    jabatan: jabatan.find(j => j.id === employee.jabatan_id),
    kantor: kantor.find(o => o.id === employee.kantor_id)
  };
  
  res.json(successResponse(employeeWithDetails));
});

app.post('/api/karyawan', (req, res) => {
  const { nama, email, jabatan_id, kantor_id } = req.body;
  
  if (!nama || !email || !jabatan_id || !kantor_id) {
    return res.status(400).json(errorResponse('All fields are required'));
  }
  
  const newEmployee = {
    id: Math.max(...karyawan.map(k => k.id), 0) + 1,
    nama,
    email,
    jabatan_id: parseInt(jabatan_id),
    kantor_id: parseInt(kantor_id),
    foto: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  karyawan.push(newEmployee);
  res.status(201).json(successResponse(newEmployee, 'Employee created successfully'));
});

app.put('/api/karyawan/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { nama, email, jabatan_id, kantor_id } = req.body;
  
  const employeeIndex = karyawan.findIndex(k => k.id === id);
  if (employeeIndex === -1) {
    return res.status(404).json(errorResponse('Employee not found'));
  }
  
  karyawan[employeeIndex] = {
    ...karyawan[employeeIndex],
    nama: nama || karyawan[employeeIndex].nama,
    email: email || karyawan[employeeIndex].email,
    jabatan_id: jabatan_id ? parseInt(jabatan_id) : karyawan[employeeIndex].jabatan_id,
    kantor_id: kantor_id ? parseInt(kantor_id) : karyawan[employeeIndex].kantor_id,
    updated_at: new Date().toISOString()
  };
  
  res.json(successResponse(karyawan[employeeIndex], 'Employee updated successfully'));
});

app.delete('/api/karyawan/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const employeeIndex = karyawan.findIndex(k => k.id === id);
  
  if (employeeIndex === -1) {
    return res.status(404).json(errorResponse('Employee not found'));
  }
  
  karyawan.splice(employeeIndex, 1);
  res.json(successResponse(null, 'Employee deleted successfully'));
});

// Jabatan endpoints
app.get('/api/jabatan', (req, res) => {
  res.json(successResponse(jabatan));
});

app.post('/api/jabatan', (req, res) => {
  const { nama_jabatan } = req.body;
  
  if (!nama_jabatan) {
    return res.status(400).json(errorResponse('Position name is required'));
  }
  
  const newJabatan = {
    id: Math.max(...jabatan.map(j => j.id), 0) + 1,
    nama_jabatan,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  jabatan.push(newJabatan);
  res.status(201).json(successResponse(newJabatan, 'Position created successfully'));
});

// Kantor endpoints
app.get('/api/kantors', (req, res) => {
  res.json(successResponse(kantor));
});

app.post('/api/kantors', (req, res) => {
  const { nama_kantor, alamat } = req.body;
  
  if (!nama_kantor || !alamat) {
    return res.status(400).json(errorResponse('Office name and address are required'));
  }
  
  const newKantor = {
    id: Math.max(...kantor.map(k => k.id), 0) + 1,
    nama_kantor,
    alamat,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  kantor.push(newKantor);
  res.status(201).json(successResponse(newKantor, 'Office created successfully'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(errorResponse('Endpoint not found'));
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json(errorResponse('Internal server error'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mock Backend Server running on port ${PORT}`);
  console.log(`📋 API Documentation available at http://localhost:${PORT}/`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;