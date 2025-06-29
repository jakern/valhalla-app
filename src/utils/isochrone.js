// Viridis color palette (subset for performance)
const VIRIDIS_COLORS = [
  '#f0f921',
  '#fee825',
  '#b6de2b',
  '#6cce5a',
  '#1f9d8a',
  '#26838f',
  '#31678e',
  '#3f4a8a',
  '#482777',
  '#440154',
]
/**
 * Get a color from the viridis palette based on normalized value
 * @param {number} normalizedValue - Value between 0 and 1
 * @returns {string} Hex color
 */
const getViridisColor = (normalizedValue) => {
  const index = Math.floor(normalizedValue * (VIRIDIS_COLORS.length - 1))
  return VIRIDIS_COLORS[Math.min(index, VIRIDIS_COLORS.length - 1)]
}

/**
 * Calculate min and max values from features for a given property
 * @param {Array} features - GeoJSON features
 * @param {string} property - Property name to extract values from
 * @returns {Object} Object with minValue and maxValue
 */
export const calculateMinMaxFromFeatures = (features, property) => {
  if (!features || features.length === 0) {
    return { minValue: 0, maxValue: 1 }
  }

  const values = features
    .map((feature) => feature.properties?.[property])
    .filter((val) => val != null && !isNaN(val))

  if (values.length === 0) {
    return { minValue: 0, maxValue: 1 }
  }

  return {
    minValue: Math.min(...values),
    maxValue: Math.max(...values),
  }
}

/**
 * Generate non-overlapping style for isochrone polygons
 * Creates styles with decreasing opacity for proper layering
 * @param {number} contourValue - The contour value for this feature
 * @param {number} totalFeatures - Total number of features being styled
 * @param {number} minContour - Minimum contour value in dataset
 * @param {number} maxContour - Maximum contour value in dataset
 * @returns {Object} Leaflet path style object
 */
export const getNonOverlappingStyle = (
  contourValue,
  totalFeatures,
  minContour,
  maxContour
) => {
  // Normalize contour value for color mapping (0 to 1)
  const range = maxContour - minContour
  const normalizedValue = range === 0 ? 0 : (contourValue - minContour) / range

  // Get color from viridis palette
  const fillColor = getViridisColor(normalizedValue)

  // Calculate opacity - larger contours (rendered first) get lower opacity
  // This ensures smaller contours on top are more visible
  // Configurable but 0.0 produced the best results to me
  const baseOpacity = 0.1
  const minOpacity = 0.1
  const opacityRange = baseOpacity - minOpacity

  // Inverse relationship: higher contour values get lower opacity
  const opacityFactor = range === 0 ? 1 : 1 - normalizedValue
  const fillOpacity = minOpacity + opacityFactor * opacityRange

  return {
    fillColor: fillColor,
    weight: 2,
    opacity: 1,
    color: '#fff',
    dashArray: '',
    fillOpacity: fillOpacity,
  }
}
