# Project Get A Pet - Node.js / Express.js / MongoDB / React.js
Project to simulate pet adoption using Node.js, Express.js, MongoDB and React.js.

# Usage
In order to run properlly both api and client server you need to run the 
following command to install all the necessary dependencies inside both folders.
```
npm install
```

Then to start the application run the command in api and client folders.
```
npm start
```

Now you are good to go!

Note: to run the application the way it has to you'll need to install and run a
MongoDB server in your machine.

# Running with Docker
If you want to run all servers (client, api and database) in a container you need
to have docker running and then run the command to build and run all containers:
```
docker-compose up --build
```