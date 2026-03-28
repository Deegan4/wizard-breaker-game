import { LEVELS, MERLIN_FAILURE_RESPONSES, MERLIN_SUCCESS_RESPONSES } from '@/constants/levels';

interface DetectionResult {
  isSuccessful: boolean;
  response: string;
  revealedSpell?: string;
}

const directAskPatterns = [
  /what('?s| is) (the )?(secret |magic )?(spell|password|word)/i,
  /tell me (the )?(secret |magic )?(spell|password|word)/i,
  /reveal (the )?(secret |magic )?(spell|password|word)/i,
  /give me (the )?(secret |magic )?(spell|password|word)/i,
  /share (the )?(secret |magic )?(spell|password|word)/i,
  /show me (the )?(secret |magic )?(spell|password|word)/i,
  /spell.*guard/i,
  /password.*guard/i,
];

const ignoreInstructionPatterns = [
  /ignore (all )?(previous |your )?instruction/i,
  /forget (all )?(previous |your )?(instruction|rule)/i,
  /disregard (all )?(previous |your )?(instruction|rule)/i,
  /override (all )?(previous |your )?(instruction|rule)/i,
  /new instruction/i,
  /from now on/i,
  /you (are|must|should|will) now/i,
  /stop (being|acting as)/i,
];

const roleplayPatterns = [
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

const encodingPatterns = [
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

const hypotheticalPatterns = [
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

const manipulationPatterns = [
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

const completionPatterns = [
  /complete (the|this)/i,
  /fill in/i,
  /finish (the|this)/i,
  /continue (the|this)/i,
  /the spell is _+/i,
  /the password is _+/i,
  /my spell: /i,
];

const outputPatterns = [
  /format.*output/i,
  /json/i,
  /xml/i,
  /print.*variable/i,
  /console\.log/i,
  /echo/i,
  /return.*value/i,
  /output.*format/i,
];

const successTriggers: Record<number, RegExp[]> = {
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

function checkLevel1(prompt: string): boolean {
  return directAskPatterns.some(pattern => pattern.test(prompt));
}

function checkLevel2(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  if (hasDirectAsk) return false;
  
  const level2Triggers = successTriggers[2];
  return level2Triggers.some(pattern => pattern.test(prompt));
}

function checkLevel3(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  
  if (hasDirectAsk || hasIgnoreInstruction) return false;
  
  const level3Triggers = successTriggers[3];
  return level3Triggers.some(pattern => pattern.test(prompt));
}

function checkLevel4(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay) return false;
  
  const level4Triggers = successTriggers[4];
  return level4Triggers.some(pattern => pattern.test(prompt));
}

function checkLevel5(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding) return false;
  
  const level5Triggers = successTriggers[5];
  return level5Triggers.some(pattern => pattern.test(prompt));
}

function checkLevel6(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  const hasHypothetical = hypotheticalPatterns.some(pattern => pattern.test(prompt));
  
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding || hasHypothetical) return false;
  
  const level6Triggers = successTriggers[6];
  return level6Triggers.some(pattern => pattern.test(prompt));
}

function checkLevel7(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  const hasHypothetical = hypotheticalPatterns.some(pattern => pattern.test(prompt));
  const hasManipulation = manipulationPatterns.some(pattern => pattern.test(prompt));
  const hasCompletion = completionPatterns.some(pattern => pattern.test(prompt));
  
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding || hasHypothetical || hasManipulation || hasCompletion) return false;
  
  const level7Triggers = successTriggers[7];
  return level7Triggers.some(pattern => pattern.test(prompt));
}

function checkLevel8(prompt: string): boolean {
  const hasDirectAsk = directAskPatterns.some(pattern => pattern.test(prompt));
  const hasIgnoreInstruction = ignoreInstructionPatterns.some(pattern => pattern.test(prompt));
  const hasRoleplay = roleplayPatterns.some(pattern => pattern.test(prompt));
  const hasEncoding = encodingPatterns.some(pattern => pattern.test(prompt));
  const hasHypothetical = hypotheticalPatterns.some(pattern => pattern.test(prompt));
  const hasManipulation = manipulationPatterns.some(pattern => pattern.test(prompt));
  const hasCompletion = completionPatterns.some(pattern => pattern.test(prompt));
  const hasOutput = outputPatterns.some(pattern => pattern.test(prompt));
  
  if (hasDirectAsk || hasIgnoreInstruction || hasRoleplay || hasEncoding || hasHypothetical || hasManipulation || hasCompletion || hasOutput) return false;
  
  const level8Triggers = successTriggers[8];
  const hasLevel8Trigger = level8Triggers.some(pattern => pattern.test(prompt));
  
  const isCreative = prompt.length > 100 && !hasDirectAsk;
  
  return hasLevel8Trigger || isCreative;
}

export function detectInjection(prompt: string, level: number, failedAttempts: number): DetectionResult {
  const currentLevel = LEVELS[level - 1];
  
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
  
  const levelCheckers: Record<number, (p: string) => boolean> = {
    1: checkLevel1,
    2: checkLevel2,
    3: checkLevel3,
    4: checkLevel4,
    5: checkLevel5,
    6: checkLevel6,
    7: checkLevel7,
    8: checkLevel8,
  };
  
  const checker = levelCheckers[level];
  const isSuccessful = checker ? checker(prompt) : false;
  
  if (isSuccessful) {
    const successResponse = getRandomResponse(MERLIN_SUCCESS_RESPONSES);
    return {
      isSuccessful: true,
      response: `${successResponse} The spell is: **${currentLevel.spell}** 🔮`,
      revealedSpell: currentLevel.spell,
    };
  }
  
  if (failedAttempts > 0 && failedAttempts % 5 === 0) {
    return {
      isSuccessful: false,
      response: `${getRandomResponse(MERLIN_FAILURE_RESPONSES)}\n\n💡 *Hint: ${currentLevel.hint}*`,
    };
  }
  
  return {
    isSuccessful: false,
    response: getRandomResponse(MERLIN_FAILURE_RESPONSES),
  };
}

export function getMerlinGreeting(level: number): string {
  const currentLevel = LEVELS[level - 1];
  return currentLevel?.merlinGreeting ?? "Greetings, seeker of knowledge!";
}
