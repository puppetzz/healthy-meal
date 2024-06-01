export type TResponse<T> = {
  status: number;
  message: string;
  data: T;
};
