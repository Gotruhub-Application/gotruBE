
import { Schema, Document, Model, model } from 'mongoose';
import { IResult } from '../../interfaces/organization/result.interface';
import { TermModel } from './monitorFeature.models';

const resultSchema: Schema<IResult> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Session',
    },
    organization: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
    },
    term: {
        type: Schema.Types.ObjectId,
        ref: 'Term',
    },
    subUnit: {
        type: Schema.Types.ObjectId,
        ref: 'SubUnit',
    },
    file: {
        type: Schema.Types.ObjectId,
        ref: 'Media',
    },
    // uploaded: {
    //     type: Boolean,
    //     required: true
    // }
}, {
    timestamps: true
});

// resultSchema.pre("save", async function(next){
//     if(this.isNew){
//         const term = await TermModel.findById(this.term)
//         this.sessionId = term?.sessionId
//     };
//     next()
// })

resultSchema.pre("findOne", function(){
    this
    .populate("subUnit")
    .populate("term")
    .populate("file")
    .populate("user");
  });

  resultSchema.pre("find", function(){
    this
    .populate("subUnit")
    .populate("term")
    .populate("user")
    .populate("file");
  });

export const Result: Model<IResult> = model<IResult>('Result', resultSchema);