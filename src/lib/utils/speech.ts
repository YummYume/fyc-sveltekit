import { browser } from '$app/environment';

export const createSpeechRecognition = () => {
  if (!browser) {
    return null;
  }

  const SpeechRecognitionAdapter = window?.SpeechRecognition || window?.webkitSpeechRecognition;

  if (!SpeechRecognitionAdapter) {
    return null;
  }

  return new SpeechRecognitionAdapter();
};

export const createSpeechGrammarList = () => {
  if (!browser) {
    return null;
  }

  const SpeechGrammarListAdapter = window?.SpeechGrammarList || window?.webkitSpeechGrammarList;

  if (!SpeechGrammarListAdapter) {
    return null;
  }

  return new SpeechGrammarListAdapter();
};

export const createSpeechRecognitionEvent = (
  type: string,
  eventInitDict: SpeechRecognitionEventInit,
) => {
  if (!browser) {
    return null;
  }

  const SpeechRecognitionEventAdapter =
    window?.SpeechRecognitionEvent || window?.webkitSpeechRecognitionEvent;

  if (!SpeechRecognitionEventAdapter) {
    return null;
  }

  return new SpeechRecognitionEventAdapter(type, eventInitDict);
};
