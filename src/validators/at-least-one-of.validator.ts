// src/validators/at-least-one-of.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
  } from 'class-validator';
  
  @ValidatorConstraint({ name: 'atLeastOneOf', async: false })
  export class AtLeastOneOfConstraint implements ValidatorConstraintInterface {
    constructor(private readonly fields: string[] = []) {}
  
    validate(_: any, args: ValidationArguments): boolean {
      const object = args.object as any;
      const fields = args.constraints[0] as string[];
      return fields.some(field => object[field] !== undefined && object[field] !== null);
    }
  
    defaultMessage(args: ValidationArguments): string {
      const fields = args.constraints[0] as string[];
      return `At least one of the following fields must be provided: ${fields.join(', ')}`;
    }
  }
  
  export function AtLeastOneOf(
    fields: string[],
    validationOptions?: ValidationOptions,
  ): ClassDecorator {
    return function (target: Function) {
      registerDecorator({
        name: 'atLeastOneOf',
        target: target,
        propertyName: undefined as any, // for class-level decorators
        options: validationOptions,
        constraints: [fields],
        validator: AtLeastOneOfConstraint,
      });
    };
  }
  