export type Question = {
  id: number;
  text: string;
};

export type ChatbotPersonality = 'humour-friend' | 'listener' | 'motivator';

export type UserAnswers = {
  [key: number]: string;
};