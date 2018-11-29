// import Crash from '../../models/Crash.js'

// async set up for db calls (for later)
// export default {
//     Query: {
//         crash: async (root, args) => await Crash.findOne(args).exec(),
//         crashes: async () => Crash.find({}).populate().exec()
//     }
// }


// dummy data instead of db for now
const dummyData = [
    {
        CRN: '1',
        MAX_SEVERI: 'fatal',
        COUNTY: 'Bucks',
        MUNICIPALITY: 'Samsquantch',
        VEHICLE_CO: [{
            "BICYCLE_CO": 'Schwinn Gambit',
            "SMALL_TRUC": ' lil truck',
            "MOTORCYCLE": 'kawasaki?'
        }]
    },
    {
        CRN: '2',
        MAX_SEVERI: 'fatal',
        COUNTY: 'Bucks',
        MUNICIPALITY: 'Other',
        VEHICLE_CO: [{
            "AUTOMOBILE": 'subaru outback', 
            "PERSON_COU": 'pedestrian', 
            "MOTORCYCLE": 'harley davidson'
        }]
    },
    {
        CRN: '3',
        MAX_SEVERI: 'mild',
        COUNTY: 'Delaware',
        MUNICIPALITY: 'What are these',
        VEHICLE_CO: [
            {"PERSON_COU": 'pedestrian'}, 
            {"BICYCLE_CO": 'Iron Horse bike'},
            {"AUTOMMOBILE": 'VW GTI'}
        ]
    },
    {
        CRN: '4',
        MAX_SEVERI: 'mild',
        COUNTY: 'Montgomery',
        MUNICIPALITY: 'Ardmore',
        VEHICLE_CO: [{
            "SMALL_TRUC": 'baby truck',
            "MOTORCYCLE": 'honda or whatever'
        }]  
    }
]

export default {
    Query: {
        // allow users to grab an individual crash by id (to simulate clicking on one)
        crash: (parent, args, context, info) => dummyData.filter(data => data.CRN === args.CRN),
        
        // allow users to build granular queries and get all crashes associated w/selected variables (early stages of the main query modal)
        crashes: (parent, args, context, info) => {            
            return dummyData.filter(crash => {
                const id = args.CRN || null
                const severity = args.MAX_SEVERI || null
                const county = args.COUNTY || null
                const municipality = args.MUNICIPALITY || null 
                
                // entities are an array of options, want to get any crash that satisfies any one of them
                // the idea is to search for even a single common feature, short out if yes and return a bool that goes into the ridiculous || chain below
                const entities = args.VEHICLE_CO || null
                let entitiesBool = false

                if(entities){
                    const length = entities.length
                    // for loop here in order to break as soon as a match is found
                    for(var i = 0; i < length; i++){
                        if(crash.VEHICLE_CO.contains(entities[i])){
                            entitiesBool = true
                            break
                        }
                    }
                }

                // return any crash that matches any of the fields
                return crash.CRN === id || crash.MAX_SEVERI === severity || crash.COUNTY === county || crash.MUNICIPALITY === municipality || entitiesBool
            })
        }
    }
}