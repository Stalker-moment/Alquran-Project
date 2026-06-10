/**
 * Calculates Qibla direction (bearing) relative to True North in degrees.
 * Formula uses spherical trigonometry.
 * 
 * @param lat User latitude in degrees
 * @param lng User longitude in degrees
 * @returns Qibla angle in degrees from True North (clockwise, 0-360)
 */
export function calculateQiblaDirection(lat: number, lng: number): number {
  const M_LAT = 21.4225241; // Kaaba Latitude
  const M_LNG = 39.8262066; // Kaaba Longitude

  // Convert to radians
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const mLatRad = (M_LAT * Math.PI) / 180;
  const mLngRad = (M_LNG * Math.PI) / 180;

  const dLng = mLngRad - lngRad;

  const y = Math.sin(dLng);
  const x = Math.cos(latRad) * Math.tan(mLatRad) - Math.sin(latRad) * Math.cos(dLng);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;

  // Normalize to 0-360 degrees
  qiblaDeg = (qiblaDeg + 360) % 360;

  return parseFloat(qiblaDeg.toFixed(2));
}
