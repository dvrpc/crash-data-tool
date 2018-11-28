import { mergeTypes } from 'merge-graphql-schemas'

import Crash from './Crash.js'
import Entities from './Entities.js'

const typeDefinitions = [Crash, Entities]

export default mergeTypes(typeDefinitions, {all: true})