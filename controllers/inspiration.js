import express from 'express'
import Inspo from '../models/inspo.js'
import isSignedIn from '../middleware/is-signed-in.js'

const router = express.Router()

// ? Index Page
router.get('', async (req, res) => {
    try {
        const inspoPics = await Inspo.find().populate('owner')
        console.log('current user:', req.session.user)
        res.render('inspiration/index.ejs', { inspoPics, user: req.session.user || null })
    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? New Page
router.get('/new', isSignedIn, (req, res) => {
    res.render('inspiration/new.ejs')
})

// ? Show Page
router.get('/:inspoId', async (req, res) => {
    try {
        const inspoId = req.params.inspoId
        const inspo = await Inspo.findById(inspoId).populate('owner')
        const checkLikes = inspo.favouritedBy.some(user => user.equals(req.session.user._id))

        res.render('inspiration/show.ejs', { inspo, checkLikes })

    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? Create New Inspo
router.post('', isSignedIn, async (req, res) => {
    try {
        req.body.owner = req.session.user._id
        const newInspo = await Inspo.create(req.body)

        return res.redirect(`/inspiration/${newInspo._id}`)
    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? Delete Inspo
router.delete('/:inspoId', isSignedIn, async (req, res) => {
    try {
        const inspoId = req.params.inspoId
        const inspoToDelete = await Inspo.findById(inspoId)

        if (!inspoToDelete.owner.equals(req.session.user._id)) {
            return res.status(403).send('You do not have permission to delete this resource')
        }

        await Inspo.findByIdAndDelete(inspoId)
        res.redirect('/inspiration')

    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? Edit Inspo

// ? Update Inspo

// ? Add user to favourties

// ? Remove user from favourties array

export default router