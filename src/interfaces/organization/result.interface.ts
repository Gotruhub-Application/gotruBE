import { Schema, Document } from 'mongoose';
import { IOrganization, ISubUnit, Iuser } from '../organization';
import { ISession, ITerm } from './monitor.interface';
import { Imedia } from '../media.interface';


export interface IResult extends Document {
    user: Iuser['_id'];
    sessionId: ISession['_id'];
    organization: IOrganization['_id'];
    term: ITerm['_id'];
    subUnit: ISubUnit['_id'];
    file: Imedia['_id'];
    // uploaded: boolean;
}
