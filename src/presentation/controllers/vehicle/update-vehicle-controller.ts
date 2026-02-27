import { UpdateVehicle } from '@/domain/use-cases';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';
import { LicensePlateValidator } from '@/validation/validators';

export class UpdateVehicleController implements Controller {
  constructor(
    private readonly updateVehicle: UpdateVehicle,
    private readonly licensePlateValidator: LicensePlateValidator
  ) {}

  async handle(request: Request): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) return badRequest(new MissingParamError('id'));
      if (!request.body) return badRequest(new MissingParamError('body'));
      const { licensePlate } = request.body;
      if (licensePlate) {
        const invalidPlate = this.licensePlateValidator.validate(licensePlate);
        if (invalidPlate) return badRequest(invalidPlate);
      }
      const { brand, model, year } = request.body;
      const vehicle = await this.updateVehicle.update({ id, licensePlate, brand, model, year });
      return ok(vehicle);
    } catch (error: any) {
      if (error instanceof NotFoundError) return notFound(error);
      return serverError(error);
    }
  }
}

type Request = HttpRequest<UpdateVehicle.Params>;
type Response = HttpResponse<UpdateVehicle.Result>;
