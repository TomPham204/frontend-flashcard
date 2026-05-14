export type Difficulty = 'Again' | 'Hard' | 'Good' | 'Easy' | 'New';

export interface Flashcard {
  id: string;
  user_id?: string;
  question: string;
  answer: string;
  code_snippet?: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export const starterDeck: Flashcard[] = [
  // JavaScript
  {
    id: 'js-1',
    category: 'JavaScript',
    question: 'What is a closure?',
    answer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives you access to an outer function\'s scope from an inner function.',
    code_snippet: 'function init() {\n  var name = "Mozilla"; // name is a local variable\n  function displayName() {\n    // displayName() is the inner function, a closure\n    console.log(name);\n  }\n  displayName();\n}',
    tags: ['core', 'functions'],
    difficulty: 'New',
    next_review_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'js-2',
    category: 'JavaScript',
    question: 'Explain the difference between let, const, and var.',
    answer: 'var is function-scoped and hoisted. let and const are block-scoped. let allows reassignment, while const does not (though properties of objects assigned to const can be mutated).',
    tags: ['core', 'variables'],
    difficulty: 'New',
    next_review_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // React
  {
    id: 'react-1',
    category: 'React',
    question: 'What is the Virtual DOM?',
    answer: 'The Virtual DOM is a programming concept where an ideal, or "virtual", representation of a UI is kept in memory and synced with the "real" DOM by a library such as ReactDOM. This process is called reconciliation.',
    tags: ['core', 'architecture'],
    difficulty: 'New',
    next_review_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'react-2',
    category: 'React',
    question: 'What are React Hooks?',
    answer: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components. They do not work inside classes.',
    code_snippet: 'const [count, setCount] = useState(0);',
    tags: ['hooks'],
    difficulty: 'New',
    next_review_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // HTML
  {
    id: 'html-1',
    category: 'HTML',
    question: 'What are semantic HTML elements?',
    answer: 'Semantic HTML elements clearly describe their meaning in a human- and machine-readable way. Examples include <header>, <footer>, <article>, and <section>, as opposed to non-semantic elements like <div> and <span>.',
    tags: ['accessibility', 'seo'],
    difficulty: 'New',
    next_review_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // CSS
  {
    id: 'css-1',
    category: 'CSS',
    question: 'Explain CSS Specificity.',
    answer: 'Specificity is the algorithm used by browsers to determine the CSS declaration that is the most relevant to an element, which in turn, determines the property value to apply. It is calculated based on inline styles, IDs, classes, attributes, pseudo-classes, and elements.',
    tags: ['core'],
    difficulty: 'New',
    next_review_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Performance
  {
    id: 'perf-1',
    category: 'Performance Optimization',
    question: 'What is lazy loading?',
    answer: 'Lazy loading is a strategy to identify resources as non-blocking (non-critical) and load these only when needed. It is a way to optimize the critical rendering path.',
    tags: ['images', 'optimization'],
    difficulty: 'New',
    next_review_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
