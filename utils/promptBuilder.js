/**
 * PlotTwist+ Prompt Builder
 * Generates structured prompts for 3-act plot creation and script generation with compelling plot twists
 */

/**
 * Builds a comprehensive prompt for 3-act plot generation with plot twists
 * @param {string} genre - The genre of the story (e.g., "thriller", "romance", "sci-fi")
 * @param {string} characters - Description of main characters
 * @param {string} setting - The setting/time period of the story
 * @returns {string} A structured prompt for plot generation with plot twists
 */
function buildPlotPrompt(genre, characters, setting) {
    // Validate inputs
    if (!genre || !characters || !setting) {
        throw new Error('All parameters (genre, characters, setting) are required');
    }

    const prompt = `You are a master storyteller specializing in plot twists and unexpected revelations. Create a compelling 3-act plot structure with MULTIPLE plot twists for the following story elements:

GENRE: ${genre}
CHARACTERS: ${characters}
SETTING: ${setting}

Please generate a detailed 3-act plot that follows these guidelines:

**ACT I - SETUP (25% of story)**
- Establish the protagonist and their ordinary world
- Introduce the main characters and their relationships
- Set up the story's tone, genre, and setting
- Plant seeds for future plot twists (foreshadowing)
- Present the inciting incident that disrupts the protagonist's world
- End with a plot point that propels the story into Act II

**ACT II - CONFRONTATION (50% of story)**
- Part A: The protagonist faces obstacles and complications
- **MIDPOINT PLOT TWIST**: A major revelation that completely changes the story direction
- Part B: Escalating tension with new information from the twist
- Additional plot twists that challenge the protagonist's understanding
- The protagonist faces their greatest challenge yet
- End with the crisis moment that leads to Act III

**ACT III - RESOLUTION (25% of story)**
- **FINAL PLOT TWIST**: A shocking revelation that recontextualizes everything
- The climax where the protagonist faces their final challenge with new knowledge
- The resolution of all major plot threads
- Character arcs are completed with the impact of all twists
- A satisfying conclusion that fits the genre

**PLOT TWIST REQUIREMENTS:**
- Include at least 2-3 major plot twists throughout the story
- Each twist should be surprising but logical when looking back
- Foreshadow twists subtly in earlier acts
- Focus on character motivations and internal conflicts that lead to plot twists
- Use the setting effectively to enhance the story and reveal secrets
- Character secrets and hidden motivations that create plot twists
- How character decisions drive the plot forward and create unexpected turns
- Ensure twists are appropriate for the ${genre} genre
- Make characters compelling and well-developed
- Create tension and stakes that escalate throughout
- End with a satisfying resolution that ties all twists together

**OUTPUT FORMAT:**
Structure your response as follows:
1. **ACT I - SETUP**
   - [Detailed plot points and character introductions]
   - [Foreshadowing elements for future twists]
2. **ACT II - CONFRONTATION** 
   - Part A: [Rising action and complications]
   - **MIDPOINT TWIST**: [Major plot twist/revelation]
   - Part B: [Escalating tension with new information]
3. **ACT III - RESOLUTION**
   - **FINAL TWIST**: [Shocking revelation]
   - [Climax and resolution]

Make this plot engaging, original, and filled with unexpected turns that will keep audiences guessing until the very end.`;

    return prompt;
}

/**
 * Builds a comprehensive prompt for script generation from plot
 * @param {string} plot - The generated 3-act plot
 * @returns {string} A structured prompt for script generation
 */
function buildScriptPrompt(plot) {
    // Validate inputs
    if (!plot) {
        throw new Error('Plot parameter is required');
    }

    const prompt = `You are a professional screenwriter and dialogue specialist. Convert the following 3-act plot into a compelling script with engaging dialogue, action descriptions, and proper screenplay format.

PLOT TO CONVERT:
${plot}

Please create a script that follows these guidelines:

**SCRIPT REQUIREMENTS:**
- Use proper screenplay format with scene headings, action lines, and dialogue
- Write engaging, natural dialogue that reveals character and advances the plot
- Include vivid action descriptions that set the scene and mood
- Maintain the plot twists and dramatic tension from the original plot
- Ensure dialogue is appropriate for the genre and character personalities
- Include character names in dialogue (CHARACTER NAME: "dialogue here")
- Add scene transitions and pacing notes where appropriate
- Keep action lines concise but descriptive
- Make dialogue sound natural and character-specific
- Preserve all plot twists and revelations in the script format

**FORMATTING GUIDELINES:**
- Scene headings: INT./EXT. LOCATION - TIME
- Action lines: Present tense, third person
- Character names: ALL CAPS before dialogue
- Dialogue: In quotes, natural speech patterns
- Parentheticals: (emotion/action) when needed for clarity

**OUTPUT FORMAT:**
Structure your response as a complete script with:
1. **FADE IN:**
2. **ACT I** - Scene headings, action, and dialogue
3. **ACT II** - Including the midpoint twist in script format
4. **ACT III** - Including the final twist and resolution
5. **FADE OUT.**

Make this script engaging, professional, and ready for production. Focus on bringing the plot to life through compelling dialogue and vivid action descriptions.`;

    return prompt;
}

export { buildPlotPrompt, buildScriptPrompt };