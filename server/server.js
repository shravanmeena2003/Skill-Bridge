import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import interviewRoutes from './routes/interviewRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import authRoutes from './routes/authRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
// Note: We use a custom Clerk verifier in middleware; avoid global Clerk middleware


// Initialize Express
const app = express()

// Connect to database
connectDB()
await connectCloudinary()

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-requested-with']
}));

// Webhook route must read raw body for signature verification
app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks)

// JSON/body parsers AFTER webhook raw parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.use('/api/auth', authRoutes)
app.use('/api/companies', companyRoutes)  // For all company operations
app.use('/api/jobs', jobRoutes)
app.use('/api/users', userRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/interviews', interviewRoutes)

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})