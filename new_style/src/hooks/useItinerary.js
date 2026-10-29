import { useState, useMemo } from 'react';
import { GWALIOR_PLACES } from '../data/places';

export function useItinerary(selectedLanguage = 'en', t) {
  // Budget & Preferences
  const [selectedHours, setSelectedHours] = useState(4);
  const [tourPace, setTourPace] = useState('balanced');
  const [travelMode, setTravelMode] = useState('e-rickshaw');
  const [routeType, setRouteType] = useState('shortest');

  // Selected Place IDs (Initial Default: Fort, S.S. Kachori, Maharaj Bada)
  const [selectedPlaces, setSelectedPlaces] = useState([
    'gw-mon-1',
    'gw-food-1',
    'gw-shop-1'
  ]);

  const togglePlaceSelection = (id) => {
    setSelectedPlaces(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Selected Place Objects (Recalculates route sequencing based on routeType)
  const selectedPlaceObjects = useMemo(() => {
    let places = GWALIOR_PLACES.filter(p => selectedPlaces.includes(p.id));
    if (routeType === 'shortest') {
      places = [...places].sort((a, b) => a.distanceKm - b.distanceKm);
    } else {
      places = [...places].sort((a, b) => (a.tier - b.tier) || (b.rating - a.rating));
    }
    return places;
  }, [selectedPlaces, routeType]);

  // Itinerary Feasibility Statistics
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

  // Auto-fit places to selected time budget
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

  // Step-by-Step Navigation Directions
  const navigationSteps = useMemo(() => {
    if (selectedPlaceObjects.length === 0) return [];

    const steps = [
      {
        id: 0,
        title: t ? t('startLocationTitle') : 'Departure: Gwalior Junction Hub',
        instruction: t ? t('startInstruction') : 'Begin journey from Tourist Facilitation Counter, Platform 1 Exit.',
        distance: '0.8 km',
        estTime: '4 mins',
        tip: t ? t('startTip') : 'Tip: Authorized pre-paid auto stand and battery e-rickshaws available.'
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
      title: t ? t('finishLocationTitle') : 'Tour Conclusion: Lashkar Heritage Gate',
      instruction: t ? t('finishInstruction') : 'Concluding at Maharaj Bada heritage corridor.',
      distance: '1.2 km',
      estTime: '10 mins',
      tip: t ? t('finishTip') : 'Recommendation: Savor evening Gajak and collect GI-certified Chanderi souvenirs.'
    });

    return steps;
  }, [selectedPlaceObjects, selectedLanguage, t]);

  return {
    selectedHours,
    setSelectedHours,
    tourPace,
    setTourPace,
    travelMode,
    setTravelMode,
    routeType,
    setRouteType,
    selectedPlaces,
    setSelectedPlaces,
    togglePlaceSelection,
    selectedPlaceObjects,
    itineraryStats,
    handleAutoFitPlaces,
    navigationSteps
  };
}

export default useItinerary;

