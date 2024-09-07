import { EventEmitter } from 'events';
import { Organization } from '../models/organization.models';
import { sendTemplateMail } from '../support/helpers';

// Define the custom emitter class
class MyEmitter extends EventEmitter {
  emitCustomEvent(data: object) {
    this.emit('announcement', data);
  }
}

// Create an instance of the custom emitter
export const myEmitter = new MyEmitter();

// Set up event listener
myEmitter.on('announcement', async (data: object) => {
  try {
    // Fetch active organizations
    const organizations = await Organization.find({ isActive: true });

    // Send emails to all active organizations
    await Promise.all(
      organizations.map(async (organization) => {
        await sendTemplateMail(
          organization.email,
          "New Announcement",
          "templates/announcementEmailTemplate.html",
          { name: organization.nameOfEstablishment, ...data }
        );
      })
    );

  } catch (error) {
    console.error('Error handling announcement event:', error);
  }
});
