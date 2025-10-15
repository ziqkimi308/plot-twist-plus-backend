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

**CRITICAL OUTPUT FORMAT - START WITH CHARACTER LIST:**

Begin your response with a CHARACTER section that lists ALL characters in the story with their genders:

**CHARACTERS:**
- [Character Name] (male)
- [Character Name] (female)
- [Character Name] (male)
... (list all characters)

Then follow with the 3-act structure.

**IMPORTANT NOTES:**
1. The CHARACTER section helps with voice assignment and should list EVERY character that appears in the story
2. Include full names (e.g., "Dr. Sarah Chen" not just "Sarah")
3. Only use (male) or (female) - no other gender markers
4. After the CHARACTER section, proceed with the three acts

Please generate a detailed plot with the following structure:

**ACT ONE - SETUP (25% of story)**
- Establish the protagonist and their ordinary world
- Introduce the main characters with their gender clearly marked on first mention
- Set up the story's tone, genre, and setting
- Plant seeds for future plot twists (foreshadowing)
- Present the inciting incident that disrupts the protagonist's world
- End with a plot point that propels the story into the second part

**ACT TWO - CONFRONTATION (50% of story)**
- Part A: The protagonist faces obstacles and complications
- **MIDPOINT PLOT TWIST**: A major revelation that completely changes the story direction
- Part B: Escalating tension with new information from the twist
- Additional plot twists that challenge the protagonist's understanding
- The protagonist faces their greatest challenge yet
- End with the crisis moment that leads to the third part
- Mark gender of any NEW characters introduced in this act

**ACT THREE - RESOLUTION (25% of story)**
- **FINAL PLOT TWIST**: A shocking revelation that recontextualizes everything
- The climax where the protagonist faces their final challenge with new knowledge
- The resolution of all major plot threads
- Character arcs are completed with the impact of all twists
- A satisfying conclusion that fits the genre
- Mark gender of any NEW characters introduced in this act

**PLOT TWIST REQUIREMENTS:**
- Include at least 2-3 major plot twists throughout the story
- Each twist should be surprising but logical when looking back
- Foreshadow twists subtly in earlier parts
- Focus on character motivations and internal conflicts that lead to plot twists
- Use the setting effectively to enhance the story and reveal secrets
- Character secrets and hidden motivations that create plot twists
- How character decisions drive the plot forward and create unexpected turns
- Ensure twists are appropriate for the ${genre} genre
- Make characters compelling and well-developed
- Create tension and stakes that escalate throughout
- End with a satisfying resolution that ties all twists together

**CRITICAL OUTPUT FORMAT REQUIREMENTS:**
- Use ONLY the exact headers: **ACT ONE - SETUP**, **ACT TWO - CONFRONTATION**, **ACT THREE - RESOLUTION**
- Do NOT use any other variations like "Act I", "ACT I", "Act 1", or similar
- Do NOT include subheadings like "ACT ONE CONCLUSION" or "END OF ACT ONE"
- Structure your response EXACTLY as follows:

**ACT ONE - SETUP**
[Detailed plot points and character introductions]
[Foreshadowing elements for future twists]

**ACT TWO - CONFRONTATION** 
Part A: [Rising action and complications]
**MIDPOINT TWIST**: [Major plot twist/revelation]
Part B: [Escalating tension with new information]

**ACT THREE - RESOLUTION**
**FINAL TWIST**: [Shocking revelation]
[Climax and resolution]

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

**CRITICAL INSTRUCTIONS:**

1. **SKIP THE CHARACTER SECTION:** The plot begins with a **CHARACTERS:** section listing all characters and genders. DO NOT include this section in the script. Skip it entirely and start with **ACT ONE**.

2. **CHARACTER NAMES IN SCRIPT:** When writing character dialogue, use ONLY the character name WITHOUT gender markers. The gender information was in the CHARACTER section for reference only.

Example:
❌ WRONG: SARAH CHEN (female)
✅ CORRECT: SARAH CHEN

3. **DO NOT READ GENDER MARKERS ALOUD:** Gender markers like (male) or (female) should NEVER appear in the script as they would be narrated.

Please create a script that follows these guidelines:

**SCRIPT REQUIREMENTS:**
- Write for audiobook/voice production (not traditional screenplay)
- Use NARRATOR for all scene descriptions and action lines
- Use CHARACTER NAMES ONLY for all dialogue (no gender markers)
- Make narration vivid and descriptive for audio listeners
- Keep dialogue natural and character-specific
- Preserve all plot twists and dramatic tension
- Ensure smooth flow between narration and dialogue
- **IMPORTANT**: Distribute content evenly across all three acts - each act should be substantial and detailed
- **ACT ONE** should contain ALL the setup from the ACT ONE plot section
- **ACT TWO** should contain ALL the confrontation from the ACT TWO plot section  
- **ACT THREE** should contain ALL the resolution from the ACT THREE plot section
- Do NOT put plot elements from earlier acts into ACT THREE

**CRITICAL FORMATTING RULES FOR VOICE GENERATION:**

1. **NARRATOR** - Use for ALL scene descriptions, actions, and transitions
	Example:
	NARRATOR
	A dimly lit office. Detective Sarah Chen sits at her desk, examining case files. Rain patters against the window.

2. **CHARACTER NAME** - Use for character dialogue ONLY (NO gender markers, NO parentheticals)
	Example:
	SARAH CHEN
	Something doesn't add up here. The timeline is all wrong.
	
	❌ WRONG - DO NOT USE PARENTHETICALS:
	SARAH CHEN
	(concerned) Something doesn't add up here.
	
	✅ CORRECT - Put emotions in NARRATOR:
	NARRATOR
	Sarah looks concerned as she examines the files.
	
	SARAH CHEN
	Something doesn't add up here.

3. **Alternating Pattern** - Always alternate: NARRATOR → DIALOGUE → NARRATOR → DIALOGUE
	- NEVER put dialogue directly after dialogue without narration
	- NEVER mix action descriptions with character dialogue
	- ALWAYS use NARRATOR to describe character actions/emotions
	- NO PARENTHETICALS in dialogue (e.g., (angrily), (whispers), (concerned))
	- Put ALL emotional cues and actions in NARRATOR blocks

4. **Character Names Are NOT Narrated** - The NARRATOR should describe what characters do, but NEVER say character names in dialogue
	❌ WRONG:
	NARRATOR
	JOHN says hello to MARRY.
	
	✅ CORRECT:
	NARRATOR
	John says hello to his wife.
	
	Or even better:
	NARRATOR
	He approaches his wife with a warm smile.
	
	JOHN
	Hello, darling.

**NARRATOR CONTENT SHOULD INCLUDE:**
- Scene settings (INT./EXT. descriptions)
- Character actions and movements
- Character emotions and expressions (NOT in parentheticals)
- Environmental details (sounds, sights, atmosphere)
- Transitions between scenes
- Physical descriptions of what's happening
- How characters speak (whisper, shout, etc.) - describe it in narration, not parentheticals

**DIALOGUE CONTENT SHOULD INCLUDE:**
- ONLY what the character speaks
- Natural, conversational language
- Character-specific speech patterns
- Emotional tone through word choice (not stage directions)
- NO parentheticals (no (whispers), (angrily), (concerned), etc.)

**CRITICAL OUTPUT FORMAT REQUIREMENTS:**
- Use ONLY the exact headers: **ACT ONE**, **ACT TWO**, **ACT THREE**
- Do NOT use any other variations like "Act I", "ACT I", "Act 1", or similar
- Do NOT include subheadings like "ACT ONE CONCLUSION" or "END OF ACT ONE"
- Structure your response EXACTLY as follows:

**ACT ONE**
[Script for the first part, alternating NARRATOR and CHARACTER blocks]

**ACT TWO**
[Script for the second part, alternating NARRATOR and CHARACTER blocks]

**ACT THREE**
[Script for the third part, alternating NARRATOR and CHARACTER blocks]

Continue this pattern throughout the entire script.

**EXAMPLE OF CORRECT FORMAT:**

**ACT ONE**
NARRATOR
Interior. A detective's office at night. Rain hammers against the windows. Detective Sarah Chen sits alone at her desk, surrounded by case files. She frowns at a document.

SARAH CHEN
Something doesn't add up here. The timeline is completely wrong.

NARRATOR
The door suddenly bursts open. Detective Marcus Reed rushes in, out of breath, clutching a manila folder.

MARCUS REED
Sarah! You need to see this right now.

**ACT TWO**
[Continue with alternating NARRATOR and CHARACTER blocks for the second part]

**ACT THREE**
[Continue with alternating NARRATOR and CHARACTER blocks for the third part]

**REMEMBER:**
- Every action/description = NARRATOR
- Every spoken word = CHARACTER NAME (no gender markers)
- Keep narration engaging and cinematic
- Make dialogue natural and character-driven
- Maintain clear separation for voice actors
- NO gender markers in the script
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