// defining entities involved in a crash in order to learn how to handle graphql objects

// @TODO: refactor this to an enum, remove the query and delete its resolver
export default `
    type Entities {
        AUTOMOBILE: String
        MOTORCYCLE: String
        BUS_COUNT: String
        SMALL_TRUC: String
        HEAVY_TRUC: String
        SUV_COUNT: String
        VAN_COUNT: String
        BICYLE_CO: String
    }

    type Query {
        entity: Entities
        entities: [Entities]
    }
`