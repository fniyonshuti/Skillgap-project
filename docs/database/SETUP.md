# MongoDB Setup

The backend requires MongoDB before it can start.

If you see this error:

```text
connect ECONNREFUSED 127.0.0.1:27017
```

it means the app is trying to use local MongoDB, but MongoDB is not running.

## Option 1: Local MongoDB

1. Install MongoDB Community Server.
2. Start the MongoDB service.
3. Use this value in `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/skills_gap_analysis
```

## Option 2: MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Allow your IP address in Atlas Network Access.
3. Create a database user.
4. Put your connection string in `server/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/skills_gap_analysis
```

## Create the Environment File on Windows

From the project root:

```powershell
Copy-Item server/.env.example server/.env
```

Then edit `server/.env` and set the correct `MONGO_URI`.

To enable Admin registration in the web form, also add:

```env
ADMIN_REGISTRATION_CODE=your-private-admin-code
```
