export interface IUpdatePublish {
  isPublished: boolean;
  id: number;
}

export interface ICreatePublish {
  startDate: Date;
  endDate: Date;
  isPublished: boolean;
  createdAt: number | undefined;
  updatedAt: number | undefined;
  id: number | undefined;
}

export interface IGetPublish {
  startDate: Date;
  endDate: Date;
}

