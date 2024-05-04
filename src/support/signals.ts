import EventEmitter from 'events';
import { Iuser } from '../interfaces/organization'
import { User } from '../models/organization.models';
import { generateQrcode } from './helpers';

const userEmitter = new EventEmitter()

export function emitUserCreationSignal(user:Iuser){
    userEmitter.emit("user_created", user)
}

async function onUserCreated(user:Iuser){
    if(user.guardians == undefined) return
    await User.findByIdAndUpdate(user._id, {$set:{passQrcode: await generateQrcode(user.guardians.toString())}})
}

// Subscribe to the user_created event
userEmitter.on('user_created', onUserCreated);
