export interface LessonStep {
  id: string; // e.g. "1-1", "1-2"
  title: string;
  type: 'keys' | 'combinations' | 'words' | 'sentences' | 'paragraph_test';
  keys: string[];
  description: string;
  text: string;
}

export interface LessonChapter {
  id: number;
  title: string;
  description: string;
  steps: LessonStep[];
}

export const lessonsData: LessonChapter[] = [
  {
    id: 1,
    title: "Chapter 1: Home Row Keys",
    description: "Learn the primary resting keys: F, J, D, K, S, L, A, and Semicolon.",
    steps: [
      {
        id: "1-1",
        title: "Home Row Keys Introduction",
        type: "keys",
        keys: ["f", "j", "d", "k"],
        description: "Focus on F, J, D, and K. Rest index fingers on F and J bumps. Middle fingers rest on D and K. Keep wrists hovering.",
        text: "ff jj dd kk fj dk fj dk ffdd jjkk fjdf jkdk fd jk fd jk kdfj jkdf dfjk fjd kdj fdk jkd"
      },
      {
        id: "1-2",
        title: "Expanding Home Row",
        type: "combinations",
        keys: ["s", "l", "a", ";"],
        description: "Introduce S, L, A, and semicolon (;). Rest left ring finger on S, left pinky on A. Right ring finger rests on L, right pinky on ;.",
        text: "ss ll aa ;; sl a; sl a; ssaa ll;; slas l;a; sa l; sa l; asdf jkl; asdf jkl; a;ld skfj a;sk"
      },
      {
        id: "1-3",
        title: "Home Row Word Practice",
        type: "words",
        keys: ["a", "s", "d", "f", "j", "k", "l", ";"],
        description: "Combine all home row keys to type real English words. Type smoothly and keep your eyes strictly on the screen.",
        text: "ask dad sad lad lass fall glad flask alfalfa salad salsa salad ask flask dad all fall gall alls dad sad"
      },
      {
        id: "1-4",
        title: "Home Row Short Sentences",
        type: "sentences",
        keys: ["a", "s", "d", "f", "j", "k", "l", ";"],
        description: "Practice typing short sentences. Focus on space bar coordination between sentences.",
        text: "a sad lad. a glad dad. a flask falls. salad is sad. ask a lass. fall for a lad. a dad is glad."
      },
      {
        id: "1-5",
        title: "Home Row Final Chapter Test",
        type: "paragraph_test",
        keys: ["a", "s", "d", "f", "j", "k", "l", ";"],
        description: "Final assessment paragraph for Chapter 1. Achieve 15 WPM and 90% accuracy to unlock Chapter 2.",
        text: "A sad lad had a salad. The glad dad had a salad too. They sat on the home row keys and typed all day. Daily practice on the home row builds standard muscle memory anchors."
      }
    ]
  },
  {
    id: 2,
    title: "Chapter 2: The Top Row Keys",
    description: "Master reaching upwards to the top row: Q, W, E, R, T, Y, U, I, O, P.",
    steps: [
      {
        id: "2-1",
        title: "Top Row Index & Middle Keys",
        type: "keys",
        keys: ["r", "u", "e", "i"],
        description: "Reach left index up to R, right index up to U. Reach left middle up to E, right middle up to I.",
        text: "rr uu ee ii ru ei ru ei rruu eeii re ui re ui rud rud rid rid rude ride dire rule cure rude err red"
      },
      {
        id: "2-2",
        title: "Reaching Outer Top Keys",
        type: "combinations",
        keys: ["w", "o", "q", "p", "t", "y"],
        description: "Reach left ring up to W, right ring up to O. Reach left pinky to Q, right pinky to P. Index fingers stretch to T and Y.",
        text: "ww oo qq pp tt yy wo qp ty wo qp ty wwoo qqpp ttyy wet wet pot pot toy toy yet yet row row write"
      },
      {
        id: "2-3",
        title: "Top Row Word Practice",
        type: "words",
        keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        description: "Type real words combining top row and home row anchors. Maintain a consistent rhythmic pace.",
        text: "write your text quite standard write power root tired user outer priority tweet list quiet simple standard read lead gold"
      },
      {
        id: "2-4",
        title: "Top Row Sentence Practice",
        type: "sentences",
        keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        description: "Type complete sentences using top row reaches. Keep your wrists straight and straight back posture.",
        text: "write your quiet root. quiet power is tired. the outer user tweets. we write standard quiet texts. power is tired."
      },
      {
        id: "2-5",
        title: "Top Row Final Chapter Test",
        type: "paragraph_test",
        keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        description: "Final assessment paragraph for Chapter 2. Achieve 20 WPM and 90% accuracy to unlock Chapter 3.",
        text: "The user wrote a quiet tweet on the power root. We are tired but we write quiet standard texts every single day. Touch typing is easy when you anchor your fingers on home row keys."
      }
    ]
  },
  {
    id: 3,
    title: "Chapter 3: The Bottom Row Keys",
    description: "Master reaching downwards to the bottom row: Z, X, C, V, B, N, M, comma, period.",
    steps: [
      {
        id: "3-1",
        title: "Bottom Row Index & Middle Keys",
        type: "keys",
        keys: ["v", "m", "c", ","],
        description: "Reach left index down to V, right index down to M. Reach left middle down to C, right middle down to comma (,).",
        text: "vv mm cc ,, vm c, vm c, vvmm cc,, vice move comb comma cove comb mud mud vice mic mic mum mud"
      },
      {
        id: "3-2",
        title: "Reaching Outer Bottom Keys",
        type: "combinations",
        keys: ["x", ".", "z", "/", "b", "n"],
        description: "Reach left ring down to X, right ring down to period (.). Reach left pinky down to Z, right pinky down to slash (/). Index fingers stretch to B and N.",
        text: "xx .. zz // bb nn x. z/ bn x. z/ bn box net zoom zero text box net zebra zero next next bone bone zones"
      },
      {
        id: "3-3",
        title: "Bottom Row Word Practice",
        type: "words",
        keys: ["z", "x", "c", "v", "b", "n", "m", ",", "."],
        description: "Practice real words using bottom row reaches. Keep your fingers slightly curved and light keypresses.",
        text: "voice comb cabin next zebra boxes bottom client normal simple visual dynamic accent carbon text zinc block"
      },
      {
        id: "3-4",
        title: "Bottom Row Sentence Practice",
        type: "sentences",
        keys: ["z", "x", "c", "v", "b", "n", "m", ",", "."],
        description: "Complete sentences using bottom row keys. Pay close attention to punctuation key placement.",
        text: "the client voice is normal. simple visual accents are next. zoom into the zero box. bottom cabins are simple."
      },
      {
        id: "3-5",
        title: "Bottom Row Final Chapter Test",
        type: "paragraph_test",
        keys: ["z", "x", "c", "v", "b", "n", "m", ",", "."],
        description: "Final assessment paragraph for Chapter 3. Achieve 22 WPM and 90% accuracy to unlock Chapter 4.",
        text: "The visual accent is simple. The client zoomed into the zero boxes at the bottom cabin. A normal voice said that the zinc block is next. Make sure to return to the home row key anchor."
      }
    ]
  },
  {
    id: 4,
    title: "Chapter 4: Capitalization & Sentences",
    description: "Introduce the Shift keys and natural, uppercase sentences.",
    steps: [
      {
        id: "4-1",
        title: "Using the Shift Key",
        type: "keys",
        keys: ["shift"],
        description: "Hold Shift with the opposite pinky to capitalize. Keep typing hand in home row alignment.",
        text: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z Ab Cd Ef Gh Ij Kl Mn Op Qr St Uv Wx Yz"
      },
      {
        id: "4-2",
        title: "Capitalized Word Practice",
        type: "words",
        keys: ["shift", "capitals"],
        description: "Practice typing proper nouns and capitalized words. Coordinate Shift keys smoothly.",
        text: "London Paris Tokyo Berlin Rome Washington Beijing Delhi Cairo Sydney Moscow NewYork Tokyo Paris London"
      },
      {
        id: "4-3",
        title: "Natural Sentence Drills",
        type: "sentences",
        keys: ["shift", "capitals", "punctuation"],
        description: "Type natural sentences with capitalization and punctuation. Try to keep typing speed steady.",
        text: "The quick brown fox jumps over the lazy dog. Hard work pays off in the end. Success is sweet. Practice makes perfect!"
      },
      {
        id: "4-4",
        title: "Chapter 4 Final Paragraph Test",
        type: "paragraph_test",
        keys: ["shift", "capitals", "punctuation"],
        description: "Final assessment paragraph for Chapter 4. Achieve 25 WPM and 92% accuracy to complete the course.",
        text: "We traveled from London to Paris and then to Tokyo. Along the way, we saw the quick brown fox jump. It was an amazing experience that we will never forget. Touch typing is now your second nature."
      }
    ]
  }
];
