import EventEmitter from 'events';
import { Iuser } from '../interfaces/organization';
import { User } from '../models/organization.models';
import { generateQrcode } from './helpers';
import { INotification } from '../interfaces/general.interface';
import { Notification } from '../models/general.models';

const userEmitter = new EventEmitter();

export function emitUserCreationSignal(user: Iuser) {
    userEmitter.emit("user_created", user);
}

async function onUserCreated(user: Iuser) {
    try {
        if (user.role == "guardian" && user.children.length > 0) {
            console.log(user, "fdsfbdsvvb")

            // Set guardians for each child
            for (const childId of user.children) {
                await User.findByIdAndUpdate(childId, { $set: { guardians: user._id } });
            }
        } else if (user.role === "student" && user.guardians) {
            console.log(user, "12345678")
  
            // Add student to the children array for guardians
            await User.findByIdAndUpdate(user.guardians, { $addToSet: { children: user._id } });
            // Generate and update passQrcode for the student
            const passQrcode = await generateQrcode(user._id.toString());
            await User.findByIdAndUpdate(user._id, { $set: { passQrcode } });
        }
    } catch (error) {
        console.error("Error processing user creation:", error);
    }
}

// Subscribe to the user_created event
userEmitter.on('user_created', onUserCreated);

export async function createNotification(payload:INotification) {
    await Notification.create(payload)
}