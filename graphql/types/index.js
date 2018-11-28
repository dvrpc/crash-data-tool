import { mergeTypes } from 'merge-graphql-schemas'

import Crash from './Crash.js'
import Entities from './Entities.js'

const typeDefs = [Crash, Entities]

export default mergeTypes(typeDefs, {all: true})