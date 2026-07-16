export type ContentDomain = "dailydose" | "funbrain";

export type DoseClassLevel = "11" | "12";

export type ContentQuestionRow = {
  id: string;
  domain: ContentDomain;
  classLevel: DoseClassLevel | null;
  activeDate: string;
  tag: string | null;
  q: string;
  opts: string[];
  correct: number;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type ContentQuestionInput = {
  domain: ContentDomain;
  classLevel?: DoseClassLevel | null;
  activeDate: string;
  tag?: string | null;
  q: string;
  opts: string[];
  correct: number;
  sortOrder?: number;
  published?: boolean;
};
