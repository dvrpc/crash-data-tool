// defining entities involved in a crash in order to learn how to handle graphql objects

// @TODO: all of these names are invalid - need to be single strings so how tf does that reconcile w/db
export default `
    type CollisionTypes {
        NonCollision: String
        RearEnd: String
        HeadOn: String
        RearToRearBacking: String
        Angle: String
        SideswipeSameDir: String
        SideswipeOppositeDir: String
        HitFixedObject: String
        HitPedestrian: String
        OtherUnknown: String
    }

    type Query {
        collisionType: CollisionTypes
        collisionTypes: [CollisionTypes]
    }
`