const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createUserToken = require('../helpers/create-user-token');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body;

    if(!name) {
      return res.status(422).json({message: "Name is required."});
    };

    if(!phone) {
      return res.status(422).json({message: "Phone is required."});
    };

    if(!email) {
      return res.status(422).json({message: "Email is required."});
    };

    if(!password) {
      return res.status(422).json({message: "Password is required."});
    };

    if(!confirmPassword) {
      return res.status(422).json({message: "You need to confirm your password."});
    };

    if(password != confirmPassword) {
      return res.status(422).json({message: "Passwords doesn't match."});
    };

    const userExists = await User.findOne({ email: email });

    if(userExists) {
      return res.status(422).json({message: "Email already in use."});
    };

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, phone, password: passwordHash });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
      return;
    } catch(err) {
      return res.status(500).json({ message: err });
    };
  };

  static async login(req, res) {
    const { email, password } = req.body;

    if(!email) {
      return res.status(422).json({message: "Email is required."});
    };

    if(!password) {
      return res.status(422).json({message: "Password is required."});
    };

    const user = await User.findOne({ email: email });

    if(!user) {
      return res.status(422).json({message: "Email not registered."});
    };

    const checkPassword = await bcrypt.compare(password, user.password);

    if(!checkPassword) {
      return res.status(422).json({ message: "Invalid password." });
    };

    await createUserToken(user, req, res);
    return;
  };

  static async checkUser(req, res) {
    let currentUser;
    if(req.headers.authorization) {
      const token = getToken(req);
      const decoded = jwt.verify(token, "oursecret");
      currentUser = await User.findById(decoded.id);
      currentUser.password = undefined;
    } else{
      currentUser = null;
    };
    return res.status(200).send(currentUser);
  };

  static async getUserById(req, res) {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");

    if(!user) {
      return res.status(422).json({ message: "User not found." });
    };
    
    return res.status(200).json({ user });
  };

  static async editUser(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const { name, email, phone, password, confirmPassword } = req.body;
    
    if(req.file) {
      user.image = req.file.filename;
    };

    if(!name) {
      return res.status(422).json({ message: "Name is required."} );
    };
    user.name = name;

    if(!email) {
      return res.status(422).json({ message: "Email is required."} );
    };
    const emailExists = await User.findOne({ email: email });

    if(user.email !== email && emailExists){
      return res.status(422).json({ message: "Email already in use."} );
    };
    user.email = email;

    if(!phone) {
      return res.status(422).json({ message: "Phone is required."} );
    };
    user.phone = phone;

    if(password != confirmPassword) {
      return res.status(422).json({message: "Passwords doesn't match."});
    } else if(password === confirmPassword && password != null) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      user.password = passwordHash;
    }
    
    try {
      await User.findOneAndUpdate(
        { _id: user.id }, 
        { $set: user }, 
        { new: true }
      );
      user.password = undefined;
      return res.status(200).json({ message: "User updated successfully.", user});
    } catch(err) {
      return res.status(500).json({ message: err });
    };
  };
};