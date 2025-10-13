/**
 * Configuration utility for PlotTwist+ Backend
 * Centralized config management for API keys and settings
 */

/**
 * Get the API configuration object
 * @returns {Object} Configuration object with all API keys
 */
export function getAPIConfig() {
    return {
        groqApiKey: process.env.GROQ_API_KEY,
        cohereApiKey: process.env.COHERE_API_KEY
    };
}

/**
 * Get server configuration
 * @returns {Object} Server configuration object
 */
export function getServerConfig() {
    return {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
    };
}

