import { CreateVehicle } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols';
import { LicensePlateValidator } from '@/validation/validators';

export class CreateVehicleController implements Controller {
  constructor(
    private readonly createVehicle: CreateVehicle,
    private readonly licensePlateValidator: LicensePlateValidator
  ) {}

  async handle(params: Request): Promise<Response> {
    try {
      const body = params.body;
      if (!body) return badRequest(new MissingParamError('body'));
      const { licensePlate } = body;
      const invalidPlate = this.licensePlateValidator.validate(licensePlate);
      if (invalidPlate) return badRequest(invalidPlate);
      const vehicle = await this.createVehicle.create(body);
      return created(vehicle);
    } catch (error) {
      return serverError(error);
    }
  }
}

type Request = HttpRequest<CreateVehicle.Params>;
type Response = HttpResponse<CreateVehicle.Result>;
