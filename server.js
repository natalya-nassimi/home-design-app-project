import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import methodOverride from 'method-override'
import 'dotenv/config'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passUserToView from './middleware/passUserToView.js'
import passMessageToView from './middleware/passMessageToView'

import authRouter from './controllers/auth.js'
import inspoRouter from './controllers/inspiration.js'

const app = express()

// * Middleware
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(express.static('public'))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
}))
app.use(passUserToView)
app.use(passMessageToView)

// * Routes
app.get('/', async (req, res) => {
    res.render('index.ejs') // { user: req.user || null }
})

app.use('/auth', authRouter)
app.use('/inspiration', inspoRouter)

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
