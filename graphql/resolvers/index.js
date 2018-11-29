// Resolvers define the business logic of your schemas 

import { mergeResolvers } from "merge-graphql-schemas";

import Crash from "./Crash.js";
import Entities from './Entities.js'

const resolvers = [Crash, Entities];

export default mergeResolvers(resolvers);