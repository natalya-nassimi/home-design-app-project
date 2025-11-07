import mongoose from 'mongoose'

const inspoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageURL: { type: String, required: true },
    description: { type: String, required: true },
    style: { type: String, required: true },
    roomType: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    favouritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

const Inspo = mongoose.model('Inspo', inspoSchema)

export default Inspo