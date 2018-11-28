import mongoose from 'mongoose'

const Schema = mongoose.Schema

// bare bones crash schema, names are based off of the Attribute Heading in the PA Crash Data Lookup sheet
// NOTE: this will not be in the final product. We dont need to define schemas for a db that already exists, this is purely to play around with graphql and see how it works
const CrashSchema = new Schema({
    CRN: {
        type: String,
        required: true,
        unique: true
    },
    MAX_SEVERI: {
        type: String,
        required: true
    },
    COUNTY: {
        type: String,
        required: true
    },
    MUNICIPALITY: {
        type: String,
        required: false
    },
    VEHICLE_CO: {
        type: String,
        required: false
    }
})

const Crash = mongoose.model('Crash', CrashSchema)

export default Crash