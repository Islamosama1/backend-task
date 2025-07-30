import { Types } from "mongoose";
import { ViewingStatus } from "../enums/viewing-status.enum";

export interface IPropertyViewing {
    propertyId: Types.ObjectId;
    userId: string;
    agentId?: string;
    startTime: Date;
    endTime: Date;
    status: ViewingStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}