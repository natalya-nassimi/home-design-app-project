import express from 'express'
import Inspo from '../models/inspo.js'
import isSignedIn from '../middleware/is-signed-in.js'
import upload from '../middleware/upload.js'
import { uploadBuffer } from '../config/cloudinary.js'

const router = express.Router()

// ? Index Page
router.get('', async (req, res) => {
    try {
        const inspiration = await Inspo.find().populate('owner')
        res.render('inspiration/index.ejs', { inspiration })

    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? New Page
router.get('/new', isSignedIn, (req, res) => {
    res.render('inspiration/new.ejs')
})

// ? My Favourites Page
router.get('/my-favourites', isSignedIn, async (req, res) => {
    try {
        const userId = req.session.user._id
        const favourites = await Inspo.find({ favouritedBy: userId }).populate('owner')
        res.render('inspiration/my-favs.ejs', { favourites })

    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
})

// ? My Posts Page
router.get('/my-posts', isSignedIn, async (req, res) => {
    try {
        const userId = req.session.user._id
        const myPosts = await Inspo.find({ owner: userId })
        res.render('inspiration/my-posts.ejs', { myPosts })

    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }    
})

// ? Show Page
router.get('/:inspoId', async (req, res) => {
    try {
        const inspoId = req.params.inspoId
        const inspo = await Inspo.findById(inspoId).populate('owner')

        let checkLikes = false
        if (req.session.user) {
            checkLikes = inspo.favouritedBy.some(user => user.equals(req.session.user._id))
        }
        
        res.render('inspiration/show.ejs', { inspo, checkLikes })

    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? Create New Inspo
router.post('', isSignedIn, upload.single('imageURL'), async (req, res) => {
    try {
        if (req.file) {
            const uploadResult = await uploadBuffer(req.file.buffer)
            req.body.imageURL = uploadResult.secure_url
        }

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
        res.redirect('/inspiration/my-posts')

    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? Edit Inspo
router.get('/:inspoId/edit', isSignedIn, async (req, res) => {
    try {
        const inspoId = req.params.inspoId
        const inspo = await Inspo.findById(inspoId)

        if(!inspo.owner.equals(req.session.user._id)) {
            res.send('You do not have permission to edit this post')
            return res.redirect(`/inspiration/${inspoId}`)
        }
        res.render('inspiration/edit.ejs', { inspo })

    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
})

// ? Update Inspo
router.put('/:inspoId', isSignedIn, upload.single('imageURL'), async (req, res) => {
    try {
        const inspoId = req.params.inspoId
        const inspo = await Inspo.findById(inspoId)

        if (req.file) {
            const uploadResult = await uploadBuffer(req.file.buffer)
            req.body.imageURL = uploadResult.secure_url
        } else {
            req.body.imageURL = inspo.imageURL
        }

        if(!inspo.owner.equals(req.session.user._id)) {
            return res.status(403).send('You do not have permission to edit this post')
        }

        await Inspo.findByIdAndUpdate(inspoId, req.body)
        res.redirect(`/inspiration/${inspoId}`)
        
    } catch (error) {
      console.error(error)
      res.status(500).send('Something went wrong')  
    }
})

// ? Add user to favourties
router.post('/:inspoId/favourited-by/:userId', isSignedIn, async (req, res) => {
    try {
        const inspoId = req.params.inspoId
        await Inspo.findByIdAndUpdate(inspoId, { 
            $push: { favouritedBy: req.session.user._id }
        })
        res.redirect(`/inspiration/${inspoId}`)

    } catch (error) {
        console.error(error)
        return res.status(500).send('Something went wrong')
    }
})

// ? Remove user from favourties array
router.delete('/:inspoId/favourited-by/:userId', isSignedIn, async (req, res) => {
    try {
        const inspoId = req.params.inspoId
        await Inspo.findByIdAndUpdate(inspoId, {
            $pull: { favouritedBy: req.session.user._id }
        })
        res.redirect('/inspiration/my-favourites')

    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
})

export default router