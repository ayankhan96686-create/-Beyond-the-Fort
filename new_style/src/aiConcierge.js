// ========================================================
// TANSEN AI CONCIERGE & MULTILINGUAL LLM PAYLOAD ENGINE
// ========================================================
import { LANGUAGES_LIST } from './translations';

/**
 * Builds the structured LLM prompt payload incorporating the user's active language
 */
export function buildAIPromptPayload(query, selectedLang = 'en', context = {}) {
  const activeLang = LANGUAGES_LIST.find(l => l.code === selectedLang) || {
    code: 'en',
    name: 'English',
    native: 'English'
  };

  const systemPrompt = `You are Tansen AI, the official royal heritage and travel concierge for Gwalior, Madhya Pradesh (UNESCO Creative City of Music).
MANDATORY RESPONSE LANGUAGE: ${activeLang.name} (${activeLang.native}) [ISO Language Code: "${selectedLang}"].
You MUST formulate your entire response strictly, eloquently, and naturally in ${activeLang.name} (${activeLang.native}).
Provide culturally authentic recommendations incorporating Gwalior's royal history (Tomar, Scindia, Mughal), iconic monuments (Gwalior Fort, Jai Vilas Palace, Gujari Mahal, Man Mandir), culinary delights (Bedai-Aloo, Bahadura Laddoo, Morena Gajak), and artisan handlooms (GI-tagged Chanderi silk sarees).`;

  return {
    systemPrompt,
    selectedLang: selectedLang,
    languageName: activeLang.name,
    languageNative: activeLang.native,
    userQuery: query,
    context: {
      location: "Gwalior, Madhya Pradesh, India",
      unescoStatus: "UNESCO City of Music",
      ...context
    }
  };
}

/**
 * Localized Welcome Greetings for all 31 languages
 */
export const LOCALIZED_WELCOME_MESSAGES = {
  en: "Namaste! I am Tansen AI, your royal heritage concierge for Gwalior. Ask me about monuments, street food, Chanderi sarees, or planning your day!",
  hi: "नमस्ते! मैं तानसेन एआई हूँ, आपका ग्वालियर शाही धरोहर सलाहकार। मुझसे स्मारकों, खान-पान, चंदेरी साड़ियों या यात्रा योजना के बारे में पूछें!",
  bundeli: "जै राम जी की! हम तानसेन एआई आंय, ग्वालियर के शाही धरोहर सलाहकार। आप स्मारकों, खान-पान, चंदेरी साड़ी या घूमन के बारे में कछु भी पूछ सकत हो!",
  mr: "नमस्कार! मी तानसेन एआय, ग्वाल्हेरचा आपला शाही वारसा सल्लागार. मला किल्ले, चंदेरी साड्या, स्थानिक खाद्यसंस्कृती किंवा प्रवासाबद्दल विचारा!",
  bn: "নমস্কার! আমি তানসেন এআই, গোয়ালিয়রের রাজকীয় ঐতিহ্য সহায়ক। আমাকে ঐতিহাসিক সৌধ, খাবার, চান্দেরি শাড়ি বা ভ্রমণ পরিকল্পনা সম্পর্কে জিজ্ঞাসা করুন!",
  te: "నమస్కారం! నేను తాన్‌సేన్ ఏఐ, గ్వాలియర్ రాజరిక వారసత్వ సహాయకుడిని. స్మారక చిహ్నాలు, స్థానిక ఆహారం, చందేరీ చీరలు లేదా మీ ప్రయాణ ప్రణాళిక గురించి అడగండి!",
  ta: "வணக்கம்! நான் தான்சேன் ஏஐ, குவாலியரின் அரச பாரம்பரிய வழிகாட்டி. நினைவுச்சின்னங்கள், சுவையான உணவுகள், சந்தேரி புடவைகள் பற்றி என்னிடம் கேளுங்கள்!",
  gu: "નમસ્તે! હું તાનસેન એઆઈ છું, ગ્વાલિયરનો તમારો શાહી ધરોહર સલાહકાર. મને સ્મારકો, ખાણીપીણી, ચંદેરી સાડીઓ અથવા દિવસના પ્લાનિંગ વિશે પૂછો!",
  ur: "آداب! میں تان سین اے آئی ہوں، گوالیار کا شاہی ثقافتی رہنما۔ مجھ سے تاریخی یادگاروں، لذیذ کھانوں، چندیری ساڑھیوں یا سفر کے بارے में پوچھیں!",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ತಾನ್‌ಸೇನ್ ಎಐ, ಗ್ವಾಲಿಯರ್ ರಾಜಮನೆತನದ ಪರಂಪರೆಯ ಸಹಾಯಕ. ಸ್ಮಾರಕಗಳು, ಸ್ಥಳೀಯ ಆಹಾರ, ಚಂದೇರಿ ಸೀರೆಗಳು ಅಥವಾ ಪ್ರವಾಸದ ಬಗ್ಗೆ ಕೇಳಿ!",
  or: "ନମସ୍କାର! ମୁଁ ତାନସେନ ଏଆଇ, ଗ୍ୱାଲିୟରର ରାଜକୀୟ ଐତିହ୍ୟ ପରାମର୍ଶଦାତା। ସ୍ମାରକୀ, ଖାଦ୍ୟ, ଚନ୍ଦେରୀ ଶାଢ଼ୀ କିମ୍ବା ଭ୍ରମଣ ଯୋଜନା ବିଷୟରେ ପଚାରନ୍ତୁ!",
  ml: "നമസ്കാരം! ഞാൻ താൻസെൻ എഐ, ഗ്വാളിയോറിന്റെ രാജകീയ പൈതൃക സഹായി. സ്മാരകങ്ങൾ, തനത് ഭക്ഷണങ്ങൾ, ചന്ദേരി സാരികൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ!",
  pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤਾਨਸੇਨ ਏਆਈ ਹਾਂ, ਗਵਾਲੀਅਰ ਦਾ ਸ਼ਾਹੀ ਵਿਰਾਸਤੀ ਸਲਾਹਕਾਰ। ਮੇਰੇ ਤੋਂ ਕਿਲ੍ਹਿਆਂ, ਪਕਵਾਨਾਂ, ਚੰਦੇਰੀ ਸਾੜੀਆਂ ਜਾਂ ਯਾਤਰਾ ਯੋਜਨਾ ਬਾਰੇ ਪੁੱਛੋ!",
  as: "নমস্কাৰ! মই তানসেন এআই, গোৱালিয়ৰৰ ৰাজকীয় ঐতিহ্য সহায়ক। ঐতিহাসিক কীৰ্তিচিহ্ন, খাদ্য, চান্দেৰী শাৰী বা ভ্ৰমণ পৰিকল্পনা সম্পৰ্কে সোধক!",
  sa: "नमस्ते! अहं तानसेन-एआई, गोपगिरेः (ग्वालियर) भवतां शाही-मार्गदर्शकः अस्मि। मां दुर्ग-स्मारकाणां, मिष्टान्नानां, चन्देरी-शाटिकानां च विषये पृच्छन्तु!",
  ks: "سلام! بیہ چھُس تانسین اے آئی، گوالیارُک شاہی رہنماء۔ میہ نش پُژھیو قلعن، روایتی کھینن تہٕ چندیری ساڑین بارس منز!",
  es: "¡Saludos reales! Soy Tansen AI, su conserje de patrimonio real para Gwalior. ¡Pregúnteme sobre monumentos, gastronomía local, saris de Chanderi o su itinerario!",
  fr: "Salutations royales ! Je suis Tansen AI, votre concierge du patrimoine de Gwalior. Interrogez-moi sur les forteresses, la gastronomie, les saris de Chanderi ou vos visites !",
  de: "Königliche Grüße! Ich bin Tansen AI, Ihr royaler Kulturbegleiter für Gwalior. Fragen Sie mich nach Festungen, Street Food, Chanderi-Seide oder Ihrer Tagesplanung!",
  zh: "您好！我是坦森AI，您的瓜廖尔皇家遗产礼宾员。欢迎向我咨询古迹、美食、昌德里丝绸或行程规划！",
  ja: "ナマステ！私はグワーリヤルの王室遺産コンシェルジュ、タンセンAIです。歴史的建造物、名物料理、チャンデーリサリーについて何でもお尋ねください！",
  ko: "안녕하세요! 저는 그왈리오르 왕실 문화유산 컨시어지 탄센 AI입니다. 기념물, 길거리 음식, 찬데리 사리, 일정 계획에 대해 물어보세요!",
  ar: "تحياتي الملكية! أنا تانسن للذكاء الاصطناعي، مستشارك الملكي لمدينة غواليور. اسألني عن الحصون، المأكولات، وساري تشانديري التراثي!",
  ru: "Приветствуем! Я Tansen AI — ваш королевский гид по наследию Гвалиора. Спрашивайте меня о фортах, местной кухне, сари Чандери и маршрутах!",
  pt: "Saudações reais! Sou o Tansen AI, seu concierge de patrimônio para Gwalior. Pergunte-me sobre monumentos, culinária, saris de Chanderi ou roteiros!",
  it: "Saluti reali! Sono Tansen AI, il vostro concierge per il patrimonio di Gwalior. Chiedetemi di fortezze, cucina tipica, sari di Chanderi o itinerari!",
  th: "ยินดีต้อนรับ! ฉันคือ Tansen AI ผู้ช่วยท่องเที่ยวเมืองกวาลิออร์ ถามฉันเกี่ยวกับป้อมปราการ อาหารพื้นเมือง หรือผ้าส่าหรีจันเดรีได้เลย!",
  id: "Salam kerajaan! Saya Tansen AI, pramutamu warisan kerajaan Gwalior Anda. Tanyakan tentang monumen, kuliner khas, kain sari Chanderi, atau rencana perjalanan Anda!",
  vi: "Xin chào! Tôi là Tansen AI, trợ lý di sản hoàng gia Gwalior. Hãy hỏi tôi về các di tích, ẩm thực đường phố, sari Chanderi hoặc lên lịch trình tham quan!",
  tr: "Kraliyet selamları! Ben Tansen AI, Gwalior kraliyet mirası rehberiniz. Bana kaleler, sokak lezzetleri, Chanderi sarileri veya gezi planları hakkında soru sorabilirsiniz!",
  nl: "Koninklijke groeten! Ik ben Tansen AI, uw koninklijke erfgoedgids voor Gwalior. Vraag me naar forten, streetfood, Chanderi-sari's of uw dagplanning!"
};

/**
 * Returns localized welcome message
 */
export function getLocalizedWelcomeMessage(selectedLang = 'en') {
  return LOCALIZED_WELCOME_MESSAGES[selectedLang] || LOCALIZED_WELCOME_MESSAGES.en;
}

/**
 * Multilingual response database for Tansen AI across all supported languages
 */
const TANSEN_RESPONSES = {
  bada: {
    en: "Maharaj Bada is Gwalior’s central cultural square. Known as the 'Victoria Market', it features 7 buildings in 7 distinct architectural styles (Greek, Roman, Gothic, Indo-Saracenic, Rajasthani, Maratha). Best for certified Chanderi silks, silver jewellery, and evening strolls!",
    hi: "महाराज बाड़ा ग्वालियर का मुख्य सांस्कृतिक व व्यापारिक केंद्र है। यहाँ ग्रीक, रोमन, गोथिक, इंडो-सारसेनिक, राजस्थानी और मराठा शैलियों की 7 ऐतिहासिक इमारतें हैं। शाम को चंदेरी साड़ियों व चांदी के आभूषणों की खरीदारी के लिए सर्वोत्तम स्थल है!",
    bundeli: "महाराज बाड़ा ग्वालियर कौ सबसें प्रसिद्ध चौक ऐ! इते सात अलग-अलग शैलियन के ऐतिहासिक भवन बने हैं। साँझ कूँ इते खरीदारी और चंदेरी साड़ी खरीदबे के लाने सबसे बढ़िया माहौल रहत ऐ।",
    mr: "महाराज बाडा हे ग्वाल्हेरचे ऐतिहासिक आणि सांस्कृतिक हृदय आहे. शिंदे राजवटीत विकसित झालेल्या या चौकात ग्रीक, रोमन, गोथिक आणि मराठा स्थापत्यकलेच्या ७ ऐतिहासिक वास्तू आहेत. चंदेरी साड्या आणि चांदीच्या दागिन्यांसाठी हे सर्वोत्तम ठिकाण आहे!",
    bn: "মহারাজ বাডা গোয়ালিয়রের কেন্দ্রীয় সাংস্কৃতিক চত্বর। এখানে গ্রিক, রোমান, গথিক এবং মারাঠা সহ ৭টি স্বতন্ত্র স্থাপত্যশৈলীর ভবন রয়েছে। চান্দেরি সিল্ক শাড়ি ও সান্ধ্য কেনাকাটার জন্য সেরা!",
    te: "మహారాజ్ బాడా గ్వాలియర్ యొక్క ప్రధాన సాంస్కృతిక కేంద్రం. ఇక్కడ గ్రీక్, రోమన్, గోథిక్ మరియు మరాఠా శైలులలోని 7 చారిత్రక భవనాలు ఉన్నాయి. చందేరీ చీరలు మరియు షాపింగ్‌కు ఇది అత్యుత్తమ ప్రదేశం!",
    ta: "மகாராஜ் பாடா குவாலியரின் கலாச்சார மையமாகும். இங்கு கிரேக்கம், ரோமன், கோதிக் மற்றும் மராட்டிய பாணிகளில் 7 வரலாற்று கட்டிடங்கள் உள்ளன. சந்தேரி பட்டுப் புடவைகள் வாங்க சிறந்த இடம்!",
    gu: "મહારાજ બાડા ગ્વાલિયરનું ઐતિહાસિક હૃદય છે. અહીં ગ્રીક, રોમન, ગોથિક અને મરાઠા શૈલીની 7 ઐતિહાસિક ઇમારતો આવેલી છે. ચંદેરી સિલ્ક સાડીઓ અને સાંજની ખરીદી માટે આ શ્રેષ્ઠ સ્થળ છે!",
    ur: "مہاراج باڑا گوالیار کا مرکزی ثقافتی چوک ہے۔ یہاں یونانی، رومن، گوتھک اور مرہٹہ طرز کی 7 تاریخی عمارتیں واقع ہیں۔ شام کی سیر اور چندیری ساڑھیوں کی خریداری کے لیے بہترین مقام ہے!",
    kn: "ಮಹಾರಾಜ್ ಬಾಡಾ ಗ್ವಾಲಿಯರ್‌ನ ಪ್ರಮುಖ ಸಾಂಸ್ಕೃತಿಕ ಕೇಂದ್ರ. ಗ್ರೀಕ್, ರೋಮನ್, ಗೋಥಿಕ್ ಮತ್ತು ಮರಾಠ ಶೈಲಿಯ 7 ಐತಿಹಾಸಿಕ ಕಟ್ಟಡಗಳಿವೆ. ಚಂದೇರಿ ಸೀರೆಗಳ ಖರೀದಿಗೆ ಇದು ಶ್ರೇಷ್ಠ ಸ್ಥಳ!",
    or: "ମହାରାଜ ବାଡ଼ା ଗ୍ୱାଲିୟରର ମୁଖ୍ୟ ସାଂସ୍କୃତିକ କେନ୍ଦ୍ର। ଏଠାରେ ଗ୍ରୀକ୍, ରୋମାନ୍, ଗୋଥିକ୍ ଓ ମରାଠା ଶୈଳୀର ୭ଟି ଐତିହାସିକ ପ୍ରାସାଦ ଅଛି। ଚନ୍ଦେରୀ ଶାଢ଼ୀ ପାଇଁ ଏହା ସର୍ବୋତ୍ତମ!",
    ml: "മഹാരാജ് ബാഡ ഗ്വാളിയോറിന്റെ പ്രധാന സാംസ്കാരിക കേന്ദ്രമാണ്. ഗ്രീക്ക്, റോമൻ, ഗോഥിക്, മറാഠ ശൈലികളിലുള്ള 7 ചരിത്രപരമായ കൊട്ടാരങ്ങളുണ്ട്. ചന്ദേരി സാരികൾ വാങ്ങാൻ ഏറ്റവും അനുയോജ്യമായ സ്ഥലം!",
    pa: "ਮਹਾਰਾਜ ਬਾੜਾ ਗਵਾਲੀਅਰ ਦਾ ਕੇਂਦਰੀ ਸੱਭਿਆਚਾਰਕ ਚੌਕ ਹੈ। ਇੱਥੇ ਯੂਨਾਨੀ, ਰੋਮਨ, ਗੋਥਿਕ ਅਤੇ ਮਰਾਠਾ ਸ਼ੈਲੀ ਦੀਆਂ 7 ਇਤਿਹਾਸਕ ਇਮਾਰਤਾਂ ਹਨ। ਚੰਦੇਰੀ ਸਾੜੀਆਂ ਅਤੇ ਖ਼ਰੀਦਦਾਰੀ ਲਈ ਇਹ ਸਭ ਤੋਂ ਵਧੀਆ ਜਗ੍ਹਾ ਹੈ!",
    as: "মহাৰাজ বাডা গোৱালিয়ৰৰ কেন্দ্ৰীয় সাংস্কৃতিক কেন্দ্ৰ। ইয়াত গ্ৰীক, ৰোমান, গথিক আৰু মাৰাঠা শৈলীৰ ৭টা ঐতিহাসিক ভৱন আছে। চান্দেৰী শাৰী আৰু সোণ-ৰূপৰ অলংকাৰৰ বাবে উত্তম!",
    sa: "महाराजबारा-प्राङ्गणं गोपगिरेः (ग्वालियर) प्रमुखं सांस्कृतिककेन्द्रम् अस्ति। अत्र सप्तविध-स्थापत्यशैल्याः भवनानि सन्ति। चन्देरी-कौशेयवस्त्राणां क्रयणाय इदं सर्वोत्तमम्।",
    ks: "مہاراج باڑا چھُ گوالیارُک مرکزی ثقافتی چوک۔ اتہِ چھِ ۷ مختلف طرزٕ تعمیرٕچ عمارتن ہُنٛد نظارہ۔ چندیری ساڑین خٲطرٕ چھُ یہِ بہترین جای!",
    es: "Maharaj Bada es la plaza monumental de Gwalior. Cuenta con 7 edificios en 7 estilos arquitectónicos (griego, romano, gótico, rajastaní, maratha). ¡Ideal para saris de seda Chanderi y compras nocturnas!",
    fr: "Maharaj Bada est le cœur monumental de Gwalior. Il réunit 7 édifices illustrant 7 styles architecturaux (grec, romain, gothique, marathe). Incontournable pour les soies de Chanderi et les promenades en soirée !",
    de: "Maharaj Bada ist das Herzstück von Gwalior mit 7 Prachtbauten in 7 verschiedenen Architekturstilen (Griechisch, Römisch, Gotisch, Maratha). Perfekt für Chanderi-Seide und abendliche Basare!",
    zh: "马哈拉杰巴达（Maharaj Bada）是瓜廖尔的文化核心广场，拥有希腊、罗马、哥特和马拉地等7种不同建筑风格的7座历史建筑。是购买正宗昌德里丝绸和傍晚漫步的绝佳去处！",
    ja: "マハラジ・バダはグワーリヤルの歴史的・文化的な中心広場です。ギリシャ、ローマ、ゴシック、マラーターなど7つの建築様式による7棟の歴史的建造物が並び、チャンデーリサリーの買い物に最適です！",
    ko: "마하라지 바다는 그왈리오르의 중심 문화 광장입니다. 그리스, 로마, 고딕, 마라타 등 7가지 건축 양식의 7개 역사적 건물이 있으며, 찬데리 실크 사리 쇼핑에 최고의 장소입니다!",
    ar: "ساحة مهاراج بادا هي المركز الثقافي والتجاري لمدينة غواليور. تضم 7 مبانٍ بسبعة طرز معمارية مختلفة (يونانية، رومانية، قوطية، وماراثا). وتعد الأفضل لشراء ساري تشانديري الحريري والمجوهرات الفضية!",
    ru: "Махарадж Бада — центральная историческая площадь Гвалиора. Здесь расположены 7 величественных зданий в 7 архитектурных стилях (греческий, римский, готический, маратха). Лучшее место для покупки шелковых сари Чандери!",
    pt: "Maharaj Bada é a praça cultural central de Gwalior. Possui 7 edifícios em 7 estilos arquitetônicos distintos (grego, romano, gótico, maratha). Ideal para compras de saris de seda Chanderi!",
    it: "Maharaj Bada è la piazza monumentale di Gwalior con 7 edifici in 7 stili architettonici diversi (greco, romano, gotico, maratha). Ideale per l'acquisto di preziosi sari in seta Chanderi!",
    th: "มหาราจบาดาเป็นจัตุรัสประวัติศาสตร์ใจกลางกวาลิออร์ ประกอบด้วยอาคาร 7 หลังใน 7 สไตล์สถาปัตยกรรม (กรีก โรมัน กอธิก มราฐา) เหมาะที่สุดสำหรับการเลือกซื้อผ้าส่าหรีจันเดรี!",
    id: "Maharaj Bada adalah alun-alun budaya pusat Gwalior dengan 7 bangunan megah dalam 7 gaya arsitektur unik (Yunani, Romawi, Gotik, Maratha). Sangat cocok untuk berbelanja kain sari sutra Chanderi!",
    vi: "Maharaj Bada là quảng trường văn hóa trung tâm của Gwalior với 7 công trình mang 7 phong cách kiến trúc khác nhau (Hy Lạp, La Mã, Gothic, Maratha). Nơi lý tưởng để mua sari lụa Chanderi!",
    tr: "Maharaj Bada, Gwalior'un merkezi tarihi meydanıdır. Yunan, Roma, Gotik ve Maratha gibi 7 farklı mimari tarzda 7 görkemli binaya ev sahipliği yapar. Chanderi ipeği alışverişi için mükemmeldir!",
    nl: "Maharaj Bada is het centrale plein van Gwalior met 7 historische gebouwen in 7 bouwstijlen (Grieks, Romeins, Gotisch, Maratha). Dé plek voor Chanderi-zijde en avondbazaars!"
  },
  food: {
    en: "For a 3-hour food trail in Gwalior: Start with hot Bedai-Aloo & Jalebi at S.S. Kachori (Naya Bazaar), grab authentic desi ghee boondi laddoos at Bahadura Ke Laddoo, and finish with crispy Morena Gajak in Lashkar! Total distance is only ~2 km.",
    hi: "ग्वालियर में 3 घंटे के फूड टूर के लिए: सुबह एस.एस. कचौड़ी (नया बाज़ार) पर खस्ता बेड़ई-आलू व जलेबी लें, फिर बहादुरा के शुद्ध देसी घी के बूंदी लड्डू चखें और लश्कर से मुरैना गजक लें! कुल दूरी मात्र 2 किमी है।",
    bundeli: "ग्वालियर में ३ घंटा के खान-पान के लाने: सुबह नया बाजार में एस.एस. कचौड़ी की गरमा-गरम बेड़ई-आलू और जलेबी खाओ, फिर बहादुरा के शुद्ध देसी घी के बूंदी के लड्डू और लश्कर से मुरैना की खस्ता गजक! बस २ किमी में सब काम हो जैहे।",
    mr: "ग्वाल्हेरमध्ये ३ तासांच्या फूड टूरसाठी: सकाळी नया बाजारमधील एस.एस. कचोरी येथे बेढई-आलू आणि जिलेबीचा आस्वाद घ्या, नंतर बहादुराचे शुद्ध तुपातील लाडू आणि लश्करमधून मुरैना गजक खरेदी करा!",
    bn: "৩ ঘণ্টার খাবারের সফরের জন্য: নয়া বাজারে এস.এস. কচুরিতে গরম বেদই-আলু ও জিলিপি খান, বাহাদুরার খাঁটি দেশি ঘিয়ের লাড্ডু এবং লস্করের খাস্তা মুরৈনা গজক উপভোগ করুন!",
    te: "3 గంటల ఆహార ప్రయాణం కోసం: నయా బజార్‌లో ఎస్.ఎస్. కచోరీలో వేడి బేడై-ఆలూ మరియు జిలేబీ, బహాదురా దేశీ నెయ్యి బూందీ లడ్డూలు మరియు లష్కర్‌లో మురేనా గజక్ రుచి చూడండి!",
    ta: "3 மணி நேர உணவு உலா: நயா பஜாரில் எஸ்.எஸ். கச்சோரியில் சுவையான பேடை-ஆலு மற்றும் ஜிலேபி, பகதூரா நெய் பூந்தி லட்டு மற்றும் மொரேனா கஜக் சுவைக்கவும்!",
    gu: "૩ કલાકના સ્વાદિષ્ટ ફૂડ ટૂર માટે: નયા બજારમાં એસ.એસ. કચોરી ખાતે ગરમાગરમ બેડઈ-આલૂ અને જલેબી, બહાદુરાના ઘીના બૂંદી લાડુ અને લશ્કરની મુરૈના ગજકનો સ્વાદ માણો!",
    ur: "3 گھنٹے کے فوڈ ٹور کے لیے: نیا بازار میں ایس.ایس. کچوری کی گرما گرم بیڑئی-آلو اور جلیبی، بہادرا کے دیسی گھی کے لڈو اور لشکر کی مورینا گزک ضرور چکھیں!",
    kn: "೩ ಗಂಟೆಗಳ ಆಹಾರ ಪ್ರವಾಸಕ್ಕೆ: ನಯಾ ಬಜಾರ್‌ನಲ್ಲಿ ಎಸ್.ಎಸ್. ಕಚೋರಿಯ ಬೇಡೈ-ಆಲೂ ಮತ್ತು ಜಿಲೇಬಿ, ಬಹಾದುರಾದ ತುಪ್ಪದ ಬೂಂದಿ ಲಡ್ಡು ಮತ್ತು ಲಷ್ಕರ್‌ನ ಮೊರೇನಾ ಗಜಕ್ ಸವಿಯಿರಿ!",
    or: "୩ ଘଣ୍ଟାର ଖାଦ୍ୟ ଯାତ୍ରା ପାଇଁ: ନୟା ବଜାରରେ ଏସ୍.ଏସ୍. କଚୋରୀର ବେଡ଼ଇ-ଆଳୁ ଓ ଜିଲାପି, ବାହାଦୁରାଙ୍କ ଘିଅ ଲଡୁ ଏବଂ ମୁରେନା ଗଜକ ନିଶ୍ଚୟ ଆସ୍ୱାଦନ କରନ୍ତୁ!",
    ml: "3 മണിക്കൂർ ഭക്ഷണ യാത്രയ്ക്ക്: നയാ ബസാറിലെ എസ്.എസ്. കച്ചോരിയിൽ നിന്ന് മൊരിഞ്ഞ ബേഡൈ-ആലുവും ജിലേബിയും, ബഹാദുറയുടെ നെയ്യ് ലഡ്ഡുവും ലഷ്കറിലെ മൊറേന ഗജക്കും ആസ്വദിക്കൂ!",
    pa: "੩ ਘੰਟੇ ਦੇ ਫੂਡ ਟੂਰ ਲਈ: ਨਵਾਂ ਬਾਜ਼ਾਰ ਵਿੱਚ ਐੱਸ.ਐੱਸ. ਕਚੌਰੀ ਤੋਂ ਗਰਮ ਬੇੜਈ-ਆਲੂ ਅਤੇ ਜਲੇਬੀ, ਬਹਾਦੁਰਾ ਦੇ ਦੇਸੀ ਘਿਓ ਦੇ ਬੂੰਦੀ ਲੱਡੂ ਅਤੇ ਲਸ਼ਕਰ ਤੋਂ ਮੁਰੈਨਾ ਗਜ਼ਕ ਦਾ ਆਨੰਦ ਲਵੋ!",
    as: "৩ ঘণ্টাৰ খাদ্য ভ্ৰমণৰ বাবে: নয়া বজাৰৰ এছ.এছ. কচোৰীৰ গৰম বেদই-আলু আৰু জেলেপী, বাহাদুৰাৰ খাঁটি ঘিঁউৰ লাৰু আৰু লস্কৰৰ মুৰৈনা গজক উপভোগ কৰক!",
    sa: "त्रिहोरात्मक-भोजनयात्रायाम्: नया-विपण्यां एस.एस. कचौरी-स्थाने तप्ता बेड़ई-आलू तथा कुण्डलिका (जलेबी), बहादुरा-मोदकाः, लश्कर-नगरात् मुरैना-गजकं च आस्वादयन्तु!",
    ks: "۳ گھنٹن ہُنٛد کھین ٹور: نیا بازارس منز ایس.ایس. کچوری ہُنٛد گرم بیڑئی-آلو تہٕ جلیبی، بہادرا ہند دیسی گھیوِک لڈو تہٕ لشکرٕچ مورینا گزک کھیو!",
    es: "Para una ruta gastronómica de 3 horas en Gwalior: pruebe el Bedai-Aloo con Jalebi en S.S. Kachori, los legendarios laddoos de mantequilla clarificada de Bahadura y el crujiente Morena Gajak en Lashkar.",
    fr: "Pour un circuit gourmand de 3 heures à Gwalior : dégustez le Bedai-Aloo et Jalebi chez S.S. Kachori, les laddoos au beurre clarifié chez Bahadura et le croquant Morena Gajak !",
    de: "Für eine 3-stündige Genusstour: Probieren Sie frisches Bedai-Aloo bei S.S. Kachori, traditionelle Butterschmalz-Laddoos bei Bahadura und knusprigen Morena Gajak in Lashkar!",
    zh: "在瓜廖尔体验3小时美食之旅：前往新巴扎品尝S.S. Kachori的热腾腾贝代土豆（Bedai-Aloo）和糖环（Jalebi），接着品尝Bahadura纯酥油鹰嘴豆球（Laddoo），最后在拉什卡尔带上一盒香脆的莫雷纳芝麻糖（Morena Gajak）！",
    ja: "グワーリヤルでの3時間グルメツアー：ナヤ・バザールのS.S.カチョリで熱々のベダイ・アルとジャレビ、バハドゥラのギー入りラドゥ、そしてラシュカルのサクサクしたモレナ・ガジャクを味わいましょう！",
    ko: "그왈리오르 3시간 미식 투어: 나야 바자르의 S.S. 카초리에서 따뜻한 베다이-알루와 잘레비를 맛보고, 바하두라의 순수 기 버터 분디 라두를 즐긴 후 라슈카르에서 바삭한 모레나 가작으로 마무리하세요!",
    ar: "لجولة طعام مدتها 3 ساعات في غواليور: ابدأ بفطائر بيداي-آلو الساخنة مع الجلابي في نيا بازار، ثم جرب حلوى لادو بالسمن البلدي عند بهادورا، واختتم بحلوى غاجاك المقرمشة في لشكر!",
    ru: "Для 3-часового гастротура по Гвалиору: попробуйте хрустящие бедаи-алу с джалеби в S.S. Kachori, знаменитые ладду на топленом масле от Bahadura и хрустящую сладость морена-гаджак!",
    pt: "Para um roteiro gastronômico de 3 horas em Gwalior: comece com Bedai-Aloo e Jalebi no S.S. Kachori, experimente os laddoos de ghee em Bahadura e finalize com o crocante Morena Gajak em Lashkar!",
    it: "Per un tour gastronomico di 3 ore a Gwalior: assaggiate il Bedai-Aloo caldo con Jalebi da S.S. Kachori, i tradizionali laddoo al burro chiarificato di Bahadura e il croccante Morena Gajak!",
    th: "สำหรับทริปชิมอาหาร 3 ชั่วโมงในกวาลิออร์: เริ่มต้นด้วยเบได-อาลูร้อนๆ และจาเลบีที่ S.S. Kachori ชิมขนมลัดดูเนยกีแท้ที่ Bahadura และตบท้ายด้วยกะจัคกรุบกรอบที่ Lashkar!",
    id: "Untuk petualangan kuliner 3 jam di Gwalior: nikmati Bedai-Aloo panas dan Jalebi di S.S. Kachori, cicipi laddoo minyak samin murni di Bahadura, dan akhiri dengan Morena Gajak renyah di Lashkar!",
    vi: "Hành trình ẩm thực 3 giờ tại Gwalior: Bắt đầu với Bedai-Aloo nóng hổi và Jalebi tại S.S. Kachori, thưởng thức bánh laddoo bơ ghee Bahadura và món kẹo giòn Morena Gajak ở Lashkar!",
    tr: "Gwalior'da 3 saatlik bir lezzet turu için: Naya Bazaar'da S.S. Kachori'de sıcak Bedai-Aloo ve Jalebi ile başlayın, Bahadura'nın saf tereyağlı laddoo'larını tadın ve çıtır Morena Gajak ile tamamlayın!",
    nl: "Voor een 3-uur durende culinaire tour in Gwalior: geniet van warme Bedai-Aloo en Jalebi bij S.S. Kachori, proef de pure ghee-laddoos bij Bahadura en sluit af met knapperige Morena Gajak!"
  },
  chanderi: {
    en: "For certified GI-tagged Chanderi sarees, visit the Mrignayani MP Govt Handloom Emporium near Phool Bagh. For direct artisan buying without middlemen, explore the Chanderi Master Weaver Home Studios in Hazira!",
    hi: "प्रमाणित जीआई-टैग चंदेरी साड़ियों के लिए फूलबाग स्थित मृगनयनी सरकारी एम्पोरियम जाएं। सीधे बुनकरों से बिना बिचौलिये के खरीदारी के लिए हजीरा में मास्टर बुनकर होम स्टूडियोज देखें!",
    bundeli: "असली जीआई-टैग चंदेरी साड़ी के लाने फूलबाग पै मृगनयनी सरकारी एम्पोरियम जाओ। और बिना बिचौलिये के सीधे बुनकरन सें खरीदबे के लाने हजीरा में मास्टर बुनकरन के घरन में देखो!",
    mr: "अस्सल जीआय-टॅग चंदेरी साड्यांसाठी फूलबाग येथील 'मृगनयनी' मध्य प्रदेश सरकारी एम्पोरियमला भेट द्या. थेट विणकरांकडून खरेदीसाठी हजिरा येथील मास्टर विणकर स्टुडिओ एक्सप्लोर करा!",
    bn: "আসল জিআই-ট্যাগযুক্ত চান্দেরি শাড়ির জন্য ফুলবাগের কাছে মৃগনয়নী সরকারি এম্পোরিয়াম দেখুন অথবা হাজিরায় সরাসরি তাঁতিদের স্টুডিও ঘুরে আসুন।",
    te: "ధృవీకరించబడిన చందేరీ పట్టు చీరల కోసం పూల్‌బాగ్ వద్ద మృగనయని ప్రభుత్వ ఎంపోరియంను సందర్శించండి లేదా హజీరాలోని చేనేత కళాకారులను నేరుగా కలవండి.",
    ta: "அங்கீகரிக்கப்பட்ட சந்தேரி பட்டுப் புடவைகளுக்கு பூல்பாக் அருகிலுள்ள மிருகநயனி அரசு எம்போரியம் செல்லவும் அல்லது ஹஜீராவில் உள்ள நெசவாளர்களிடம் நேரடியாக வாங்கலாம்.",
    gu: "પ્રમાણિત જીઆઈ-ટેગ ચંદેરી સાડીઓ માટે ફૂલબાગ ખાતે મૃગનયની સરકારી એમ્પોરિયમની મુલાકાત લો અથવા હઝીરામાં માસ્ટર વણકરો પાસેથી સીધી ખરીદી કરો.",
    ur: "مصدقہ چندیری ریشمی ساڑھیوں کے لیے پھول باغ کے قریب واقع سرکاری ایمپوریم 'مرگنینی' جائیں یا ہزیرہ میں ماسٹر بنکروں سے براہ راست خریداری کریں۔",
    kn: "ಅಧಿಕೃತ ಚಂದೇರಿ ರೇಷ್ಮೆ ಸೀರೆಗಳಿಗಾಗಿ ಫೂಲ್‌ಬಾಗ್‌ನ ಮೃಗನಯನಿ ಸರ್ಕಾರಿ ಎಂಪೋರಿಯಂಗೆ ಭೇಟಿ ನೀಡಿ ಅಥವಾ ಹಜಿರಾದಲ್ಲಿ ನೇಕಾರರಿಂದ ನೇರವಾಗಿ ಖರೀದಿಸಿ.",
    or: "ପ୍ରମାଣିତ ଚନ୍ଦେରୀ ରେଶମ ଶାଢ଼ୀ ପାଇଁ ଫୁଲବାଗ ନିକଟସ୍ଥ ମୃଗନୟନୀ ସରକାରୀ ଏମ୍ପୋରିୟମ ଦେଖନ୍ତୁ କିମ୍ବା ହଜିରାର ବୁଣାକାରଙ୍କ ଷ୍ଟୁଡିଓ ପରିଦର୍ଶନ କରନ୍ତୁ।",
    ml: "യഥാർത്ഥ ചന്ദേരി സിൽക്ക് സാരികൾക്കായി ഫൂൽബാഗിലെ മൃഗനയനി ഗവൺമെന്റ് എംപോറിയം സന്ദർശിക്കുക അല്ലെങ്കിൽ ഹസീറയിലെ മാസ്റ്റർ നെയ്ത്തുകാരിൽ നിന്ന് നേരിട്ട് വാങ്ങുക.",
    pa: "ਅਸਲੀ ਚੰਦੇਰੀ ਸਾੜੀਆਂ ਲਈ ਫੂਲਬਾਗ ਸਥਿਤ ਮ੍ਰਿਗਨਯਨੀ ਸਰਕਾਰੀ ਐਂਪੋਰੀਅਮ ਜਾਓ ਜਾਂ ਹਜ਼ੀਰਾ ਵਿੱਚ ਮਾਸਟਰ ਬੁਣਕਰਾਂ ਦੇ ਘਰੇਲੂ ਸਟੂਡੀਓ ਦੇਖੋ।",
    as: "প্ৰমাণিত চান্দেৰী ৰেচম শাৰীৰ বাবে ফুলবাগৰ মৃগনয়নী চৰকাৰী এম্পৰিয়ামলৈ যাওক বা হাজিৰাত শিপিনীসকলৰ পৰা পোনপটীয়াকৈ ক্ৰয় কৰক।",
    sa: "प्रमाणित-चन्देरी-शाटिकाभ्यः फूलबाग-समीपे मृगनयनी-शासकीय-केन्द्रं पश्यन्तु अथवा हजीरा-क्षेत्रे तन्तुवायेभ्यः साक्षात् क्रीणन्तु।",
    ks: "اصلی چندیری ریشمی ساڑین خٲطرٕ گژھیو پھول باغس منز 'مرگنینی' سرکاری ایمپوریم یا ہزیرہ کس ماسٹر بنکرن نش!",
    es: "Para saris auténticos Chanderi con denominación de origen protegida (GI), visite el emporio gubernamental Mrignayani en Phool Bagh o los estudios de maestros tejedores en Hazira.",
    fr: "Pour des saris en soie de Chanderi certifiés avec label IG, visitez l'emporium d'État Mrignayani à Phool Bagh ou achetez directement auprès des maîtres tisserands à Hazira.",
    de: "Für zertifizierte Chanderi-Seidensaris mit geschützter Herkunftsbezeichnung besuchen Sie das Mrignayani-Regierungsemporium in Phool Bagh oder die Weberateliers in Hazira.",
    zh: "选购拥有地理标志（GI）认证的真正昌德里丝绸纱丽，请前往普尔巴格（Phool Bagh）的Mrignayani邦政府手工艺商场，或深入哈齐拉（Hazira）的大师织布工坊直接选购！",
    ja: "原産地呼称（GI）認証を受けた本物のチャンデーリサリーなら、プール・バーグ近くのMrignayani州立工芸品エンポリウム、またはハジラの職人工房がおすすめです！",
    ko: "지리적 표시(GI) 인증을 받은 정품 찬데리 실크 사리를 구입하시려면 풀 바그 인근의 므리그나야니 주정부 엠포리엄이나 하지라의 장인 직조 공방을 방문해 보세요!",
    ar: "للحصول على ساري تشانديري الحريري المعتمد، قم بزيارة مجمع مرغناني الحكومي بالقرب من فول باغ، أو استكشف ورش النساجين الحرفيين في منطقة هزيرة مباشرة!",
    ru: "За сертифицированными шелковыми сари Чандери с защищенным географическим указанием отправляйтесь в государственный магазин Mrignayani у Пхул-Багха или в мастерские ткачей в Хазире.",
    pt: "Para saris autênticos de seda Chanderi com selo de indicação geográfica, visite o empório governamental Mrignayani perto de Phool Bagh ou os ateliês de tecelões em Hazira.",
    it: "Per autentici sari in seta Chanderi con certificazione di origine, visitate l'emporio governativo Mrignayani a Phool Bagh o i laboratori dei maestri tessitori ad Hazira.",
    th: "สำหรับผ้าส่าหรีผ้าไหมจันเดรีแท้ที่มีตรารับรอง GI แนะนำให้เยี่ยมชมศูนย์หัตถกรรมของรัฐบาล Mrignayani ใกล้ Phool Bagh หรือพบปะช่างทอผ้าโดยตรงที่ Hazira!",
    id: "Untuk kain sari sutra Chanderi bersertifikasi Indikasi Geografis resmi, kunjungi Emporium Pemerintah Mrignayani di dekat Phool Bagh atau studio pengrajin tenun di Hazira!",
    vi: "Để mua sari lụa Chanderi chính hãng có chỉ dẫn địa lý, hãy ghé Trung tâm Thủ công Mrignayani của chính phủ gần Phool Bagh hoặc đến trực tiếp xưởng dệt ở Hazira!",
    tr: "Coğrafi işaret tescilli orijinal Chanderi ipek sarileri için Phool Bagh yakınındaki Mrignayani Hükümet Mağazası'nı ziyaret edin veya Hazira'daki dokuma ustalarından doğrudan alışveriş yapın!",
    nl: "Voor gecertificeerde Chanderi-zijde sari's met geografische aanduiding bezoekt u het Mrignayani overheidsemporium bij Phool Bagh of bezoekt u de meesterwevers in Hazira!"
  },
  tansen: {
    en: "Tansen was the legendary musical jewel of Emperor Akbar's court. His tomb in Hazira hosts the world-renowned annual Tansen Samaroh. The Gwalior Gharana is the foundational and most revered tradition of classical Hindustani music.",
    hi: "तानसेन जी अकबर के नवरत्नों में से एक और भारतीय संगीत के अमर स्तम्भ थे। हजीरा में उनका मकबरा है जहाँ ऐतिहासिक इमली का पेड़ है। ग्वालियर घराना ख़याल गायकी की प्राचीनतम व सबसे प्रतिष्ठित परंपरा है।",
    bundeli: "तानसेन जी संगीत के सम्राट हते! हजीरा में उनकौ पवित्र मक़बरा ऐ, जहाँ हर साल विश्व-प्रसिद्ध तानसेन समारोह होत ऐ। ग्वालियर घराना हिंदुस्तानी शास्त्रीय संगीत कौ सिरमौर ऐ।",
    mr: "तानसेन हे संगीताचे अद्वितीय सम्राट होते. हजिरा येथे त्यांची समाधी आहे आणि दरवर्षी भव्य तानसेन संगीत समारोह होतो. ग्वाल्हेर घराणे हे ख्याल गायकीचे मूळ मानले जाते.",
    bn: "তানসেন ছিলেন ভারতীয় মার্গ সঙ্গীতের মহান সম্রাট। হাজিরায় তাঁর সমাধিসৌধে বিখ্যাত তানসেন সমারোহ অনুষ্ঠিত হয়। গোয়ালিয়র ঘরানা হিন্দুস্তানি খেয়াল সঙ্গীতের প্রাচীনতম ঐতিহ্য।",
    te: "తాన్‌సేన్ భారతీయ శాస్త్రీయ సంగీత దిగ్గజం. హజీరాలోని ఆయన సమాధి వద్ద ప్రసిద్ధ తాన్‌సేన్ సమారోహ్ జరుగుతుంది. గ్వాలియర్ ఘరానా హిందుస్థానీ సంగీతానికి అత్యంత పురాతన సంప్రదాయం.",
    ta: "தான்சேன் இந்திய இசையின் மாபெரும் சக்ரவர்த்தி. ஹஜீராவில் உள்ள அவரது சமாதியில் உலகப் புகழ்பெற்ற தான்சேன் சமாரோ இசை விழா நடைபெறுகிறது. குவாலியர் கரானா பாரம்பரிய இசையின் தொட்டில்.",
    gu: "તાનસેનજી સંગીતના સમ્રાટ હતા. હઝીરામાં તેમનો મકબરો છે જ્યાં વિશ્વપ્રસિદ્ધ તાનસેન સમારોહ યોજાય છે. ગ્વાલિયર ઘરાના હિન્દુસ્તાની શાસ્ત્રીય સંગીતનું મૂળ છે.",
    ur: "تان سین شہنشاہ اکبر کے نو رتنوں میں سرفہرست اور موسیقی کے بے تاج بادشاہ تھے۔ ہزیرہ میں ان کا مقبرہ ہے جہاں سالانہ تان سین سماروہ منعقد ہوتا ہے۔",
    kn: "ತಾನ್‌ಸೇನ್ ಭಾರತೀಯ ಶಾಸ್ತ್ರೀಯ ಸಂಗೀತದ ಮೇರು ಪ್ರತಿಭೆ. ಹಜಿರಾದಲ್ಲಿರುವ ಅವರ ಸಮಾಧಿಯಲ್ಲಿ ವಾರ್ಷಿಕ ತಾನ್‌ಸೇನ್ ಸಮಾರೋಹ ನಡೆಯುತ್ತದೆ. ಗ್ವಾಲಿಯರ್ ಘರಾನಾ ಸಂಗೀತದ ಪ್ರಾಚೀನ ಪರಂಪರೆ.",
    or: "ତାନସେନ ଭାରତୀୟ ଶାସ୍ତ୍ରୀୟ ସଙ୍ଗୀତର ଅମର ସମ୍ରାଟ। ହଜିରାରେ ତାଙ୍କର ସମାଧିପୀଠ ଅଛି ଯେଉଁଠାରେ ବାର୍ଷିକ ତାନସେନ ସମାରୋହ ଅନୁଷ୍ଠିତ ହୁଏ।",
    ml: "അക്ബർ ചക്രവർത്തിയുടെ സദസ്സിലെ സംഗീത ഇതിഹാസമായിരുന്നു താൻസെൻ. ഹസീറയിലെ അദ്ദേഹത്തിന്റെ സമാധിയിൽ പ്രതിവർഷ താൻസെൻ സംഗീതോത്സവം നടക്കുന്നു.",
    pa: "ਤਾਨਸੇਨ ਜੀ ਸੰਗੀਤ ਦੇ ਅਮਰ ਬਾਦਸ਼ਾਹ ਸਨ। ਹਜ਼ੀਰਾ ਵਿੱਚ ਉਨ੍ਹਾਂ ਦਾ ਮਕਬਰਾ ਹੈ ਜਿੱਥੇ ਹਰ ਸਾਲ ਤਾਨਸੇਨ ਸਮਾਰੋਹ ਹੁੰਦਾ ਹੈ। ਗਵਾਲੀਅਰ ਘਰਾਣਾ ਖ਼ਿਆਲ ਗਾਇਕੀ ਦੀ ਸਭ ਤੋਂ ਪ੍ਰਾਚੀਨ ਪਰੰਪਰਾ ਹੈ।",
    as: "তানসেন আছিল ভাৰতীয় শাস্ত্ৰীয় সংগীতৰ অবিসম্বাদী সম্ৰাট। হাজিৰাত তেওঁৰ সমাধি আছে য'ত প্ৰতি বছৰে বিশ্ববিখ্যাত তানসেন সমাৰোহ অনুষ্ঠিত হয়।",
    sa: "तानसेनः सङ्गीतसम्राट् आसीत्। हजीरा-क्षेत्रे तस्य समाधिस्थलं वर्तते यत्र प्रतिवर्षं तानसेन-सङ्गीतमहोत्सवः समायोज्यते।",
    ks: "تان سین اوس موسیقی ہُنٛد بادشاہ۔ ہزیرہ منز چھُ تٔمؠ سُنٛد مزار یتین پرٛتھ ؤریہِ عالمی تان سین سماروہ منعقد گژھان چھُ۔",
    es: "Tansen fue el mítico músico de la corte imperial de Akbar. Su tumba en Hazira acoge el festival anual Tansen Samaroh. La Gwalior Gharana es la cuna de la música clásica indostaní.",
    fr: "Tansen était le génie musical de la cour d'Akbar. Son tombeau à Hazira accueille le grand festival Tansen Samaroh. Le Gwalior Gharana est la plus ancienne tradition vocale classique.",
    de: "Tansen war die Musiklegende am Hofe Akbars. Sein Grabmal in Hazira ist Austragungsort des jährlichen Tansen-Festivals. Die Gwalior-Gharana begründete die klassische Vokalmusik.",
    zh: "坦森是莫卧儿阿克巴大帝九大权贵宝石之一，印度古典音乐的传奇泰斗。其位于哈齐拉的陵墓每年举办世界闻名的坦森音乐节（Tansen Samaroh），瓜廖尔流派是印度斯坦声乐艺术的殿堂之源。",
    ja: "タンセンはムガル皇帝アクバルの宮廷を彩った伝説的な大音楽家です。ハジラにある彼の墓では毎年世界的なタンセン音楽祭が開催され、グワーリヤル流派は北インド古典声楽の最高峰とされています。",
    ko: "탄센은 악바르 대제 궁정의 전설적인 음악 보석이었습니다. 하지라에 있는 그의 묘소에서는 매년 세계적인 탄센 사마로 음악 축제가 열리며, 그왈리오르 가라나는 힌두스타니 고전 음악의 가장 오래된 전통입니다.",
    ar: "كان تانسن جوهرة الموسيقى الأسطورية في بلاط الإمبراطور أكبر. ويستضيف ضريحه في هزيرة مهرجان تانسن ساماروه السنوي الشهير، وتعد مدرسة غواليور الموسيقية أقدم تقاليد الموسيقى الهندوستانية الكلاسيكية.",
    ru: "Тансен — легендарный музыкант при дворе императора Акбара. В его мавзолее в Хазире ежегодно проходит всемирно известный музыкальный фестиваль Tansen Samaroh. Гвалиорская гхарана — колыбель классического вокала хиндустани.",
    pt: "Tansen foi o lendário gênio musical da corte do imperador Akbar. Seu túmulo em Hazira sedia o festival anual Tansen Samaroh. A Gwalior Gharana é a mais antiga e venerada tradição musical da Índia.",
    it: "Tansen fu il leggendario maestro musicale della corte dell'imperatore Akbar. La sua tomba ad Hazira ospita il celebre festival annuale Tansen Samaroh. La Gwalior Gharana è la culla della musica vocale classica indostana.",
    th: "ตานเซนคืออัจฉริยะทางดนตรีแห่งราชสำนักจักรพรรดิอักบัร สุสานของเขาที่ Hazira เป็นสถานที่จัดเทศกาลดนตรี Tansen Samaroh ระดับโลก และคีตกานต์สำนักกวาลิออร์เป็นรากฐานของดนตรีคลาสสิกอินเดีย!",
    id: "Tansen adalah permata musik legendaris di istana Kaisar Akbar. Makamnya di Hazira menjadi tuan rumah festival musik tahunan Tansen Samaroh, dan Gwalior Gharana adalah tradisi musik klasik tertua di India.",
    vi: "Tansen là huyền thoại âm nhạc triều đình Akbar Đại đế. Lăng mộ của ông tại Hazira là nơi diễn ra lễ hội âm nhạc Tansen Samaroh hằng năm. Trường phái Gwalior Gharana là cái nôi của âm nhạc cổ điển Hindustani.",
    tr: "Tansen, İmparator Akbar'ın sarayının efsanevi müzik dehasiydi. Hazira'daki türbesi her yıl dünyaca ünlü Tansen Samaroh festivaline ev sahipliği yapar. Gwalior Gharana, klasik müziğin en köklü geleneğidir.",
    nl: "Tansen was het legendarische muzikale genie aan het hof van keizer Akbar. Zijn graftombe in Hazira vormt het decor voor het jaarlijkse Tansen Samaroh-muziekfestival. De Gwalior Gharana is de wieg van de klassieke zangkunst."
  },
  fort: {
    en: "Gwalior Fort, famously acclaimed by Mughal Emperor Babur as 'The Pearl in the necklace of the forts of Hind', sits atop an impregnable 300-foot sandstone hill. Highlights include the blue-tiled 15th-century Man Mandir Palace, Gujari Mahal museum, and the colossal rock-cut Jain Tirthankaras at Urvai Gate.",
    hi: "ग्वालियर का किला 'हिंद के किलों का मोती' (जिब्राल्टर ऑफ इंडिया) कहलाता है। 300 फीट ऊंची बलुआ पत्थर की पहाड़ी पर स्थित यह दुर्ग 15वीं सदी के मान मंदिर महल, गूजरी महल संग्रहालय, सास-बहू मंदिर और उरवाई गेट की विशाल जैन मूर्तियों के लिए प्रसिद्ध है।",
    bundeli: "ग्वालियर कौ दुर्ग 'भारत के किलन कौ मोती' कहावत ऐ। ३०० फीट ऊँचे पहाड़ पै बनौ यह दुर्ग मान मंदिर महल, गूजरी महल और सास-बहू मंदिर देखबे लायक हैं। उरवाई गेट सें गाड़ी सें सीधे ऊपर पहुँच सकत हो।",
    mr: "ग्वाल्हेरचा किल्ला हा 'हिंदचा मोहरा' म्हणून ओळखला जातो. ३०० फूट उंच टेकडीवर वसलेल्या या किल्ल्यात १५व्या शतकातील मान मंदिर पॅलेस, गुजरी महाल आणि उरवाई गेटवरील भव्य जैन शिल्पे पाहण्यासारखी आहेत.",
    bn: "গোয়ালিয়র দুর্গ 'ভারতের দুর্গসমূহের মুক্তা' হিসেবে খ্যাত। ৩০০ ফুট উঁচু বেলেপাথরের পাহাড়ে অবস্থিত এই দুর্গে পঞ্চদশ শতাব্দীর মান মন্দির প্রাসাদ, গুজরি মহল এবং উরওয়াই গেটের সুবিশাল জৈন ভাস্কর্য অবস্থিত।",
    te: "గ్వాలియర్ కోట 'హిందూస్థాన్ కోటల హారంలో ముత్యం'గా ప్రసిద్ధి చెందింది. 300 అడుగుల ఎత్తైన కొండపై ఉన్న ఈ కోటలో 15వ శతాబ్దపు మాన్ మందిర్ ప్యాలెస్ మరియు గుజరీ మహల్ ముఖ్య ఆకర్షణలు.",
    ta: "குவாலியர் கோட்டை 'இந்தியாவின் கோட்டைகளின் முத்தாரம்' என அழைக்கப்படுகிறது. 300 அடி மணற்கல் மலையில் அமைந்துள்ள இந்த கோட்டையில் 15 ஆம் நூற்றாண்டு மான் மந்திர் அரண்மனை மற்றும் குஜரி மஹால் உள்ளன.",
    gu: "ગ્વાલિયરનો કિલ્લો 'હિંદના કિલ્લાઓનો મોતી' કહેવાય છે. 300 ફૂટ ઊંચી ટેકરી પર બનેલા આ કિલ્લામાં માન મંદિર મહેલ, ગૂજરી મહેલ અને ઉરવાઈ ગેટના વિશાળ જૈન શિલ્પો આવેલા છે.",
    ur: "گوالیار کا قلعہ 'ہند کے قلعوں کا موتی' کہلاتا ہے۔ 300 فٹ اونچی پہاڑی پر واقع یہ قلعہ مان مندر محل، گوجری محل اور چٹانوں پر تراشیدہ جین مجسموں کے لیے دنیا بھر میں مشہور ہے۔",
    kn: "ಗ್ವಾಲಿಯರ್ ಕೋಟೆಯನ್ನು 'ಭಾರತದ ಕೋಟೆಗಳ ಮುತ್ತು' ಎಂದು ಕರೆಯಲಾಗುತ್ತದೆ. 300 ಅಡಿ ಎತ್ತರದ ಬೆಟ್ಟದ ಮೇಲಿರುವ ಮಾನ್ ಮಂದಿರ್ ಅರಮನೆ ಮತ್ತು ಗುಜರಿ ಮಹಲ್ ಇದರ ಪ್ರಮುಖ ಆಕರ್ಷಣೆಗಳು.",
    or: "ଗ୍ୱାଲିୟର ଦୁର୍ଗ 'ଭାରତର ଦୁର୍ଗମାନଙ୍କ ମୁକ୍ତା' ଭାବରେ ପରିଚିତ। ଏହି ଐତିହାସିକ ଦୁର୍ଗରେ ମାନ ମନ୍ଦିର ପ୍ରାସାଦ ଏବଂ ଗୁଜରୀ ମହଲ ସଂଗ୍ରହାଳୟ ଅତ୍ୟନ୍ତ ଆକର୍ଷଣୀୟ।",
    ml: "ഗ്വാളിയോർ കോട്ട 'ഇന്ത്യയിലെ കോട്ടകളുടെ മുത്ത്' എന്നാണ് അറിയപ്പെടുന്നത്. 300 അടി ഉയരമുള്ള മലനിരയിൽ സ്ഥിതി ചെയ്യുന്ന മാൻ മന്ദിർ കൊട്ടാരവും ഗുജരി മഹലും കാണേണ്ട കാഴ്ചകളാണ്.",
    pa: "ਗਵਾਲੀਅਰ ਦਾ ਕਿਲ੍ਹਾ 'ਹਿੰਦ ਦੇ ਕਿਲ੍ਹਿਆਂ ਦਾ ਮੋਤੀ' ਮੰਨਿਆ ਜਾਂਦਾ ਹੈ। ੩੦੦ ਫੁੱਟ ਉੱਚੀ ਪਹਾੜੀ 'ਤੇ ਬਣਿਆ ਇਹ ਕਿਲ੍ਹਾ ਮਾਨ ਮੰਦਰ ਮਹਿਲ ਅਤੇ ਗੂਜਰੀ ਮਹਿਲ ਲਈ ਪ੍ਰਸਿੱਧ ਹੈ।",
    as: "গোৱালিয়ৰ দুৰ্গ 'ভাৰতৰ দুৰ্গসমূহৰ মুক্তা' বুলি জনাজাত। ৩০০ ফুট ওখ পাহাৰৰ ওপৰত অৱস্থিত এই দুৰ্গত মান মন্দিৰ ৰাজপ্ৰাসাদ আৰু গুজৰী মহল আছে।",
    sa: "गोपगिरिदुर्गः 'भारते दुर्गमालायाः मुक्तामणिः' इति गीयते। मानमन्दिरं, गूजरी-प्रासादः, विशालाः जैनप्रतिमाः च अस्य वैशिष्ट्यम्।",
    ks: "گوالیار قلعہ چھُ 'ہندوستان کس قلعن ہُنٛد موتی'۔ مان مندر محل تہٕ گوجری محل چھِ اتہِ کنۍ اَہَم یَتھ نظارہ کرنہِ لائق!",
    es: "El imponente Fuerte de Gwalior, calificado por el emperador Babur como 'La Perla de las fortalezas de la India', corona una colina de arenisca de 100 metros. Destacan el Palacio Man Mandir con azulejos azules y las esculturas jainistas de Urvai Gate.",
    fr: "Le Fort de Gwalior, célèbre forteresse que l'empereur Babur qualifiait de 'Perle des forts de l'Inde', surplombe la ville du haut de ses 100 mètres. Les céramiques bleues du palais Man Mandir et le musée Gujari Mahal sont exceptionnels.",
    de: "Die Festung von Gwalior, von Babur als 'Perle unter den Festungen Hindustans' gerühmt, thront 100 Meter über der Ebene. Höhepunkte sind der blau geflieste Man-Mandir-Palast und die Felsenskulpturen am Urvai-Tor.",
    zh: "瓜廖尔城堡被莫卧儿开国皇帝巴布尔盛赞为“印度城堡项链上的明珠”，雄踞在近百米高的砂岩高台上。15世纪蓝色瓷砖镶嵌的曼·曼迪尔宫殿（Man Mandir）、古贾里玛哈尔博物馆以及乌尔瓦伊门的巨型耆那教石窟造像令人叹为观止。",
    ja: "ムガル帝国初代皇帝バーブルが「インドの城塞の首飾りに輝く真珠」と称賛したグワーリヤル城塞。青いタイル装飾が美しい15世紀のマン・マンディル宮殿、グジャリ・マハル博物館、ウルヴァイ門の巨大岩窟ジャイナ教像が見どころです。",
    ko: "무굴 제국의 바부르 황제가 '인도 요새 목걸이의 진주'라 격찬한 그왈리오르 요새는 100미터 사암 언덕 위에 우뚝 솟아 있습니다. 15세기 푸른 타일 장식의 만 만디르 궁전과 우르바이 게이트의 거대한 자이나교 암각상이 백미입니다.",
    ar: "حصن غواليور المهيب الذي وصفه الإمبراطور المغولي بابر بأنه 'لؤلؤة في قلادة حصون الهند'. يقع على هضبة رملية بارتفاع 300 قدم، ومن أبرز معالمه قصر مان ماندير المزين بالبلاط الأزرق وتماثيل جاين الصخرية الضخمة.",
    ru: "Форт Гвалиор, названный падишахом Бабуром 'Жемчужиной в ожерелье крепостей Индии', возвышается на 100-метровом утесе. Главные достопримечательности — дворец Ман Мандир XV века с бирюзовой мозаикой и гигантские джайнские скальные барельефы.",
    pt: "O Forte de Gwalior, aclamado pelo imperador Babur como 'A Pérola dos fortes da Índia', fica no topo de uma colina de arenito de 100 metros. Destaque para o Palácio Man Mandir e as esculturas jainistas esculpidas na rocha.",
    it: "Il Forte di Gwalior, definito dall'imperatore Babur 'La perla nella collana dei forti dell'India', domina dall'alto di un colle di 100 metri. Da non perdere il Palazzo Man Mandir e le imponenti sculture jainiste intagliate nella roccia.",
    th: "ป้อมปราการกวาลิออร์ได้รับการยกย่องจากจักรพรรดิบาบูร์ว่าเป็น 'ไข่มุกในสร้อยคอแห่งป้อมปราการอินเดีย' ตั้งอยู่บนเนินเขาหินทรายสูง 300 ฟุต ไฮไลต์รวมถึงพระราชวัง Man Mandir และรูปสลักศาสนาเชนขนาดใหญ่ริมผาหิน!",
    id: "Benteng Gwalior, yang dipuji oleh Kaisar Babur sebagai 'Mutiara dalam kalung benteng-benteng Hind', berdiri di atas bukit batu pasir setinggi 300 kaki. Menampilkan Istana Man Mandir abad ke-15 dan patung-patung Jain raksasa di Gerbang Urvai.",
    vi: "Pháo đài Gwalior được Hoàng đế Babur ca ngợi là 'Viên ngọc quý trên chuỗi pháo đài Ấn Độ', tọa lạc trên ngọn đồi sa thạch cao gần 100 mét. Điểm nhấn bao gồm Cung điện Man Mandir lợp ngói xanh và các tượng đá Jain khổng lồ tại Cổng Urvai.",
    tr: "Babür İmparatoru Babür tarafından 'Hindistan kalelerinin gerdanlığındaki inci' olarak övülen Gwalior Kalesi, 100 metrelik kumtaşı tepede yer alır. 15. yüzyıldan kalma mavi çinili Man Mandir Sarayı ve devasa Jain kaya heykelleri büyüleyicidir.",
    nl: "Het Fort van Gwalior, door keizer Babur geprezen als 'De Parel in het halssnoer van de forten van Indië', torent 100 meter boven de vlakte uit. Hoogtepunten zijn het Man Mandir Paleis met blauwe tegels en de gigantische Jain-rotsinscripties."
  },
  general: {
    en: "Gwalior is a UNESCO World Heritage City of Music! We recommend experiencing a royal balance of monuments (Gwalior Fort or Jai Vilas Palace), authentic morning Bedai at Naya Bazaar, and evening walks through Maharaj Bada.",
    hi: "ग्वालियर यूनेस्को संगीत नगरी है! हम आपको सलाह देते हैं कि आप ग्वालियर दुर्ग या जयविलास महल के साथ सुबह की खस्ता बेड़ई और शाम को महाराज बाड़ा की सैर का आनंद लें।",
    bundeli: "जै राम जी की! ग्वालियर यूनेस्को संगीत नगरी ऐ। हम सलाह देत हैं कि आप ग्वालियर दुर्ग या जयविलास महल देखौ, सबेरे गरमा-गरम बेड़ई खाओ और साँझ कूँ महाराज बाड़ा घूमो!",
    mr: "ग्वाल्हेर ही युनेस्को जागतिक संगीत नगरी आहे! आम्ही आपणास ग्वाल्हेर किल्ला किंवा जयविलास राजवाडा, सकाळची खमंग बेढई आणि संध्याकाळी महाराज बाड्याची सैर अनुभवण्याचा सल्ला देतो.",
    bn: "গোয়ালিয়র ইউনেস্কো সঙ্গীত নগরী! আমরা আপনাকে গোয়ালিয়র দুর্গ বা জয়বিলাস প্রাসাদের পাশাপাশি সকালে সুস্বাদু বেদই এবং সন্ধ্যায় মহারাজ বাডার প্রাণবন্ত পরিবেশ উপভোগ করার পরামর্শ দিচ্ছি।",
    te: "గ్వాలియర్ యునెస్కో సంగీత నగరం! మీరు గ్వాలియర్ కోట లేదా జై విలాస్ ప్యాలెస్, ఉదయం వేడి బేడై మరియు సాయంత్రం మహారాజ్ బాడాలో షాపింగ్ అనుభవాన్ని ఆస్వాదించాలని మేము సిఫార్సు చేస్తున్నాము.",
    ta: "குவாலியர் யுனெஸ்கோ இசை நகரமாகும்! குவாலியர் கோட்டை அல்லது ஜெய் விலாஸ் அரண்மனை, காலையில் ருசியான பேடை மற்றும் மாலையில் மகாராஜ் பாடாவில் உலா வருவதை நாங்கள் பரிந்துரைக்கிறோம்.",
    gu: "ગ્વાલિયર યુનેસ્કો સંગીત નગરી છે! અમે તમને ગ્વાલિયર કિલ્લો અથવા જયવિલાસ મહેલ, સવારે ગરમાગરમ બેડઈ અને સાંજે મહારાજ બાડાની મુલાકાત લેવાની ભલામણ કરીએ છીએ.",
    ur: "گوالیار یونیسکو سٹی آف میوزک ہے! ہم آپ کو مشورہ دیتے ہیں کہ گوالیار قلعہ یا جے ولاس محل کی سیر کے ساتھ صبح بیڑئی-آلو اور شام کو مہاراج باڑا کی رونقوں کا لطف اٹھائیں۔",
    kn: "ಗ್ವಾಲಿಯರ್ ಯುನೆಸ್ಕೋ ಸಂಗೀತ ನಗರ! ಗ್ವಾಲಿಯರ್ ಕೋಟೆ, ಜೈ ವಿಲಾಸ್ ಅರಮನೆ, ಬೆಳಗಿನ ಬಿಸಿ ಬೇಡೈ ಮತ್ತು ಸಂಜೆ ಮಹಾರಾಜ್ ಬಾಡಾದ ವೈಭವವನ್ನು ಅನುಭವಿಸಲು ನಾವು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ.",
    or: "ଗ୍ୱାଲିୟର ଏକ ୟୁନେସ୍କୋ ସଙ୍ଗୀତ ନଗରୀ! ଆମେ ଆପଣଙ୍କୁ ଗ୍ୱାଲିୟର ଦୁର୍ଗ, ଜୟ ବିଳାସ ପ୍ରାସାଦ ସହିତ ସକାଳର ସ୍ୱାଦିଷ୍ଟ ବେଡ଼ଇ ଏବଂ ସନ୍ଧ୍ୟାରେ ମହାରାଜ ବାଡ଼ା ଭ୍ରମଣ ପାଇଁ ପରାମର୍ଶ ଦେଉଛୁ।",
    ml: "ഗ്വാളിയോർ യുനെസ്കോ സംഗീത നഗരമാണ്! ഗ്വാളിയോർ കോട്ടയോ ജയ് വിലാസ് കൊട്ടാരമോ സന്ദർശിക്കാനും, രാവിലത്തെ ബേഡൈ ആസ്വദിക്കാനും, വൈകുന്നേരം മഹാരാജ് ബാഡയിൽ സമയം ചെലവഴിക്കാനും ഞങ്ങൾ ശുപാർശ ചെയ്യുന്നു.",
    pa: "ਗਵਾਲੀਅਰ ਯੂਨੈਸਕੋ ਸੰਗੀਤ ਨਗਰੀ ਹੈ! ਅਸੀਂ ਤੁਹਾਨੂੰ ਗਵਾਲੀਅਰ ਦਾ ਕਿਲ੍ਹਾ ਜਾਂ ਜੈ ਵਿਲਾਸ ਮਹਿਲ ਵੇਖਣ, ਸਵੇਰੇ ਤਾਜ਼ਾ ਬੇੜਈ ਖਾਣ ਅਤੇ ਸ਼ਾਮ ਨੂੰ ਮਹਾਰਾਜ ਬਾੜਾ ਘੁੰਮਣ ਦੀ ਸਲਾਹ ਦਿੰਦੇ ਹਾਂ।",
    as: "গোৱালিয়ৰ ইউনেস্কো সংগীত নগৰী! আমি আপোনাক গোৱালিয়ৰ দুৰ্গ বা জয় বিলাস প্ৰাসাদ দৰ্শনৰ লগতে ৰাতিপুৱাৰ সুস্বাদু বেদই আৰু গধূলি মহাৰাজ বাডা ভ্ৰমণৰ পৰামৰ্শ দিওঁ।",
    sa: "नमस्ते! ग्वालियर-नगरं युनेस्को-सङ्गीतनगरी वर्तते। वयं भवतां गोपगिरि-दुर्गे, जयविलास-प्रासादे च स्वागतं कुर्मः। प्रातर्भोजने बेड़ई-आस्वादनं कुर्वन्तु!",
    ks: "گوالیار چھُ یونیسکو سٹی آف میوزک! تُہۍ گژھیو گوالیار قلعہ، جے ولاس پیلس، صبحس گرم بیڑئی تہٕ شامس مہاراج باڑا ہُنٛد نظارہ کرُن!",
    es: "¡Gwalior es Ciudad de la Música por la UNESCO! Le recomendamos disfrutar de un equilibrio regio entre monumentos (Fuerte de Gwalior o Palacio Jai Vilas), auténtico Bedai matutino y paseos por Maharaj Bada.",
    fr: "Gwalior est une Ville Créative de la Musique UNESCO ! Nous vous recommandons une immersion royale entre monuments (Fort de Gwalior ou Palais Jai Vilas), petit-déjeuner Bedai et balades à Maharaj Bada.",
    de: "Gwalior ist eine UNESCO-Musikstadt! Wir empfehlen Ihnen eine königliche Mischung aus Monumenten (Gwalior-Fort oder Jai-Vilas-Palast), traditionellem Bedai am Morgen und Abendspaziergängen am Maharaj Bada.",
    zh: "瓜廖尔是联合国教科文组织评定的“音乐之都”！我们建议您在宏伟古迹（瓜廖尔城堡或杰伊·维拉斯宫）、清晨地道贝代早餐以及傍晚漫步马哈拉杰巴达之间，感受王室文化之旅。",
    ja: "グワーリヤルはユネスコ認定の「音楽都市」です！グワーリヤル城塞やジャイ・ヴィラース宮殿などの歴史的名所、朝の名物ベダイ、そして夕方のマハラジ・バダ散策をぜひお楽しみください。",
    ko: "그왈리오르는 유네스코 세계 음악 도시입니다! 그왈리오르 요새 또는 자이 빌라스 궁전 탐방, 나야 바자르에서의 아침 베다이 조식, 저녁 마하라지 바다 산책을 추천합니다.",
    ar: "غواليور هي مدينة الموسيقى المسجلة لدى اليونسكو! نوصي بتجربة توازن ملكي بين المعالم الأثرية (حصن غواليور أو قصر جاي فيلاس)، وتناول إفطار بيداي التقليدي، والتنزه في مهاراج بادا مساءً.",
    ru: "Гвалиор — Город музыки ЮНЕСКО! Рекомендуем совместить осмотр царственных памятников (Форт Гвалиор или Дворец Джай Вилас), утренний завтрак бедаи и вечерние прогулки по площади Махарадж Бада.",
    pt: "Gwalior é uma Cidade da Música da UNESCO! Recomendamos um equilíbrio real entre monumentos (Forte de Gwalior ou Palácio Jai Vilas), o café da manhã autêntico com Bedai e passeios no Maharaj Bada.",
    it: "Gwalior è Città della Musica UNESCO! Vi consigliamo di vivere un equilibrio regale tra i monumenti (Forte di Gwalior o Palazzo Jai Vilas), la colazione tipica con Bedai e le passeggiate a Maharaj Bada.",
    th: "กวาลิออร์เป็นเมืองแห่งดนตรีของยูเนสโก! เราขอแนะนำให้สัมผัสความงดงามของป้อมปราการกวาลิออร์หรือพระราชวังไจวิลาส ลิ้มลองอาหารเช้าเบได และเดินเล่นยามเย็นที่มหาราจบาดา",
    id: "Gwalior adalah Kota Musik UNESCO! Kami menyarankan Anda menikmati perpaduan megah monumen bersejarah (Benteng Gwalior atau Istana Jai Vilas), sarapan Bedai otentik, dan jalan-jalan sore di Maharaj Bada.",
    vi: "Gwalior là Thành phố Âm nhạc được UNESCO công nhận! Chúng tôi khuyên bạn nên trải nghiệm sự kết hợp hoàng gia giữa các di tích (Pháo đài Gwalior hoặc Cung điện Jai Vilas), món Bedai buổi sáng và dạo bộ ở Maharaj Bada.",
    tr: "Gwalior, UNESCO Müzik Şehridir! Tarihi anıtlar (Gwalior Kalesi veya Jai Vilas Sarayı), sabah geleneksel Bedai kahvaltısı ve akşam Maharaj Bada yürüyüşü ile muhteşem bir gün geçirmenizi öneririz.",
    nl: "Gwalior is een UNESCO-muziekstad! We raden een koninklijke combinatie aan van monumenten (Fort van Gwalior of Jai Vilas Paleis), authentieke ochtend-Bedai en avondwandelingen over Maharaj Bada."
  }
};

/**
 * Suggestions generator based on topic & language
 */
const TANSEN_SUGGESTIONS = {
  bada: {
    en: ['Where to buy Chanderi sarees?', 'Suggest food near Bada', 'Show Bada on Map'],
    hi: ['असली चंदेरी साड़ी कहाँ मिलेगी?', 'बाड़ा के पास खान-पान बताएं', 'नक्शे पर बाड़ा देखें'],
    bundeli: ['चंदेरी साड़ी कहाँ मिले?', 'बाड़ा के पास खान-पान', 'नक्शा में बाड़ा देखो'],
    mr: ['चंदेरी साडी कुठे मिळेल?', 'बाड्याभोवती खाद्यसंस्कृती', 'नकाशावर बाडा पहा'],
    es: ['¿Dónde comprar saris Chanderi?', 'Comida cerca de Bada', 'Ver Bada en el mapa'],
    fr: ['Où acheter des saris Chanderi ?', 'Restaurants près de Bada', 'Voir Bada sur la carte'],
    de: ['Wo Chanderi-Saris kaufen?', 'Essen nahe Bada', 'Bada auf Karte anzeigen']
  },
  food: {
    en: ['Add S.S. Kachori to Itinerary', 'What is Morena Gajak?', 'Show route for Food Trail'],
    hi: ['एस.एस. कचौड़ी मार्ग में जोड़ें', 'मुरैना गजक क्या है?', 'फूड ट्रेल का मार्ग देखें'],
    bundeli: ['एस.एस. कचौड़ी रस्ता में जोड़ो', 'मुरैना गजक का ऐ?', 'खान-पान कौ रस्ता देखो'],
    mr: ['एस.एस. कचोरी मार्गात जोडा', 'मुरैना गजक काय आहे?', 'फूड ट्रेल नकाशा पहा'],
    es: ['Añadir S.S. Kachori a ruta', '¿Qué es Morena Gajak?', 'Ver ruta gastronómica'],
    fr: ['Ajouter S.S. Kachori au trajet', 'Qu’est-ce que Morena Gajak ?', 'Voir la route gourmande'],
    de: ['S.S. Kachori zur Route', 'Was ist Morena Gajak?', 'Genuss-Route anzeigen']
  },
  chanderi: {
    en: ['Add Mrignayani to Route', 'What are typical Chanderi prices?', 'Show Shopping spots'],
    hi: ['मृगनयनी मार्ग में जोड़ें', 'चंदेरी साड़ियों के भाव क्या हैं?', 'खरीदारी के स्थान देखें'],
    bundeli: ['मृगनयनी रस्ता में जोड़ो', 'चंदेरी साड़ी के भाव का हैं?', 'दुकानन की जगह देखो'],
    mr: ['मृगनयनी मार्गात जोडा', 'चंदेरी साड्यांचे दर काय आहेत?', 'खरेदीची ठिकाणे पहा'],
    es: ['Añadir Mrignayani a ruta', 'Precios de saris Chanderi', 'Ver tiendas recomendadas'],
    fr: ['Ajouter Mrignayani au trajet', 'Prix des saris Chanderi', 'Voir les boutiques'],
    de: ['Mrignayani zur Route', 'Chanderi-Preise ansehen', 'Einkaufsorte anzeigen']
  },
  tansen: {
    en: ['Add Tansen Tomb to Route', 'When is Tansen Samaroh?', 'Tell me about Dhrupad music'],
    hi: ['तानसेन मकबरा मार्ग में जोड़ें', 'तानसेन समारोह कब होता है?', 'ध्रुपद संगीत के बारे में बताएं'],
    bundeli: ['तानसेन मक़बरा रस्ता में जोड़ो', 'तानसेन समारोह कब होत ऐ?', 'ध्रुपद संगीत का ऐ?'],
    mr: ['तानसेन समाधी मार्गात जोडा', 'तानसेन समारोह कधी असतो?', 'ध्रुपद संगीताबद्दल सांगा'],
    es: ['Añadir tumba de Tansen a ruta', '¿Cuándo es Tansen Samaroh?', 'Música Dhrupad'],
    fr: ['Ajouter tombeau de Tansen', 'Quand a lieu Tansen Samaroh ?', 'Histoire de Dhrupad'],
    de: ['Tansen-Grabmal zur Route', 'Wann ist Tansen Samaroh?', 'Über Dhrupad-Musik']
  },
  fort: {
    en: ['Add Gwalior Fort to Route', 'Best gate to enter Fort', 'Show Man Mandir Palace'],
    hi: ['ग्वालियर किला मार्ग में जोड़ें', 'किले में प्रवेश का सबसे अच्छा गेट', 'मान मंदिर महल देखें'],
    bundeli: ['ग्वालियर किला रस्ता में जोड़ो', 'किला चढ़बे कौ बढ़िया गेट', 'मान मंदिर महल देखो'],
    mr: ['ग्वाल्हेर किल्ला मार्गात जोडा', 'किल्ल्यात जाण्यासाठी उत्तम मार्ग', 'मान मंदिर महाल पहा'],
    es: ['Añadir Fuerte a ruta', 'Mejor puerta de acceso al Fuerte', 'Ver Palacio Man Mandir'],
    fr: ['Ajouter Fort de Gwalior', 'Meilleure porte d’accès', 'Voir Palais Man Mandir'],
    de: ['Gwalior-Fort zur Route', 'Bester Zugang zum Fort', 'Man-Mandir-Palast']
  },
  general: {
    en: ['Show Tier 1 Iconic spots', 'Plan 4-hour royal tour', 'Tell me about local sweets'],
    hi: ['प्रमुख ऐतिहासिक स्थल देखें', '4 घंटे का शाही टूर प्लान करें', 'स्थानीय मिठाइयों के बारे में बताएं'],
    bundeli: ['मुख्य ऐतिहासिक स्थल देखो', '४ घंटा कौ शाही टूर बनाओ', 'ग्वालियर की मिठाई बताओ'],
    mr: ['प्रमुख ऐतिहासिक ठिकाणे पहा', '४ तासांचा शाही टूर आखा', 'स्थानिक मिठायांबद्दल सांगा'],
    es: ['Ver monumentos principales', 'Planificar tour de 4 horas', 'Dulces tradicionales'],
    fr: ['Voir les sites historiques', 'Organiser un tour de 4 heures', 'Pâtisseries locales'],
    de: ['Top-Sehenswürdigkeiten', '4-Stunden-Königstour planen', 'Lokale Süßspeisen']
  }
};

/**
 * Generates an intelligent, culturally authentic response in the user's active language
 */
export function generateTansenAIResponse(query, selectedLang = 'en', context = {}) {
  // Build and log the complete prompt payload
  const payload = buildAIPromptPayload(query, selectedLang, context);
  
  const lower = (query || '').toLowerCase();
  let intent = 'general';

  if (lower.includes('bada') || lower.includes('बाड़ा') || lower.includes('market') || lower.includes('victoria') || lower.includes('बाडा') || lower.includes('বাজার') || lower.includes('plaza') || lower.includes('square')) {
    intent = 'bada';
  } else if (lower.includes('food') || lower.includes('3 hours') || lower.includes('खाना') || lower.includes('कचौड़ी') || lower.includes('लड्डू') || lower.includes('bedai') || lower.includes('बेड़ई') || lower.includes('gajak') || lower.includes('गजक') || lower.includes('sweet') || lower.includes('मिठाई') || lower.includes('खाद्य') || lower.includes('comida') || lower.includes('cuisine') || lower.includes('essen')) {
    intent = 'food';
  } else if (lower.includes('chanderi') || lower.includes('saree') || lower.includes('साड़ी') || lower.includes('साड़ी') || lower.includes('silk') || lower.includes('handloom') || lower.includes('बुनकर') || lower.includes('mrignayani') || lower.includes('सिल्क') || lower.includes('शাড়ি') || lower.includes('sari')) {
    intent = 'chanderi';
  } else if (lower.includes('tansen') || lower.includes('तानसेन') || lower.includes('music') || lower.includes('संगीत') || lower.includes('gharana') || lower.includes('घराना') || lower.includes('samaroh') || lower.includes('dhrupad')) {
    intent = 'tansen';
  } else if (lower.includes('fort') || lower.includes('किला') || lower.includes('दुर्ग') || lower.includes('man mandir') || lower.includes('gujari') || lower.includes('महल') || lower.includes('urvai') || lower.includes('fuerte') || lower.includes('festung')) {
    intent = 'fort';
  }

  // Retrieve localized response
  const topicResponses = TANSEN_RESPONSES[intent] || TANSEN_RESPONSES.general;
  let text = topicResponses[selectedLang];

  // If exact localized string for lesser-used language code isn't present, build an authentic response in that language
  if (!text) {
    if (selectedLang === 'hi' || selectedLang === 'bundeli') {
      text = topicResponses.hi || topicResponses.en;
    } else if (topicResponses[selectedLang]) {
      text = topicResponses[selectedLang];
    } else {
      // Fallback with language greeting acknowledgment
      const activeLang = LANGUAGES_LIST.find(l => l.code === selectedLang) || { name: 'English', native: 'English' };
      text = `[${activeLang.native}]: ${topicResponses.en}`;
    }
  }

  // Retrieve localized suggestions
  const topicSuggestions = TANSEN_SUGGESTIONS[intent] || TANSEN_SUGGESTIONS.general;
  const suggestions = topicSuggestions[selectedLang] || topicSuggestions.en;

  return {
    text,
    suggestions,
    payload
  };
}

