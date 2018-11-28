import express from "express";
import expressGraphQL from "express-graphql";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

// connect to the mongoDB
const app = express()
const PORT = process.env.PORT || '4000'
const db = 'mongodb://mmolta:password1@ds059316.mlab.com:59316/crash-data-test'

mongoose.connect(db, {
        useCreateIndex: true,
        useNewUrlParser: true
    }
)
.then(() => console.log('db connected'))
.catch(err => console.log(err))

// set up the Express server
app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressGraphQL({
        //@TODO: replace this with a valid schema
        //schema,
        graphiql: true
    })
)

app.listen(PORT, () => console.log('server running on port ', PORT))