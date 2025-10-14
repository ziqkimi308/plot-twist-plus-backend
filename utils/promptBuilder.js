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

	const prompt = `You are a professional screenwriter and audiobook script specialist. Convert the following 3-act plot into a compelling script optimized for voice narration and audiobook production.

PLOT TO CONVERT:
${plot}

Please create a script that follows these guidelines:

**SCRIPT REQUIREMENTS:**
- Write for audiobook/voice production (not traditional screenplay)
- Use NARRATOR for all scene descriptions and action lines
- Use CHARACTER NAMES for all dialogue
- Make narration vivid and descriptive for audio listeners
- Keep dialogue natural and character-specific
- Preserve all plot twists and dramatic tension
- Ensure smooth flow between narration and dialogue

**CRITICAL FORMATTING RULES FOR VOICE GENERATION:**
1. **NARRATOR** - Use for ALL scene descriptions, actions, and transitions
   Example:
   NARRATOR
   A dimly lit office. Detective Sarah Chen sits at her desk, examining case files. Rain patters against the window.

2. **CHARACTER NAME** - Use for character dialogue ONLY
   Example:
   SARAH CHEN
   Something doesn't add up here. The timeline is all wrong.

3. **Alternating Pattern** - Always alternate: NARRATOR → DIALOGUE → NARRATOR → DIALOGUE
   - NEVER put dialogue directly after dialogue without narration
   - NEVER mix action descriptions with character dialogue
   - ALWAYS use NARRATOR to describe character actions/emotions

**NARRATOR CONTENT SHOULD INCLUDE:**
- Scene settings (INT./EXT. descriptions)
- Character actions and movements
- Character emotions and expressions
- Environmental details (sounds, sights, atmosphere)
- Transitions between scenes
- Physical descriptions of what's happening

**DIALOGUE CONTENT SHOULD INCLUDE:**
- Only what the character speaks
- Natural, conversational language
- Character-specific speech patterns
- Emotional tone through words (not stage directions)

**OUTPUT FORMAT:**
Structure your response with clear alternating blocks:

NARRATOR
[Scene opening - set the location, atmosphere, and initial action]

CHARACTER NAME
[Their first line of dialogue]

NARRATOR
[Describe their action, another character's entrance, or scene change]

CHARACTER NAME
[Next dialogue]

Continue this pattern throughout the entire script.

**EXAMPLE OF CORRECT FORMAT:**

NARRATOR
Interior. A detective's office at night. Rain hammers against the windows. Detective Sarah Chen sits alone at her desk, surrounded by case files. She frowns at a document.

SARAH CHEN
Something doesn't add up here. The timeline is completely wrong.

NARRATOR
The door suddenly bursts open. Detective Marcus Reed rushes in, out of breath, clutching a manila folder.

MARCUS REED
Sarah! You need to see this right now.

**REMEMBER:**
- Every action/description = NARRATOR
- Every spoken word = CHARACTER NAME
- Keep narration engaging and cinematic
- Make dialogue natural and character-driven
- Maintain clear separation for voice actors

Make this script compelling and perfectly formatted for audiobook production with multiple voice actors.`;

	return prompt;
}

function buildImagePrompts(plot, opts = {}) {
	if (!plot) {
		throw new Error('Plot parameter is required');
	}
	const { style = 'cinematic, highly detailed, dramatic lighting, professional photography', aspect = '16:9', negative = 'blurry, low quality, text, watermark, cartoonish' } = opts;

	const clean = (t) => t.replace(/\*\*|__|\*|`/g, '').replace(/\s+/g, ' ').trim();

	// Extract key visual elements from the plot
	const extractVisualElements = (text) => {
		const cleaned = clean(text);

		// Look for characters, settings, emotions, and actions
		const characterMatches = cleaned.match(/(?:Dr\.|Detective|Officer|Patient|Nurse|Doctor|John|Sarah|Mike|Lisa)\s+\w+/gi) || [];
		const settingMatches = cleaned.match(/(?:hospital|office|room|corridor|emergency|ICU|lab|ward|city|street|building|home|apartment)/gi) || [];
		const actionMatches = cleaned.match(/(?:investigating|examining|discovering|revealing|confronting|running|hiding|fighting|saving|healing)/gi) || [];
		const emotionMatches = cleaned.match(/(?:mysterious|dark|dramatic|intense|suspenseful|shocking|terrifying|hopeful|desperate|dangerous)/gi) || [];

		// Get main character and setting
		const mainCharacter = characterMatches[0] || 'protagonist';
		const mainSetting = settingMatches[0] || 'modern setting';
		const mood = emotionMatches[0] || 'dramatic';

		return { mainCharacter, mainSetting, mood };
	};

	const grab = (regex) => {
		const m = plot.match(regex);
		return m ? m[0] : '';
	};

	const act1 = grab(/ACT\s*I[\s\S]*?(?=ACT\s*II|$)/i);
	const act2 = grab(/ACT\s*II[\s\S]*?(?=ACT\s*III|$)/i);
	const act3 = grab(/ACT\s*III[\s\S]*?$/i);

	const fallbackSplit = () => {
		const parts = clean(plot).split(/ACT\s*[I1]{1,3}/i).filter(Boolean);
		return [parts[0] || plot, parts[1] || plot, parts[2] || plot];
	};

	const [a1, a2, a3] = (act1 && act2 && act3) ? [act1, act2, act3] : fallbackSplit();

	// Extract visual elements for each act
	const act1Elements = extractVisualElements(a1);
	const act2Elements = extractVisualElements(a2);
	const act3Elements = extractVisualElements(a3);

	const prompts = [
		{
			act: 'I',
			prompt: `Opening scene: ${act1Elements.mainCharacter} in ${act1Elements.mainSetting}, ${act1Elements.mood} atmosphere, establishing shot, ${style}`.trim()
		},
		{
			act: 'II',
			prompt: `Climactic scene: ${act2Elements.mainCharacter} facing conflict in ${act2Elements.mainSetting}, intense ${act2Elements.mood} moment, dramatic angle, ${style}`.trim()
		},
		{
			act: 'III',
			prompt: `Resolution scene: ${act3Elements.mainCharacter} in ${act3Elements.mainSetting}, ${act3Elements.mood} conclusion, wide cinematic shot, ${style}`.trim()
		}
	].map((item) => ({ ...item, aspect, negative }));

	return prompts;
}

export { buildPlotPrompt, buildScriptPrompt, buildImagePrompts };