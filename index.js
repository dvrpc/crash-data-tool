import express from "express";
import expressGraphQL from "express-graphql";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

import schema from './graphql/'

// connect to the mongoDB (firewall is blocking the connection but when we *do* go back to a db connect, the setup shouldnt be too disimilar to this
// const db = "mongodb://mmolta:password1@ds059316.mlab.com:59316/crash-data-test"

// mongoose.connect(
    //     db,
    //     {
        //         useCreateIndex: true,
        //         useNewUrlParser: true
        //     }
        // )
        // .then(() => console.log('db connected'))
        // .catch(err => console.log(err))
        
// set up the Express server
const app = express()
const PORT = process.env.PORT || '4000'

app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressGraphQL({
        schema,
        graphiql: true
    })
)

// server static assets in production
if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))

    // star is too permissive but its ok for now
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

app.listen(PORT, () => console.log('server running on port ', PORT)) 