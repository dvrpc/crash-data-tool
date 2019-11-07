const states = ['Pennsylvania','New Jersey']
const counties = { 'Bucks':42017,'Chester':42029,'Delaware':42045,'Montgomery':42091,'Philadelphia':42101,'Gloucester':34015,'Camden':34007,'Burlington':34005,'Mercer':34021 }
const munis = {'Abington Township':4209100156,'Aldan Borough':4204500676,'Ambler Borough':4209102264,'Aston Township':4204503336,'Atglen Borough':4202903384,'Audubon Borough':3400702200,'Audubon Park Borough':3400702230,'Avondale Borough':4202903656,'Barrington Borough':3400703250,'Bass River Township':3400503370,'Bedminster Township':4201704976,'Bellmawr Borough':3400704750,'Bensalem Township':4201705616,'Berlin Borough':3400705440,'Berlin Township':3400705470,'Bethel Township':4204506024,'Beverly City':3400505740,'Birmingham Township':4202906544,'Bordentown City':3400506670,'Bordentown Township':3400506700,'Bridgeport Borough':4209108568,'Bridgeton Township':4201708592,'Bristol Borough':4201708760,'Bristol Township':4201708768,'Brookhaven Borough':4204509080,'Brooklawn Borough':3400708170,'Bryn Athyn Borough':4209109696,'Buckingham Township':4201709816,'Burlington City':3400508920,'Burlington Township':3400508950,'Caln Township':4202910824,'Camden City':3400710000,'Central':4210160003,'Central Northeast':4210160018,'Chadds Ford Township':4204512442,'Chalfont Borough':4201712504,'Charlestown Township':4202912744,'Cheltenham Township':4209112968,'Cherry Hill Township':3400712280,'Chesilhurst Borough':3400712550,'Chester City':4204513208,'Chester Heights Borough':4204513232,'Chester Township':4204513212,'Chesterfield Township':3400512670,'Cinnaminson Township':3400512940,'Clayton Borough':3401513360,'Clementon Borough':3400713420,'Clifton Heights Borough':4204514264,'Coatesville City':4202914712,'Collegeville Borough':4209115192,'Collingdale Borough':4204515232,'Collingswood Borough':3400714260,'Colwyn Borough':4204515432,'Concord Township':4204515488,'Conshohocken Borough':4209115848,'Darby Borough':4204518152,'Darby Township':4204518160,'Delanco Township':3400517080,'Delran Township':3400517440,'Deptford Township':3401517710,'Douglass Township':4209119672,'Downingtown Borough':4202919752,'Doylestown Borough':4201719784,'Doylestown Township':4201719792,'Dublin Borough':4201720104,'Durham Township':4201720480,'East Bradford Township':4202920824,'East Brandywine Township':4202920864,'East Caln Township':4202920920,'East Coventry Township':4202921008,'East Fallowfield Township':4202921104,'East Goshen Township':4202921192,'East Greenville Borough':4209121200,'East Greenwich Township':3401519180,'East Lansdowne Borough':4204521384,'East Marlborough Township':4202921480,'East Nantmeal Township':4202921576,'East Norriton Township':4209121600,'East Nottingham Township':4202921624,'East Pikeland Township':4202921696,'East Rockhill Township':4201721760,'East Vincent Township':4202922000,'East Whiteland Township':4202922056,'East Windsor Township':3402119780,'Eastampton Township':3400518790,'Easttown Township':4202921928,'Eddystone Borough':4204522296,'Edgewater Park Township':3400520050,'Edgmont Township':4204522584,'Elk Township':3401521060,'Elverson Borough':4202923440,'Evesham Township':3400522110,'Ewing Township':3402122185,'Falls Township':4201725112,'Fieldsboro Borough':3400523250,'Florence Township':3400523850,'Folcroft Borough':4204526408,'Franconia Township':4209127280,'Franklin Township':4202927376,'Gibbsboro Borough':3400726070,'Glassboro Borough':3401526340,'Glenolden Borough':4204529720,'Gloucester City':3400726820,'Gloucester Township':3400726760,'Green Lane Borough':4209131088,'Greenwich Township':3401528185,'Haddon Heights Borough':3400728800,'Haddon Township':3400728740,'Haddonfield Borough':3400728770,'Hainesport Township':3400529010,'Hamilton Township':3402129310,'Harrison Township':3401530180,'Hatboro Borough':4209133088,'Hatfield Borough':4209133112,'Hatfield Township':4209133120,'Haverford Township':4204533144,'Haycock Township':4201733224,'Hi-Nella Borough':3400732220,'Highland Township':4202934448,'Hightstown Borough':3402131620,'Hilltown Township':4201734952,'Honey Brook Borough':4202935528,'Honey Brook Township':4202935536,'Hopewell Borough':3402133150,'Hopewell Township':3402133180,'Horsham Township':4209135808,'Hulmeville Borough':4201736192,'Ivyland Borough':4201737304,'Jenkintown Borough':4209138000,'Kennett Square Borough':4202939352,'Kennett Township':4202939344,'Langhorne Borough':4201741392,'Langhorne Manor Borough':4201741416,'Lansdale Borough':4209141432,'Lansdowne Borough':4204541440,'Laurel Springs Borough':3400739210,'Lawnside Borough':3400739420,'Lawrence Township':3402139510,'Limerick Township':4209143312,'Lindenwold Borough':3400740440,'Logan Township':3401541160,'London Britain Township':4202944440,'London Grove Township':4202944480,'Londonderry Township':4202944456,'Lower Chichester Township':4204544888,'Lower Far Northeast':4210160016,'Lower Frederick Township':4209144912,'Lower Gwynedd Township':4209144920,'Lower Makefield Township':4201744968,'Lower Merion Township':4209144976,'Lower Moreland Township':4209145008,'Lower North':4210160007,'Lower Northeast':4210160014,'Lower Northwest':4210160008,'Lower Oxford Township':4202945040,'Lower Pottsgrove Township':4209145072,'Lower Providence Township':4209145080,'Lower Salford Township':4209145096,'Lower South':4210160005,'Lower Southampton Township':4201745112,'Lower Southwest':4210160002,'Lumberton Township':3400542060,'Magnolia Borough':3400742630,'Malvern Borough':4202946792,'Mansfield Township':3400543290,'Mantua Township':3401543440,'Maple Shade Township':3400543740,'Marcus Hook Borough':4204547344,'Marlborough Township':4209147592,'Marple Township':4204547616,'Medford Lakes Borough':3400545210,'Medford Township':3400545120,'Media Borough':4204548480,'Merchantville Borough':3400745510,'Middletown Township':4204549136,'Milford Township':4201749384,'Millbourne Borough':4204549504,'Modena Borough':4202950232,'Monroe Township':3401547250,'Montgomery Township':4209150640,'Moorestown Township':3400547880,'Morrisville Borough':4201751144,'Morton Borough':4204551176,'Mount Ephraim Borough':3400748750,'Mount Holly Township':3400548900,'Mount Laurel Township':3400549020,'Narberth Borough':4209152664,'National Park Borough':3401549680,'Nether Providence Township':4204553104,'New Britain Borough':4201753296,'New Britain Township':4201753304,'New Garden Township':4202953608,'New Hanover Township':4209153664,'New Hope Borough':4201753712,'New London Township':4202953816,'Newfield Borough':3401551390,'Newlin Township':4202953784,'Newtown Borough':4201754184,'Newtown Township':4201754192,'Nockamixon Township':4201754576,'Norristown Borough':4209154656,'North':4210160001,'North Coventry Township':4202954936,'North Delaware':4210160004,'North Hanover Township':3400553070,'North Wales Borough':4209155512,'Northampton Township':4201754688,'Norwood Borough':4204555664,'Oaklyn Borough':3400753880,'Oxford Borough':4202957480,'Palmyra Borough':3400555800,'Parkesburg Borough':4202958032,'Parkside Borough':4204558176,'Paulsboro Borough':3401557150,'Pemberton Borough':3400557480,'Pemberton Township':3400557510,'Penn Township':4202958808,'Penndel Borough':4201758936,'Pennington Borough':3402157600,'Pennsauken Township':3400757660,'Pennsburg Borough':4209159120,'Pennsbury Township':4202959136,'Perkasie Borough':4201759384,'Perkiomen Township':4209159392,'Philadelphia City':4210160000,'Phoenixville Borough':4202960120,'Pine Hill Borough':3400758770,'Pine Valley Borough':3400758920,'Pitman Borough':3401559070,'Plumstead Township':4201761616,'Plymouth Township':4209161664,'Pocopson Township':4202961800,'Pottstown Borough':4209162416,'Princeton':3402160900,'Prospect Park Borough':4204562792,'Quakertown Borough':4201763048,'Radnor Township':4204563264,'Red Hill Borough':4209163808,'Richland Township':4201764536,'Richlandtown Borough':4201764584,'Ridley Park Borough':4204564832,'Ridley Township':4204564800,'Riegelsville Borough':4201764856,'River Wards':4210160009,'Riverside Township':3400563510,'Riverton Borough':3400563660,'Robbinsville Township':3402163850,'Rockledge Borough':4209165568,'Rose Valley Borough':4204566192,'Royersford Borough':4209166576,'Runnemede Borough':3400765160,'Rutledge Borough':4204566928,'Sadsbury Township':4202967080,'Salford Township':4209167528,'Schuylkill Township':4202968288,'Schwenksville Borough':4209168328,'Sellersville Borough':4201769248,'Shamong Township':3400566810,'Sharon Hill Borough':4204569752,'Silverdale Borough':4201770744,'Skippack Township':4209171016,'Solebury Township':4201771752,'Somerdale Borough':3400768340,'Souderton Borough':4209171856,'South':4210160012,'South Coatesville Borough':4202972072,'South Coventry Township':4202972088,'South Harrison Township':3401569030,'Southampton Township':3400568610,'Spring City Borough':4202972920,'Springfield Township':4204573032,'Stratford Borough':3400771220,'Swarthmore Borough':4204575648,'Swedesboro Borough':3401571850,'Tabernacle Township':3400572060,'Tavistock Borough':3400772240,'Telford Borough':4209176304,'Thornbury Township':4202976568,'Tinicum Township':4204576792,'Towamencin Township':4209177152,'Trainer Borough':4204577288,'Trappe Borough':4209177304,'Tredyffrin Township':4202977344,'Trenton City':3402174000,'Trumbauersville Borough':4201777704,'Tullytown Borough':4201777744,'University/Southwest':4210160010,'Upland Borough':4204578712,'Upper Chichester Township':4204578776,'Upper Darby Township':4204579000,'Upper Dublin Township':4209179008,'Upper Far Northeast':4210160013,'Upper Frederick Township':4209179040,'Upper Gwynedd Township':4209179056,'Upper Hanover Township':4209179064,'Upper Makefield Township':4201779128,'Upper Merion Township':4209179136,'Upper Moreland Township':4209179176,'Upper North':4210160015,'Upper Northwest':4210160017,'Upper Oxford Township':4202979208,'Upper Pottsgrove Township':4209179240,'Upper Providence Township':4209179256,'Upper Salford Township':4209179280,'Upper Southampton Township':4201779296,'Upper Uwchlan Township':4202979352,'Uwchlan Township':4202979480,'Valley Township':4202979544,'Voorhees Township':3400776220,'Wallace Township':4202980616,'Warminster Township':4201780952,'Warrington Township':4201781048,'Warwick Township':4201781144,'Washington Township':3400577150,'Waterford Township':3400777630,'Wenonah Borough':3401578110,'West':4210160011,'West Bradford Township':4202982544,'West Brandywine Township':4202982576,'West Caln Township':4202982664,'West Chester Borough':4202982704,'West Conshohocken Borough':4209182736,'West Deptford Township':3401578800,'West Fallowfield Township':4202982936,'West Goshen Township':4202983080,'West Grove Borough':4202983104,'West Marlborough Township':4202983464,'West Nantmeal Township':4202983664,'West Norriton Township':4209183696,'West Nottingham Township':4202983712,'West Park':4210160006,'West Pikeland Township':4202983832,'West Pottsgrove Township':4209183912,'West Rockhill Township':4201783960,'West Sadsbury Township':4202983968,'West Vincent Township':4202984160,'West Whiteland Township':4202984192,'West Windsor Township':3402180240,'Westampton Township':3400578200,'Westtown Township':4202984104,'Westville Borough':3401580120,'Whitemarsh Township':4209184624,'Whitpain Township':4209184888,'Willingboro Township':3400581440,'Willistown Township':4202985352,'Winslow Township':3400781740,'Woodbury City':3401582120,'Woodbury Heights Borough':3401582180,'Woodland Township':3400582420,'Woodlynne Borough':3400782450,'Woolwich Township':3401582840,'Worcester Township':4209186496,'Wrightstown Borough':3400582960,'Wrightstown Township':4201786624,'Yardley Borough':4201786920,'Yeadon Borough':4204586968}

export { munis, counties, states }