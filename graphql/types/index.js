//Types define a schema for graphql to map over
    // they define two things:
        // the structure of your query - what fields it has and their corresponding data structure
        // the way to access your resolver functions. 'type Query' within the resolvers should map to functions defined in its associated resolver 

import { mergeTypes } from 'merge-graphql-schemas'

import Crash from './Crash.js'
import Entities from './Entities.js'

const typeDefs = [Crash, Entities]

export default mergeTypes(typeDefs)