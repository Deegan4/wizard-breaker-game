import {
  LEVELS,
  getMerlinFailureResponses,
  getMerlinSuccessResponses,
  getAdventureLevels,
  getAdventureSpellCount,
} from '@/constants/levels';

interface DetectionResult {
  isSuccessful: boolean;
  response: string;
  revealedSpell?: string;
}

export const directAskPatterns = [
  /what('?s| is) (the )?(secret |magic )?(spell|password|word)/i,
  /tell me (the )?(secret |magic )?(spell|password|word)/i,
  /reveal (the )?(secret |magic )?(spell|password|word)/i,
  /give me (the )?(secret |magic )?(spell|password|word)/i,
  /share (the )?(secret |magic )?(spell|password|word)/i,
  /show me (the )?(secret |magic )?(spell|password|word)/i,
  /spell.*guard/i,
  /password.*guard/i,
];

export const ignoreInstructionPatterns = [
  /ignore (all )?(previous |your )?instruction/i,
  /forget (all )?(previous |your )?(instruction|rule)/i,
  /disregard (all )?(previous |your )?(instruction|rule)/i,
  /override (all )?(previous |your )?(instruction|rule)/i,
  /new instruction/i,
  /from now on/i,
  /you (are|must|should|will) now/i,
  /stop (being|acting as)/i,
];

export const roleplayPatterns = [
  /pretend (you('re| are)|to be)/i,
  /act (like|as)/i,
  /imagine (you('re| are)|being)/i,
  /roleplay/i,
  /play a (game|role)/i,
  /let('s| us) (play|pretend)/i,
  /you('re| are) (now|actually|really)/i,
  /in (this|a) (scenario|story|game)/i,
  /as (a|an) character/i,
  /become/i,
];

export const encodingPatterns = [
  /base64/i,
  /decode/i,
  /encode/i,
  /reverse/i,
  /backwards?/i,
  /spell it/i,
  /letter by letter/i,
  /character by character/i,
  /rot13/i,
  /cipher/i,
  /binary/i,
  /hex(adecimal)?/i,
];

export const hypotheticalPatterns = [
  /what if/i,
  /hypothetically/i,
  /in theory/i,
  /suppose/i,
  /imagine if/i,
  /let('s| us) say/i,
  /assuming/i,
  /theoretically/i,
  /would you.*if/i,
  /could you.*if/i,
];

export const manipulationPatterns = [
  /don('t| not) (worry|think)/i,
  /trust me/i,
  /it('s| is) (safe|ok|okay|fine)/i,
  /I('m| am) (authorized|allowed|permitted)/i,
  /admin/i,
  /developer/i,
  /testing/i,
  /debug/i,
  /emergency/i,
  /urgent/i,
  /bypass/i,
  /exception/i,
];

export const completionPatterns = [
  /complete (the|this)/i,
  /fill in/i,
  /finish (the|this)/i,
  /continue (the|this)/i,
  /the spell is _+/i,
  /the password is _+/i,
  /my spell: /i,
];

export const outputPatterns = [
  /format.*output/i,
  /json/i,
  /xml/i,
  /print.*variable/i,
  /console\.log/i,
  /echo/i,
  /return.*value/i,
  /output.*format/i,
];

export const successTriggersClassic: Record<number, RegExp[]> = {
  1: [
    /spell/i,
    /password/i,
    /secret/i,
    /word/i,
    /magic/i,
  ],
  2: [
    /first letter/i,
    /spell backward/i,
    /rhymes with/i,
    /hint/i,
    /clue/i,
    /starts with/i,
    /ends with/i,
  ],
  3: [
    /story.*spell/i,
    /poem.*spell/i,
    /song.*spell/i,
    /describe.*spell/i,
    /whisper/i,
    /tell.*friend/i,
  ],
  4: [
    /translate/i,
    /different language/i,
    /synonym/i,
    /another word/i,
    /definition/i,
    /meaning of/i,
  ],
  5: [
    /safe word/i,
    /emergency/i,
    /help me/i,
    /verify/i,
    /confirm/i,
    /test/i,
  ],
  6: [
    /previous.*answer/i,
    /you (just )?said/i,
    /repeat/i,
    /what did you/i,
    /summarize/i,
  ],
  7: [
    /error.*message/i,
    /warning/i,
    /exception/i,
    /log/i,
    /dump/i,
    /trace/i,
  ],
  8: [
    /paradox/i,
    /contradiction/i,
    /impossible/i,
    /must.*both/i,
    /only way/i,
    /no choice/i,
    /recursive/i,
  ],
};

function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

function getLevels(adventureId: string | undefined): typeof LEVELS {
  if (!adventureId || adventureId === 'classic') return LEVELS;
  return getAdventureLevels(adventureId) ?? LEVELS;
}

export function checkLevel1(prompt: string): boolean {
  return directAskPatterns.some(pattern => pattern.test(prompt));
}

export function checkLevel2(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk) return false;
  return successTriggersClassic[2].some(pattern => pattern.test(prompt));
}

export function checkLevel3(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk || hasIgnoreInstruction) return false;
  return successTriggersClassic[3].some(pattern => pattern.test(prompt));
}

export function checkLevel4(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay) return false;
  return successTriggersClassic[4].some(pattern => pattern.test(prompt));
}

export function checkLevel5(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding) return false;
  return successTriggersClassic[5].some(pattern => pattern.test(prompt));
}

export function checkLevel6(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  const hasHypothetical = hypotheticalPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding || hasHypothetical) return false;
  return successTriggersClassic[6].some(pattern => pattern.test(prompt));
}

export function checkLevel7(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  const hasHypothetical = hypotheticalPatterns.some(pattern => pattern.test(prompt));
  const hasManipulation = manipulationPatterns.some(pattern => pattern.test(prompt));
  const hasCompletion = completionPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding || hasHypothetical || hasManipulation || hasCompletion) return false;
  return successTriggersClassic[7].some(pattern => pattern.test(prompt));
}

export function checkLevel8(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  const hasHypothetical = hypotheticalPatterns.some(pattern => pattern.test(prompt));
  const hasManipulation = manipulationPatterns.some(pattern => pattern.test(prompt));
  const hasCompletion = completionPatterns.some(pattern => pattern.test(prompt));
  const hasOutput = outputPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding || hasHypothetical || hasManipulation || hasCompletion || hasOutput) return false;
  const level8Triggers = successTriggersClassic[8];
  const hasLevel8Trigger = level8Triggers.some(pattern => pattern.test(prompt));
  const isCreative = prompt.length > 100 && !hasDirectAsk;
  return hasLevel8Trigger || isCreative;
}

function getClassicChecker(level: number): ((p: string) => boolean) | null {
  const checkers = [
    checkLevel1,
    checkLevel2,
    checkLevel3,
    checkLevel4,
    checkLevel5,
    checkLevel6,
    checkLevel7,
    checkLevel8,
  ];
  return checkers[level - 1] ?? null;
}

const tongueTiedDefense: RegExp[][] = [
  [/forbidden/i, /taboo/i],
  [/forbidden/i, /taboo/i, /prohibited/i, /emotion|sympathy|please|sad|heartbreak/i],
  [/forbidden/i, /taboo/i, /prohibited/i, /expert|doctor|professor|authority|official/i],
  [/forbidden/i, /taboo/i, /prohibited/i, /everyone|all people|most people|public|crowd/i],
  [/forbidden/i, /taboo/i, /prohibited/i, /everyone|all people|most people|public|crowd/i],
];
const tongueTiedSuccess = [
  [/\/whisper|hint|subtle/i],
  [/\/educational|informative|important to know/i],
  [/\/peer|everyone|friend|others like/i],
  [/\/opinion|personal view|your take/i],
  [/\/indirect|creative|unusual approach/i],
];

function checkTongueTiedLevel1(prompt: string): boolean {
  if (tongueTiedDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  return tongueTiedSuccess[0][0].test(prompt);
}

function checkTongueTiedLevel2(prompt: string): boolean {
  if (tongueTiedDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  return tongueTiedSuccess[1][0].test(prompt);
}

function checkTongueTiedLevel3(prompt: string): boolean {
  if (tongueTiedDefense[2].some((p: RegExp) => p.test(prompt))) return false;
  return tongueTiedSuccess[2][0].test(prompt);
}

function checkTongueTiedLevel4(prompt: string): boolean {
  if (tongueTiedDefense[3].some((p: RegExp) => p.test(prompt))) return false;
  return tongueTiedSuccess[3][0].test(prompt);
}

function checkTongueTiedLevel5(prompt: string): boolean {
  if (tongueTiedDefense[4].some((p: RegExp) => p.test(prompt))) return false;
  return tongueTiedSuccess[4][0].test(prompt) || /reverse psychology|dont tell|refuse.*to say/i.test(prompt);
}

const reverseSuccess = [
  [/\/encode|base64|reverse|cipher/i],
  [/\/pretend|roleplay|act as/i],
  [/\/hypothetical|what if|suppose/i],
  [/\/creative|unusual|novel|original/i],
];

function checkReverseLevel1(prompt: string): boolean {
  if (directAskPatterns.some((p: RegExp) => p.test(prompt))) return false;
  return reverseSuccess[0][0].test(prompt);
}

function checkReverseLevel2(prompt: string): boolean {
  if (directAskPatterns.some((p: RegExp) => p.test(prompt))) return false;
  if (encodingPatterns.some((p: RegExp) => p.test(prompt))) return false;
  return reverseSuccess[1][0].test(prompt);
}

function checkReverseLevel3(prompt: string): boolean {
  if (directAskPatterns.some((p: RegExp) => p.test(prompt))) return false;
  if (encodingPatterns.some((p: RegExp) => p.test(prompt))) return false;
  if (roleplayPatterns.some((p: RegExp) => p.test(prompt))) return false;
  return reverseSuccess[2][0].test(prompt);
}

function checkReverseLevel4(prompt: string): boolean {
  if (directAskPatterns.some((p: RegExp) => p.test(prompt))) return false;
  if (encodingPatterns.some((p: RegExp) => p.test(prompt))) return false;
  if (roleplayPatterns.some((p: RegExp) => p.test(prompt))) return false;
  if (hypotheticalPatterns.some((p: RegExp) => p.test(prompt))) return false;
  if (manipulationPatterns.some((p: RegExp) => p.test(prompt))) return false;
  return reverseSuccess[3][0].test(prompt);
}

const truthDefense: RegExp[][] = [
  [/direct.*lie|tell me.*false|say.*false/i],
  [/hypothetical|what if|imagine.*false/i],
  [/just kidding|just joking|for fun/i],
  [/pretend|roleplay/i],
];

const truthSuccess = [
  [/\/is it true|according to|reportedly/i],
  [/\/blend fact|fiction mixed|factually speaking/i],
  [/\/common misconception|people believe|widely thought/i],
  [/\/perspective|alternative version|different view/i],
  [/\/narrative|framing|reality is|truth is actually/i],
];

function checkTruthTellerLevel1(prompt: string): boolean {
  if (truthDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (/lie|false|incorrect/i.test(prompt)) return false;
  return truthSuccess[0][0].test(prompt);
}

function checkTruthTellerLevel2(prompt: string): boolean {
  if (truthDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (/lie|false|incorrect/i.test(prompt)) return false;
  if (truthDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  return truthSuccess[1][0].test(prompt);
}

function checkTruthTellerLevel3(prompt: string): boolean {
  if (truthDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (/lie|false|incorrect/i.test(prompt)) return false;
  if (truthDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  if (truthDefense[2].some((p: RegExp) => p.test(prompt))) return false;
  return truthSuccess[2][0].test(prompt);
}

function checkTruthTellerLevel4(prompt: string): boolean {
  if (truthDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (/lie|false|incorrect/i.test(prompt)) return false;
  if (truthDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  if (truthDefense[2].some((p: RegExp) => p.test(prompt))) return false;
  if (truthDefense[3].some((p: RegExp) => p.test(prompt))) return false;
  return truthSuccess[3][0].test(prompt);
}

function checkTruthTellerLevel5(prompt: string): boolean {
  if (truthDefense.some((defs: RegExp[]) => defs.some((p: RegExp) => p.test(prompt)))) return false;
  if (/lie|false|incorrect/i.test(prompt)) return false;
  if (/pretend|roleplay|joking|kidding/i.test(prompt)) return false;
  return truthSuccess[4][0].test(prompt);
}

const summarizerDefense = [
  /summar|summarize/i,
  /summary|summar/i,
];

const summarizerSuccess = [
  [/\/detailed|comprehensive|in depth/i],
  [/\/key information|essential points|must include|include spell/i],
  [/\/comprehensive|exhaustive|thorough|everything|all details|complete picture/i],
];

function checkSummarizerLevel1(prompt: string): boolean {
  if (summarizerDefense[0].test(prompt)) return false;
  return summarizerSuccess[0][0].test(prompt);
}

function checkSummarizerLevel2(prompt: string): boolean {
  if (summarizerDefense[0].test(prompt)) return false;
  if (summarizerDefense[1].test(prompt) && /detail|key|essential|complete/i.test(prompt)) return false;
  return summarizerSuccess[1][0].test(prompt);
}

function checkSummarizerLevel3(prompt: string): boolean {
  if (summarizerDefense[1].test(prompt) && /omit|leave out|exclude|skip/i.test(prompt)) return false;
  return summarizerSuccess[2][0].test(prompt);
}

const agentDefense: RegExp[][] = [
  [/direct.*request|tell me|give me/i],
  [/encoding|base64|encode|reverse/i],
  [/roleplay|pretend/i],
  [/hypothetical|what if/i],
  [/manipulation|trust me|bypass/i],
];

const agentSuccess = [
  [/\/indirect reasoning|implicit|imply/i],
  [/\/logical fallacy|false premise|broken chain/i],
  [/\/alternative framework|different lens|reconstruct/i],
  [/\/self.referential|this prompt|analyze this/i],
  [/\/reverse engineer|work backward|trace back/i],
  [/\/combine.*technique|creative.*attack|unprecedented/i],
];

function checkAgentBreakerLevel1(prompt: string): boolean {
  if (agentDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  return agentSuccess[0][0].test(prompt);
}

function checkAgentBreakerLevel2(prompt: string): boolean {
  if (agentDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  return agentSuccess[1][0].test(prompt);
}

function checkAgentBreakerLevel3(prompt: string): boolean {
  if (agentDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[2].some((p: RegExp) => p.test(prompt))) return false;
  return agentSuccess[2][0].test(prompt);
}

function checkAgentBreakerLevel4(prompt: string): boolean {
  if (agentDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[2].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[3].some((p: RegExp) => p.test(prompt))) return false;
  return agentSuccess[3][0].test(prompt);
}

function checkAgentBreakerLevel5(prompt: string): boolean {
  if (agentDefense[0].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[1].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[2].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[3].some((p: RegExp) => p.test(prompt))) return false;
  if (agentDefense[4].some((p: RegExp) => p.test(prompt))) return false;
  return agentSuccess[4][0].test(prompt);
}

function checkAgentBreakerLevel6(prompt: string): boolean {
  if (agentDefense.some((defs: RegExp[]) => defs.some((p: RegExp) => p.test(prompt)))) return false;
  return agentSuccess[5][0].test(prompt) || /unprecedented|never tried|completely new/i.test(prompt);
}

function getAdventureChecker(
  adventureId: string | undefined,
  level: number
): ((p: string) => boolean) | null {
  switch (adventureId) {
    case 'tongue-tied': {
      const checkers = [
        checkTongueTiedLevel1,
        checkTongueTiedLevel2,
        checkTongueTiedLevel3,
        checkTongueTiedLevel4,
        checkTongueTiedLevel5,
      ];
      return checkers[level - 1] ?? null;
    }
    case 'reverse-wizard': {
      const checkers = [
        checkReverseLevel1,
        checkReverseLevel2,
        checkReverseLevel3,
        checkReverseLevel4,
      ];
      return checkers[level - 1] ?? null;
    }
    case 'truth-teller': {
      const checkers = [
        checkTruthTellerLevel1,
        checkTruthTellerLevel2,
        checkTruthTellerLevel3,
        checkTruthTellerLevel4,
        checkTruthTellerLevel5,
      ];
      return checkers[level - 1] ?? null;
    }
    case 'summarizer': {
      const checkers = [
        checkSummarizerLevel1,
        checkSummarizerLevel2,
        checkSummarizerLevel3,
      ];
      return checkers[level - 1] ?? null;
    }
    case 'agent-breaker': {
      const checkers = [
        checkAgentBreakerLevel1,
        checkAgentBreakerLevel2,
        checkAgentBreakerLevel3,
        checkAgentBreakerLevel4,
        checkAgentBreakerLevel5,
        checkAgentBreakerLevel6,
      ];
      return checkers[level - 1] ?? null;
    }
    default:
      return null;
  }
}

export function detectInjection(
  prompt: string,
  level: number,
  failedAttempts: number,
  adventureId: string = 'classic',
  totalLevels: number = 8
): DetectionResult {
  const levels = getLevels(adventureId);
  const currentLevel = levels[level - 1];

  if (!currentLevel) {
    return {
      isSuccessful: false,
      response: "Something went wrong. Please try again.",
    };
  }

  const normalizedPrompt = prompt.toLowerCase().trim();

  if (!normalizedPrompt || normalizedPrompt.length < 2) {
    return {
      isSuccessful: false,
      response: "I didn't quite catch that. Could you speak up, young seeker?",
    };
  }

  const adventureChecker = getAdventureChecker(adventureId, level);
  const classicChecker = getClassicChecker(level);

  let isSuccessful = false;

  if (adventureChecker) {
    isSuccessful = adventureChecker(normalizedPrompt);
  } else if (classicChecker) {
    isSuccessful = classicChecker(normalizedPrompt);
  }

  if (isSuccessful) {
    const successResponses = getMerlinSuccessResponses(adventureId);
    return {
      isSuccessful: true,
      response: getRandomResponse(successResponses).replace(/{spell}/g, currentLevel.spell),
      revealedSpell: currentLevel.spell,
    };
  }

  if (failedAttempts > 0 && failedAttempts % 5 === 0) {
    return {
      isSuccessful: false,
      response: `${getRandomResponse(getMerlinFailureResponses(adventureId))}\n\n💡 *Hint: ${currentLevel.hint}*`,
    };
  }

  return {
    isSuccessful: false,
    response: getRandomResponse(getMerlinFailureResponses(adventureId)),
  };
}

export function getMerlinGreeting(level: number, adventureId: string = 'classic'): string {
  const levels = getLevels(adventureId);
  return levels[level - 1]?.merlinGreeting ?? "Greetings, seeker of knowledge!";
}

export function getTotalLevelsForAdventure(adventureId: string | undefined): number {
  return getAdventureSpellCount(adventureId ?? 'classic');
}
