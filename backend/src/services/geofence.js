// Fórmula de Haversine para calcular distância em metros entre dois pontos GPS
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Raio da Terra em metros
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
};

/**
 * Verifica se uma posição (lat, lng) está dentro de uma geofence.
 * @param {Number} currentLat Latitude atual
 * @param {Number} currentLng Longitude atual
 * @param {Object} geofence Objeto contendo { lat, lng, raio_metros }
 * @returns {Boolean} true se dentro da zona, false se fora
 */
const isInsideGeofence = (currentLat, currentLng, geofence) => {
    if (!geofence || !geofence.lat || !geofence.lng || !geofence.raio_metros) {
        return true; // Se não tem geofence, está sempre 'dentro' por padrão
    }

    const distance = calculateDistance(
        parseFloat(currentLat),
        parseFloat(currentLng),
        parseFloat(geofence.lat),
        parseFloat(geofence.lng)
    );

    return distance <= parseFloat(geofence.raio_metros);
};

module.exports = {
    calculateDistance,
    isInsideGeofence
};
