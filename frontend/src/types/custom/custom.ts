export type Column = {
  id: string;
  name: string;
};

export type UpdateColumn = Column & {
  realId: number;
};
