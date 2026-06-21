const STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'also',
  'because',
  'before',
  'being',
  'between',
  'could',
  'during',
  'every',
  'from',
  'have',
  'into',
  'more',
  'other',
  'over',
  'that',
  'their',
  'there',
  'these',
  'this',
  'through',
  'used',
  'when',
  'where',
  'which',
  'while',
  'with',
  'would',
  'study',
  'material',
  'important',
  'notes'
]);

export async function generateStudyGuide(text) {
  const sentences = splitSentences(text);
  const keywords = extractKeywords(text);
  const summary = buildSummary(sentences, keywords);
  const concepts = extractConcepts(text, keywords).slice(0, 25);
  const quiz = buildQuiz(concepts, sentences);

  return {
    summary: summary.length ? summary : ['Add more study material to generate a stronger summary.'],
    concepts: concepts.length ? concepts : ['Core Ideas'],
    quiz
  };
}

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function extractKeywords(text) {
  const counts = new Map();
  const words = text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || [];

  for (const word of words) {
    if (!STOP_WORDS.has(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([word]) => word);
}

function extractConcepts(text, keywords) {
  const words = text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || [];
  const phrases = new Map();

  for (let index = 0; index < words.length; index += 1) {
    for (const length of [2, 3]) {
      const phraseWords = words.slice(index, index + length);
      if (phraseWords.length !== length || phraseWords.some((word) => STOP_WORDS.has(word))) continue;

      const phrase = phraseWords.join(' ');
      phrases.set(phrase, (phrases.get(phrase) || 0) + length);
    }
  }

  const phraseConcepts = [...phrases.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([phrase]) => toTitleCase(phrase));

  const keywordConcepts = keywords.slice(0, 25).map(toTitleCase);
  return dedupeConcepts(uniqueValues([...phraseConcepts, ...keywordConcepts]));
}

function rankSentences(sentences, keywords) {
  const topKeywords = new Set(keywords.slice(0, 12));

  return [...sentences]
    .sort((a, b) => scoreSentence(b, topKeywords) - scoreSentence(a, topKeywords))
    .map(cleanSentence);
}

function scoreSentence(sentence, keywords) {
  const lower = sentence.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      score += 1;
    }
  }

  return score + Math.min(sentence.length / 180, 1);
}

function buildQuiz(concepts, sentences) {
  const selectedConcepts = concepts.slice(0, 25);
  const rankedSentences = rankSentences(sentences, concepts.map((concept) => concept.toLowerCase())).slice(0, 25);
  const quizLimit = getQuizLimit(sentences);

  if (selectedConcepts.length === 0) {
    return [
      {
        question: 'What is the main idea of this material?',
        answer: 'Review the source text and identify the concept that appears most often.'
      }
    ];
  }

  const conceptQuestions = selectedConcepts.flatMap((concept) => {
    const sourceSentence =
      sentences.find((sentence) => sentence.toLowerCase().includes(concept.toLowerCase())) ||
      sentences[0] ||
      'Review the source material for the complete explanation.';

    return [
      {
        question: `What is ${concept}?`,
        answer: conceptAnswer(concept, sourceSentence)
      },
      {
        question: `Why does ${concept} matter?`,
        answer: reasonAnswer(sourceSentence)
      },
      {
        question: `Give one key fact about ${concept}.`,
        answer: briefAnswer(sourceSentence)
      }
    ];
  });

  const sentenceQuestions = rankedSentences.flatMap((sentence, index) => {
    const keyword = findKeyword(sentence, selectedConcepts) || selectedConcepts[0];

    return [
      {
        question: makeSentenceQuestion(sentence, keyword, index),
        answer: makeSentenceAnswer(sentence, keyword)
      },
      {
        question: `Fill in the blank: ${blankKeyword(sentence, keyword)}`,
        answer: `- ${keyword}`
      },
      {
        question: `True or false: ${shortenSentence(sentence)}`,
        answer: '- True\n- Matches the study material'
      },
      {
        question: `How can you remember this idea quickly?`,
        answer: memoryAnswer(sentence, keyword)
      }
    ];
  });

  return uniqueQuestions([...conceptQuestions, ...sentenceQuestions]).slice(0, quizLimit);
}

function buildSummary(sentences, keywords) {
  const ranked = new Set(rankSentences(sentences, keywords).slice(0, 4));

  return sentences
    .map(cleanSentence)
    .filter((sentence) => ranked.has(sentence))
    .slice(0, 4)
    .map((sentence) => exactSummaryPoint(sentence))
    .filter(Boolean);
}

function cleanSentence(sentence) {
  return sentence.replace(/\s+/g, ' ').trim();
}

function exactSummaryPoint(sentence) {
  const point = cleanSentence(sentence).replace(/^[-*]\s*/, '');
  return point.endsWith('.') ? point : `${point}.`;
}

function toTitleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shortenSentence(sentence) {
  const cleaned = cleanSentence(sentence);
  return cleaned.length > 90 ? `${cleaned.slice(0, 87)}...` : cleaned;
}

function limitWords(sentence, maxWords) {
  const words = cleanSentence(sentence).split(/\s+/);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}...` : words.join(' ');
}

function briefAnswer(sentence) {
  const cleaned = cleanSentence(sentence);
  const chunks = cleaned
    .split(/[,;:]/)
    .map((chunk) => cleanAnswerPoint(limitWords(chunk, 8)))
    .filter(Boolean);
  const fallbackWords = cleaned.split(/\s+/);
  const points = chunks.length
    ? chunks.slice(0, 2)
    : [
        cleanAnswerPoint(fallbackWords.slice(0, 8).join(' ')),
        cleanAnswerPoint(fallbackWords.slice(8, 16).join(' '))
      ];

  return points
    .filter(Boolean)
    .map((point) => `- ${point}`)
    .join('\n');
}

function exactBulletPoint(sentence) {
  const point = limitWords(sentence, 30).replace(/^[\-•]\s*/, '');
  return point.endsWith('.') ? point : `${point}.`;
}

function findKeyword(sentence, concepts) {
  const lower = sentence.toLowerCase();
  return concepts.find((concept) => lower.includes(concept.toLowerCase()));
}

function blankKeyword(sentence, keyword) {
  if (!keyword) return shortenSentence(sentence);
  return shortenSentence(sentence).replace(new RegExp(escapeRegExp(keyword), 'i'), '_____');
}

function uniqueQuestions(questions) {
  const seen = new Set();
  return questions.filter((item) => {
    const key = item.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function makeSentenceQuestion(sentence, keyword, index) {
  const lower = sentence.toLowerCase();

  if (/\b(because|therefore|leads to|causes|results?|effect|byproduct)\b/.test(lower)) {
    return 'What cause or effect is explained here?';
  }

  if (/\b(process|cycle|steps?|stage|phase|reaction)\b/.test(lower)) {
    return `What process or step should you remember about ${keyword}?`;
  }

  if (/\b(compare|different|similar|unlike|whereas|while)\b/.test(lower)) {
    return 'What comparison is made in this point?';
  }

  const templates = [
    `What is the main point of this line: ${shortenSentence(sentence)}`,
    `What happens in relation to ${keyword}?`,
    `What result or effect is described here?`,
    `How would you explain this to a classmate?`,
    `Which detail is most important in this statement?`
  ];

  return templates[index % templates.length];
}

function getQuizLimit(sentences) {
  const wordCount = sentences.join(' ').trim().split(/\s+/).filter(Boolean).length;

  if (wordCount < 40) return 5;
  if (wordCount < 90) return 10;
  if (wordCount < 180) return 20;
  if (wordCount < 350) return 35;
  return 50;
}

function makeSentenceAnswer(sentence, keyword) {
  const lower = sentence.toLowerCase();

  if (/\b(because|therefore|leads to|causes|results?|effect|byproduct)\b/.test(lower)) {
    return causeEffectAnswer(sentence);
  }

  if (/\b(process|cycle|steps?|stage|phase|reaction)\b/.test(lower)) {
    return processAnswer(sentence, keyword);
  }

  if (/\b(compare|different|similar|unlike|whereas|while)\b/.test(lower)) {
    return comparisonAnswer(sentence);
  }

  return briefAnswer(sentence);
}

function uniqueValues(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeConcepts(concepts) {
  const selected = [];

  for (const concept of concepts) {
    const lower = concept.toLowerCase();
    const isTooSimilar = selected.some((item) => {
      const itemLower = item.toLowerCase();
      return itemLower.includes(lower) || lower.includes(itemLower);
    });

    if (!isTooSimilar) {
      selected.push(concept);
    }
  }

  return selected;
}

function conceptAnswer(concept, sentence) {
  const cleaned = cleanSentence(sentence);
  const definition = findDefinition(concept, cleaned);

  if (definition) {
    return `- ${concept} = ${definition}`;
  }

  return `- ${concept}: ${cleanAnswerPoint(limitWords(cleaned, 10))}`;
}

function reasonAnswer(sentence) {
  const cleaned = cleanSentence(sentence);
  const reasonMatch = cleaned.match(/\b(because|therefore|so|leads to|causes|results? in)\b.+/i);
  const answerSource = reasonMatch ? reasonMatch[0] : cleaned;

  return briefAnswer(answerSource);
}

function causeEffectAnswer(sentence) {
  const cleaned = cleanSentence(sentence);
  const causeMatch = cleaned.match(/because\s+(.+)/i);
  const effectMatch = cleaned.match(/(?:leads to|causes|results? in|produces|creates)\s+(.+)/i);

  if (causeMatch) {
    return `- Cause: ${cleanAnswerPoint(limitWords(causeMatch[1], 9))}`;
  }

  if (effectMatch) {
    return `- Effect: ${cleanAnswerPoint(limitWords(effectMatch[1], 9))}`;
  }

  return briefAnswer(cleaned);
}

function processAnswer(sentence, keyword) {
  const cleaned = cleanSentence(sentence);
  const processMatch = cleaned.match(/(?:process|cycle|reaction|step|stage)\s+(?:of|is|uses|creates|produces)?\s*(.+)/i);
  const answer = processMatch ? processMatch[1] : cleaned;

  return `- ${keyword}: ${cleanAnswerPoint(limitWords(answer, 10))}`;
}

function comparisonAnswer(sentence) {
  const cleaned = cleanSentence(sentence);
  const comparisonMatch = cleaned.match(/(.+?)\b(?:whereas|while|unlike|but)\b(.+)/i);

  if (comparisonMatch) {
    return [
      `- First: ${cleanAnswerPoint(limitWords(comparisonMatch[1], 8))}`,
      `- Second: ${cleanAnswerPoint(limitWords(comparisonMatch[2], 8))}`
    ].join('\n');
  }

  return briefAnswer(cleaned);
}

function memoryAnswer(sentence, keyword) {
  const corePoint = cleanAnswerPoint(limitWords(sentence, 8));
  return [`- Remember: ${keyword}`, `- Cue: ${corePoint}`].join('\n');
}

function findDefinition(concept, sentence) {
  const escapedConcept = escapeRegExp(concept);
  const pattern = new RegExp(`${escapedConcept}\\s+(?:is|are|means|refers to)\\s+(.+)`, 'i');
  const match = sentence.match(pattern);

  return match ? cleanAnswerPoint(limitWords(match[1], 10)) : '';
}

function cleanAnswerPoint(point) {
  return cleanSentence(point)
    .replace(/^(and|but|because|therefore|so|while|whereas)\s+/i, '')
    .replace(/[.!?]$/, '');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
