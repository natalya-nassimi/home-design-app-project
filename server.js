import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import methodOverride from 'method-override'
import 'dotenv/config'

import authRouter from './controllers/auth.js'

const app = express()
console.log(process.env)

// * Middleware
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(express.static('public'))

// * Routes
app.get('/', async (req, res) => {
    res.render('index.ejs')
})

app.use('/auth', authRouter)

// * Connections
const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('🔗 Database connection established')
    } catch (error) {
      console.error(error)
    }
}

connect()

app.listen(3000, () => console.log('✅ Server running on port 3000'))
