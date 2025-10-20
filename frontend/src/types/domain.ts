export type Tag = {
  id: string;
  text: string;
};

export type Goal = {
  id: string;
  order: number;
  description: string;
  isSelected: boolean;
  resultProgress: number; // percentage from 0 to 100
  tags: Tag[];
};

export type Domain = {
  id: string;
  order: number;
  name: string;
  goalCount: number;
  goals: Goal[];
};
