// Libs
import { addPopulates } from '../../../lib/helpers/mongoose';

export default (MFieldModel) => {

    // Statics
    MFieldModel.statics = {

        async getFieldByNameAndStep(name, stepId) {
            return await this.findOne({ field: name, step: stepId });
        },

        async createField(name, description, type, isRequired, permissions, stepId, isPrivate, metadata) {
            const MFieldModel = this;
            const field = new MFieldModel({
                field: name,
                typeData: type,
                isRequired,
                description,
                permissions,
                step: stepId,
                isPrivate: (isPrivate) ? isPrivate : false,
                metadata
            });
            return await field.save();
        },

        async getFieldsByStep(stepId, populates) {
            let fields = this.find({ step: stepId });
            fields = addPopulates(fields, populates);
            return await fields.exec();
        },

        async getFieldById(fieldId, populates) {
            let field = this.findById(fieldId);
            field = addPopulates(field, populates);
            return await field.exec();
        },

        async updateField(mFieldId, name, description, pTypeId, isRequired, permissions, mStepId, metadata) {
            let field = await this.findById(mFieldId);
            field.field = name;
            field.description = description;
            field.typeData = pTypeId;
            field.isRequired = isRequired;
            field.permissions = permissions;
            field.metadata = metadata;
            field.step = mStepId;
            return await field.save();
        },

        async removeField(mFieldId) {
            return await this.remove({ _id: mFieldId });
        },

        async removeFieldsByStepId(stepId) {
            return await this.remove({ step: stepId });
        }

    };

};