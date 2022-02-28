export type StorageType = {
  description: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  location: {
    latitude: number;
    longitude: number;
  };
};
