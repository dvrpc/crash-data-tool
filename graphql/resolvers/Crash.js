import Crash from '../../models/Crash.js'

// mongo stuff, subject to change
export default {
    Query: {
        crash: async (root, args) => await Crash.findOne(args).exec(),
        crashes: async () => Crash.find({}).populate().exec()
    }
}