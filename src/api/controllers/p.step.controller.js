// Libs
import { result, error } from 'express-easy-helper';
import { getMessage } from '../../lib/helpers/locales';

// Business
import StepImplementation from '../business/pm/parameterize/step/step.implementation';

// Transformers
import { pStepTransformer } from '../transformers/p.step.transformer';

// get steps
export async function getSteps(req, res) {

    try {
        const steps = await StepImplementation.getSteps();
        return result(res, 200, pStepTransformer.transformer(steps));
    } catch (exception) {
        console.log("p.step@getSteps ---->", exception);
        if (exception.codeHttp && exception.key) {
            return error(res, exception.codeHttp, { message: getMessage(exception.key, 'es') });
        }
        return error(res, 500, { message: 'Server error ...' });
    }

}