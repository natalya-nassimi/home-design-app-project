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
        if (password !== confirmPassword) return res.status(400).send('Passwords do not match❗️')

        const usernameInDatabase = await User.findOne({ username: username })
        if (usernameInDatabase) return res.status(400).send('This username has already been used❗️')

        const emailInDatabase = await User.findOne({ email: email })
        if (emailInDatabase) return res.status(400).send('This email has already been used❗️')

        req.body.password = bcrypt.hashSync(password, 12)
        const createdUser = await User.create(req.body)
        console.log(createdUser)

        res.redirect('/auth/sign-in')
    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
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
        if (!existingUser) return res.status(401).send('We could not find an account under this username')

        if (!bcrypt.compareSync(password, existingUser.password)) {
            return res.status(401).send('Incorrect password provided')
        }

        req.session.user = {
            _id: existingUser._id,
            username: existingUser.username
        }
        console.log('Logged in user:', req.session.user)
        req.session.save(() => res.redirect('/inspiration'))

    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

export default router