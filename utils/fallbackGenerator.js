/**
 * Fallback text generator for testing when APIs are not available
 * Generates basic plot structures for development and testing
 */

/**
 * Generate a basic plot structure for testing
 * @param {string} genre - The genre of the story
 * @param {string} characters - Description of main characters
 * @param {string} setting - The setting/time period of the story
 * @returns {string} A basic plot structure
 */
export function generateFallbackPlot(genre, characters, setting) {
    return `**FALLBACK PLOT GENERATED FOR TESTING**

**ACT I - SETUP**
- Our protagonist, ${characters.split(' ')[0] || 'the main character'}, lives in ${setting}
- The story begins in the ${genre} genre
- We establish the ordinary world and introduce key characters
- A mysterious event occurs that disrupts the protagonist's life
- **Foreshadowing**: Something doesn't feel right about this situation

**ACT II - CONFRONTATION**
- Part A: The protagonist faces increasing obstacles and complications
- **MIDPOINT TWIST**: A shocking revelation that changes everything - the protagonist discovers they are not who they thought they were
- Part B: Escalating tension with new information from the twist
- The protagonist must make difficult choices that will determine their fate
- **Additional Twist**: A trusted ally reveals their true intentions

**ACT III - RESOLUTION**
- **FINAL TWIST**: The ultimate revelation that recontextualizes the entire story
- The climax where the protagonist faces their greatest challenge
- All plot threads are resolved with the impact of all twists
- A satisfying conclusion that fits the ${genre} genre

**PLOT TWISTS INCLUDED:**
1. Identity revelation at midpoint
2. Betrayal of trusted ally
3. Ultimate truth that changes everything

**CHARACTERS:** ${characters}
**SETTING:** ${setting}
**GENRE:** ${genre}

This is a fallback plot generated for testing purposes. In production, this would be replaced by AI-generated content.`;
}

/**
 * Generate a basic script from plot for testing
 * @param {string} plot - The generated plot
 * @returns {string} A basic script structure
 */
export function generateFallbackScript(plot) {
    return `**FALLBACK SCRIPT GENERATED FOR TESTING**

FADE IN:

INT. MAIN LOCATION - DAY

Our protagonist stands in the center of the room, looking around with determination.

PROTAGONIST
"This is where it all begins."

The camera slowly pulls back to reveal the full scope of the setting.

NARRATOR (V.O.)
${plot.split('\n')[0] || 'The story unfolds...'}

FADE OUT.

**NOTE:** This is a fallback script generated for testing purposes. In production, this would be replaced by AI-generated content with full dialogue, action descriptions, and proper screenplay formatting.`;
}
