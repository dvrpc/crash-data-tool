// @TODO: update these codes w/the new GEOID format once the vector tiles are updated
const states = ['Pennsylvania','New Jersey']
const counties = { 'Bucks': '09','Chester': '15','Delaware': '23','Montgomery': '46','Philadelphia': '67' }
const munis = { 'Abington Township': '46101','Aston Township': '23101','Bedminster Township': '09201','Bensalem Township': '09202','Bethel Township': '23201','Birmingham Township': '15201','Bridgeton Township': '09203','Bristol Township': '09401','Buckingham Township': '09204','Caln Township': '15101','Chadds Ford Township': '23202','Charlestown Township': '15202','Cheltenham Township': '46102','Chester Township': '23301','Concord Township': '23204','Darby Township': '23407','Douglass Township': '46201','Doylestown Township': '09403','Durham Township': '09206','East Bradford Township': '15203','East Brandywine Township': '15204','East Caln Township': '15205','East Coventry Township': '15206','East Fallowfield Township': '15207','East Goshen Township': '15208','East Marlborough Township': '15209','East Nantmeal Township': '15210','East Norriton Township': '46202','East Nottingham Township': '15211','East Pikeland Township': '15212','East Rockhill Township': '09207','East Vincent Township': '15213','East Whiteland Township': '15214','Easttown Township': '15215','Edgmont Township': '23205','Elk Township': '15216','Falls Township': '09208','Franconia Township': '46203','Franklin Township': '15217','Hatfield Township': '46409','Haverford Township': '23103','Haycock Township': '09209','Highland Township': '15218','Hilltown Township': '09210','Honey Brook Township': '15405','Horsham Township': '46204','Kennett Township': '15220','Limerick Township': '46205','London Britain Township': '15221','London Grove Township': '15222','Londonderry Township': '15223','Lower Chichester Township': '23104','Lower Frederick Township': '46206','Lower Gwynedd Township': '46207','Lower Makefield Township': '09211','Lower Merion Township': '46104','Lower Moreland Township': '46105','Lower Oxford Township': '15224','Lower Pottsgrove Township': '46106','Lower Providence Township': '46208','Lower Salford Township': '46209','Lower Southampton Township': '09212','Marlborough Township': '46210','Marple Township': '23112','Middletown Township': '23207','Milford Township': '09214','Montgomery Township': '46211','Nether Providence Township': '23105','New Britain Township': '09410','New Garden Township': '15225','New Hanover Township': '46212','New London Township': '15226','Newlin Township': '15227','Newtown Township': '23208','Nockamixon Township': '09217','North Coventry Township': '15228','Northampton Township': '09218','Penn Township': '15229','Pennsbury Township': '15230','Perkiomen Township': '46213','Philadelphia': '67','Plumstead Township': '09219','Plymouth Township': '46107','Pocopson Township': '15231','Radnor Township': '23106','Richland Township': '09220','Ridley Township': '23107','Sadsbury Township': '15232','Salford Township': '46214','Schuylkill Township': '15233','Skippack Township': '46215','Solebury Township': '09221','South Coventry Township': '15234','Springfield Township': '46108','Thornbury Township': '23209','Tinicum Township': '23109','Towamencin Township': '46216','Tredyffrin Township': '15236','Upper Chichester Township': '23110','Upper Darby Township': '23111','Upper Dublin Township': '46109','Upper Frederick Township': '46217','Upper Gwynedd Township': '46113','Upper Hanover Township': '46219','Upper Makefield Township': '09224','Upper Merion Township': '46220','Upper Moreland Township': '46110','Upper Oxford Township': '15237','Upper Pottsgrove Township': '46114','Upper Providence Township': '46222','Upper Salford Township': '46223','Upper Southampton Township': '09225','Upper Uwchlan Township': '15238','Uwchlan Township': '15239','Valley Township': '15240','Wallace Township': '15241','Warminster Township': '09226','Warrington Township': '09227','Warwick Township': '15242','West Bradford Township': '15243','West Brandywine Township': '15244','West Caln Township': '15245','West Fallowfield Township': '15246','West Goshen Township': '15247','West Marlborough Township': '15248','West Nantmeal Township': '15249','West Norriton Township': '46111','West Nottingham Township': '15250','West Pikeland Township': '15251','West Pottsgrove Township': '46112','West Rockhill Township': '09229','West Sadsbury Township': '15252','West Vincent Township': '15253','West Whiteland Township': '15254','Westtown Township': '15255','Whitemarsh Township': '46224','Whitpain Township': '46225','Willistown Township': '15256','Worcester Township': '46226','Wrightstown Township': '09230' }

export { munis, counties, states }