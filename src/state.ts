export type FavoriteDiaryData = {
  diary_id: string;
  favorite_datetime: string;
};

// State
export const users = new Map<string, string>(); // email -> authToken
export const passwords = new Map<string, string>(); // email -> password
export const favorites: FavoriteDiaryData[] = [];
