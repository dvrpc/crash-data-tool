import { mergeResolvers } from "merge-graphql-schemas";

import Crash from "./Crash.js";

const resolvers = [Crash];

export default mergeResolvers(resolvers);