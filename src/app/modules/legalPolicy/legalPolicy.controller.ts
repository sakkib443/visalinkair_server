// ===================================================================
// Visalink Air - Legal Policy Controller
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { LegalPolicyService } from './legalPolicy.service';
import { PolicyType } from './legalPolicy.interface';

const VALID_TYPES = LegalPolicyService.VALID_TYPES;

const getAllPolicies = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await LegalPolicyService.getAllPolicies();
        res.status(200).json({
            success: true,
            message: 'Legal policies retrieved successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
};

const getPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.params.type as PolicyType;
        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid policy type. Must be one of: ${VALID_TYPES.join(', ')}`,
            });
        }
        const data = await LegalPolicyService.getPolicy(type);
        res.status(200).json({
            success: true,
            message: `${type} policy retrieved successfully`,
            data,
        });
    } catch (err) {
        next(err);
    }
};

const updatePolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const type = req.params.type as PolicyType;
        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid policy type. Must be one of: ${VALID_TYPES.join(', ')}`,
            });
        }
        const data = await LegalPolicyService.updatePolicy(type, req.body);
        res.status(200).json({
            success: true,
            message: `${type} policy updated successfully`,
            data,
        });
    } catch (err) {
        next(err);
    }
};

const seedDefaults = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await LegalPolicyService.seedDefaults();
        res.status(200).json({
            success: true,
            message: 'Legal policies seeded successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const LegalPolicyController = {
    getAllPolicies,
    getPolicy,
    updatePolicy,
    seedDefaults,
};
