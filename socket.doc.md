# Socket Events Documentation

## ROUTE: BASE_URL

## Client Events

### SEND_PARENT_SIGN_IN_OUT_MESSAGE
- Description: Sends a message to a parent about sign-in or sign-out by and admin device.
- Usage: Emits when an admin sends a sign-in or sign-out message to a parent.

### RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_ADMIN
- Description: Receives a sign-in or sign-out message from an admin.
- Usage: Emits when a parent receives a sign-in or sign-out message from an admin.

### RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_PARENT
- Description: Receives a sign-in or sign-out reponse message from a parent.
- Usage: Emits when an admin receives a sign-in or sign-out message from a parent.

### SEND_SIGN_IN_OUT_APPROVAL_TO_ADMIN
- Description: Sends approval for sign-in or sign-out to an admin.
- Usage: Emits when a parent sends approval for sign-in or sign-out to an admin.

## Server Events

### ERROR
- Description: Indicates an error.
- Usage: Emits when an error occurs.

### SUCCESS
- Description: Indicates a success.
- Usage: Emits when an operation is successful.

### WELCOME
- Description: Indicates a welcome message.
- Usage: Emits when a user connects to the server.

