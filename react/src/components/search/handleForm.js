const munis = [
    'ABINGTON','ASTON','Aldan','Ambler','Atglen','Audubon','Audubon Park','Avondale','BASS RIVER','BEDMINSTER'
]

const counties = [
'Atlantic','Berks','Bucks','Burlington','Camden','Cape May','Cecil','Chester','Cumberland','Delaware','Gloucester','Harford','Hunterdon','Kent','Lancaster','Lehigh','Mercer','Middlesex','Monmouth','Montgomery','New Castle','Northampton','Ocean','Philadelphia','Salem','Somerset','Warren','York'
]

// based off of the selected value, create the next dropdown or search bar
const handleSelect = value => {
    switch(value){
        case 'county':
            return counties
        case 'municipality':
            return munis
        default:
            return false
    }
}

const postSearch = e => {
    console.log('form submitted')
}

export  { handleSelect, postSearch }