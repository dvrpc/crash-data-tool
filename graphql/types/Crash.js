// define the graphql model and the query types for crash (get one or get all, for now)

export default `
    type Crash {
        CRN: String!
        MAX_SEVERI: String!
        COUNTY: String!
        MUNICIPALITY: String
        VEHICLE_CO: [Entities!]
    }

    type Query {
        crash(CRN: String!): Crash
        crashes: [Crash]
    }
`