export interface EssayItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  description: string;
}

export const essaysData: EssayItem[] = [
  {
    id: "essay-autumn",
    title: "The Beauty of Autumn",
    category: "Nature",
    difficulty: "easy",
    description: "A short, descriptive passage about the changing seasons and autumn colors.",
    text: "Autumn brings a cool crispness to the air, painted in vibrant shades of gold, amber, and deep crimson. Leaves rustle softly underfoot as they drop from high branches, blanketing the forest floor. It is a season of harvest, reflection, and quiet transitions. Warm tea and cozy fires welcome the longer nights as winter approaches slowly."
  },
  {
    id: "essay-coffee",
    title: "The Art of Crafting Coffee",
    category: "Lifestyle",
    difficulty: "easy",
    description: "An essay exploring the process of coffee bean selection, roasting, and brewing.",
    text: "Brewing the perfect cup of coffee is a delicate dance between chemistry and craft. It begins with quality green beans, carefully sourced from volcanic soil at high altitudes. Roasting transforms them, unlocking rich oils, nutty aromas, and fruity acidity. Precision grinding, water temperature, and extraction speed determine the final taste, making every morning cup a small daily ritual of patience and passion."
  },
  {
    id: "essay-alice",
    title: "Alice in Wonderland Excerpt",
    category: "Literature",
    difficulty: "easy",
    description: "The classic opening scene of Lewis Carroll's Alice in Wonderland.",
    text: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?'"
  },
  {
    id: "essay-space",
    title: "Space Exploration and Our Future",
    category: "Science",
    difficulty: "medium",
    description: "An essay on humanity's drive to explore the cosmos and establish interplanetary outposts.",
    text: "Humanity has always looked to the stars with curiosity and hope. From the early Apollo missions to the robotic rovers mapping the red sands of Mars, our journey into the cosmos is a testament to human ingenuity. Establishing space stations and planning lunar bases are no longer science fiction, but logical milestones. Exploring deep space expands our scientific horizon, protects our species from planetary catastrophes, and pushes the boundary of what we consider possible."
  },
  {
    id: "essay-sherlock",
    title: "The Adventures of Sherlock Holmes",
    category: "Literature",
    difficulty: "medium",
    description: "The famous opening passage regarding Irene Adler from Arthur Conan Doyle.",
    text: "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind."
  },
  {
    id: "essay-internet",
    title: "A Brief History of the Internet",
    category: "Technology",
    difficulty: "medium",
    description: "A summary of how the internet evolved from military communication nets to the world wide web.",
    text: "The internet started as ARPANET, a experimental project in the late nineteen sixties designed to keep military communications active during crises. Over decades, developers created standard networking protocols, allowing diverse computer terminals to speak to each other. In nineteen ninety, Tim Berners-Lee created the World Wide Web, introducing links and browsers. This unlocked communication for billions, turning a research network into a digital town square."
  },
  {
    id: "essay-sleep",
    title: "The Science of Sleep",
    category: "Health",
    difficulty: "medium",
    description: "An overview of circadian cycles, REM sleep stages, and cognitive rest benefits.",
    text: "Sleep is not a passive state, but an active phase of physical restoration and cognitive cleanup. During sleep, our brains cycle through non-REM and REM stages, consolidating memory files and clearing out metabolic debris. Circadian rhythms, regulated by daylight exposure, dictate when we feel tired. Chronic sleep deprivation weakens immune function and slows focus. Prioritizing eight hours of restful sleep daily is essential for long-term health."
  },
  {
    id: "essay-ai",
    title: "The Rise of Artificial Intelligence",
    category: "Technology",
    difficulty: "hard",
    description: "A comprehensive essay discussing deep learning, language models, and societal alignment.",
    text: "Artificial intelligence has shifted from academic labs to the center of global industry. Powered by deep neural networks and massive cloud servers, systems now analyze languages, generate code, and diagnose complex medical images with expert precision. However, this sudden leap brings critical challenges. Aligning machine behaviors with human ethics is paramount, as automated biases can easily amplify inequality. As we integrate models into education, governance, and creative arts, balancing technical innovation with cautious policy regulations remains the defining challenge of our generation."
  },
  {
    id: "essay-programming",
    title: "Programming as an Art Form",
    category: "Technology",
    difficulty: "hard",
    description: "An exploration of software craftsmanship, refactoring, and code readability.",
    text: "Writing code is often compared to engineering, but it shares equal lineage with creative writing and architecture. A developer must solve mathematical challenges under strict hardware constraints, while keeping code clear enough for teammates to read. Elegant code resembles poetry: it expresses complex commands with minimal syntax, avoids redundant repetitions, and flows logically. Refactoring is the editing process, polishing rough variables into pristine components. Software craftsmanship is the pride of making things that perform gracefully and last."
  },
  {
    id: "essay-code-js",
    title: "JavaScript Code Practice",
    category: "Code Snippets",
    difficulty: "hard",
    description: "A JavaScript coding snippet checking brackets, assignments, arithmetic, and loop operators.",
    text: "const findMaxSubArray = (arr) => { let maxSoFar = arr[0]; let maxEndingHere = arr[0]; for (let i = 1; i < arr.length; i++) { maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]); maxSoFar = Math.max(maxSoFar, maxEndingHere); } return maxSoFar; };"
  },
  {
    id: "essay-code-html",
    title: "HTML / React Code Layout",
    category: "Code Snippets",
    difficulty: "hard",
    description: "An HTML component template with standard divs, paragraph tags, brackets, and class properties.",
    text: "<div class=\"card\" id=\"user-card-1\"><h3 class=\"title font-bold\">Itype Profile</h3><p class=\"desc text-xs text-muted\">A minimal workspace to practice touch typing.</p><button class=\"btn btn-primary\" onClick={handleSave}>Save Settings</button></div>"
  }
];
