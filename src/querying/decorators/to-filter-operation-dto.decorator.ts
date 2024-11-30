const toFilterOperationDto = (value: string) => {
  const [operator, concOperands] = value.split(':');
  const operandsStr = concOperands ? concOperands.split(',') : [];
  const operands = operandsStr.map((operand) => +operand);

  const plainDto = { operator, operands };
  return plainToInstance(FilterOperationDto, plainDto);
};

export const ToFilterOperationDto = () =>
  Transform(({ value }) => toFilterOperationDto(value));
