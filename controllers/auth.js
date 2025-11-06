import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'

const router = express.Router()

router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
    try {
        const username = req.body.username
        const email = req.body.email
        const password = req.body.password

        const confirmPassword = req.body.confirmPassword
        if (password !== confirmPassword) throw new Error('Passwords do not match!')

        const usernameInDatabase = await User.findOne({ username: username })
        if (usernameInDatabase) throw new Error('Username already taken')

        const emailInDatabase = await User.findOne({ email: email })
        if (emailInDatabase) throw new Error('Email has already been used')

        req.body.password = bcrypt.hashSync(password, 12)
        await User.create(req.body)
        res.redirect('/auth/sign-in')
        
    } catch (error) {
        console.error(error.message)
        res.render('auth/sign-up.ejs', { message: error.message })
    }
})

router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in.ejs')
})

router.post('/sign-in', async (req, res) => {
    try {
        const username = req.body.username
        const password = req.body.password

        const existingUser = await User.findOne({ username: username })
        if (!existingUser) throw new Error('We could not find an account under this username')

        if (!bcrypt.compareSync(password, existingUser.password)) {
            throw new Error('Incorrect password was provided')
        }

        req.session.user = {
            _id: existingUser._id,
            username: existingUser.username
        }
        
        console.log('Logged in user:', req.session.user)
        req.session.save(() => res.redirect('/inspiration'))

    } catch (error) {
        console.error(error.message)
        res.render('auth/sign-in.ejs', { message: error.message })
    }
})

router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

export default router