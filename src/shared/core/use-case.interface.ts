export interface UseCaseInterface<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse> | IResponse;
}
