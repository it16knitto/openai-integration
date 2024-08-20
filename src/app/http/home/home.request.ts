import { InferOutput, object, string } from 'valibot';
import { ERROR_VALIDATION_MSG } from '@root/libs/config/errorMessage';

const sampleValidation = object({
	name: string(ERROR_VALIDATION_MSG.string('Name'))
});
export type TSampleValidation = InferOutput<typeof sampleValidation>;

export default {
	sampleValidation
};
