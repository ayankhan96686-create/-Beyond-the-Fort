import json, logging, os, re
from typing import Any
from state import TourismAgentState

log = logging.getLogger(__name__)
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "gwalior_curated_pois.json"))
SUPPLEMENTAL_DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "beyond_the_fort_places.json"))
SUPPLEMENTAL_DWELL_MINUTES = 30
MAX_RESEARCH_CANDIDATES = 6

IMAGE_ASSETS = {
    "chanderi": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg/960px-Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg",
        "image_credit": "Shoot stufz / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Master artisan weaving genuine Chanderi silk saree on a traditional pit loom",
    },
    "kachori": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Kachori-sabzi.jpg/960px-Kachori-sabzi.jpg",
        "image_credit": "Priyanka nawalramka / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Kachori-sabzi.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Authentic Bedai and crisp spiced Urad-dal Kachori served with hing potato gravy",
    },
    "bedai": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Kachori-sabzi.jpg/960px-Kachori-sabzi.jpg",
        "image_credit": "Priyanka nawalramka / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Kachori-sabzi.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Authentic Bedai and crisp spiced Urad-dal Kachori served with hing potato gravy",
    },
    "maharaj bada": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Maharaj_Bada_Gwalior.jpg/960px-Maharaj_Bada_Gwalior.jpg",
        "image_credit": "Neerajshivpuri / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Maharaj_Bada_Gwalior.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Historic Maharaj Bada square, bustling center of Gwalior metal and stone craft guilds",
    },
    "tansen": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Tomb_of_Tansen.jpg/960px-Tomb_of_Tansen.jpg",
        "image_credit": "Simon Wagner / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Tomb_of_Tansen.jpg",
        "image_license": "CC BY-SA 2.5",
        "image_caption": "Tomb of Mian Tansen, cultural sanctum of Gwalior Gharana classical Dhrupad music",
    },
    "gajak": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg/960px-Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg",
        "image_credit": "Billjones94 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Gur_Rewari_(a_kind_of_Gajak)_from_Lucknow,_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Artisanal hand-pounded sesame and jaggery Gwaliori Gajak brittle",
    },
    "zari": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg/960px-Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg",
        "image_credit": "Zarood / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Close_Shot_of_the_Zardozi_(Zardouzi)_Embroidery_Cushion_Covers.jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Generational master artisans executing royal court Zari & Zardozi gold embroidery",
    },
    "zardozi": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg/960px-Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg",
        "image_credit": "Zarood / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Close_Shot_of_the_Zardozi_(Zardouzi)_Embroidery_Cushion_Covers.jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Generational master artisans executing royal court Zari & Zardozi gold embroidery",
    },
    "sarafa": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Lac_Bangles_making_Hyderabad_%2823718%29.jpg/960px-Lac_Bangles_making_Hyderabad_%2823718%29.jpg",
        "image_credit": "PJeganathan / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Lac_Bangles_making_Hyderabad_(23718).jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Sarafa bazaar artisans flame-shaping melted natural lac bangles and silver filigree",
    },
    "lac": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Lac_Bangles_making_Hyderabad_%2823718%29.jpg/960px-Lac_Bangles_making_Hyderabad_%2823718%29.jpg",
        "image_credit": "PJeganathan / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Lac_Bangles_making_Hyderabad_(23718).jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Sarafa bazaar artisans flame-shaping melted natural lac bangles and silver filigree",
    },
    "pottery": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg/960px-Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg",
        "image_credit": "Gannu03 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Daulat Ganj potter spinning unglazed Chambal river clay urns on a traditional wheel",
    },
    "clay": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg/960px-Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg",
        "image_credit": "Gannu03 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Daulat Ganj potter spinning unglazed Chambal river clay urns on a traditional wheel",
    },
    "sun temple": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Surya_mandir_Birla_Sun_temple_Gwalior.jpg/960px-Surya_mandir_Birla_Sun_temple_Gwalior.jpg",
        "image_credit": "Yashasvi joshi / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Surya_mandir_Birla_Sun_temple_Gwalior.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Red sandstone architecture and artisan gardens of Morar Sun Temple (Surya Mandir)",
    },
    "surya mandir": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Surya_mandir_Birla_Sun_temple_Gwalior.jpg/960px-Surya_mandir_Birla_Sun_temple_Gwalior.jpg",
        "image_credit": "Yashasvi joshi / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Surya_mandir_Birla_Sun_temple_Gwalior.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Red sandstone architecture and artisan gardens of Morar Sun Temple (Surya Mandir)",
    },
    "pakhawaj": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Pakhawaj_img.jpg/960px-Pakhawaj_img.jpg",
        "image_credit": "RahulRajak027 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Pakhawaj_img.jpg",
        "image_license": "CC0",
        "image_caption": "Acoustic craftsmen tuning handmade Sheesham wood Pakhawaj and Dhrupad instruments",
    },
    "phool bagh": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Pakhawaj_img.jpg/960px-Pakhawaj_img.jpg",
        "image_credit": "RahulRajak027 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Pakhawaj_img.jpg",
        "image_license": "CC0",
        "image_caption": "Acoustic craftsmen tuning handmade Sheesham wood Pakhawaj and Dhrupad instruments",
    },
    "khadi": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Charkha_%28spinning_wheel%291.jpg/960px-Charkha_%28spinning_wheel%291.jpg",
        "image_credit": "Janak Bhatta / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Charkha_(spinning_wheel)1.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional Charkha spinning wheel producing organic handloom Khadi cotton yarn",
    },
    "petha": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Gulab_Jamun_as_a_Diwali_Sweet.jpg/960px-Gulab_Jamun_as_a_Diwali_Sweet.jpg",
        "image_credit": "Yakshitha / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Gulab_Jamun_as_a_Diwali_Sweet.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Warm mawa Gulab Jamuns and kesar petha freshly simmered in copper cauldrons",
    },
    "gulab jamun": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Gulab_Jamun_as_a_Diwali_Sweet.jpg/960px-Gulab_Jamun_as_a_Diwali_Sweet.jpg",
        "image_credit": "Yakshitha / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Gulab_Jamun_as_a_Diwali_Sweet.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Warm mawa Gulab Jamuns and kesar petha freshly simmered in copper cauldrons",
    },
    "jai vilas palace": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/DUrbar_hall_at_jai_vilas_palace.JPG/960px-DUrbar_hall_at_jai_vilas_palace.JPG",
        "image_credit": "Adityajoardar9 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:DUrbar_hall_at_jai_vilas_palace.JPG",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Durbar Hall inside Jai Vilas Palace",
    },
    "hh maharaja sir jiwajirao scindia museum": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/DUrbar_hall_at_jai_vilas_palace.JPG/960px-DUrbar_hall_at_jai_vilas_palace.JPG",
        "image_credit": "Adityajoardar9 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:DUrbar_hall_at_jai_vilas_palace.JPG",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Scindia Museum is housed inside Jai Vilas Palace",
    },
    "scindia museum": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/DUrbar_hall_at_jai_vilas_palace.JPG/960px-DUrbar_hall_at_jai_vilas_palace.JPG",
        "image_credit": "Adityajoardar9 / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:DUrbar_hall_at_jai_vilas_palace.JPG",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Scindia Museum is housed inside Jai Vilas Palace",
    },
    "government museum": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Moti_Mahal%2C_Gwalior%2C_Madhya_Pradesh_04.jpg/960px-Moti_Mahal%2C_Gwalior%2C_Madhya_Pradesh_04.jpg",
        "image_credit": "Amitabha Gupta / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Moti_Mahal,_Gwalior,_Madhya_Pradesh_04.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Moti Mahal building, Gwalior",
    },
    "moti mahal": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Moti_Mahal%2C_Gwalior%2C_Madhya_Pradesh_04.jpg/960px-Moti_Mahal%2C_Gwalior%2C_Madhya_Pradesh_04.jpg",
        "image_credit": "Amitabha Gupta / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Moti_Mahal,_Gwalior,_Madhya_Pradesh_04.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Moti Mahal building, Gwalior",
    },
    "gujari mahal": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/Gujari_Mahal_in_Gwalior_Fort.jpg/960px-Gujari_Mahal_in_Gwalior_Fort.jpg",
        "image_credit": "Nitin Pandey / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Gujari_Mahal_in_Gwalior_Fort.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Gujari Mahal inside Gwalior Fort",
    },
    "fort": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Gwalior_fort_panorama.jpg/960px-Gwalior_fort_panorama.jpg",
        "image_credit": "Pavel Suprun / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Gwalior_fort_panorama.jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Gwalior Fort panorama and ancient ramparts",
    },
    "man mandir": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Gwalior_fort_panorama.jpg/960px-Gwalior_fort_panorama.jpg",
        "image_credit": "Pavel Suprun / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Gwalior_fort_panorama.jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Man Mandir Palace ramparts at Gwalior Fort",
    },
    "sas bahu": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Sas-bahu_Temple_%28Gwalior%29.jpg/960px-Sas-bahu_Temple_%28Gwalior%29.jpg",
        "image_credit": "Kshitiz Sikka / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Sas-bahu_Temple_(Gwalior).jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "11th-century carved stone ceiling of Sas Bahu Temples at Gwalior Fort",
    },
    "sahastrabahu": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Sas-bahu_Temple_%28Gwalior%29.jpg/960px-Sas-bahu_Temple_%28Gwalior%29.jpg",
        "image_credit": "Kshitiz Sikka / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Sas-bahu_Temple_(Gwalior).jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "11th-century carved stone ceiling of Sas Bahu Temples at Gwalior Fort",
    },
    "teli ka mandir": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Teli_Ka_Mandir_Front.jpg/960px-Teli_Ka_Mandir_Front.jpg",
        "image_credit": "Abhishek / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Teli_Ka_Mandir_Front.jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Teli Ka Mandir, the tallest ancient monument inside Gwalior Fort",
    },
    "mohammad ghaus": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Tomb_of_Mohammad_Ghaus_Gwalior_IMG_20181031_110535050_HDR.jpg/960px-Tomb_of_Mohammad_Ghaus_Gwalior_IMG_20181031_110535050_HDR.jpg",
        "image_credit": "Souravchakra / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Tomb_of_Mohammad_Ghaus_Gwalior_IMG_20181031_110535050_HDR.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "16th-century pierced stone jaali screens at the Tomb of Muhammad Ghaus",
    },
    "muhammad ghaus": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Tomb_of_Mohammad_Ghaus_Gwalior_IMG_20181031_110535050_HDR.jpg/960px-Tomb_of_Mohammad_Ghaus_Gwalior_IMG_20181031_110535050_HDR.jpg",
        "image_credit": "Souravchakra / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Tomb_of_Mohammad_Ghaus_Gwalior_IMG_20181031_110535050_HDR.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "16th-century pierced stone jaali screens at the Tomb of Muhammad Ghaus",
    },
    "tea": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Masala_Tea.jpg/960px-Masala_Tea.jpg",
        "image_credit": "AlekhyaDas / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Masala_Tea.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional spiced Indian masala chai served in an authentic earthen kulhad",
    },
    "chai": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Masala_Tea.jpg/960px-Masala_Tea.jpg",
        "image_credit": "AlekhyaDas / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Masala_Tea.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional spiced Indian masala chai served in an authentic earthen kulhad",
    },
    "lounge": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Masala_Tea.jpg/960px-Masala_Tea.jpg",
        "image_credit": "AlekhyaDas / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Masala_Tea.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional spiced Indian masala chai served in an authentic earthen kulhad",
    },
    "cookie": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Naan_khataai_the_Indian_sweet_cookie.JPG/960px-Naan_khataai_the_Indian_sweet_cookie.JPG",
        "image_credit": "PJ.wikilovesfood / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Naan_khataai_the_Indian_sweet_cookie.JPG",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional cardamom and semolina Naan Khatai artisanal cookies",
    },
    "cake": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Naan_khataai_the_Indian_sweet_cookie.JPG/960px-Naan_khataai_the_Indian_sweet_cookie.JPG",
        "image_credit": "PJ.wikilovesfood / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Naan_khataai_the_Indian_sweet_cookie.JPG",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional cardamom and semolina Naan Khatai artisanal cookies",
    },
    "bakery": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Naan_khataai_the_Indian_sweet_cookie.JPG/960px-Naan_khataai_the_Indian_sweet_cookie.JPG",
        "image_credit": "PJ.wikilovesfood / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Naan_khataai_the_Indian_sweet_cookie.JPG",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional cardamom and semolina Naan Khatai artisanal cookies",
    },
    "hotel": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/North_Indian_Vegetarian_Thali-MB51.jpg/960px-North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_credit": "Rajeeb Dutta / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional North Indian vegetarian thali feast",
    },
    "caterer": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/North_Indian_Vegetarian_Thali-MB51.jpg/960px-North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_credit": "Rajeeb Dutta / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional North Indian vegetarian thali feast",
    },
    "restaurant": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/North_Indian_Vegetarian_Thali-MB51.jpg/960px-North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_credit": "Rajeeb Dutta / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional North Indian vegetarian thali feast",
    },
    "thali": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/North_Indian_Vegetarian_Thali-MB51.jpg/960px-North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_credit": "Rajeeb Dutta / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:North_Indian_Vegetarian_Thali-MB51.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Traditional North Indian vegetarian thali feast",
    },
    "jalebi": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Jalebi_image.jpg/960px-Jalebi_image.jpg",
        "image_credit": "Charles Haynes / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Jalebi_image.jpg",
        "image_license": "CC BY-SA 2.0",
        "image_caption": "Crispy golden jalebis freshly prepared in desi ghee",
    },
}

CATEGORY_IMAGE_POOLS = {
    "culinary": [
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Kachori-sabzi.jpg/960px-Kachori-sabzi.jpg",
            "image_credit": "Priyanka nawalramka / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Kachori-sabzi.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Authentic Bedai and crisp spiced Urad-dal Kachori with hing potato gravy",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg/960px-Gur_Rewari_%28a_kind_of_Gajak%29_from_Lucknow%2C_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg",
            "image_credit": "Billjones94 / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Gur_Rewari_(a_kind_of_Gajak)_from_Lucknow,_a_traditional_Indian_snack_made_with_Jaggery_and_crunchy_sesame_seeds_in_the_form_of_crispy_bars.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Artisanal hand-pounded sesame and jaggery Gwaliori Gajak brittle",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/North_Indian_Vegetarian_Thali-MB51.jpg/960px-North_Indian_Vegetarian_Thali-MB51.jpg",
            "image_credit": "Rajeeb Dutta / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:North_Indian_Vegetarian_Thali-MB51.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Traditional North Indian heritage thali banquet",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Gulab_Jamun_as_a_Diwali_Sweet.jpg/960px-Gulab_Jamun_as_a_Diwali_Sweet.jpg",
            "image_credit": "Yakshitha / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Gulab_Jamun_as_a_Diwali_Sweet.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Warm mawa Gulab Jamuns and kesar petha confections",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Masala_Tea.jpg/960px-Masala_Tea.jpg",
            "image_credit": "AlekhyaDas / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Masala_Tea.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Traditional spiced Indian masala chai served in an earthen kulhad",
        },
    ],
    "crafts": [
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg/960px-Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg",
            "image_credit": "Shoot stufz / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Master artisan weaving genuine Chanderi silk saree on a pit loom",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg/960px-Close_Shot_of_the_Zardozi_%28Zardouzi%29_Embroidery_Cushion_Covers.jpg",
            "image_credit": "Zarood / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Close_Shot_of_the_Zardozi_(Zardouzi)_Embroidery_Cushion_Covers.jpg",
            "image_license": "CC BY-SA 3.0",
            "image_caption": "Intricate metallic gold and silver bullion Zardozi needlework",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Lac_Bangles_making_Hyderabad_%2823718%29.jpg/960px-Lac_Bangles_making_Hyderabad_%2823718%29.jpg",
            "image_credit": "PJeganathan / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Lac_Bangles_making_Hyderabad_(23718).jpg",
            "image_license": "CC BY-SA 3.0",
            "image_caption": "Sarafa bazaar artisans flame-shaping melted natural lac bangles",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg/960px-Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg",
            "image_credit": "Gannu03 / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Potter_shaping_clay_on_a_traditional_manual_potter%E2%80%99s_wheel_in_India_01.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Master potter shaping natural Chambal river clay on traditional manual wheel",
        },
    ],
    "music": [
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Tomb_of_Tansen.jpg/960px-Tomb_of_Tansen.jpg",
            "image_credit": "Simon Wagner / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Tomb_of_Tansen.jpg",
            "image_license": "CC BY-SA 2.5",
            "image_caption": "Tomb of Mian Tansen, cultural sanctum of Gwalior Gharana classical music",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Pakhawaj_img.jpg/960px-Pakhawaj_img.jpg",
            "image_credit": "RahulRajak027 / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Pakhawaj_img.jpg",
            "image_license": "CC0",
            "image_caption": "Handmade Pakhawaj acoustic barrel drum crafted from seasoned sheesham wood",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/DhrupadConcert.jpg/960px-DhrupadConcert.jpg",
            "image_credit": "Oscar / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:DhrupadConcert.jpg",
            "image_license": "CC BY-SA 3.0 or GFDL",
            "image_caption": "Gwalior Gharana classical Dhrupad performance",
        },
    ],
    "heritage": [
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Gwalior_fort_panorama.jpg/960px-Gwalior_fort_panorama.jpg",
            "image_credit": "Pavel Suprun / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Gwalior_fort_panorama.jpg",
            "image_license": "CC BY-SA 3.0",
            "image_caption": "Gwalior Fort panorama and ancient ramparts",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Sas-bahu_Temple_%28Gwalior%29.jpg/960px-Sas-bahu_Temple_%28Gwalior%29.jpg",
            "image_credit": "Kshitiz Sikka / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Sas-bahu_Temple_(Gwalior).jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "11th-century carved stone ceiling of Sas Bahu Temples at Gwalior Fort",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Teli_Ka_Mandir_Front.jpg/960px-Teli_Ka_Mandir_Front.jpg",
            "image_credit": "Abhishek / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Teli_Ka_Mandir_Front.jpg",
            "image_license": "CC BY-SA 3.0",
            "image_caption": "Teli Ka Mandir, the tallest ancient monument inside Gwalior Fort",
        },
        {
            "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Surya_mandir_Birla_Sun_temple_Gwalior.jpg/960px-Surya_mandir_Birla_Sun_temple_Gwalior.jpg",
            "image_credit": "Yashasvi joshi / Wikimedia Commons",
            "image_source_url": "https://commons.wikimedia.org/wiki/File:Surya_mandir_Birla_Sun_temple_Gwalior.jpg",
            "image_license": "CC BY-SA 4.0",
            "image_caption": "Red sandstone architecture of Morar Sun Temple (Surya Mandir)",
        },
    ]
}

REPRESENTATIVE_IMAGES = {
    "crafts": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg/960px-Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg",
        "image_credit": "Shoot stufz / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Chanderi_Craft_Village_%E2%80%93_Traditional_Weaving_and_Handicrafts_in_Madhya_Pradesh_20.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Illustrative Chanderi handloom weaving demonstration",
    },
    "culinary": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Kachori-sabzi.jpg/960px-Kachori-sabzi.jpg",
        "image_credit": "Priyanka nawalramka / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Kachori-sabzi.jpg",
        "image_license": "CC BY-SA 4.0",
        "image_caption": "Illustrative traditional Gwalior culinary heritage breakfast",
    },
    "music": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/DhrupadConcert.jpg/960px-DhrupadConcert.jpg",
        "image_credit": "Oscar / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:DhrupadConcert.jpg",
        "image_license": "CC BY-SA 3.0 or GFDL",
        "image_caption": "Illustrative Gwalior Gharana classical Dhrupad concert",
    },
    "heritage": {
        "image_url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Gwalior_fort_panorama.jpg/960px-Gwalior_fort_panorama.jpg",
        "image_credit": "Pavel Suprun / Wikimedia Commons",
        "image_source_url": "https://commons.wikimedia.org/wiki/File:Gwalior_fort_panorama.jpg",
        "image_license": "CC BY-SA 3.0",
        "image_caption": "Illustrative Gwalior Fort historic landscape",
    },
}

def _image_asset(name: Any, category: str | None = None) -> dict[str, str]:
    normalized = str(name or "").casefold()
    for match, asset in IMAGE_ASSETS.items():
        if match in normalized:
            return asset
    cat = str(category or "").casefold()
    pool = CATEGORY_IMAGE_POOLS.get(cat)
    if pool:
        idx = abs(hash(str(name or ""))) % len(pool)
        return pool[idx]
    return REPRESENTATIVE_IMAGES.get(cat, {})

def load_curated_dataset() -> list[dict[str, Any]]:
    with open(DATASET_PATH, encoding="utf-8") as f: rows = json.load(f)
    # Preserve the source export verbatim; adapt only tourism-relevant records for the agent.
    with open(SUPPLEMENTAL_DATASET_PATH, encoding="utf-8") as f: supplemental = json.load(f)
    rows.extend(_adapt_supplemental_record(row) for row in supplemental)
    return rows

def _adapt_supplemental_record(row: dict[str, Any]) -> dict[str, Any]:
    raw_categories = [str(row.get("category", "")), *(str(c) for c in row.get("categories", []))]
    category_text = " ".join(raw_categories).casefold()
    if any(term in category_text for term in ("craft", "handicraft", "handloom", "textile", "weaving", "artist", "art gallery")):
        category = "crafts"
    elif any(term in category_text for term in ("restaurant", "food", "cafe", "bakery", "culinary")):
        category = "culinary"
    elif any(term in category_text for term in ("music", "dhrupad", "performing art")):
        category = "music"
    elif any(term in category_text for term in ("tourist attraction", "historical", "heritage", "museum", "fort", "palace", "temple", "archaeological", "monument", "gurudwara", "church", "mosque", "aquarium", "garden", "park", "library")):
        category = "heritage"
    else:
        category = None
    hours = row.get("openingHours") or []
    return {
        "id": row.get("id"), "name": row.get("name"), "category": category,
        "subCategory": row.get("category"), "description": row.get("sourceSearch", ""),
        "coordinates": {"lat": row.get("latitude"), "lng": row.get("longitude")},
        "city": row.get("city"), "address": row.get("address"),
        "min_dwell_time_mins": SUPPLEMENTAL_DWELL_MINUTES,
        "duration_estimate_type": "heuristic_default",
        "operating_hours": hours or None, "verification_status": "UNVERIFIED_GOOGLE_MAPS_SCRAPE",
        "source_reference": "User-provided Beyond the Fort Apify Google Maps export",
        "source_url": row.get("googleMapsUrl"), "source_search": row.get("sourceSearch"),
        "rating": row.get("rating"), "review_count": row.get("reviewCount"),
        "data_note": row.get("dataNote", "Scraped listing; verify details before public use."),
        **_image_asset(row.get("name"), category),
    }

def _tokens(text: str) -> set[str]:
    return {x for x in re.findall(r"[a-z0-9]+", text.lower()) if len(x) > 2}

def research_node(state: TourismAgentState) -> dict[str, Any]:
    """Contract: validated constraints -> exact dataset matches retaining IDs and source metadata."""
    c = state.get("constraints", {})
    interests = c.get("interests", [])
    terms = set().union(*(_tokens(str(x)) for x in interests)) if interests else set()
    category_map = {
        "food": "culinary", "eat": "culinary", "khana": "culinary", "culinary": "culinary",
        "craft": "crafts", "crafts": "crafts", "textile": "crafts", "weaving": "crafts", "silk": "crafts", "jewellery": "crafts", "jewelry": "crafts",
        "music": "music", "dhrupad": "music", "heritage": "heritage", "site": "heritage", "sites": "heritage"
    }
    wanted = {v for token, v in category_map.items() if token in terms}
    # In the UI's "music heritage" option, music is the narrower category.
    if "music" in wanted and "heritage" in wanted:
        wanted.discard("heritage")
    broad_terms = {"craft", "crafts", "textile", "weaving", "food", "culinary", "music", "heritage", "site", "sites", "jewellery", "jewelry", "local", "all", "mujhe", "hai", "khana", "dikhana", "dekhna", "want", "would", "like", "try", "see", "visit", "explore", "experience", "meet", "please", "some", "in", "aaj", "mujhe"}
    has_specific_interest = bool(terms - broad_terms)
    all_rows = load_curated_dataset()
    found=[]
    incomplete=[]
    supplemental_matches = 0
    for row in all_rows:
        if row.get("synthetic") or row.get("is_placeholder") or row.get("record_type") == "synthetic" or not row.get("category"): continue
        if str(row.get("city", "Gwalior")).casefold() != str(c.get("city", "")).casefold(): continue
        coords=row.get("coordinates") or {}
        if not row.get("id") or not row.get("name") or not row.get("min_dwell_time_mins") or not all(k in coords for k in ("lat", "lng")):
            incomplete.append(row.get("name", row.get("id", "Unnamed record")))
            continue
        text = " ".join(str(row.get(k, "")) for k in ("name", "hindiName", "category", "subCategory", "description", "highlights", "source_search"))
        row_terms = _tokens(text)
        cat = str(row.get("category", "")).lower()
        # Match explicit category, or lexical overlap. Generic query has no arbitrary all-record fallback.
        category_match = bool(wanted and cat in wanted and not has_specific_interest)
        lexical_match = bool(terms & row_terms)
        if not (category_match or (lexical_match and has_specific_interest)): continue
        candidate = {k: row[k] for k in ("id", "name", "category", "subCategory", "description", "coordinates", "image_url", "image_caption", "image_credit", "image_source_url", "image_license", "images", "city", "address", "entry_fee", "min_dwell_time_mins", "duration_estimate_type", "operating_hours", "verification_status", "source_reference", "source_url", "source_urls", "last_audited", "community_rules", "highlights", "cost_estimate", "data_note", "rating", "review_count") if k in row}
        if not candidate.get("image_url"):
            candidate.update(_image_asset(candidate.get("name"), candidate.get("category")))
        found.append(candidate)
        if row.get("duration_estimate_type") == "heuristic_default": supplemental_matches += 1
        if len(found) >= MAX_RESEARCH_CANDIDATES: break
    warnings=list(state.get("warnings", []))
    if supplemental_matches:
        warnings.append(f"{supplemental_matches} matching imported listings are unverified Google Maps scrapes. Their 30-minute visit durations are planning defaults, not source-verified facts.")
        if any(p.get("operating_hours") for p in found if p.get("duration_estimate_type") == "heuristic_default"):
            warnings.append("Imported listing opening hours are scraped and unverified; confirm them before travel.")
    if len(found) >= MAX_RESEARCH_CANDIDATES:
        warnings.append(f"Research results are limited to the first {MAX_RESEARCH_CANDIDATES} matching records to keep live route lookups bounded.")
    if incomplete: warnings.append(f"Excluded {len(incomplete)} dataset record(s) missing an ID, name, coordinates, or visit-duration estimate; values were not invented.")
    if any(not p.get("operating_hours") for p in found): warnings.append("Some matching records have no opening-hour evidence; hours were not inferred.")
    if any(p.get("operating_hours") for p in found): warnings.append("The dataset has no date-specific opening calendar; listed hours may need confirmation for the selected date.")
    trace=list(state.get("agent_trace", [])); trace.append(f"[Research] Matched {len(found)} non-placeholder records across curated and imported Gwalior datasets")
    log.info("research matched=%d city=%s", len(found), c.get("city"))
    return {"candidates": found, "agent_trace": trace, "warnings": warnings}





