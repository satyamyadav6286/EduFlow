# How to Start the Application

This guide provides instructions for starting both the client and server components of the EduFlow application using PowerShell.

## Starting the Server

1. Open a PowerShell terminal
2. Navigate to the server directory:
   ```powershell
   cd server
   ```
3. Start the server:
   ```powershell
   npm run dev
   ```

## Starting the Client

1. Open a new PowerShell terminal window
2. Navigate to the client directory:
   ```powershell
   cd client
   ```
3. Start the client:
   ```powershell
   npm run dev
   ```

## Note on PowerShell Command Chaining

Unlike Bash, PowerShell does not use `&&` to chain commands. Instead, use one of these approaches:

1. Use semicolons to separate commands:
   ```powershell
   cd client; npm run dev
   ```

2. Or use separate lines for each command:
   ```powershell
   cd client
   npm run dev
   ```

## Common Issues

### Error: Port Already in Use (EADDRINUSE)

If you see an error like "Error: listen EADDRINUSE: address already in use :::3000", it means the port is already being used by another application. To fix this:

1. Find and close the application using the port
2. Or modify the server port in `server/.env` file

### Package.json Not Found

If you see errors about not finding package.json, make sure you're in the correct directory:
- For client: `C:\Users\satya\OneDrive\Desktop\EduFlow\client`
- For server: `C:\Users\satya\OneDrive\Desktop\EduFlow\server`

## Additional Resources

- For more information on the client application, refer to `client/README.md`
- For server API documentation, see `server/README.md` 