import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  MapPin, Clock, Compass, Navigation, ChevronRight,
  Search, Star, ShieldCheck, CheckCircle2, Sparkles,
  Send, X, Layers, Volume2, VolumeX,
  Share2, ArrowRight, Lock,
  Mail, User, Globe, Award, Footprints, Car, Eye,
  Play, Check, ShoppingBag, Landmark, UtensilsCrossed, Music,
  AlertCircle, Route, Radio, Menu
} from 'lucide-react';

import { LANGUAGES_LIST, TRANSLATIONS } from './translations';
import { generateTansenAIResponse, getLocalizedWelcomeMessage } from './aiConcierge';
import { sendChatMessage, API_BASE_URL } from './services/api';

// ========================================================
// DATA DEFINITION: GWALIOR HERITAGE SPOTS (36 Curated Places)
// ========================================================
const GWALIOR_PLACES = [
  // === SIGHTSEEING ===
  // Tier 1: Iconic
  {
    id: 'gw-mon-1',
    name: 'Gwalior Fort & Man Singh Palace',
    hindiName: 'ग्वालियर दुर्ग एवं मानसिंह महल',
    category: 'sightseeing',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Landmark',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित स्मारक',
    duration: 90,
    distanceKm: 2.5,
    rating: 4.9,
    reviews: 8420,
    price: '₹25 (ASI Pass)',
    priceHi: '₹25 (एएसआई पास)',
    hours: '06:00 AM - 06:00 PM',
    verified: true,
    verifiedBy: 'ASI & MP Heritage Dept',
    mapCoords: { x: 44, y: 28 },
    image: 'https://images.unsplash.com/photo-1599831104325-508b98453e92?auto=format&fit=crop&w=800&q=80',
    description: 'The "Pearl among fortresses of Hind". Renowned for vibrant turquoise duck and elephant enameled wall tiles, rock-cut palaces, and panoramic cliffside vistas.',
    descriptionHi: 'हिंद के किलों का मोती! नीली व पीली मीनाकारी वाली टाइलों, मानसिंह महल, जौहर कुंड और गोपाचल पर्वत से विहंगम दृश्य के लिए प्रसिद्ध।',
    highlights: ['Turquoise Glazed Tiles', 'Jauhar Kund', 'Babur’s Favourite Fort'],
    highlightsHi: ['नीली मीनाकारी टाइलें', 'ऐतिहासिक जौहर कुंड', 'बाबर का पसंदीदा किला'],
    tags: ['UNESCO Music City Hill', 'Ancient Architecture', 'Must Visit']
  },
  {
    id: 'gw-mon-2',
    name: 'Jai Vilas Palace & Scindia Museum',
    hindiName: 'जय विलास महल एवं सिंधिया संग्रहालय',
    category: 'sightseeing',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Landmark',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित स्मारक',
    duration: 75,
    distanceKm: 3.2,
    rating: 4.8,
    reviews: 6240,
    price: '₹300 (Indians) / ₹850 (Foreign)',
    priceHi: '₹300 (भारतीय) / ₹850 (विदेशी)',
    hours: '10:00 AM - 05:00 PM (Wed Closed)',
    verified: true,
    verifiedBy: 'Scindia Heritage Trust',
    mapCoords: { x: 26, y: 64 },
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    description: '19th-century royal European palace with the world’s two largest crystal chandeliers weighing 3.5 tons each, and the legendary silver banquet dining train.',
    descriptionHi: '19वीं सदी का भव्य यूरोपीय महल जिसमें 3.5 टन वजनी दुनिया के सबसे बड़े झाड़-फानूस और चांदी की डाइनिंग ट्रेन प्रदर्शित है।',
    highlights: ['3.5-Ton Chandeliers', 'Silver Model Dining Train', 'Durbar Hall Gold Leafing'],
    highlightsHi: ['3.5 टन के झाड़-फानूस', 'चांदी की डाइनिंग ट्रेन', 'दरबार हॉल स्वर्ण नक्काशी'],
    tags: ['Royal Palace', 'Maratha Dynasty', 'European Decor']
  },
  {
    id: 'gw-mon-3',
    name: 'Tomb of Mohammad Ghaus & Tansen Samadhi',
    hindiName: 'मोहम्मद गौस का मकबरा एवं तानसेन समाधि',
    category: 'sightseeing',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Landmark',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित स्मारक',
    duration: 45,
    distanceKm: 1.8,
    rating: 4.7,
    reviews: 3890,
    price: 'Free Entry',
    priceHi: 'निःशुल्क प्रवेश',
    hours: '08:00 AM - 07:00 PM',
    verified: true,
    verifiedBy: 'ASI & Tansen Festival Committee',
    mapCoords: { x: 70, y: 22 },
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    description: 'Resting place of Sangeet Samrat Tansen, the legendary gem of Akbar’s court, and Sufi saint Mohammad Ghaus. The tamarind tree here is said to sweeten one’s singing voice.',
    descriptionHi: 'अकबर के नवरत्नों में से एक संगीत सम्राट तानसेन एवं सूफी संत मोहम्मद गौस का पवित्र विश्राम स्थल। यहाँ की इमली के पत्ते गले को सुरीला बनाते हैं।',
    highlights: ['Magical Tamarind Tree', 'Mughal Hexagonal Jali Work', 'Annual Tansen Music Fest'],
    highlightsHi: ['जादुई इमली का वृक्ष', 'मुगल षट्कोणीय जाली कार्य', 'वार्षिक तानसेन संगीत समारोह'],
    tags: ['UNESCO Music City', 'Classical Sangeet', 'Sufi Heritage']
  },
  {
    id: 'gw-mon-4',
    name: 'Gujari Mahal Archaeological Museum',
    hindiName: 'गूजरी महल पुरातत्व संग्रहालय',
    category: 'sightseeing',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Landmark',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित स्मारक',
    duration: 50,
    distanceKm: 2.8,
    rating: 4.6,
    reviews: 2150,
    price: '₹20 (Ticket Counter)',
    priceHi: '₹20 (टिकट काउंटर)',
    hours: '10:00 AM - 05:00 PM (Mon Closed)',
    verified: true,
    verifiedBy: 'State Archaeology Department',
    mapCoords: { x: 42, y: 22 },
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    description: 'Built by King Man Singh Tomar for his fearless tribal queen Mrignayani. Houses priceless stone sculptures dating from the 1st to 2nd century BC, including the Shalabhanjika.',
    descriptionHi: 'राजा मानसिंह तोमर द्वारा रानी मृगनयनी के लिए निर्मित महल। यहाँ 1ली व 2री सदी ईसा पूर्व की शलभंजिका "भारतीय मोनालिसा" प्रतिमा संरक्षित है।',
    highlights: ['Shalabhanjika "Indian Monalisa"', 'Tomar Architecture', 'Rare Copper Plates'],
    highlightsHi: ['शलभंजिका दुर्लभ मूर्ति', 'तोमरकालीन स्थापत्य कला', 'प्राचीन ताम्रपत्र संग्रह'],
    tags: ['Sculpture Art', 'Royal Love Story', 'Archaeology']
  },
  // Tier 2: Local Favorites
  {
    id: 'gw-mon-5',
    name: 'Sun Temple (Surya Mandir)',
    hindiName: 'सूर्य मंदिर (बिरला मंदिर)',
    category: 'sightseeing',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 40,
    distanceKm: 4.5,
    rating: 4.7,
    reviews: 4120,
    price: 'Free Entry',
    priceHi: 'निःशुल्क प्रवेश',
    hours: '06:30 AM - 12:00 PM, 01:00 PM - 07:00 PM',
    verified: true,
    verifiedBy: 'Birla Temple Trust',
    mapCoords: { x: 86, y: 45 },
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Inspired by the famous Konark Sun Temple in Odisha, crafted with red sandstone and white marble. Features 7 carved stone horses pulling Surya’s chariot amid lush gardens.',
    descriptionHi: 'कोणार्क के सूर्य मंदिर की प्रेरणा से लाल बलुआ पत्थर और सफेद संगमरमर से निर्मित भव्य मंदिर, जिसमें सूर्य देव के रथ को खींचते 7 अश्व हैं।',
    highlights: ['Konark Replica Design', 'Red Sandstone Chariot', 'Tranquil Gardens'],
    highlightsHi: ['कोणार्क शैली नक्काशी', 'लाल बलुआ पत्थर रथ', 'शांत हरियाली युक्त उद्यान'],
    tags: ['Spiritual', 'Architecture', 'Sunset Spot']
  },
  {
    id: 'gw-mon-6',
    name: 'Gopachal Parvat Rock-Cut Jain Statues',
    hindiName: 'गोपाचल पर्वत जैन तीर्थंकर मूर्तियां',
    category: 'sightseeing',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 45,
    distanceKm: 1.9,
    rating: 4.8,
    reviews: 2940,
    price: 'Free Entry',
    priceHi: 'निःशुल्क प्रवेश',
    hours: '06:00 AM - 07:00 PM',
    verified: true,
    verifiedBy: 'ASI & Digambar Trust',
    mapCoords: { x: 40, y: 36 },
    image: 'https://images.unsplash.com/photo-1600100397608-f010f443a999?auto=format&fit=crop&w=800&q=80',
    description: 'Colossal 15th-century rock-cut monolithic sculptures carved directly into the sheer stone cliffs of Gwalior Fort hill, including a 47-foot seated figure of Bhagwan Parshvanatha.',
    descriptionHi: '15वीं शताब्दी में सीधे चट्टान तराश कर बनाई गई भगवान पार्श्वनाथ की 47 फीट ऊंची पद्मासन प्रतिमा व दर्जनों प्राचीन तीर्थंकर मूर्तियां।',
    highlights: ['47-Ft Monolith Tirthankara', 'Cliff-carved Bas-Reliefs', 'Ancient Inscriptions'],
    highlightsHi: ['47 फीट ऊंची विशाल प्रतिमा', 'चट्टान तराश नक्काशी', 'प्राचीन शिलालेख'],
    tags: ['Rock-Cut Wonder', 'Peaceful Walk', 'Historic']
  },
  {
    id: 'gw-mon-7',
    name: 'Saas Bahu (Sahastrabahu) Temples',
    hindiName: 'सास-बहू (सहस्रबाहु) मंदिर',
    category: 'sightseeing',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 40,
    distanceKm: 2.6,
    rating: 4.6,
    reviews: 3200,
    price: '₹25 (Combined Fort Ticket)',
    priceHi: '₹25 (किला संयुक्त टिकट)',
    hours: '08:00 AM - 05:30 PM',
    verified: true,
    verifiedBy: 'ASI Central Circle',
    mapCoords: { x: 48, y: 30 },
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
    description: '11th-century twin architectural masterpieces dedicated to Lord Vishnu (Sahastrabahu). Exquisite geometric beam carvings and panoramic views overlooking Gwalior valley.',
    descriptionHi: '11वीं सदी के भगवान विष्णु (सहस्रबाहु) को समर्पित जुड़वां मंदिर। ज्यामितीय नक्काशीदार खंभे और घाटी का विहंगम मनोरम दृश्य।',
    highlights: ['Intricate Pillar Carvings', 'Panoramic City View', '11th-Century Kachchhapaghata'],
    highlightsHi: ['अद्भुत स्तंभ नक्काशी', 'शहर का मनोरम दृश्य', 'कच्छपघात स्थापत्य'],
    tags: ['Ancient Temple', 'Photography', 'Heritage Gem']
  },
  {
    id: 'gw-mon-8',
    name: 'Tigra Dam & Reservoir',
    hindiName: 'तिघरा जलाशय एवं बांध',
    category: 'sightseeing',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 120,
    distanceKm: 19.5,
    rating: 4.5,
    reviews: 1890,
    price: 'Boating: ₹100-300',
    priceHi: 'नौकायन: ₹100-300',
    hours: '09:00 AM - 06:00 PM',
    verified: true,
    verifiedBy: 'MP Water Resource & Tourism',
    mapCoords: { x: 12, y: 12 },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'Scenic freshwater reservoir on the Sank River. Popular weekend getaway for birdwatching, serene speed-boating, and watching sunsets over rocky hills.',
    descriptionHi: 'सांक नदी पर बना सुरम्य मीठे पानी का जलाशय। सूर्यास्त दर्शन, प्रवासी पक्षियों और स्पीड बोटिंग के लिए प्रसिद्ध प्राकृतिक पिकनिक स्थल।',
    highlights: ['Speed Boating', 'Migratory Birds', 'Sunset Point'],
    highlightsHi: ['स्पीड बोटिंग', 'प्रवासी पक्षी दर्शन', 'मनोहर सूर्यास्त'],
    tags: ['Nature Escape', 'Watersports', 'Family Trip']
  },
  // Tier 3: Hidden Gems
  {
    id: 'gw-mon-9',
    name: 'Sarod Ghar — Museum of Musical Heritage',
    hindiName: 'सरोद घर (संगीत धरोहर संग्रहालय)',
    category: 'sightseeing',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 50,
    distanceKm: 2.1,
    rating: 4.9,
    reviews: 980,
    price: '₹100 (Donation Ticket)',
    priceHi: '₹100 (सहयोग शुल्क)',
    hours: '10:00 AM - 05:00 PM (Sun Closed)',
    verified: true,
    verifiedBy: 'Ustad Hafiz Ali Khan Trust',
    mapCoords: { x: 52, y: 55 },
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: 'The ancestral haveli of legendary Sarod maestros Ustad Hafiz Ali Khan & Amjad Ali Khan. Houses historic stringed instruments, old gramophones, and rare audio recordings.',
    descriptionHi: 'उस्ताद हाफिज अली खान व अमजद अली खान की पैतृक हवेली, जहाँ ऐतिहासिक वाद्य यंत्र, पुराने ग्रामोफोन व दुर्लभ शास्त्रीय रिकॉर्डिंग मौजूद हैं।',
    highlights: ['Ancestral Haveli Courtyard', 'Rare Vintage Instruments', 'Live Classical Ambiance'],
    highlightsHi: ['पैतृक हवेली प्रांगण', 'दुर्लभ प्राचीन वाद्ययंत्र', 'शास्त्रीय संगीत का माहौल'],
    tags: ['UNESCO Music City', 'Living Legacy', 'Intimate Heritage']
  },
  {
    id: 'gw-mon-10',
    name: 'Chhatris of Scindia Dynasty',
    hindiName: 'सिंधिया राजवंश की छतरियां',
    category: 'sightseeing',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 35,
    distanceKm: 3.8,
    rating: 4.6,
    reviews: 820,
    price: 'Free Entry',
    priceHi: 'निःशुल्क प्रवेश',
    hours: '07:00 AM - 06:30 PM',
    verified: true,
    verifiedBy: 'Gwalior Royal Cenotaphs Board',
    mapCoords: { x: 34, y: 72 },
    image: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=800&q=80',
    description: 'Graceful marble and sandstone cenotaphs built in memory of Scindia rulers. Exhibits a harmonious blend of Maratha simplicity and Rajput stone arches amid calm shaded walkways.',
    descriptionHi: 'सिंधिया शासकों की स्मृति में निर्मित नक्काशीदार संगमरमर व बलुआ पत्थर की छतरियां। मराठा सादगी व राजपूत मेहराबों का शांत संगम।',
    highlights: ['Maratha-Rajput Cenotaphs', 'Quiet Reflection Gardens', 'Marble Pietra Dura'],
    highlightsHi: ['मराठा-राजपूत छतरियां', 'शांत हरियाली गलियारे', 'संगमरमर पच्चीकारी'],
    tags: ['Royal Cenotaphs', 'Peaceful', 'Off-The-Beaten-Track']
  },
  {
    id: 'gw-mon-11',
    name: 'Italian Garden (Phool Bagh Compound)',
    hindiName: 'इटालियन गार्डन (फूल बाग परिसर)',
    category: 'sightseeing',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 30,
    distanceKm: 2.4,
    rating: 4.4,
    reviews: 1450,
    price: 'Free Entry',
    priceHi: 'निःशुल्क प्रवेश',
    hours: '06:00 AM - 08:30 PM',
    verified: true,
    verifiedBy: 'Gwalior Municipal Heritage Wing',
    mapCoords: { x: 56, y: 48 },
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    description: 'A European landscaped royal garden commissioned by Madho Rao Scindia in the 1920s with neoclassical fountains, stone balustrades, and rare botanical trees.',
    descriptionHi: '1920 के दशक में निर्मित यूरोपीय शैली का शाही उद्यान, जिसमें फव्वारे, संगमरमर की बाड़ और दुर्लभ वनस्पतियां हैं।',
    highlights: ['Neoclassical Fountains', 'Historic Pavilion', 'Lush Shaded Lawns'],
    highlightsHi: ['क्लासिकल फव्वारे', 'शाही बारादरी', 'छायादार हरी घास'],
    tags: ['Garden Walk', 'Royal History', 'Charming']
  },
  {
    id: 'gw-mon-12',
    name: 'Urwahi Gate & Cliffside Water Reservoirs',
    hindiName: 'उरवाही द्वार एवं प्राचीन बावडियां',
    category: 'sightseeing',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 35,
    distanceKm: 2.0,
    rating: 4.7,
    reviews: 730,
    price: 'Free Access',
    priceHi: 'निःशुल्क आवागमन',
    hours: 'Open 24 Hours (Daytime Best)',
    verified: true,
    verifiedBy: 'ASI & Local Eco-Guides',
    mapCoords: { x: 38, y: 26 },
    image: 'https://images.unsplash.com/photo-1620067925093-801122ac1408?auto=format&fit=crop&w=800&q=80',
    description: 'The ancient winding vehicular ascent to the fort. Famous for centuries-old rainwater harvesting step-wells and breath-taking views of the sandstone escarpment.',
    descriptionHi: 'किले पर चढ़ने का ऐतिहासिक घुमावदार रास्ता, जो प्राचीन बावड़ियों और विशालकाय चट्टानी नक्काशी से घिरा है।',
    highlights: ['Deep Stepwells', 'Medieval Gate Arches', 'Echo Ravines'],
    highlightsHi: ['प्राचीन गहरी बावडियां', 'मध्यकालीन मेहराब', 'घाटी का विहंगम दृश्य'],
    tags: ['Adventure Ascent', 'Hidden History', 'Scenic Drive']
  },

  // === EATING / FOOD ===
  // Tier 1: Iconic Delicacies
  {
    id: 'gw-food-1',
    name: 'S.S. Kachori & Bedai Wale',
    hindiName: 'एस.एस. कचौड़ी एवं बेड़ई वाले',
    category: 'eating',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Food',
    tierLabelHi: 'श्रेणी 1: प्रसिद्ध खान-पान',
    duration: 25,
    distanceKm: 1.2,
    rating: 4.9,
    reviews: 5310,
    price: '₹50 - ₹100 / person',
    priceHi: '₹50 - ₹100 प्रति व्यक्ति',
    hours: '06:30 AM - 01:30 PM (Morning Specialty)',
    verified: true,
    verifiedBy: 'Certified Heritage Food Artisan',
    mapCoords: { x: 48, y: 66 },
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    description: 'Serving Gwalior’s most sought-after breakfast since 1952. Piping hot, double-fried crispy Bedai served with aromatic spicy hing aloo sabzi and sweet jalebis.',
    descriptionHi: '1952 से ग्वालियर का सबसे लोकप्रिय सुबह का नाश्ता। खस्ता बेड़ई, तीखी हींग की आलू की सब्जी और गरमा-गरम रसीली जलेबी।',
    highlights: ['Asafoetida (Hing) Potato Curry', 'Crisp Urad Dal Bedai', 'Hot Saffron Jalebi'],
    highlightsHi: ['हींग वाली आलू की सब्जी', 'खस्ता उड़द दाल बेड़ई', 'केसरिया देशी घी जलेबी'],
    tags: ['Iconic Breakfast', 'Desi Ghee', 'Culinary Legend']
  },
  {
    id: 'gw-food-2',
    name: 'Bahadura Ke Laddoo (Naya Bazaar)',
    hindiName: 'बहादुरा के शुद्ध देसी घी के लड्डू',
    category: 'eating',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Food',
    tierLabelHi: 'श्रेणी 1: प्रसिद्ध खान-पान',
    duration: 20,
    distanceKm: 1.4,
    rating: 4.9,
    reviews: 6890,
    price: '₹400 / kg box',
    priceHi: '₹400 / किग्रा डिब्बा',
    hours: '09:00 AM - 09:30 PM',
    verified: true,
    verifiedBy: 'Traditional Confectioner Guild',
    mapCoords: { x: 44, y: 68 },
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    description: 'India-famous melt-in-the-mouth boondi laddoos fried in pure cow ghee. Former Prime Minister Atal Bihari Vajpayee’s all-time favourite sweet from Gwalior.',
    descriptionHi: 'शुद्ध गाय के देसी घी में तले मुंह में घुल जाने वाले बूंदी के लड्डू। भारत रत्न अटल बिहारी वाजपेयी जी की सबसे पसंदीदा मिठाई।',
    highlights: ['Pure Desi Ghee Aroma', 'Melt-in-mouth Boondi', 'Historic 80-Yr Legacy'],
    highlightsHi: ['शुद्ध देसी घी की खुशबू', 'मुलायम मोतीचूर बूंदी', '80 वर्षों की परंपरा'],
    tags: ['Royal Sweets', 'Famous Gift', 'Must Taste']
  },
  {
    id: 'gw-food-3',
    name: 'Sarafa Bazaar Late-Night Street Food',
    hindiName: 'सराफा बाज़ार नाइट स्ट्रीट फूड गली',
    category: 'eating',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Food',
    tierLabelHi: 'श्रेणी 1: प्रसिद्ध खान-पान',
    duration: 45,
    distanceKm: 1.5,
    rating: 4.8,
    reviews: 4720,
    price: '₹100 - ₹250 / person',
    priceHi: '₹100 - ₹250 प्रति व्यक्ति',
    hours: '08:00 PM - 01:00 AM',
    verified: true,
    verifiedBy: 'Gwalior Street Vendor Association',
    mapCoords: { x: 46, y: 70 },
    image: 'https://images.unsplash.com/photo-1505253758473-96b3015f27eb?auto=format&fit=crop&w=800&q=80',
    description: 'When the jewelry shops shut down, Sarafa transforms into a bustling food street. Renowned for Bhutte Ka Kis, Kesar Malai Kulfi, Garadu, and creamy Rabdi Falooda.',
    descriptionHi: 'रात में सराफा बाज़ार की दुकानों के बाद सजने वाली चौपाटी। भुट्टे का कीस, मलाई कुल्फी, गर्मागर्म गराडू और रबड़ी फालूदा।',
    highlights: ['Bhutte Ka Kis (Grated Corn)', 'Rabdi Kesar Falooda', 'Steaming Hot Garadu'],
    highlightsHi: ['मालवी भुट्टे का कीस', 'केसरिया रबड़ी फालूदा', 'चटपटा गराडू'],
    tags: ['Night Life', 'Street Food Paradise', 'Vibrant Buzz']
  },
  {
    id: 'gw-food-4',
    name: 'Morena Gajak Bhandar (Lashkar)',
    hindiName: 'मुरैना गजक भंडार (लश्कर)',
    category: 'eating',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Food',
    tierLabelHi: 'श्रेणी 1: प्रसिद्ध खान-पान',
    duration: 20,
    distanceKm: 1.6,
    rating: 4.8,
    reviews: 3410,
    price: '₹280 - ₹500 / kg',
    priceHi: '₹280 - ₹500 प्रति किग्रा',
    hours: '09:30 AM - 10:00 PM',
    verified: true,
    verifiedBy: 'GI Product Verification Board',
    mapCoords: { x: 42, y: 65 },
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic Chambal-belt specialty made with roasted sesame seeds (til), pure jaggery (gud), cardamom, and dry fruits. Paper-thin, crispy, and warming.',
    descriptionHi: 'चंबल अंचल की जीआई टैग प्राप्त तिल-गुड़ की कुरकुरी गजक, पिस्ता रोल और खस्ता पट्टी जो सर्दियों में शरीर को ऊर्जा देती है।',
    highlights: ['Til-Gud Khasta Gajak', 'Pista Roll Gajak', 'Winter Heritage Snack'],
    highlightsHi: ['तिल-गुड़ खस्ता गजक', 'पिस्ता रोल गजक', 'सर्दियों की प्रसिद्ध सौगात'],
    tags: ['GI Heritage', 'Crispy Sweet', 'Souvenir Food']
  },
  // Tier 2: Local Favorites
  {
    id: 'gw-food-5',
    name: 'Dilli Paratha House (Phool Bagh)',
    hindiName: 'दिल्ली परांठा हाउस (फूलबाग)',
    category: 'eating',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 35,
    distanceKm: 2.2,
    rating: 4.6,
    reviews: 2650,
    price: '₹120 - ₹220 / person',
    priceHi: '₹120 - ₹220 प्रति व्यक्ति',
    hours: '11:00 AM - 11:00 PM',
    verified: true,
    verifiedBy: 'Verified Local Diner',
    mapCoords: { x: 54, y: 50 },
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy chur-chur tandoori and tawa parathas stuffed with spiced paneer, radish, and potatoes, served with dollops of white makhan, dal makhani, and imli chutney.',
    descriptionHi: 'ताजा मक्खन, दाल मखनी और इमली चटनी के साथ परोसे जाने वाले कुरकुरे चूर-चूर परांठे (पनीर, आलू, गोभी)।',
    highlights: ['Chur-Chur Stuffed Paratha', 'Fresh Desi White Butter', 'Rich Dal Makhani'],
    highlightsHi: ['खस्ता चूर-चूर परांठा', 'घर का सफेद मक्खन', 'स्वादिष्ट दाल मखनी'],
    tags: ['Comfort Dining', 'Filling Lunch', 'Spicy Flavors']
  },
  {
    id: 'gw-food-6',
    name: 'Agarwal Poha & Samosa Center (Station Road)',
    hindiName: 'अग्रवाल पोहा एवं समोसा भंडार',
    category: 'eating',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 20,
    distanceKm: 0.8,
    rating: 4.7,
    reviews: 3100,
    price: '₹30 - ₹70 / person',
    priceHi: '₹30 - ₹70 प्रति व्यक्ति',
    hours: '05:30 AM - 12:00 PM',
    verified: true,
    verifiedBy: 'Railway Travelers Circle',
    mapCoords: { x: 74, y: 38 },
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
    description: 'Fluffy steamed Indori-style Poha sprinkled with crunchy Ratlami sev, pomegranate pearls, jeeravan masala, served alongside fresh hot samosas and cutting chai.',
    highlights: ['Steamed Jeeravan Poha', 'Ratlami Sev Topping', 'Hot Ginger Chai'],
    descriptionHi: 'रतलामी सेव, अनारदाने व जीरावन मसाले से सजा भाप का गरमा-गरम पोहा, करारे समोसे व अदरक की स्पेशल चाय।',
    highlightsHi: ['जीरावन पोहा', 'रतलामी सेव', 'कड़क अदरक चाय'],
    tags: ['Quick Bite', 'Commuter Favorite', 'Morning Rush']
  },
  {
    id: 'gw-food-7',
    name: 'Kwality Heritage Restaurant (Maharani Laxmibai Marg)',
    hindiName: 'क्वालिटी हेरिटेज रेस्टोरेंट',
    category: 'eating',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 50,
    distanceKm: 1.7,
    rating: 4.6,
    reviews: 2900,
    price: '₹350 - ₹650 / person',
    priceHi: '₹350 - ₹650 प्रति व्यक्ति',
    hours: '12:00 PM - 03:30 PM, 07:00 PM - 11:00 PM',
    verified: true,
    verifiedBy: 'Gwalior Hospitality Guild',
    mapCoords: { x: 50, y: 60 },
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    description: 'Established in the 1960s, offering royal North Indian banquet flavors, Chana Bhature, Shahi Paneer, and Mughlai curries in vintage heritage dining hall decor.',
    descriptionHi: '1960 के दशक से स्थापित ऐतिहासिक रेस्टोरेंट, अपने चना भटूरे, शाही पनीर और पारंपरिक उत्तर भारतीय स्वादों के लिए विख्यात।',
    highlights: ['Signature Chana Bhatura', 'Vintage Ambiance', 'Family Dining'],
    highlightsHi: ['प्रसिद्ध चना भटूरा', 'विंटेज वातावरण', 'सपरिवार भोजन'],
    tags: ['Sit-Down Meal', 'Vintage Ambiance', 'North Indian']
  },
  {
    id: 'gw-food-8',
    name: 'Shanker Kesar Petha & Sweets (Daulat Ganj)',
    hindiName: 'शंकर केसर पेठा एवं मिष्ठान भंडार',
    category: 'eating',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 20,
    distanceKm: 1.3,
    rating: 4.7,
    reviews: 1820,
    price: '₹220 - ₹380 / kg',
    priceHi: '₹220 - ₹380 प्रति किग्रा',
    hours: '08:30 AM - 10:00 PM',
    verified: true,
    verifiedBy: 'Local Merchant Council',
    mapCoords: { x: 45, y: 62 },
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
    description: 'Famous for aromatic saffron-infused translucent Kesar Angoori Petha, Gulab Jamun dipped in cardamom syrup, and fresh chenna sweets made daily.',
    descriptionHi: 'पारदर्शी केसर अंगूरी पेठा, इलायची की चाशनी वाले गुलाब जामुन और रोज ताजे बनाए जाने वाले छेना मिष्ठान।',
    highlights: ['Kesar Angoori Petha', 'Hot Spongy Gulab Jamun', 'Pure Chenna Delicacy'],
    highlightsHi: ['केसर अंगूरी पेठा', 'मुलायम गुलाब जामुन', 'शुद्ध छेना मिठाई'],
    tags: ['Sweet Cravings', 'Local Confectioner', 'Takeaway']
  },
  // Tier 3: Hidden Gems
  {
    id: 'gw-food-9',
    name: 'Pandit Ji Ke Mangode (Patankar Bazaar)',
    hindiName: 'पंडित जी के कुरकुरे मंगोड़े',
    category: 'eating',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 25,
    distanceKm: 1.5,
    rating: 4.8,
    reviews: 1120,
    price: '₹50 / dona',
    priceHi: '₹50 प्रति दोना',
    hours: '03:00 PM - 09:00 PM',
    verified: true,
    verifiedBy: 'Secret Street Food Trail Guide',
    mapCoords: { x: 44, y: 72 },
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    description: 'Tucked inside the narrow heritage lanes of Patankar Bazaar. Piping hot, ultra-crunchy yellow moong-dal fritters served with tangy coriander-mint chutney and grated radish.',
    descriptionHi: 'पाटनकर बाज़ार की संकरी गलियों में मिलने वाले मूंग दाल के कुरकुरे मंगोड़े, तीखी हरी चटनी और कद्दूकस मूली के साथ।',
    highlights: ['Crispy Moong Dal Fritters', 'Spicy Mint Radish Salad', 'Chilly Evening Favorite'],
    highlightsHi: ['कुरकुरे मूंग दाल मंगोड़े', 'तीखी पुदीना चटनी', 'शाम का पसंदीदा स्नैक'],
    tags: ['Street Fritters', 'Hidden Alley', 'Authentic Taste']
  },
  {
    id: 'gw-food-10',
    name: 'Chhappan Bhog Kulhad Chai & Bun Maska (Hazira)',
    hindiName: 'छप्पन भोग कुल्हड़ चाय एवं बन मस्का',
    category: 'eating',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 20,
    distanceKm: 3.1,
    rating: 4.7,
    reviews: 950,
    price: '₹30 - ₹60',
    priceHi: '₹30 - ₹60',
    hours: '06:00 AM - 11:30 PM',
    verified: true,
    verifiedBy: 'Hazira Youth Food Club',
    mapCoords: { x: 68, y: 28 },
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    description: 'Clay-pot earthen kulhad tandoori chai infused with lemongrass and saffron, served with grilled pillowy pav spread generously with homemade white butter.',
    descriptionHi: 'मिट्टी के कुल्हड़ में तंदूरी चाय, केसर व लेमनग्रास की सौंधी महक और ताजा सफेद मक्खन से भरा मुलायम बन मस्का।',
    highlights: ['Smoky Tandoori Kulhad Chai', 'Warm Toasted Bun Maska', 'Night Gathering Spot'],
    highlightsHi: ['तंदूरी कुल्हड़ चाय', 'मक्खन बन मस्का', 'देर रात की बैठक'],
    tags: ['Chai Adda', 'Midnight Hangout', 'Soul Comfort']
  },
  {
    id: 'gw-food-11',
    name: 'Pancham Sweets — Royal Mawa Bati (Lashkar)',
    hindiName: 'पंचम स्वीट्स — प्रसिद्ध मावा बाटी',
    category: 'eating',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 20,
    distanceKm: 2.0,
    rating: 4.8,
    reviews: 790,
    price: '₹40 / piece',
    priceHi: '₹40 प्रति पीस',
    hours: '10:00 AM - 09:30 PM',
    verified: true,
    verifiedBy: 'Old Gwalior Food Historian',
    mapCoords: { x: 38, y: 66 },
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    description: 'A Madhya Pradesh royal specialty resembling a giant gulab jamun, stuffed with mawa, pistachio, almond, and cardamom paste, fried slowly to a dark mahogany brown.',
    descriptionHi: 'मध्य प्रदेश की पारंपरिक शाही मिठाई — मावा, काजू, पिस्ता और इलायची के मसाले से भरी धीमी आंच पर सिकी मावा बाटी।',
    highlights: ['Stuffed Dry Fruit Core', 'Thick Saffron Sugar Syrup', 'Rare Heritage Recipe'],
    highlightsHi: ['मेवा से भरा आंतरिक भाग', 'गाढ़ी केसर चाशनी', 'पारंपरिक शाही नुस्खा'],
    tags: ['Rare Royal Sweet', 'Deeply Decadent', 'Heritage Gourmet']
  },
  {
    id: 'gw-food-12',
    name: 'Anand Chaat Corner (Morar)',
    hindiName: 'आनंद चाट कार्नर (मुरार)',
    category: 'eating',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 25,
    distanceKm: 4.8,
    rating: 4.6,
    reviews: 870,
    price: '₹50 - ₹90 / person',
    priceHi: '₹50 - ₹90 प्रति व्यक्ति',
    hours: '04:00 PM - 10:00 PM',
    verified: true,
    verifiedBy: 'Morar Market Association',
    mapCoords: { x: 84, y: 52 },
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
    description: 'Famous among Morar cantonment locals for spicy pani puri with 6 distinct herb waters, crisp golden aloo tikki doused in sweet curd and sonth, and soft dahi vadas.',
    descriptionHi: 'मुरार का प्रसिद्ध चाट कोना — 6 प्रकार के सुगंधित पानी वाली पानी-पूरी, मीठे गाढ़े दही वाली आलू टिक्की व दही वड़ा।',
    highlights: ['6 Flavors of Golgappa Paani', 'Crispy Ghee Aloo Tikki', 'Velvety Sweet Curd'],
    highlightsHi: ['6 स्वादों का गोलगप्पा पानी', 'करारी घी आलू टिक्की', 'गाढ़ा मीठा दही'],
    tags: ['Chaat Craving', 'Local Secret', 'Flavor Blast']
  },

  // === SHOPPING / HANDLOOMS & BAZAARS ===
  // Tier 1: Iconic Bazaars
  {
    id: 'gw-shop-1',
    name: 'Maharaj Bada (Victoria Market & Central Hub)',
    hindiName: 'महाराज बाड़ा (ग्वालियर का भव्य चौक)',
    category: 'shopping',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Bazaar',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित बाज़ार',
    duration: 60,
    distanceKm: 1.3,
    rating: 4.9,
    reviews: 9140,
    price: 'Free Walk / Varies',
    priceHi: 'निःशुल्क भ्रमण',
    hours: '11:00 AM - 09:30 PM (Sun Market Vibrant)',
    verified: true,
    verifiedBy: 'Smart City Heritage Corridor',
    mapCoords: { x: 46, y: 64 },
    image: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=800&q=80',
    description: 'The spectacular beating heart of Gwalior. Surrounded by 7 distinct architectural style buildings (Roman, Greek, Victorian, Indo-Saracenic, Rajasthani, Maratha).',
    descriptionHi: 'ग्वालियर का हृदय स्थल! 7 अलग-अलग स्थापत्य शैलियों (रोमन, ग्रीक, विक्टोरियन, इंडो-सारसेनिक, राजपूताना, मराठा) की ऐतिहासिक इमारतों से घिरा बाज़ार।',
    highlights: ['7 Architectural Heritage Facades', 'Central Victoria Clock Tower', 'Pedestrian Promenade'],
    highlightsHi: ['7 स्थापत्य शैलियों की इमारतें', 'सेंट्रल विक्टोरिया क्लॉक टावर', 'पैदल हेरिटेज प्लाजा'],
    tags: ['Grand Piazza', 'Heritage Shopping', 'Must Experience']
  },
  {
    id: 'gw-shop-2',
    name: 'Mrignayani MP Govt Handloom Emporium',
    hindiName: 'मृगनयनी म.प्र. सरकारी हथकरघा एम्पोरियम',
    category: 'shopping',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Bazaar',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित बाज़ार',
    duration: 45,
    distanceKm: 2.0,
    rating: 4.8,
    reviews: 3120,
    price: '₹1,500 - ₹35,000',
    priceHi: '₹1,500 - ₹35,000',
    hours: '10:30 AM - 08:00 PM (Govt Timings)',
    verified: true,
    verifiedBy: 'MP Handloom & Handicrafts Corp',
    mapCoords: { x: 50, y: 52 },
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    description: 'State government certified emporium offering authentic GI-tagged Chanderi and Maheshwari silk-cotton sarees with pure zari borders, stoles, and Bagh prints.',
    descriptionHi: 'मध्य प्रदेश शासन का प्रमाणित एम्पोरियम। शुद्ध ज़री बॉर्डर वाली असली जीआई-टैग चंदेरी व महेश्वरी साड़ियां, दुपट्टे और हस्तशिल्प।',
    highlights: ['Govt Authenticity Certified', 'GI Tag Chanderi Silks', 'Hand-block Bagh Prints'],
    highlightsHi: ['सरकारी प्रामाणिकता गारंटी', 'जीआई टैग चंदेरी सिल्क', 'हैंड-ब्लॉक बाघ प्रिंट'],
    tags: ['Chanderi Sarees', 'Govt Verified', 'Pure Handloom']
  },
  {
    id: 'gw-shop-3',
    name: 'Sarafa Jewellery & Silver Bazaar',
    hindiName: 'सराफा चांदी एवं आभूषण बाज़ार',
    category: 'shopping',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Bazaar',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित बाज़ार',
    duration: 40,
    distanceKm: 1.5,
    rating: 4.7,
    reviews: 2680,
    price: 'Standard Bullion Rates',
    priceHi: 'मानक बुलियन दरें',
    hours: '11:00 AM - 08:30 PM (Sun Closed)',
    verified: true,
    verifiedBy: 'Gwalior Jewellers Guild',
    mapCoords: { x: 47, y: 68 },
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    description: 'Centuries-old market renowned for intricate hallmarked silver ornaments, antique tribal payals, temple filigree jewelry, and traditional royal Gwalior silverware.',
    descriptionHi: 'सदियों पुराना आभूषण बाज़ार जो हॉलमार्क चांदी की पायल, पारंपरिक मीनाकारी, कुंदन और राजसी पूजा बर्तनों के लिए प्रसिद्ध है।',
    highlights: ['Traditional Silver Payals', 'Royal Filigree Ornaments', 'Custom Master Goldsmiths'],
    highlightsHi: ['पारंपरिक चांदी की पायल', 'शाही जालीदार आभूषण', 'अनुभवी स्वर्णकार'],
    tags: ['Silver Art', 'Heirloom Jewelry', 'Old City Guild']
  },
  {
    id: 'gw-shop-4',
    name: 'Topi Bazaar (Royal Scindia Headgear & Ethnic Wear)',
    hindiName: 'टोपी बाज़ार (राजसी पगड़ी एवं पारंपरिक वस्त्र)',
    category: 'shopping',
    tier: 1,
    tierLabel: 'Tier 1: Iconic Bazaar',
    tierLabelHi: 'श्रेणी 1: प्रतिष्ठित बाज़ार',
    duration: 35,
    distanceKm: 1.4,
    rating: 4.6,
    reviews: 1940,
    price: '₹200 - ₹2,500',
    priceHi: '₹200 - ₹2,500',
    hours: '11:00 AM - 09:00 PM',
    verified: true,
    verifiedBy: 'Topi Bazaar Traders Council',
    mapCoords: { x: 44, y: 64 },
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    description: 'Historic bazaar where authentic Maratha-Scindia Shinde-shahi pagdis, royal ceremonial caps, bandhgalas, and embroidered sherwanis have been handcrafted for 200 years.',
    descriptionHi: '200 वर्ष पुराना बाज़ार जहाँ पारंपरिक शिंदे-शाही पगड़ियां, राजसी टोपियां, जोधपुरी बंदगला और पारंपरिक वस्त्र तैयार किए जाते हैं।',
    highlights: ['Shindeshahi Royal Pagdis', 'Hand-stitched Topis', 'Wedding Kurta Fabric'],
    highlightsHi: ['शिंदे-शाही राजसी पगड़ी', 'हस्त-निर्मित टोपियां', 'विवाह कुर्ता फैब्रिक'],
    tags: ['Royal Headgear', 'Maratha Attire', 'Centuries Old']
  },
  // Tier 2: Local Favorites
  {
    id: 'gw-shop-5',
    name: 'Morar Brassware & Artisan Market',
    hindiName: 'मुरार पीतल एवं हस्तशिल्प बाज़ार',
    category: 'shopping',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 45,
    distanceKm: 4.8,
    rating: 4.5,
    reviews: 1680,
    price: '₹300 - ₹5,000',
    priceHi: '₹300 - ₹5,000',
    hours: '11:00 AM - 09:00 PM (Tue Closed)',
    verified: true,
    verifiedBy: 'Morar Handicraft Trade Union',
    mapCoords: { x: 82, y: 50 },
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant local bazaar popular for polished brass puja lamps, traditional bronze cooking utensils (kansa), decorative bells, and hand-beaten copper vessels.',
    descriptionHi: 'पीतल के दीये, पारंपरिक कांसे के थाल व बर्तन, घंटियां और तांबे के हस्तशिल्प के लिए मुरार का प्रमुख बाज़ार।',
    highlights: ['Hand-Hammered Brass Diyas', 'Kansa Healing Cookware', 'Artisanal Bells'],
    highlightsHi: ['हस्तनिर्मित पीतल दीये', 'कांसे के पारंपरिक बर्तन', 'नक्काशीदार घंटियां'],
    tags: ['Metal Crafts', 'Local Price', 'Brass Wonders']
  },
  {
    id: 'gw-shop-6',
    name: 'Daulat Ganj Wholesale Spice & Dry Fruit Market',
    hindiName: 'दौलत गंज थोक मसाला एवं मेवा बाज़ार',
    category: 'shopping',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 35,
    distanceKm: 1.6,
    rating: 4.6,
    reviews: 2100,
    price: 'Wholesale Rates',
    priceHi: 'थोक बाज़ार दरें',
    hours: '10:00 AM - 08:30 PM',
    verified: true,
    verifiedBy: 'Daulat Ganj Vyapar Mandal',
    mapCoords: { x: 43, y: 61 },
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'A sensory whirlwind of whole stone-ground spices, fragrant Kashmiri saffron, Chambal mustard seeds, and mountain dry fruits at direct wholesale market prices.',
    descriptionHi: 'सीधे थोक भाव पर शुद्ध खड़े मसाले, चंबल की पीली सरसों, शुद्ध कश्मीरी केसर और मेवे का ऐतिहासिक बाज़ार।',
    highlights: ['Aromatic Whole Spices', 'Pure Kashmiri Saffron', 'Cold-pressed Mustard Oil'],
    highlightsHi: ['सुगंधित खड़े मसाले', 'शुद्ध कश्मीरी केसर', 'कच्ची घानी सरसों तेल'],
    tags: ['Spice Market', 'Fragrant Aisles', 'Wholesale Deals']
  },
  {
    id: 'gw-shop-7',
    name: 'Patankar Mojri & Leather Craft Street',
    hindiName: 'पाटनकर मोजड़ी एवं चमड़ा हस्तशिल्प गली',
    category: 'shopping',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 30,
    distanceKm: 1.5,
    rating: 4.7,
    reviews: 1780,
    price: '₹350 - ₹1,800',
    priceHi: '₹350 - ₹1,800',
    hours: '11:30 AM - 09:30 PM',
    verified: true,
    verifiedBy: 'Patankar Crafts Guild',
    mapCoords: { x: 45, y: 71 },
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    description: 'Specialized street filled with colorful handcrafted leather Mojris and Juttis embroidered with silk threads and golden tilla work, durable and regal in style.',
    descriptionHi: 'रेशम के धागों और सुनहरे तिल्ले की कशीदाकारी वाली चमड़े की राजसी मोजड़ियां और पारंपरिक जूतियों का प्रसिद्ध केंद्र।',
    highlights: ['Zari Embroidered Mojris', 'Pure Leather Juttis', 'Vibrant Bangles Alley'],
    highlightsHi: ['ज़री कढ़ाई मोजड़ियां', 'शुद्ध चमड़ा जूतियां', 'रंग-बिरंगी चूड़ी गली'],
    tags: ['Traditional Footwear', 'Handcrafted', 'Vibrant Colors']
  },
  {
    id: 'gw-shop-8',
    name: 'DB City Mall Gwalior',
    hindiName: 'डीबी सिटी मॉल ग्वालियर',
    category: 'shopping',
    tier: 2,
    tierLabel: 'Tier 2: Local Favorite',
    tierLabelHi: 'श्रेणी 2: स्थानीय पसंदीदा',
    duration: 60,
    distanceKm: 3.5,
    rating: 4.5,
    reviews: 5800,
    price: 'Modern Retail Prices',
    priceHi: 'आधुनिक रिटेल दरें',
    hours: '10:30 AM - 10:00 PM',
    verified: true,
    verifiedBy: 'Mall Management Authority',
    mapCoords: { x: 62, y: 44 },
    image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=800&q=80',
    description: 'The city’s premier contemporary shopping and entertainment complex with international retail brands, multiplex cinemas, hypermarkets, and food courts.',
    descriptionHi: 'ग्वालियर का आधुनिक शॉपिंग कॉम्प्लेक्स जिसमें राष्ट्रीय-अंतरराष्ट्रीय ब्रांड्स, मल्टीप्लेक्स सिनेमा और फूड कोर्ट शामिल हैं।',
    highlights: ['Air-Conditioned Comfort', 'Modern Retail Brands', 'Multiplex Cinema'],
    highlightsHi: ['वातानुकूलित परिसर', 'आधुनिक प्रमुख ब्रांड्स', 'मल्टीप्लेक्स सिनेमा'],
    tags: ['Modern Mall', 'Family Outing', 'Air-Conditioned']
  },
  // Tier 3: Hidden Gems
  {
    id: 'gw-shop-9',
    name: 'Chanderi Master Weaver Home Studios',
    hindiName: 'चंदेरी मास्टर बुनकर होम स्टूडियोज़',
    category: 'shopping',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 50,
    distanceKm: 5.2,
    rating: 4.9,
    reviews: 640,
    price: '₹2,200 - ₹28,000 (Direct Loom Price)',
    priceHi: '₹2,200 - ₹28,000 (सीधे करघे की दर)',
    hours: '10:00 AM - 06:00 PM (By Appointment / Walk-in)',
    verified: true,
    verifiedBy: 'National Handloom Awardee Guild',
    mapCoords: { x: 75, y: 18 },
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80',
    description: 'Hidden weaver colonies where 3rd-generation artisan families operate pit looms right inside their courtyards. Experience live warp and weft silk weaving and purchase directly with zero middlemen.',
    descriptionHi: 'पारंपरिक बुनकरों की बस्ती जहाँ तीसरी पीढ़ी के कारीगर करघे पर सीधे चंदेरी सिल्क साड़ियां बुनते हैं। बिना किसी बिचौलिये के सीधे खरीद का मौका।',
    highlights: ['Live Pit-Loom Demonstrations', 'Zero-Middleman Direct Buy', 'Custom Color Weaving'],
    highlightsHi: ['जीवंत करघा बुनाई दर्शन', 'बिचौलिया-मुक्त सीधी खरीद', 'मनपसंद रंगों का ताना-बाना'],
    tags: ['Artisan Direct', 'Rare Experience', 'Living Heritage']
  },
  {
    id: 'gw-shop-10',
    name: 'Gwalior Sandstone Carving Studio',
    hindiName: 'ग्वालियर बलुआ पत्थर तराश स्टूडियो',
    category: 'shopping',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 40,
    distanceKm: 3.9,
    rating: 4.8,
    reviews: 520,
    price: '₹150 - ₹12,000',
    priceHi: '₹150 - ₹12,000',
    hours: '09:30 AM - 06:30 PM',
    verified: true,
    verifiedBy: 'Stone Sculptor Cooperative',
    mapCoords: { x: 30, y: 38 },
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    description: 'Master sculptors hand-carving Gwalior’s famed white-ochre sandstone into intricate perforated jalis (lattice screens), miniature fort replicas, garden bird baths, and candle holders.',
    descriptionHi: 'ग्वालियर के हल्के पीले बलुआ पत्थर पर हाथ से तराशी गई जालियां, किले के लघु मॉडल और सुरुचिपूर्ण सजावटी कलाकृतियां।',
    highlights: ['Live Sandstone Carving', 'Intricate Jali Screens', 'Miniature Fort Keepsakes'],
    highlightsHi: ['जीवंत पत्थर नक्काशी', 'बारीक नक्काशीदार जालियां', 'किले के स्मृति चिन्ह'],
    tags: ['Stone Craft', 'Master Artisans', 'Unique Souvenir']
  },
  {
    id: 'gw-shop-11',
    name: 'Koteshwar Terracotta & Clay Pottery Hub',
    hindiName: 'कोटेश्वर टेराकोटा एवं मिट्टी शिल्प कुटीर',
    category: 'shopping',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 30,
    distanceKm: 3.1,
    rating: 4.7,
    reviews: 430,
    price: '₹50 - ₹800',
    priceHi: '₹50 - ₹800',
    hours: '08:00 AM - 07:00 PM',
    verified: true,
    verifiedBy: 'Khadi & Village Industries Board',
    mapCoords: { x: 58, y: 34 },
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    description: 'Generations of traditional potters shaping earthen matkas, decorative glazed planters, festival oil lamps (diyas), and organic clay cooking pots over wooden wheels.',
    descriptionHi: 'चाक पर मिट्टी को आकार देते कुम्हार — जैविक मिट्टी की हांडियां, नक्काशीदार दीये और सजावटी गमले।',
    highlights: ['Hands-on Potter’s Wheel', 'Organic Clay Cookware', 'Artistic Glazed Planters'],
    highlightsHi: ['कुम्हार के चाक का अनुभव', 'जैविक मिट्टी के बर्तन', 'सजावटी हस्तनिर्मित गमले'],
    tags: ['Pottery Lane', 'Eco-Friendly', 'Clay Art']
  },
  {
    id: 'gw-shop-12',
    name: 'Subhash Market Vintage Curios & Coins',
    hindiName: 'सुभाष मार्केट विंटेज सिक्के एवं प्राचीन वस्तुएं',
    category: 'shopping',
    tier: 3,
    tierLabel: 'Tier 3: Hidden Gem',
    tierLabelHi: 'श्रेणी 3: अनमोल छुपा रत्न',
    duration: 35,
    distanceKm: 1.7,
    rating: 4.6,
    reviews: 380,
    price: 'Varies by rarity',
    priceHi: 'दुर्लभता के अनुसार',
    hours: '12:00 PM - 08:30 PM (Sun Closed)',
    verified: true,
    verifiedBy: 'Numismatic & Antiquities Society',
    mapCoords: { x: 49, y: 63 },
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    description: 'Charming vintage stalls for collectors featuring rare Scindia state copper coins, brass pocket compasses, antique gramophone needles, and sepia postcards of 19th-century Gwalior.',
    descriptionHi: 'ऐतिहासिक सिंधिया रियासत के तांबे के सिक्के, पुराने पीतल के कंपास, 19वीं सदी के दुर्लभ पोस्टकार्ड और ग्रामोफोन संग्रह।',
    highlights: ['Historical Scindia Coins', 'Old Sepia Postcards', 'Vintage Brass Memorabilia'],
    highlightsHi: ['ऐतिहासिक सिंधिया रियासती सिक्के', 'पुराने दुर्लभ पोस्टकार्ड', 'विंटेज पीतल संग्रह'],
    tags: ['Antique Hunters', 'Collector Secret', 'Nostalgia']
  }
];

export default function App() {
  // Production Tab State ('dashboard' | 'explore' | 'route')
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals (Language & Auth)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Persistent Chatbot Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: getLocalizedWelcomeMessage('en'),
      textHi: 'नमस्ते! मैं तानसेन एआई हूँ, आपका ग्वालियर शाही धरोहर सलाहकार। मुझसे स्मारकों, खान-पान, चंदेरी साड़ियों या यात्रा योजना के बारे में पूछें!',
      timestamp: 'Just now',
      suggestions: ['What is famous in Bada?', 'Suggest food in 3 hours', 'Where to buy Chanderi sarees?'],
      suggestionsHi: ['बाड़ा में क्या प्रसिद्ध है?', '3 घंटे में खान-पान सुझाव दें', 'असली चंदेरी साड़ी कहाँ मिलेगी?']
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Dynamic Multi-Language State (31 Supported Languages)
  const [selectedLang, setSelectedLang] = useState('en');
  const selectedLanguage = selectedLang;
  const setSelectedLanguage = setSelectedLang;
  const [languageSearch, setLanguageSearch] = useState('');
  const [languageCategoryFilter, setLanguageCategoryFilter] = useState('all');

  // Filtered Languages for Modal
  const filteredLanguages = useMemo(() => {
    return LANGUAGES_LIST.filter(lang => {
      const matchesCategory = languageCategoryFilter === 'all' || lang.category === languageCategoryFilter;
      const matchesSearch = languageSearch.trim() === '' ||
        lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
        lang.native.toLowerCase().includes(languageSearch.toLowerCase()) ||
        lang.code.toLowerCase().includes(languageSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [languageSearch, languageCategoryFilter]);

  // Helper for dynamic translation
  const t = useCallback((key) => {
    const dict = TRANSLATIONS[selectedLanguage];
    if (dict && dict[key]) return dict[key];
    if (TRANSLATIONS.hi && (selectedLanguage === 'hi' || selectedLanguage === 'bundeli') && TRANSLATIONS.hi[key]) return TRANSLATIONS.hi[key];
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return key;
  }, [selectedLanguage]);

  // User State & Auth
  const [userAuth, setUserAuth] = useState({
    isLoggedIn: false,
    name: 'Royal Guest',
    nameHi: 'शाही अतिथि',
    email: 'guest@beyondthefort.in',
    isGuest: true
  });
  const [authMode, setAuthMode] = useState('signin');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoadingProvider, setAuthLoadingProvider] = useState(null);

  // Welcome Toast Notification State
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((toastData) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(toastData);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // Dashboard Filters & Reactive Time Budget State
  const [selectedHours, setSelectedHours] = useState(4);
  const [tourPace, setTourPace] = useState('balanced');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Tier Filter & Place Selection
  const [selectedTier, setSelectedTier] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaces, setSelectedPlaces] = useState([
    'gw-mon-1',
    'gw-food-1',
    'gw-shop-1'
  ]);
  const [spotDetailModal, setSpotDetailModal] = useState(null);

  // Map & Navigation States
  const [activeMapPin, setActiveMapPin] = useState('gw-mon-1');
  const [travelMode, setTravelMode] = useState('e-rickshaw');
  const [routeType, setRouteType] = useState('shortest');
  const [isNavSimulating, setIsNavSimulating] = useState(false);
  const [currentNavStep, setCurrentNavStep] = useState(0);
  const [mapLayer, setMapLayer] = useState('all');

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Derived filtered places for Explore screen
  const filteredPlaces = useMemo(() => {
    return GWALIOR_PLACES.filter(place => {
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
      const matchesTier = selectedTier === 0 || place.tier === selectedTier;
      const matchesSearch = searchQuery.trim() === '' || 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.hindiName.includes(searchQuery) ||
        place.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        place.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTier && matchesSearch;
    });
  }, [selectedCategory, selectedTier, searchQuery]);

  // Selected Place Objects & Stats (Recalculates route sequencing based on routeType)
  const selectedPlaceObjects = useMemo(() => {
    let places = GWALIOR_PLACES.filter(p => selectedPlaces.includes(p.id));
    if (routeType === 'shortest') {
      places = [...places].sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      places = [...places].sort((a, b) => (a.tier - b.tier) || (b.rating - a.rating));
    }
    return places;
  }, [selectedPlaces, routeType]);

  const itineraryStats = useMemo(() => {
    const paceTransit = tourPace === 'relaxed' ? 20 : tourPace === 'fast' ? 10 : 15;
    const modeMultiplier = travelMode === 'walking' ? 1.4 : travelMode === 'cab' ? 0.75 : 1.0;
    const effectiveTransitPerLeg = Math.round(paceTransit * modeMultiplier);
    const totalMinutes = selectedPlaceObjects.reduce((acc, p) => acc + p.duration, 0);
    const totalKm = selectedPlaceObjects.reduce((acc, p) => acc + p.distanceKm, 0);
    const transitMinutes = selectedPlaceObjects.length > 1 ? (selectedPlaceObjects.length - 1) * effectiveTransitPerLeg : 0;
    const grossMinutes = totalMinutes + transitMinutes;
    const grossHours = (grossMinutes / 60).toFixed(1);
    
    // Calculate how many of the selected spots fit within the active time budget
    let cumulativeMin = 0;
    let fittingSpotsCount = 0;
    for (let i = 0; i < selectedPlaceObjects.length; i++) {
      const p = selectedPlaceObjects[i];
      const transit = i > 0 ? effectiveTransitPerLeg : 0;
      if (cumulativeMin + p.duration + transit <= selectedHours * 60) {
        cumulativeMin += p.duration + transit;
        fittingSpotsCount++;
      } else {
        break;
      }
    }
    
    return {
      count: selectedPlaceObjects.length,
      fittingSpotsCount,
      totalMinutes,
      transitMinutes,
      grossMinutes,
      grossHours,
      totalKm: totalKm.toFixed(1),
      fitsBudget: grossMinutes <= selectedHours * 60,
      deficitHours: Math.max(0, parseFloat(((grossMinutes - selectedHours * 60) / 60).toFixed(1))).toFixed(1)
    };
  }, [selectedPlaceObjects, selectedHours, tourPace, travelMode]);

  const handleAutoFitPlaces = () => {
    const paceTransit = tourPace === 'relaxed' ? 20 : tourPace === 'fast' ? 10 : 15;
    const modeMultiplier = travelMode === 'walking' ? 1.4 : travelMode === 'cab' ? 0.75 : 1.0;
    const effectiveTransit = Math.round(paceTransit * modeMultiplier);
    const sorted = [...GWALIOR_PLACES].sort((a, b) => (a.tier - b.tier) || (b.rating - a.rating));
    const fitted = [];
    let currentMin = 0;
    for (const place of sorted) {
      const transit = fitted.length > 0 ? effectiveTransit : 0;
      if (currentMin + place.duration + transit <= selectedHours * 60) {
        fitted.push(place.id);
        currentMin += place.duration + transit;
      }
    }
    if (fitted.length > 0) {
      setSelectedPlaces(fitted);
    }
  };

  const togglePlaceSelection = (id) => {
    setSelectedPlaces(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Auth Handlers (OAuth & Email)
  const handleOAuthLogin = (provider) => {
    setAuthLoadingProvider(provider);
    setTimeout(() => {
      const profiles = {
        Google: {
          name: 'Priya Sharma (Google)',
          nameHi: 'प्रिया शर्मा (गूगल)',
          email: 'priya.sharma@gmail.com'
        },
        Facebook: {
          name: 'Rohit Verma (Facebook)',
          nameHi: 'रोहित वर्मा (फेसबुक)',
          email: 'rohit.verma@facebook.com'
        },
        Instagram: {
          name: 'Ananya Scindia (Instagram)',
          nameHi: 'अनन्या सिंधिया (इंस्टाग्राम)',
          email: 'ananya.travels@instagram.com'
        }
      };

      const profile = profiles[provider] || {
        name: `${provider} Traveler`,
        nameHi: `${provider} यात्री`,
        email: `traveler@${provider.toLowerCase()}.com`
      };

      setUserAuth({
        isLoggedIn: true,
        name: profile.name,
        nameHi: profile.nameHi,
        email: profile.email,
        isGuest: false,
        provider
      });

      setAuthLoadingProvider(null);
      setIsAuthModalOpen(false);
      setAuthError('');

      showToast({
        title: selectedLanguage === 'hi' ? `स्वागत है, ${profile.nameHi}!` : `Welcome, ${profile.name}!`,
        description: selectedLanguage === 'hi'
          ? `${provider} द्वारा सफलतापूर्वक लॉगिन किया गया। आपकी शाही ग्वालियर धरोहर यात्रा सक्रिय है!`
          : `Successfully authenticated via ${provider}. Your royal Gwalior pass is now active!`
      });
    }, 450);
  };

  const handleEmailAuth = (e) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Please fill in both email and password.');
      return;
    }
    const displayName = nameInput.trim() || 'Royal Explorer';
    setUserAuth({
      isLoggedIn: true,
      name: displayName,
      nameHi: displayName,
      email: emailInput,
      isGuest: false,
      provider: 'Email'
    });
    setAuthError('');
    setIsAuthModalOpen(false);

    showToast({
      title: selectedLanguage === 'hi' ? `नमस्ते, ${displayName}!` : `Welcome, ${displayName}!`,
      description: selectedLanguage === 'hi'
        ? `सफलतापूर्वक लॉगिन किया गया। आपकी ग्वालियर यात्रा शुरू हो चुकी है!`
        : `Signed in successfully! Your royal Gwalior heritage pass is now active.`
    });
  };

  const handleGuestLogin = () => {
    setUserAuth({
      isLoggedIn: true,
      name: 'Royal Guest',
      nameHi: 'शाही अतिथि',
      email: 'guest@beyondthefort.in',
      isGuest: true
    });
    setIsAuthModalOpen(false);
    showToast({
      title: selectedLanguage === 'hi' ? 'शाही अतिथि के रूप में स्वागत है!' : 'Welcome, Royal Guest!',
      description: selectedLanguage === 'hi'
        ? 'आप अतिथि के रूप में भ्रमण कर रहे हैं। सभी मार्ग व एआई सुविधाएँ सक्रिय हैं!'
        : 'Exploring as a guest. All routes and AI concierge features are active!'
    });
  };

  const handleSignOut = () => {
    setUserAuth({
      isLoggedIn: false,
      name: 'Royal Guest',
      nameHi: 'शाही अतिथि',
      email: 'guest@beyondthefort.in',
      isGuest: true
    });
    setIsAuthModalOpen(false);
    showToast({
      title: selectedLanguage === 'hi' ? 'लॉगआउट सफल' : 'Signed Out Successfully',
      description: selectedLanguage === 'hi'
        ? 'आप अतिथि मोड में वापस आ गए हैं।'
        : 'You have returned to guest mode.'
    });
  };

  // Chatbot Send Message Handler
  const handleSendChat = async (messageText) => {
    const query = messageText || chatInput;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsBotTyping(true);

    try {
      if (API_BASE_URL) {
        const res = await sendChatMessage(query, selectedLang);
        const replyText = res.reply || res.message || res.text;
        if (replyText) {
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'bot',
              text: replyText,
              source: res.source,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: res.suggestions || ['Tell me more', 'Plan my visit', 'Best food nearby']
            }
          ]);
          setIsBotTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[ChatBot] Live backend unavailable, using curated concierge:', err.message);
    }

    setTimeout(() => {
      // Pass the active selectedLang state into the AI prompt payload and generator
      const aiResponse = generateTansenAIResponse(query, selectedLang, {
        selectedHours,
        timeBudgetHours: selectedHours,
        tourPace,
        travelMode,
        routeType,
        selectedCategory,
        selectedPlacesCount: selectedPlaces.length
      });

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: aiResponse.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: aiResponse.suggestions,
          promptPayload: aiResponse.payload
        }
      ]);
      setIsBotTyping(false);
    }, 500);
  };

  // Step-by-Step Directions
  const navigationSteps = useMemo(() => {
    if (selectedPlaceObjects.length === 0) return [];
    
    const steps = [
      {
        id: 0,
        title: t('startLocationTitle'),
        instruction: t('startInstruction'),
        distance: '0.8 km',
        estTime: '4 mins',
        tip: t('startTip')
      }
    ];

    selectedPlaceObjects.forEach((place, index) => {
      const placeName = selectedLanguage === 'hi' ? place.hindiName : place.name;
      steps.push({
        id: index + 1,
        title: `${selectedLanguage === 'hi' ? 'पड़ाव' : 'Stop'} ${index + 1}: ${placeName}`,
        instruction: selectedLanguage === 'hi'
          ? `${placeName} पहुँचें। पर्यटक वाहन पार्किंग उपलब्ध। अनुशंसित भ्रमण समय: ${place.duration} मिनट।`
          : `Arrive at ${place.name}. Tourist parking available. Recommended duration: ${place.duration} mins.`,
        distance: `${place.distanceKm} km`,
        estTime: `${place.duration} mins`,
        placeRef: place,
        tip: selectedLanguage === 'hi'
          ? `विरासत टिप: ${place.highlightsHi[0]} यहाँ का मुख्य आकर्षण है। ${place.verifiedBy} द्वारा प्रमाणित।`
          : `Heritage Tip: ${place.highlights[0]} is a highlight here. Verified by ${place.verifiedBy}.`
      });
    });

    steps.push({
      id: steps.length,
      title: t('finishLocationTitle'),
      instruction: t('finishInstruction'),
      distance: '1.2 km',
      estTime: '10 mins',
      tip: t('finishTip')
    });

    return steps;
  }, [selectedPlaceObjects, selectedLanguage, t]);

  const toggleVoice = () => {
    setIsVoiceActive(prev => !prev);
    if (!isVoiceActive) {
      setTimeout(() => {
        const voiceQuery = selectedLanguage === 'hi'
          ? '3 घंटे में खान-पान सुझाव दें'
          : selectedLanguage === 'bundeli'
          ? '३ घंटा में खान-पान बताओ'
          : selectedLanguage === 'mr'
          ? '३ तासांत खाद्यसंस्कृती सुचवा'
          : selectedLanguage === 'es'
          ? 'Sugerir comida en 3 horas'
          : selectedLanguage === 'fr'
          ? 'Suggérer un repas en 3 heures'
          : selectedLanguage === 'de'
          ? 'Essen in 3 Stunden vorschlagen'
          : 'Suggest food in 3 hours';
        handleSendChat(voiceQuery);
        setIsVoiceActive(false);
      }, 1500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fdfbf7] flex flex-col text-[#2D241E] font-sans selection:bg-[#d4af37]/30 selection:text-[#8B0000]">
      
      {/* ======================================================== */}
      {/* 1. CLEAN PRODUCTION HEADER (STICKY & FLUID LAYOUT)       */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-50 w-full bg-[#350d0e]/95 backdrop-blur-md shadow-md border-b border-[#d4af37]/30">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="w-full flex items-center justify-between h-18">
            
            {/* Logo & Royal Crest */}
            <div 
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-linear-to-br from-[#8B0000] to-[#240809] border border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5D77F]" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-heritage text-base sm:text-xl font-bold tracking-tight text-[#F5D77F] truncate">
                    {t('brandTitle')}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#F5D77F] font-bold border border-[#D4AF37]/40">
                    Gwalior
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 hidden sm:block truncate">
                  {t('cityTagline')}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links (Clean Production Bar) */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#240809]/80 p-1.5 rounded-full border border-[#D4AF37]/40 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#D4AF37] text-[#350d0e] font-bold shadow-xs'
                    : 'text-stone-300 hover:text-[#F5D77F] hover:bg-white/10'
                }`}
              >
                {t('navDashboard')}
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  activeTab === 'explore'
                    ? 'bg-[#D4AF37] text-[#350d0e] font-bold shadow-xs'
                    : 'text-stone-300 hover:text-[#F5D77F] hover:bg-white/10'
                }`}
              >
                {t('navExplore')}
              </button>
              <button
                onClick={() => setActiveTab('route')}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${
                  activeTab === 'route'
                    ? 'bg-[#D4AF37] text-[#350d0e] font-bold shadow-xs'
                    : 'text-stone-300 hover:text-[#F5D77F] hover:bg-white/10'
                }`}
              >
                {t('navMap')}
              </button>
            </nav>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Dynamic Language Modal Button (31 Languages) */}
              <button
                onClick={() => {
                  setLanguageSearch('');
                  setIsLanguageModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#240809]/80 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-xs font-bold text-[#F5D77F] transition-colors shadow-2xs"
                title="Select Language (31 Languages Available)"
              >
                <span className="text-sm leading-none">{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.flag || '🌐'}</span>
                <span className="font-semibold">{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native || 'English'}</span>
              </button>

              {/* Active Route Pill */}
              <button
                onClick={() => setActiveTab('route')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#240809]/80 hover:bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/40 text-xs font-semibold transition-colors"
                title="View Itinerary"
              >
                <Route className="w-3.5 h-3.5 text-[#F5D77F]" />
                <span className="hidden sm:inline">{t('routeBadge')}:</span>
                <span className="bg-[#D4AF37] text-[#350d0e] px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {selectedPlaces.length}
                </span>
              </button>

              {/* User Account / Pass Button */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#240809]/80 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-semibold text-[#F5D77F] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="truncate max-w-[110px]">
                  {userAuth.isLoggedIn ? (selectedLanguage === 'hi' ? userAuth.nameHi : userAuth.name) : t('navAccount')}
                </span>
              </button>

              {/* Chatbot Header Button */}
              <button
                onClick={() => setIsChatOpen(prev => !prev)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-[#8B0000] to-[#AA820A] border border-[#D4AF37]/50 text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
                <span className="hidden sm:inline">{t('tansenAI')}</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5D77F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              </button>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                className="md:hidden p-2 rounded-xl bg-[#240809]/80 border border-[#D4AF37]/40 text-[#F5D77F]"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Navbar */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#350d0e] border-t border-[#D4AF37]/40 px-4 py-3 space-y-2 shadow-2xl">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#D4AF37] text-[#350d0e]' : 'text-stone-200 hover:bg-[#240809] hover:text-[#F5D77F]'
              }`}
            >
              {t('navDashboard')}
            </button>
            <button
              onClick={() => {
                setActiveTab('explore');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'explore' ? 'bg-[#D4AF37] text-[#350d0e]' : 'text-stone-200 hover:bg-[#240809] hover:text-[#F5D77F]'
              }`}
            >
              {t('navExplore')}
            </button>
            <button
              onClick={() => {
                setActiveTab('route');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'route' ? 'bg-[#D4AF37] text-[#350d0e]' : 'text-stone-200 hover:bg-[#240809] hover:text-[#F5D77F]'
              }`}
            >
              {t('navMap')}
            </button>
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#F5D77F] bg-[#240809] border border-[#D4AF37]/30 flex items-center justify-between"
            >
              <span>{userAuth.isLoggedIn ? (selectedLanguage === 'hi' ? userAuth.nameHi : userAuth.name) : t('navAccount')}</span>
              <User className="w-4 h-4 text-[#D4AF37]" />
            </button>
            <button
              onClick={() => {
                setLanguageSearch('');
                setIsLanguageModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#F5D77F] bg-[#240809] border border-[#D4AF37]/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.flag || '🌐'}</span>
                <span>{t('selectLangTitle')} ({LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native || 'English'})</span>
              </div>
              <Globe className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTAINER (FULLY FLUID & RESPONSIVE LAYOUT)         */}
      {/* ======================================================== */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* ======================================================== */}
        {/* VIEW 1: DASHBOARD (HOME)                                */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="w-full space-y-6 sm:space-y-8">
            
            {/* Royal Cultural Welcome Card */}
            <div className="w-full relative rounded-2xl overflow-hidden border border-[#D4AF37]/50 shadow-xl bg-linear-to-r from-[#8B0000] via-[#750000] to-[#500000] text-white p-4 sm:p-8">
              <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-8 pointer-events-none">
                <Landmark className="w-80 h-80 text-[#D4AF37]" />
              </div>
              
              <div className="relative z-10 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#5E0000] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Music className="w-3.5 h-3.5" /> {t('unescoBadge')}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-stone-200 text-xs border border-white/20">
                    {t('stateBadge')}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[#F5D77F] text-xs border border-[#D4AF37]/30">
                    {t('weatherBadge')}
                  </span>
                </div>

                <h1 className="font-heritage text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 leading-tight">
                  {t('welcomeTitle')}
                </h1>
                <h2 className="font-heritage text-base sm:text-2xl text-[#F5D77F] font-medium mb-3">
                  "{t('welcomeSubtitle')}"
                </h2>
                <p className="text-stone-200 text-xs sm:text-sm leading-relaxed w-full mb-6">
                  {t('welcomeDescription')}
                </p>

                {/* Quick Traveler Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-[#5E0000] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-[#5E0000]" />
                    <span>{t('exploreBtn')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('route')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/25 transition-all flex items-center gap-2"
                  >
                    <Route className="w-4 h-4 text-[#F5D77F]" />
                    <span>{t('viewRouteBtn')} ({selectedPlaces.length})</span>
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-[#F5D77F] font-semibold text-xs border border-[#D4AF37]/40 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('askAIBtn')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Time-Budget Input Section */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#D4AF37]/40 shadow-xs">
              <div className="w-full mb-6 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-[#8B0000]" />
                  <h3 className="font-heritage text-lg sm:text-xl font-bold text-[#8B0000]">
                    {t('timePlannerTitle')}
                  </h3>
                </div>
                <p className="text-xs text-[#6B5E55]">
                  {t('timePlannerDesc')}
                </p>
              </div>

              {/* Slider & Visual Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
                {/* Left Column: Interactive slider & quick-select preset buttons */}
                <div className="w-full lg:col-span-7 space-y-5">
                  {/* Quick-Select Buttons / Preset Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#6B5E55] uppercase tracking-wider">
                        {selectedLanguage === 'hi' ? 'त्वरित समय विकल्प' : 'Quick Presets'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {selectedLanguage === 'hi' ? 'समय सीमा चुनें' : 'Choose tour duration'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { hrs: 2, labelKey: 'preset2h', fallback: '2 Hours' },
                        { hrs: 3, labelKey: 'preset3h', fallback: '3 Hours' },
                        { hrs: 5, labelKey: 'preset5h', fallback: '5 Hours' },
                        { hrs: 8, labelKey: 'preset8h', fallback: '8 Hours' }
                      ].map(preset => {
                        const isSelected = Number(selectedHours) === preset.hrs;
                        return (
                          <button
                            key={preset.hrs}
                            type="button"
                            onClick={() => setSelectedHours(preset.hrs)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-center cursor-pointer border ${
                              isSelected
                                ? 'bg-[#8B0000] text-white border-[#8B0000] shadow-sm ring-2 ring-[#D4AF37]/50'
                                : 'bg-[#FDFBF7] text-[#6B5E55] border-[#E8DFC8] hover:bg-[#D4AF37]/15 hover:text-[#8B0000] hover:border-[#D4AF37]/50'
                            }`}
                          >
                            {t(preset.labelKey) || preset.fallback}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Range Slider */}
                  <div className="space-y-3 pt-1">
                    <div className="w-full flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#6B5E55]">{t('hoursAvailable')}:</span>
                      <span className="text-base font-bold text-[#8B0000] bg-[#8B0000]/10 px-3.5 py-1 rounded-full border border-[#8B0000]/20 shadow-2xs">
                        {selectedHours} {selectedLanguage === 'hi' ? 'घंटे उपलब्ध' : 'Hours Available'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={selectedHours}
                      onChange={(e) => setSelectedHours(parseFloat(e.target.value) || 1)}
                      onInput={(e) => setSelectedHours(parseFloat(e.target.value) || 1)}
                      aria-label="Time Budget in Hours"
                      className="w-full h-2.5 bg-[#E8DFC8] rounded-lg appearance-none cursor-pointer accent-[#8B0000]"
                    />

                    <div className="flex justify-between text-[11px] text-stone-400 font-medium px-0.5">
                      <span>1h ({t('fast')})</span>
                      <span>4h ({t('balanced')})</span>
                      <span>8h ({t('preset8h') ? t('preset8h').split(' ')[0] + 'h' : '8h'})</span>
                      <span>10h+</span>
                    </div>
                  </div>

                  {/* Pace Selector */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                    <span className="text-xs font-semibold text-stone-600 mr-1">{t('travelPace')}</span>
                    {[
                      { key: 'relaxed', labelKey: 'relaxed' },
                      { key: 'balanced', labelKey: 'balanced' },
                      { key: 'fast', labelKey: 'fast' }
                    ].map(pace => (
                      <button
                        key={pace.key}
                        type="button"
                        onClick={() => setTourPace(pace.key)}
                        className={`text-xs px-3 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                          tourPace === pace.key
                            ? 'bg-[#AA820A] text-white font-bold shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {t(pace.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column: Itinerary Feasibility Card */}
                <div className="w-full lg:col-span-5 bg-[#FDFBF7] p-5 sm:p-6 rounded-xl border border-[#D4AF37]/40 shadow-xs space-y-3.5">
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-bold text-[#8B0000] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-[#8B0000]" />
                      {t('itineraryFeasibility')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase ${
                      itineraryStats.fitsBudget
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {itineraryStats.fitsBudget ? `✓ ${t('fitsBudget')}` : `+${itineraryStats.deficitHours}h ${t('overBudget')}`}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-[#2D241E]">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6B5E55]">{t('selectedPlacesLabel')}</span>
                      <span className="font-semibold text-stone-800">
                        {itineraryStats.count} {selectedLanguage === 'hi' ? 'स्थान' : 'spots'}
                        {itineraryStats.count > 0 && !itineraryStats.fitsBudget && (
                          <span className="ml-1.5 text-[10px] text-amber-700 font-medium">
                            ({itineraryStats.fittingSpotsCount} {selectedLanguage === 'hi' ? 'समय में' : 'fit budget'})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6B5E55]">{t('explorationTime')}</span>
                      <span className="font-semibold text-stone-800">{itineraryStats.totalMinutes} mins</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6B5E55]">{t('transitBuffer')}</span>
                      <span className="font-semibold text-stone-800">~{itineraryStats.transitMinutes} mins</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#E8DFC8] font-bold text-sm text-[#8B0000]">
                      <span>{t('totalDuration')}</span>
                      <span>{itineraryStats.grossHours} {selectedLanguage === 'hi' ? 'घंटे' : 'Hours'}</span>
                    </div>
                  </div>

                  {/* Auto-Fit / Optimize Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAutoFitPlaces}
                      className="w-full py-2 px-3 rounded-xl bg-linear-to-r from-[#D4AF37]/20 via-[#D4AF37]/30 to-[#D4AF37]/20 hover:from-[#D4AF37]/35 hover:to-[#D4AF37]/35 text-[#8B0000] border border-[#D4AF37]/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8B0000]" />
                      <span>
                        {selectedLanguage === 'hi'
                          ? `${selectedHours} घंटे के अनुसार स्थल अनुकूलित करें`
                          : `Auto-Fit Spots to ${selectedHours}h Budget`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Category Selector: 3 Prominent Cards */}
            <div className="w-full">
              <div className="mb-4">
                <h3 className="font-heritage text-xl sm:text-2xl font-bold text-[#8B0000]">
                  {t('categoriesTitle')}
                </h3>
                <p className="text-xs text-[#6B5E55]">
                  {t('categoriesSubtitle')}
                </p>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* 1. Sightseeing Card */}
                <div
                  onClick={() => {
                    setSelectedCategory('sightseeing');
                    setActiveTab('explore');
                  }}
                  className="w-full group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white border-[#E8DFC8] hover:border-[#D4AF37]"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1599831104325-508b98453e92?auto=format&fit=crop&w=800&q=80"
                      alt="Gwalior Sightseeing"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 bg-[#8B0000] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D4AF37]">
                      {t('catSightseeingCount')}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <Landmark className="w-5 h-5 text-[#D4AF37]" />
                        <h4 className="font-heritage text-lg font-bold">{t('catSightseeing')}</h4>
                      </div>
                      <p className="text-[11px] text-stone-200">
                        {t('catSightseeingSub')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-[#6B5E55] line-clamp-2">
                      {t('catSightseeingDesc')}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-semibold text-[#8B0000]">
                      <span>{t('browseSpots')}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* 2. Eating / Food Card */}
                <div
                  onClick={() => {
                    setSelectedCategory('eating');
                    setActiveTab('explore');
                  }}
                  className="w-full group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white border-[#E8DFC8] hover:border-[#D4AF37]"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
                      alt="Gwalior Delicacies"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 bg-[#AA820A] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#F5D77F]">
                      {t('catEatingCount')}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <UtensilsCrossed className="w-5 h-5 text-[#F5D77F]" />
                        <h4 className="font-heritage text-lg font-bold">{t('catEating')}</h4>
                      </div>
                      <p className="text-[11px] text-stone-200">
                        {t('catEatingSub')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-[#6B5E55] line-clamp-2">
                      {t('catEatingDesc')}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-semibold text-[#8B0000]">
                      <span>{t('browseSpots')}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* 3. Shopping Card */}
                <div
                  onClick={() => {
                    setSelectedCategory('shopping');
                    setActiveTab('explore');
                  }}
                  className="w-full group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:shadow-xl bg-white border-[#E8DFC8] hover:border-[#D4AF37]"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                      alt="Gwalior Handlooms"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 bg-[#5E0000] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D4AF37]">
                      {t('catShoppingCount')}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                        <h4 className="font-heritage text-lg font-bold">{t('catShopping')}</h4>
                      </div>
                      <p className="text-[11px] text-stone-200">
                        {t('catShoppingSub')}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-[#6B5E55] line-clamp-2">
                      {t('catShoppingDesc')}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-semibold text-[#8B0000]">
                      <span>{t('browseSpots')}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: EXPLORE SPOTS (TIERS & FILTERS)                  */}
        {/* ======================================================== */}
        {activeTab === 'explore' && (
          <div className="w-full space-y-6">
            
            {/* Filter Bar: Search + Category Pills + Tier Tabs */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 border border-[#D4AF37]/40 shadow-xs space-y-4">
              <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heritage text-xl sm:text-2xl font-bold text-[#8B0000]">
                    {t('explorerTitle')}
                  </h2>
                  <p className="text-xs text-[#6B5E55]">
                    {t('explorerSubtitle')}
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] bg-[#FDFBF7]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'all', label: t('allCategories') },
                  { key: 'sightseeing', label: t('catSightseeing') },
                  { key: 'eating', label: t('catEating') },
                  { key: 'shopping', label: t('catShopping') }
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all font-semibold ${
                      selectedCategory === cat.key
                        ? 'bg-[#8B0000] text-white shadow-xs'
                        : 'bg-[#F5EFE6] text-[#6B5E55] hover:bg-[#D4AF37]/20 hover:text-[#8B0000]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 3 Tier Tabs */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200">
                <button
                  onClick={() => setSelectedTier(1)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedTier === 1
                      ? 'border-[#8B0000] bg-[#8B0000]/5 shadow-xs ring-1 ring-[#D4AF37]'
                      : 'border-stone-200 hover:border-[#D4AF37] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heritage text-sm font-bold text-[#8B0000]">
                      {t('tier1Title')}
                    </span>
                    <span className="text-[10px] bg-[#8B0000] text-white px-2 py-0.5 rounded-full font-bold">
                      {t('tier1Badge')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B5E55]">
                    {t('tier1Desc')}
                  </p>
                </button>

                <button
                  onClick={() => setSelectedTier(2)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedTier === 2
                      ? 'border-[#AA820A] bg-[#AA820A]/5 shadow-xs ring-1 ring-[#AA820A]'
                      : 'border-stone-200 hover:border-[#D4AF37] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heritage text-sm font-bold text-[#AA820A]">
                      {t('tier2Title')}
                    </span>
                    <span className="text-[10px] bg-[#AA820A] text-white px-2 py-0.5 rounded-full font-bold">
                      {t('tier2Badge')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B5E55]">
                    {t('tier2Desc')}
                  </p>
                </button>

                <button
                  onClick={() => setSelectedTier(3)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedTier === 3
                      ? 'border-[#5E0000] bg-[#5E0000]/5 shadow-xs ring-1 ring-[#5E0000]'
                      : 'border-stone-200 hover:border-[#D4AF37] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heritage text-sm font-bold text-[#5E0000]">
                      {t('tier3Title')}
                    </span>
                    <span className="text-[10px] bg-stone-700 text-white px-2 py-0.5 rounded-full font-bold">
                      {t('tier3Badge')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B5E55]">
                    {t('tier3Desc')}
                  </p>
                </button>
              </div>
            </div>

            {/* Places Grid (Fluid Responsive) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredPlaces.map(place => {
                const isSelected = selectedPlaces.includes(place.id);
                const titleText = selectedLanguage === 'hi' ? place.hindiName : place.name;
                const subTitleText = selectedLanguage === 'hi' ? place.name : place.hindiName;
                const descText = selectedLanguage === 'hi' ? place.descriptionHi : place.description;
                const priceText = selectedLanguage === 'hi' ? place.priceHi : place.price;
                const tierBadgeText = selectedLanguage === 'hi' ? place.tierLabelHi : place.tierLabel;

                return (
                  <div
                    key={place.id}
                    className={`w-full rounded-2xl overflow-hidden border-2 transition-all duration-200 flex flex-col justify-between bg-white ${
                      isSelected
                        ? 'border-[#8B0000] shadow-md ring-2 ring-[#D4AF37]/50'
                        : 'border-[#E8DFC8] hover:border-[#D4AF37] shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Image Header with Badges */}
                      <div className="h-48 relative overflow-hidden group">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#D4AF37]" />
                            {place.distanceKm} km {t('away')}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#5E0000] text-[10px] font-bold">
                            {tierBadgeText.split(':')[0]}
                          </span>
                        </div>

                        {/* Verified Badge */}
                        {place.verified && (
                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-200 border border-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-300" />
                            <span>{t('verified')}</span>
                          </div>
                        )}

                        {/* Bottom Duration & Price */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs text-[11px]">
                            <Clock className="w-3 h-3 text-[#F5D77F]" />
                            ~{place.duration}m {t('visit')}
                          </span>
                          <span className="font-semibold text-[#F5D77F] bg-black/60 px-2 py-0.5 rounded-full text-[11px]">
                            {priceText}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-heritage text-base font-bold text-[#8B0000] leading-snug">
                            {titleText}
                          </h3>
                          <p className="text-xs text-[#AA820A] font-medium">
                            {subTitleText}
                          </p>
                        </div>

                        <p className="text-xs text-[#6B5E55] line-clamp-2 leading-relaxed">
                          {descText}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{t('source')}: {place.verifiedBy}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(selectedLanguage === 'hi' ? place.highlightsHi : place.highlights).slice(0, 2).map((h, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-[#F5EFE6] text-[#2D241E] font-medium"
                            >
                              ★ {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => setSpotDetailModal(place)}
                        className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('details')}</span>
                      </button>

                      <button
                        onClick={() => togglePlaceSelection(place.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#8B0000] text-white shadow-xs'
                            : 'bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#8B0000] border border-[#D4AF37]/60'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{t('inItinerary')}</span>
                          </>
                        ) : (
                          <span>{t('addToRoute')}</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Bottom Summary Bar */}
            <div className="sticky bottom-4 z-30 bg-[#8B0000] text-white rounded-2xl p-4 shadow-xl border border-[#D4AF37] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#5E0000] flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedPlaces.length}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#F5D77F]">
                    {selectedPlaces.length} {t('placesSelected')}
                  </div>
                  <div className="text-stone-200 text-xs">
                    {t('totalDuration')} <span className="font-semibold text-white">{itineraryStats.grossHours}h</span> ({itineraryStats.totalKm} km)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedPlaces([])}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-stone-200 transition-colors"
                >
                  {t('clearAll')}
                </button>
                <button
                  onClick={() => setActiveTab('route')}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-[#5E0000] font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('generateRoute')}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: IN-APP ROUTE & NAVIGATION (EMBEDDED MAP)        */}
        {/* ======================================================== */}
        {activeTab === 'route' && (
          <div className="w-full space-y-6">
            
            {/* Header with Mode Controls */}
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#D4AF37]/40 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#8B0000]" />
                  <h2 className="font-heritage text-xl sm:text-2xl font-bold text-[#8B0000]">
                    {t('mapTitle')}
                  </h2>
                </div>
                <p className="text-xs text-[#6B5E55]">
                  {t('mapSubtitle')}
                </p>
              </div>

              {/* Mode & Optimization Controls */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="flex items-center bg-[#F5EFE6] p-1 rounded-xl border border-[#D4AF37]/30">
                  {[
                    { mode: 'e-rickshaw', label: 'E-Rickshaw', icon: Car },
                    { mode: 'walking', label: 'Walking', icon: Footprints },
                    { mode: 'cab', label: 'Cab', icon: Car }
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.mode}
                        onClick={() => setTravelMode(item.mode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                          travelMode === item.mode
                            ? 'bg-[#8B0000] text-white shadow-xs'
                            : 'text-[#6B5E55] hover:text-[#8B0000]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setRouteType(routeType === 'shortest' ? 'scenic' : 'shortest')}
                  className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#8B0000] border border-[#D4AF37]/50 font-bold transition-colors cursor-pointer"
                >
                  {routeType === 'shortest' ? t('shortestPath') : t('scenicPath')}
                </button>

                {/* Route Time-Budget Sync & Re-calculate */}
                <div className="flex items-center gap-1.5 pl-1 sm:border-l sm:border-stone-200">
                  <span className="px-2.5 py-1 rounded-lg bg-[#8B0000]/10 text-[#8B0000] font-bold text-xs flex items-center gap-1 border border-[#8B0000]/20">
                    <Clock className="w-3.5 h-3.5 text-[#8B0000]" />
                    <span>{selectedHours}h Budget</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFitPlaces}
                    className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/25 hover:bg-[#D4AF37]/40 text-[#8B0000] border border-[#D4AF37]/60 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                    title={`Recalculate route for ${selectedHours} hours`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#8B0000]" />
                    <span>{selectedLanguage === 'hi' ? `${selectedHours}h अनुकूलन` : `Fit ${selectedHours}h`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Interactive Map Layout: Two Columns (Map View + Directions) */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              
              {/* Left Column (7 Cols): Embedded Simulated Map View */}
              <div className="w-full lg:col-span-7 space-y-4">
                <div className="w-full bg-white rounded-2xl border border-[#D4AF37]/50 shadow-md p-3 relative overflow-hidden">
                  
                  {/* Map Header */}
                  <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-stone-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-stone-700">GPS Live: Gwalior Heritage Grid</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <Layers className="w-3.5 h-3.5 text-stone-400" />
                      <select
                        value={mapLayer}
                        onChange={(e) => setMapLayer(e.target.value)}
                        className="bg-stone-50 border border-stone-300 rounded-lg px-2 py-0.5 text-xs text-stone-700"
                      >
                        <option value="all">{t('allLayers')}</option>
                        <option value="sightseeing">{t('monumentsOnly')}</option>
                        <option value="eating">{t('foodOnly')}</option>
                        <option value="shopping">{t('shoppingOnly')}</option>
                      </select>
                    </div>
                  </div>

                  {/* SVG / Vector Canvas Map */}
                  <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-[#FAF6EE] rounded-xl overflow-hidden border border-[#D4AF37]/30 my-2 select-none shadow-inner">
                    <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id="heritageGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E6DAC4" strokeWidth="0.4" />
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#heritageGrid)" />

                      {/* Gwalior Fort Ridge */}
                      <path
                        d="M 32 18 Q 44 14 54 22 L 52 38 Q 44 42 36 34 Z"
                        fill="#E0D2BC"
                        stroke="#C4AF8E"
                        strokeWidth="0.8"
                      />
                      <text x="38" y="27" fontSize="2.2" fill="#8B7355" fontWeight="bold">
                        Gwalior Fort Plateau
                      </text>

                      {/* Phool Bagh */}
                      <ellipse cx="52" cy="52" rx="10" ry="6" fill="#DCE7D6" stroke="#BACDB2" strokeWidth="0.5" />
                      <text x="47" y="52" fontSize="1.8" fill="#5F7D53" fontWeight="bold">Phool Bagh</text>

                      {/* Major Roads */}
                      <path d="M 75 38 Q 62 46 46 64" fill="none" stroke="#D5C5A8" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M 46 64 Q 40 50 38 26" fill="none" stroke="#D5C5A8" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M 44 24 Q 56 16 70 22" fill="none" stroke="#D5C5A8" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M 46 64 Q 65 60 84 50" fill="none" stroke="#D5C5A8" strokeWidth="1.4" strokeLinecap="round" />

                      {/* Route Path */}
                      {selectedPlaceObjects.length > 0 && (
                        <path
                          d={`M 75 38 ${selectedPlaceObjects.map(p => `L ${p.mapCoords.x} ${p.mapCoords.y}`).join(' ')}`}
                          fill="none"
                          stroke="#8B0000"
                          strokeWidth="1.2"
                          strokeDasharray="2 1.5"
                          className="animate-pulse"
                        />
                      )}
                    </svg>

                    {/* User Pin at Station */}
                    <div 
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{ left: '75%', top: '38%' }}
                      onClick={() => setActiveMapPin('gw-start')}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-60"></span>
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                          <Navigation className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                        You are here (Station)
                      </div>
                    </div>

                    {/* Landmark Pins */}
                    {selectedPlaceObjects.map((place, idx) => {
                      const isActive = activeMapPin === place.id;
                      const pinColor = place.category === 'sightseeing'
                        ? 'bg-[#8B0000]'
                        : place.category === 'eating'
                        ? 'bg-[#AA820A]'
                        : 'bg-[#5E0000]';

                      return (
                        <div
                          key={place.id}
                          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                          style={{ left: `${place.mapCoords.x}%`, top: `${place.mapCoords.y}%` }}
                          onClick={() => setActiveMapPin(place.id)}
                        >
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-[11px] shadow-lg border-2 border-[#D4AF37] ${pinColor} ${
                            isActive ? 'ring-4 ring-[#D4AF37] scale-110' : ''
                          }`}>
                            {idx + 1}
                          </div>
                          
                          <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FDFBF7] text-[#8B0000] border border-[#D4AF37] text-[9px] font-bold px-1.5 py-0.2 rounded shadow-md pointer-events-none">
                            {(selectedLanguage === 'hi' ? place.hindiName : place.name).split(' ')[0]}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Pin Focus Preview */}
                  {(() => {
                    const focusedPlace = GWALIOR_PLACES.find(p => p.id === activeMapPin);
                    if (!focusedPlace) return null;
                    const placeTitle = selectedLanguage === 'hi' ? focusedPlace.hindiName : focusedPlace.name;
                    const placePrice = selectedLanguage === 'hi' ? focusedPlace.priceHi : focusedPlace.price;

                    return (
                      <div className="mt-2 p-3 rounded-xl bg-[#FDFBF7] border border-[#D4AF37]/50 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={focusedPlace.image}
                            alt={focusedPlace.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[#D4AF37]/40 shrink-0"
                          />
                          <div>
                            <div className="font-heritage font-bold text-[#8B0000]">
                              {placeTitle}
                            </div>
                            <div className="text-[11px] text-[#6B5E55]">
                              {focusedPlace.distanceKm} km {t('away')} • ~{focusedPlace.duration}m {t('visit')} • {placePrice}
                            </div>
                            <div className="text-[10px] text-emerald-800 font-medium">
                              ✓ {t('verified')}: {focusedPlace.verifiedBy}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSpotDetailModal(focusedPlace)}
                          className="px-3 py-1.5 rounded-lg bg-[#8B0000] text-white font-semibold text-xs whitespace-nowrap"
                        >
                          {t('details')}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Map Metrics */}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-stone-200 text-center text-xs">
                    <div className="p-2 rounded-lg bg-stone-50">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">{t('totalRoute')}</div>
                      <div className="font-bold text-[#8B0000]">{itineraryStats.totalKm} KM</div>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">{t('estimatedTime')}</div>
                      <div className="font-bold text-[#8B0000]">{itineraryStats.grossHours} Hours</div>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">{t('safetyScore')}</div>
                      <div className="font-bold text-emerald-700">{t('policedCorridor')}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-50">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">{t('travelModeLabel')}</div>
                      <div className="font-bold capitalize text-[#AA820A]">{travelMode}</div>
                    </div>
                  </div>
                </div>

                {/* Simulation Control */}
                <div className="w-full bg-[#F5EFE6] rounded-xl p-3 border border-[#D4AF37]/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${isNavSimulating ? 'text-red-600 animate-pulse' : 'text-stone-400'}`} />
                    <span className="font-bold text-[#8B0000]">
                      {isNavSimulating ? 'Live Guidance Simulation Active' : 'Simulation Mode:'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsNavSimulating(prev => !prev);
                      if (!isNavSimulating) setCurrentNavStep(1);
                    }}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-colors ${
                      isNavSimulating
                        ? 'bg-red-700 text-white hover:bg-red-800'
                        : 'bg-[#8B0000] text-white hover:bg-[#700000]'
                    }`}
                  >
                    {isNavSimulating ? t('stopSimulation') : t('startSimulation')}
                  </button>
                </div>
              </div>

              {/* Right Column (5 Cols): Step-by-Step Directions */}
              <div className="w-full lg:col-span-5 bg-white rounded-2xl border border-[#D4AF37]/40 shadow-xs p-4 sm:p-5 space-y-4">
                <div className="w-full flex items-center justify-between pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="font-heritage text-lg font-bold text-[#8B0000]">
                      {t('turnByTurnTitle')}
                    </h3>
                    <p className="text-[11px] text-[#6B5E55]">
                      {navigationSteps.length} {t('plannedLegs')}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#AA820A] bg-[#AA820A]/10 px-2.5 py-1 rounded-full">
                    Shortest & Safest
                  </span>
                </div>

                <div className="w-full space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {navigationSteps.map((step, idx) => {
                    const isCurrent = isNavSimulating && currentNavStep === idx;
                    return (
                      <div
                        key={step.id}
                        onClick={() => {
                          if (step.placeRef) setActiveMapPin(step.placeRef.id);
                          setCurrentNavStep(idx);
                        }}
                        className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#8B0000]/10 border-[#8B0000] ring-2 ring-[#D4AF37]'
                            : 'bg-[#FDFBF7] border-stone-200 hover:border-[#D4AF37]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-[#8B0000] text-white'
                              : 'bg-[#D4AF37] text-[#5E0000]'
                          }`}>
                            {idx === 0 ? 'S' : idx === navigationSteps.length - 1 ? 'E' : idx}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-xs text-[#2D241E]">
                                {step.title}
                              </h4>
                              <span className="text-[10px] text-stone-500 font-semibold whitespace-nowrap">
                                {step.distance}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#6B5E55] leading-relaxed">
                              {step.instruction}
                            </p>

                            <div className="text-[10px] text-[#8B0000] bg-white p-1.5 rounded border border-stone-200 italic font-medium">
                              💡 {step.tip}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full pt-3 border-t border-stone-200 flex items-center gap-2">
                  <button
                    onClick={() => alert('Route copied to clipboard!')}
                    className="flex-1 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('shareRoute')}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('explore')}
                    className="flex-1 py-2 rounded-xl bg-[#8B0000]/10 hover:bg-[#8B0000]/20 text-[#8B0000] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>{t('addMoreSpots')}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* PLACE DETAILS MODAL                                      */}
      {/* ======================================================== */}
      {spotDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AF37] shadow-2xl relative">
            <button
              onClick={() => setSpotDetailModal(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="h-56 relative">
              <img
                src={spotDetailModal.image}
                alt={spotDetailModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] bg-[#D4AF37] text-[#5E0000] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedLanguage === 'hi' ? spotDetailModal.tierLabelHi : spotDetailModal.tierLabel}
                </span>
                <h3 className="font-heritage text-xl font-bold mt-1">
                  {selectedLanguage === 'hi' ? spotDetailModal.hindiName : spotDetailModal.name}
                </h3>
                <p className="text-xs text-[#F5D77F]">
                  {selectedLanguage === 'hi' ? spotDetailModal.name : spotDetailModal.hindiName}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-[#8B0000]" />
                  {spotDetailModal.duration}m {t('visit')}
                </span>
                <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-[#8B0000]" />
                  {spotDetailModal.distanceKm} km {t('away')}
                </span>
                <span className="flex items-center gap-1 text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {spotDetailModal.rating} ({spotDetailModal.reviews})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{t('verified')}: {spotDetailModal.verifiedBy}</div>
                  <div className="text-[11px] text-emerald-700">Official Heritage Authenticity Guarantee.</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#8B0000] uppercase tracking-wider mb-1">
                  {t('modalSignificance')}
                </h4>
                <p className="text-xs text-[#6B5E55] leading-relaxed">
                  {selectedLanguage === 'hi' ? spotDetailModal.descriptionHi : spotDetailModal.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-xs text-[#8B0000] uppercase tracking-wider mb-2">
                  {t('modalHighlights')}
                </h4>
                <div className="space-y-1.5">
                  {(selectedLanguage === 'hi' ? spotDetailModal.highlightsHi : spotDetailModal.highlights).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#AA820A] shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FDFBF7] p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[#6B5E55] block">{t('modalHours')}</span>
                  <span className="font-semibold text-stone-800">{spotDetailModal.hours}</span>
                </div>
                <div>
                  <span className="text-[#6B5E55] block">{t('modalPrice')}</span>
                  <span className="font-semibold text-[#8B0000]">
                    {selectedLanguage === 'hi' ? spotDetailModal.priceHi : spotDetailModal.price}
                  </span>
                </div>
              </div>

              {/* Audio Guide */}
              <div className="p-3 rounded-xl bg-[#F5EFE6] border border-[#D4AF37]/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#8B0000]" />
                  <span className="font-medium text-[#2D241E]">
                    {t('modalAudioGuide')} ({selectedLanguage.toUpperCase()})
                  </span>
                </div>
                <button
                  onClick={() => alert(`Playing audio heritage guide for ${selectedLanguage === 'hi' ? spotDetailModal.hindiName : spotDetailModal.name}...`)}
                  className="px-3 py-1 rounded-lg bg-[#8B0000] text-white text-[11px] font-bold flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-white" /> {t('listenAudio')}
                </button>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    togglePlaceSelection(spotDetailModal.id);
                    setSpotDetailModal(null);
                  }}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                    selectedPlaces.includes(spotDetailModal.id)
                      ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      : 'bg-[#8B0000] text-white hover:bg-[#700000]'
                  }`}
                >
                  {selectedPlaces.includes(spotDetailModal.id)
                    ? t('removeFromItinerary')
                    : t('addToRoute')}
                </button>
                <button
                  onClick={() => {
                    setSpotDetailModal(null);
                    setActiveTab('route');
                    setActiveMapPin(spotDetailModal.id);
                  }}
                  className="px-4 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2c] text-[#5E0000] font-bold text-xs"
                >
                  {t('locateOnMap')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* USER AUTH MODAL                                          */}
      {/* ======================================================== */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#D4AF37] shadow-2xl relative p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {userAuth.isLoggedIn && !userAuth.isGuest ? (
              <div className="text-center py-2 space-y-4">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#8B0000] to-[#550000] text-[#F5D77F] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md text-2xl font-heritage font-bold">
                  {(userAuth.name || 'R').charAt(0)}
                </div>
                <div>
                  <h3 className="font-heritage text-lg font-bold text-[#8B0000]">
                    {selectedLanguage === 'hi' ? userAuth.nameHi : userAuth.name}
                  </h3>
                  <p className="text-xs text-[#6B5E55] mt-0.5">{userAuth.email}</p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedLanguage === 'hi' ? 'सक्रिय शाही पास' : 'Active Heritage Pass'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D4AF37]/30 text-xs text-[#6B5E55] text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-700">Connected via:</span>
                    <span className="font-bold text-[#8B0000]">{userAuth.provider || 'Social Account'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-stone-700">Saved Itinerary:</span>
                    <span className="font-bold text-[#8B0000]">{selectedPlaces.length} Landmarks</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {selectedLanguage === 'hi' ? 'भ्रमण जारी रखें' : 'Continue Exploring'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-300 transition-colors cursor-pointer"
                  >
                    {selectedLanguage === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 border border-[#D4AF37] flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-[#8B0000]" />
                  </div>
                  <h3 className="font-heritage text-xl font-bold text-[#8B0000]">
                    {authMode === 'signin' ? t('authTitleSignIn') : t('authTitleSignUp')}
                  </h3>
                  <p className="text-xs text-[#6B5E55]">
                    {t('authSubtitle')}
                  </p>
                </div>

                {/* Quick OAuth Buttons */}
                <div className="space-y-2.5 mb-4">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('Google')}
                    disabled={authLoadingProvider !== null}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 active:bg-stone-100 text-xs font-semibold text-stone-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {authLoadingProvider === 'Google' ? (
                      <Sparkles className="w-4 h-4 animate-spin text-[#8B0000]" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>
                      {authLoadingProvider === 'Google'
                        ? (selectedLanguage === 'hi' ? 'गूगल से कनेक्ट हो रहा है...' : 'Connecting to Google...')
                        : t('googleOAuth')}
                    </span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('Facebook')}
                    disabled={authLoadingProvider !== null}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 active:bg-[#1877F2]/15 text-xs font-semibold text-[#1877F2] shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {authLoadingProvider === 'Facebook' ? (
                      <Sparkles className="w-4 h-4 animate-spin text-[#1877F2]" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    )}
                    <span>
                      {authLoadingProvider === 'Facebook'
                        ? (selectedLanguage === 'hi' ? 'फेसबुक से कनेक्ट हो रहा है...' : 'Connecting to Facebook...')
                        : t('fbOAuth')}
                    </span>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('Instagram')}
                    disabled={authLoadingProvider !== null}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-pink-200 bg-linear-to-r from-pink-50/70 via-purple-50/40 to-pink-50/70 hover:from-pink-100/80 hover:to-purple-100/60 active:from-pink-100 text-xs font-semibold text-[#C13584] shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {authLoadingProvider === 'Instagram' ? (
                      <Sparkles className="w-4 h-4 animate-spin text-[#C13584]" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0 text-[#C13584]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    )}
                    <span>
                      {authLoadingProvider === 'Instagram'
                        ? (selectedLanguage === 'hi' ? 'इंस्टाग्राम से कनेक्ट हो रहा है...' : 'Connecting to Instagram...')
                        : t('instaOAuth')}
                    </span>
                  </button>
                </div>

                <div className="relative flex py-2 items-center mb-3">
                  <div className="grow border-t border-stone-200"></div>
                  <span className="shrink mx-3 text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                    or with Email
                  </span>
                  <div className="grow border-t border-stone-200"></div>
                </div>

                {authError && (
                  <div className="mb-3 p-2 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t('fullName')}
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="e.g. Maharana Pratap"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('emailAddr')}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 border border-[#D4AF37] cursor-pointer"
                  >
                    <span>{authMode === 'signin' ? t('signInBtn') : t('signUpBtn')}</span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-stone-200 flex flex-col items-center gap-2 text-xs text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                      setAuthError('');
                    }}
                    className="text-[#8B0000] font-semibold hover:underline cursor-pointer"
                  >
                    {authMode === 'signin' ? t('noAccount') : t('hasAccount')}
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="text-stone-500 hover:text-[#8B0000] font-medium cursor-pointer"
                  >
                    {t('exploreGuestBtn')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WELCOME TOAST NOTIFICATION                               */}
      {/* ======================================================== */}
      {toast && (
        <div className="fixed top-20 right-4 sm:right-6 z-60 max-w-sm w-full bg-white rounded-2xl border-2 border-[#D4AF37] shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heritage text-sm font-bold text-[#8B0000] truncate">
              {toast.title}
            </h4>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              {toast.description}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPREHENSIVE 31-LANGUAGE SELECTION MODAL                */}
      {/* ======================================================== */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#D4AF37] shadow-2xl relative p-5 sm:p-7 max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsLanguageModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-4">
              <div className="w-11 h-11 rounded-full bg-[#8B0000]/10 border border-[#D4AF37] flex items-center justify-center mx-auto mb-2">
                <Globe className="w-6 h-6 text-[#8B0000]" />
              </div>
              <h3 className="font-heritage text-lg sm:text-xl font-bold text-[#8B0000]">
                {t('selectLangTitle')} (31 Languages)
              </h3>
              <p className="text-xs text-[#6B5E55]">
                {t('selectLangSubtitle')}
              </p>
            </div>

            {/* Search Input & Category Filter Tabs */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  placeholder="Search 31 languages (e.g. Hindi, Spanish, বাংলা, 日本語, தமிழ்)..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] bg-[#FDFBF7]"
                />
                {languageSearch && (
                  <button
                    onClick={() => setLanguageSearch('')}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
                {[
                  { key: 'all', label: `All (${LANGUAGES_LIST.length})` },
                  { key: 'Indian Languages', label: `Indian Languages (15)` },
                  { key: 'International', label: `International (16)` }
                ].map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setLanguageCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-semibold ${
                      languageCategoryFilter === cat.key
                        ? 'bg-[#8B0000] text-white shadow-xs'
                        : 'bg-[#F5EFE6] text-[#6B5E55] hover:bg-[#D4AF37]/20 hover:text-[#8B0000]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 31 Languages Scrollable Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {filteredLanguages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {filteredLanguages.map(lang => {
                    const isSelected = selectedLanguage === lang.code;
                    return (
                      <div
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setIsLanguageModalOpen(false);
                        }}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2.5 text-left ${
                          isSelected
                            ? 'border-[#8B0000] bg-[#8B0000]/10 shadow-xs ring-2 ring-[#D4AF37]'
                            : 'border-stone-200 hover:border-[#D4AF37] hover:bg-[#FDFBF7] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0 leading-none">{lang.flag}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[#2D241E] truncate">
                              {lang.native}
                            </div>
                            <div className="text-[10px] text-[#6B5E55] truncate">
                              {lang.name}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#8B0000] text-white flex items-center justify-center text-[10px] shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-stone-500">
                  No languages matching "{languageSearch}"
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-[#6B5E55]">
              <span>Active: <strong className="text-[#8B0000]">{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.name} ({LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native})</strong></span>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="text-xs font-semibold text-[#8B0000] hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PERSISTENT AI CHATBOT (TANSEN AI) DRAWER                 */}
      {/* ======================================================== */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-linear-to-r from-[#8B0000] via-[#750000] to-[#AA820A] text-white font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-[#D4AF37]"
          title="Open Tansen AI"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#F5D77F]" />
            <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#F5D77F] opacity-75"></span>
          </div>
          <span className="font-heritage tracking-wide">{t('tansenAI')}</span>
        </button>
      </div>

      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] max-w-full bg-white shadow-2xl border-l border-[#D4AF37]/50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 bg-linear-to-r from-[#8B0000] to-[#600000] text-white flex items-center justify-between border-b border-[#D4AF37]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                <Music className="w-5 h-5 text-[#F5D77F]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heritage text-sm font-bold text-white">
                    {t('botHeaderTitle')}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-[#F5E6BE]">
                  {t('botHeaderSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isVoiceActive ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-stone-200 hover:bg-white/20'
                }`}
                title="Voice Assistant Mode"
              >
                {isVoiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active AI Language Indicator Banner */}
          <button
            type="button"
            onClick={() => {
              setLanguageSearch('');
              setIsLanguageModalOpen(true);
            }}
            className="w-full bg-[#48080a] hover:bg-[#5a0b0d] px-3.5 py-1.5 flex items-center justify-between text-[11px] text-[#F5D77F] border-b border-[#D4AF37]/30 transition-colors cursor-pointer text-left"
            title="Click to change AI language"
          >
            <div className="flex items-center gap-1.5">
              <span>{LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.flag || '🌐'}</span>
              <span className="font-bold">
                {LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.native || 'English'} ({LANGUAGES_LIST.find(l => l.code === selectedLanguage)?.name || 'English'})
              </span>
            </div>
            <span className="text-[10px] text-stone-300 font-medium flex items-center gap-1">
              <span>
                {selectedLanguage === 'hi'
                  ? 'भाषा बदलें'
                  : selectedLanguage === 'bundeli'
                  ? 'भाषा बदलो'
                  : 'Change Language'}
              </span>
              <ChevronRight className="w-3 h-3 text-[#F5D77F]" />
            </span>
          </button>

          {/* Quick Prompt Chips */}
          <div className="p-3 bg-[#FDFBF7] border-b border-stone-200 overflow-x-auto whitespace-nowrap space-x-1.5 text-xs">
            {[
              t('botChip1'),
              t('botChip2'),
              t('botChip3'),
              t('botChip4'),
              t('botChip5')
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(chip)}
                className="inline-block px-3 py-1 rounded-full bg-white hover:bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8B0000] text-[11px] font-medium transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF7F0]/60">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#8B0000] text-white rounded-tr-none'
                      : 'bg-white text-[#2D241E] border border-[#D4AF37]/40 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p>{msg.id === 1 && msg.sender === 'bot' ? getLocalizedWelcomeMessage(selectedLanguage) : msg.text}</p>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendChat(sug)}
                          className="text-[10px] bg-[#F5EFE6] hover:bg-[#D4AF37]/30 text-[#8B0000] font-semibold px-2 py-0.5 rounded-md transition-colors"
                        >
                          → {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center gap-2 text-xs text-[#8B0000] italic bg-white p-2.5 rounded-xl border border-stone-200 w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#AA820A]" />
                <span>{selectedLanguage === 'hi' ? 'तानसेन एआई सलाह तैयार कर रहे हैं...' : 'Tansen AI is composing royal advice...'}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t('botPlaceholder')}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-[#8B0000] bg-[#FDFBF7]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-xl bg-[#8B0000] hover:bg-[#700000] disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-stone-400 text-center mt-1.5">
              {t('botDisclaimer')}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FOOTER (FULLY FLUID)                                     */}
      {/* ======================================================== */}
      <footer className="w-full bg-[#1C1613] text-stone-300 border-t border-[#D4AF37]/40 py-6 sm:py-8 px-3 sm:px-6 lg:px-8 text-xs mt-auto">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] border border-[#D4AF37] flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-heritage text-sm font-bold text-[#F5D77F]">
                {t('brandTitle')} — {t('brandSubtitle')}
              </span>
              <p className="text-[11px] text-stone-400">
                Preserving living culture, artisan handlooms & traditional culinary arts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-400">
            <span>© 2026 MP Tourism Heritage Board</span>
            <span>•</span>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-[#F5D77F]">{t('navDashboard')}</button>
            <span>•</span>
            <button onClick={() => setActiveTab('explore')} className="hover:text-[#F5D77F]">{t('navExplore')}</button>
            <span>•</span>
            <button onClick={() => setActiveTab('route')} className="hover:text-[#F5D77F]">{t('navMap')}</button>
            <span>•</span>
            <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-[#F5D77F]">{t('navAccount')}</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
