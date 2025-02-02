// Business
import StepBusiness from './step.business';
import FieldBusiness from '../field/field.business';
import RoleBusiness from '../role/role.business';
import OperatorBusiness from '../../parameterize/operator/operator.business';
import CallbackBusiness from '../../parameterize/callback/callback.business';
import TypeDataBusiness from '../../parameterize/typeData/typeData.business';
import VURoleBusiness from '../../../vu/role/role.business';
import VUEntityBusiness from '../../../vu/entity/entity.business';
import PStepBusiness from '../../../pm/parameterize/step/step.business';
import MProcessBusiness from '../../../pm/manage/process/process.business';
import RProcessBusiness from '../../runtime/process/process.business';

// Exceptions
import APIException from '../../../../exceptions/api.exception';

export default class StepImplementation extends StepBusiness {

    constructor() {
        super();
    }

    static async iAddRuleToStep(mStepId, conditions, callbacks) {

        // verify if step exists
        const mStepFound = await this.getStepById(mStepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        // process information cannot be edited until it is deactivated and there are no procedures in progress
        const mProcessId = mStepFound.process.toString();
        const processFound = await MProcessBusiness.getProcessById(mProcessId);
        if (!processFound) {
            throw new APIException('m.process.process_not_exists', 404);
        }
        const count = await RProcessBusiness.getCountProcessesByProcess(mStepFound.process.toString());
        if (processFound.active || count > 0) {
            throw new APIException('m.process.process_cant_update', 401);
        }

        // validate conditions
        let conditionsValid = 0;
        for (let property in conditions) {
            const dataCondition = conditions[property];
            if (dataCondition.hasOwnProperty('field') && dataCondition.hasOwnProperty('operator') && dataCondition.hasOwnProperty('value')) {
                const fieldFound = await FieldBusiness.getFieldById(dataCondition.field);
                const operatorFound = await OperatorBusiness.getOperatorById(dataCondition.operator);

                const pTypeData = await TypeDataBusiness.getTypeDataById(fieldFound.typeData.toString());
                let confirmOperator = pTypeData.operators.find(operator => {
                    return operator.toString() === dataCondition.operator.toString();
                });

                const verifyField = fieldFound && fieldFound.step.toString() === mStepId.toString();
                const verifyOperator = operatorFound && confirmOperator;
                const verifyValue = dataCondition.value;

                if (verifyField && verifyOperator && verifyValue) {
                    conditionsValid++;
                }
            }
        }
        const verifyConditions = conditions.length === conditionsValid;
        if (!verifyConditions) {
            throw new APIException('m.process.rules.rule_conditions_invalid', 401);
        }

        // validate callbacks
        let callbacksValid = 0;
        for (let property in callbacks) {
            const dataCallaback = callbacks[property];
            if (dataCallaback.hasOwnProperty('callback') && dataCallaback.hasOwnProperty('metadata')) {
                const callbackFound = await CallbackBusiness.getCallbackById(dataCallaback.callback);
                if (callbackFound) {
                    let metadataValid = 0;
                    callbackFound.fields.forEach((field) => {
                        if (dataCallaback.metadata.hasOwnProperty(field.field)) {
                            const verifyTypeData = TypeDataBusiness.verifyTypeData(field.typeData, dataCallaback.metadata[field.field]);
                            if (verifyTypeData) {
                                metadataValid++;
                            }
                        }
                    });
                    if (callbackFound.fields.length === metadataValid) {
                        callbacksValid++;
                    }
                }
            }
        }
        const verifyCallbacks = callbacks.length === callbacksValid;
        if (!verifyCallbacks) {
            throw new APIException('m.process.rules.rule_callbacks_invalid', 401);
        }

        const rule = {
            conditions,
            callbacks
        };

        await this.addRuleToStep(mStepId, rule);

        return await this.getStepById(mStepId);
    }

    static async iUpdateRuleToStep(mStepId, ruleId, conditions, callbacks) {

        // verify if step exists
        const mStepFound = await this.getStepById(mStepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        // process information cannot be edited until it is deactivated and there are no procedures in progress
        const mProcessId = mStepFound.process.toString();
        const processFound = await MProcessBusiness.getProcessById(mProcessId);
        if (!processFound) {
            throw new APIException('m.process.process_not_exists', 404);
        }
        const count = await RProcessBusiness.getCountProcessesByProcess(mStepFound.process.toString());
        if (processFound.active || count > 0) {
            throw new APIException('m.process.process_cant_update', 401);
        }

        // verify if rule exists
        const rules = mStepFound.rules;
        let ruleFound = false;
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            if (rule._id.toString() === ruleId.toString()) {
                ruleFound = true;
            }
        }
        if (!ruleFound) {
            throw new APIException('m.process.rules.rule_not_exists', 404);
        }

        // validate conditions
        let conditionsValid = 0;
        for (let property in conditions) {
            const dataCondition = conditions[property];
            if (dataCondition.hasOwnProperty('field') && dataCondition.hasOwnProperty('operator') && dataCondition.hasOwnProperty('value')) {
                const fieldFound = await FieldBusiness.getFieldById(dataCondition.field);
                const operatorFound = await OperatorBusiness.getOperatorById(dataCondition.operator);

                const pTypeData = await TypeDataBusiness.getTypeDataById(fieldFound.typeData.toString());
                let confirmOperator = pTypeData.operators.find(operator => {
                    return operator.toString() === dataCondition.operator.toString();
                });

                const verifyField = fieldFound && fieldFound.step.toString() === mStepId.toString();
                const verifyOperator = operatorFound && confirmOperator;
                const verifyValue = dataCondition.value;

                if (verifyField && verifyOperator && verifyValue) {
                    conditionsValid++;
                }
            }
        }
        const verifyConditions = conditions.length === conditionsValid;
        if (!verifyConditions) {
            throw new APIException('m.process.rules.rule_conditions_invalid', 401);
        }

        // validate callbacks
        let callbacksValid = 0;
        for (let property in callbacks) {
            const dataCallaback = callbacks[property];
            if (dataCallaback.hasOwnProperty('callback') && dataCallaback.hasOwnProperty('metadata')) {
                const callbackFound = await CallbackBusiness.getCallbackById(dataCallaback.callback);
                if (callbackFound) {
                    let metadataValid = 0;
                    callbackFound.fields.forEach((field) => {
                        if (dataCallaback.metadata.hasOwnProperty(field.field)) {
                            const verifyTypeData = TypeDataBusiness.verifyTypeData(field.typeData, dataCallaback.metadata[field.field]);
                            if (verifyTypeData) {
                                metadataValid++;
                            }
                        }
                    });
                    if (callbackFound.fields.length === metadataValid) {
                        callbacksValid++;
                    }
                }
            }
        }
        const verifyCallbacks = callbacks.length === callbacksValid;
        if (!verifyCallbacks) {
            throw new APIException('m.process.rules.rule_callbacks_invalid', 401);
        }

        const rule = {
            conditions,
            callbacks
        };

        await this.updateRuleToStep(mStepId, ruleId, rule);

        return await this.getStepById(mStepId);
    }

    static async iRemoveRuleToStep(stepId, ruleId) {

        // verify if step exists
        const mStepFound = await this.getStepById(stepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        // process information cannot be edited until it is deactivated and there are no procedures in progress
        const mProcessId = mStepFound.process.toString();
        const processFound = await MProcessBusiness.getProcessById(mProcessId);
        if (!processFound) {
            throw new APIException('m.process.process_not_exists', 404);
        }
        const count = await RProcessBusiness.getCountProcessesByProcess(mStepFound.process.toString());
        if (processFound.active || count > 0) {
            throw new APIException('m.process.process_cant_update', 401);
        }

        // verify if rule exists
        const rules = mStepFound.rules;
        let ruleFound = false;
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            if (rule._id.toString() === ruleId.toString()) {
                ruleFound = true;
            }
        }
        if (!ruleFound) {
            throw new APIException('m.process.rules.rule_not_exists', 404);
        }

        await StepBusiness.removeRuleToStep(stepId, ruleId);
    }

    static async iAddRoleToStep(mStepId, vuRoleId) {

        // verify if step exists
        const mStepFound = await this.getStepById(mStepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        // process information cannot be edited until it is deactivated and there are no procedures in progress
        const mProcessId = mStepFound.process.toString();
        const processFound = await MProcessBusiness.getProcessById(mProcessId);
        if (!processFound) {
            throw new APIException('m.process.process_not_exists', 404);
        }
        const count = await RProcessBusiness.getCountProcessesByProcess(mStepFound.process.toString());
        if (processFound.active || count > 0) {
            throw new APIException('m.process.process_cant_update', 401);
        }

        // verify if role exists
        const vuRoleFound = await VURoleBusiness.getRoleById(vuRoleId);
        if (!vuRoleFound) {
            throw new APIException('m.process.roles.role_not_exists', 404);
        }

        // verify if role has registered in the step
        const rolesStep = mStepFound.roles;
        let foundRole = false;
        for (let i in rolesStep) {
            const roleId = rolesStep[i];
            if (roleId.toString() === vuRoleId.toString()) {
                foundRole = true;
                break;
            }
        }
        if (foundRole) {
            throw new APIException('m.process.steps.step_role_registered', 401);
        }

        rolesStep.push(vuRoleId);

        await this.updateRolesToStep(mStepId, rolesStep);

        return await this.getStepById(mStepId);
    }

    static async iRemoveRoleToStep(mStepId, vuRoleId) {

        // verify if step exists
        const mStepFound = await this.getStepById(mStepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        // process information cannot be edited until it is deactivated and there are no procedures in progress
        const mProcessId = mStepFound.process.toString();
        const processFound = await MProcessBusiness.getProcessById(mProcessId);
        if (!processFound) {
            throw new APIException('m.process.process_not_exists', 404);
        }
        const count = await RProcessBusiness.getCountProcessesByProcess(mStepFound.process.toString());
        if (processFound.active || count > 0) {
            throw new APIException('m.process.process_cant_update', 401);
        }

        // verify if role exists
        const vuRoleFound = await VURoleBusiness.getRoleById(vuRoleId);
        if (!vuRoleFound) {
            throw new APIException('m.process.roles.role_not_exists', 404);
        }

        const rolesStep = mStepFound.roles;
        for (let i in rolesStep) {
            const roleId = rolesStep[i];
            if (roleId.toString() === vuRoleId.toString()) {
                rolesStep.splice(i, 1);
                break;
            }
        }

        await this.updateRolesToStep(mStepId, rolesStep);

        return await this.getStepById(mStepId);
    }

    static async updateStepToOrigin(mStepId) {

        // verify if step exists
        const mStepFound = await this.getStepById(mStepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        // process information cannot be edited until it is deactivated and there are no procedures in progress
        const mProcessId = mStepFound.process.toString();
        const processFound = await MProcessBusiness.getProcessById(mProcessId);
        if (!processFound) {
            throw new APIException('m.process.process_not_exists', 404);
        }
        const count = await RProcessBusiness.getCountProcessesByProcess(mStepFound.process.toString());
        if (processFound.active || count > 0) {
            throw new APIException('m.process.process_cant_update', 401);
        }

        const stepsProcess = await this.getStepsFromProcess(mStepFound.process.toString());
        for (let i in stepsProcess) {
            const step = stepsProcess[i];
            const isFirst = (step._id.toString() === mStepId) ? true : false;
            await this.updateStepFirst(step._id.toString(), isFirst);
        }

        return await this.getStepById(mStepId);
    }

    static async iSetEntityToStep(mStepId, vuEntityId) {

        // verify if step exists
        const mStepFound = await this.getStepById(mStepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        // process information cannot be edited until it is deactivated and there are no procedures in progress
        const mProcessId = mStepFound.process.toString();
        const processFound = await MProcessBusiness.getProcessById(mProcessId);
        if (!processFound) {
            throw new APIException('m.process.process_not_exists', 404);
        }
        const count = await RProcessBusiness.getCountProcessesByProcess(mStepFound.process.toString());
        if (processFound.active || count > 0) {
            throw new APIException('m.process.process_cant_update', 401);
        }

        // verify if entity exists
        const vuEntityFound = await VUEntityBusiness.getEntityById(vuEntityId);
        if (!vuEntityFound) {
            throw new APIException('m.process.entities.entity_not_exists', 404);
        }

        // verify if entity belongs to process
        const entitiesProcess = processFound.entities;
        const find = entitiesProcess.find(item => {
            return item.toString() === vuEntityId.toString();
        });
        if (!find) {
            throw new APIException('m.process.entities.entity_not_belongs_to_process', 401);
        }

        await this.updateEntityToStep(mStepId, vuEntityId);

        return await this.getStepById(mStepId);
    }

    static async getDataOrderStep(mStepId) {

        // verify if step exists
        const mStepFound = await this.getStepById(mStepId);
        if (!mStepFound) {
            throw new APIException('m.process.steps.step_not_exists', 404);
        }

        const mProcessId = mStepFound.process.toString();
        const dataStep = {
            before: [],
            after: []
        };

        // before
        let steps = await this.getStepsFromProcess(mProcessId);
        steps = JSON.parse(JSON.stringify(steps));
        // for (let i in steps) {
        //     const step = steps[i];
        //     const rules = step.rules;
        //     for (let j = 0; j < rules.length; j++) {
        //         const rule = rules[j];
        //         const callbacks = rule.callbacks;
        //         for (let k = 0; k < callbacks.length; k++) {
        //             const callback = callbacks[k];
        //             if (callback.callback.toString() === CallbackBusiness.CALLBACK_STEP) {
        //                 if (callback.metadata.step.toString() === mStepId.toString()) {
        //                     const fields = await FieldBusiness.getFieldsByStep(step._id.toString());
        //                     step.fields = fields.filter(item => {
        //                         return item.isPrivate === false;
        //                     });
        //                     step.typeStep = await PStepBusiness.getStepById(step.typeStep.toString());
        //                     dataStep.before.push(step);
        //                 }
        //             }
        //         }
        //     }
        // }
        for (let i in steps) {
            const step = steps[i];
            if (step._id.toString() !== mStepId.toString()) {
                const fields = await FieldBusiness.getFieldsByStep(step._id.toString());
                step.fields = fields.filter(item => {
                    return item.isPrivate === false;
                });
                step.typeStep = await PStepBusiness.getStepById(step.typeStep.toString());
                dataStep.before.push(step);
            }
        }

        // after
        // const step = mStepFound;
        // const rules = step.rules;
        // for (let j = 0; j < rules.length; j++) {
        //     const rule = rules[j];
        //     const callbacks = rule.callbacks;
        //     for (let k = 0; k < callbacks.length; k++) {
        //         const callback = callbacks[k];
        //         if (callback.callback.toString() === CallbackBusiness.CALLBACK_STEP) {
        //             const tempStep = await this.getStepById(callback.metadata.step.toString());
        //             dataStep.after.push(tempStep);
        //         }
        //     }
        // }

        return dataStep;
    }

}