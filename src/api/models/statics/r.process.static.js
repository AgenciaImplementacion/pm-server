// Libs
import { addPopulates } from '../../../lib/helpers/mongoose';
import moment from 'moment';

export default (RProcessModel) => {

    // Statics
    RProcessModel.statics = {

        async createProcess(mProcessId, createdBy, mSteps) {
            const RProcessModel = this;
            const process = new RProcessModel({
                process: mProcessId,
                steps: mSteps,
                createdBy
            });
            return await process.save();
        },

        async getProcessById(rProcessId) {
            let process = this.findById(rProcessId).populate({
                path: 'process'
            }).populate({
                path: 'steps.step',
                populate: [
                    {
                        path: 'step',
                        model: 'MStepModel',
                    },
                    {
                        path: 'typeStep',
                        model: 'PStepModel',
                    }
                ]
            });
            return await process.exec();
        },

        async updateProcessStep(rProcessId, mStepId, data, metadata, vuUserId) {
            return await this.findOneAndUpdate(
                {
                    '_id': rProcessId,
                    'steps.step': mStepId
                },
                {
                    "$set": {
                        "steps.$.data": data,
                        "steps.$.metadata": metadata,
                        "steps.$.updatedAt": moment(),
                        "steps.$.modifiedBy": vuUserId
                    }
                }
            );
        },

        async getProcessesByProcessAndSteps(mProcessId, mRoles, populates) {
            let processes = this.find({
                process: mProcessId,
                'steps.step': { "$in": mRoles },
                'steps.active': true
            });
            processes = addPopulates(processes, populates);
            return await processes.exec();
        },

        async getProcessesMatchSteps(mProcessId, mStepsId) {
            let processes = this.find({
                process: mProcessId,
                active: true,
                steps: {
                    $elemMatch: {
                        step: { "$in": mStepsId },
                        active: true
                    }
                }
            }).populate({
                path: 'process'
            }).populate({
                path: 'steps.step',
                populate: [
                    {
                        path: 'step',
                        model: 'MStepModel',
                    },
                    {
                        path: 'typeStep',
                        model: 'PStepModel',
                    }
                ]
            });
            return await processes.exec();
        },

        async updateStepActive(rProcessId, mStepId) {
            await this.findOneAndUpdate(
                {
                    '_id': rProcessId,
                    'steps.active': true
                },
                {
                    "$set": {
                        "steps.$.active": false,
                    }
                }
            );
            return await this.findOneAndUpdate(
                {
                    '_id': rProcessId,
                    'steps.step': mStepId
                },
                {
                    "$set": {
                        "steps.$.active": true,
                    }
                }
            );
        },

        async updateProcessActive(rProcessId, active) {
            return await this.findOneAndUpdate(
                {
                    '_id': rProcessId
                },
                {
                    "active": active
                }
            );
        },

        async getProcessesByProcess(mProcessId) {
            let processes = this.find({ process: mProcessId });
            return await processes.exec();
        },

        async getProcessesByActive(active) {
            let processes = this.find({ active });
            return await processes.exec();
        },

        async getCountActiveProcessByTypeProcess(mProcessId, active) {
            return await this.count({ process: mProcessId, active });
        },

        async getCountProcessesByProcess(mProcessId) {
            return await this.count({ process: mProcessId });
        }

    };

};