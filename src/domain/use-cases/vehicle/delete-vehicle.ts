export interface DeleteVehicle {
  delete: (data: DeleteVehicle.Params) => Promise<DeleteVehicle.Result>;
}

export namespace DeleteVehicle {
  export type Params = { id: string };
  export type Result = void;
}
