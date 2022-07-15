const Pet = require('../models/Pet');
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class PetController {
  static async create(req, res) {
    const { name, age, weight, color } = req.body;
    const available = true;
    const images = req.files;

    if (!name) {
      return res.status(422).json({ message: "Name is required" });
    };

    if (!age) {
      return res.status(422).json({ message: "Age is required" });
    };

    if (!weight) {
      return res.status(422).json({ message: "Weight is required" });
    };

    if (!color) {
      return res.status(422).json({ message: "Color is required" });
    };

    if (images.length === 0) {
      return res.status(422).json({ message: "Image is required" });
    };

    const token = getToken(req);
    const user = await getUserByToken(token, req, res);

    const pet = new Pet({
      name, 
      age,
      weight, 
      color, 
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map(image => pet.images.push(image.filename));

    try {
      const newPet = await pet.save();
      return res.status(201).json({ message: "Pet registered successfully!", newPet });
    } catch (error) {
      return res.status(500).json({ message: error });
    };

  };

  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createAt");
    try {
      return res.status(200).json({ pets: pets });  
    } catch (error) {
      return res.status(500).json({ message: error });
    };
  };

  static async getAllUserPets(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
    try {
      return res.status(200).json({ pets });
    } catch (error) {
      return res.status(500).json({ message: error });
    };
  };

  static async getAllUserAdoptions(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "adopter._id": user._id}).sort("-createdAt");
    try {
      return res.status(200).json({ pets });
    } catch (error) {
      return res.status(500).json({ message: error });
    };
  };
  
  static async getPetById(req, res) {
    const id = req.params.id;

    if(!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Invalid id." });
    };

    const pet = await Pet.findOne({ _id: id });

    if(!pet) {
      return res.status(404).json({ message: "Pet not found." });
    };

    return res.status(200).json({ pet });
  };

  static async removePetById(req, res) {
    const id = req.params.id;

    if(!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Invalid id." });
    };

    const pet = await Pet.findOne({ _id: id });

    if(!pet) {
      return res.status(404).json({ message: "Pet not found." });
    };

    const token = getToken(req);
    const user = await getUserByToken(token);

    if(pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({ message: "Error. try again later." });
    };

    await Pet.findByIdAndRemove(id);
    return res.status(200).json({ message: "Pet removed." });
  };

  static async updatePet(req, res) { 
    const id = req.params.id;
    const { name, age, weight, color, available } = req.body;
    const images = req.files;
    let updatedData = {};

    if(!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Invalid id." });
    };

    const pet = await Pet.findOne({ _id: id });

    if(!pet) {
      return res.status(404).json({ message: "Pet not found." });
    };

    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      return res.status(422).json({ message: "Error. try again later." });
    }

    if (!name) {
      return res.status(422).json({ message: "Name is required." });
    } else {
      updatedData.name = name;
    }

    if (!age) {
      return res.status(422).json({ message: "Age is required." });
    } else {
      updatedData.age = age;
    }

    if (!weight) {
      return res.status(422).json({ message: "Weight is required." });
    } else {
      updatedData.weight = weight;
    }

    if (!color) {
      return res.status(422).json({ message: "Color is required." });
    } else {
      updatedData.color = color;
    }

    if (images.length > 0) {
      updatedData.images = [];
      images.map(image => updatedData.images.push(image.filename));
    }

    await Pet.findByIdAndUpdate(id, updatedData);
    return res.status(200).json({ message: "Pet updated." });
  };

  static async schedule(req, res) {
    const id = req.params.id;

    if(!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Invalid id." });
    };

    const pet = await Pet.findOne({ _id: id });

    if(!pet) {
      return res.status(404).json({ message: "Pet not found." });
    };

    const token = getToken(req);
    const user = await getUserByToken(token);

    if(pet.user._id.equals(user._id)) {
      return res.status(422).json({ message: "You can't schedule a visit with your own pet." });
    };

    if(pet.adopter?._id.equals(user._id)) {
      return res.status(422).json({ message: "You've already scheduled a visit with this pet." });
    };

    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image
    };

    await Pet.findByIdAndUpdate(id, pet);
    return res.status(200).json({ message: `Visit scheduled, contact ${pet.user.name} by the phone ${pet.user.phone}.`});
  };

  static async concludeAdoption(req, res) {
    const id = req.params.id;
    if(!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Invalid id." });
    };

    const pet = await Pet.findOne({ _id: id });

    if(!pet) {
      return res.status(404).json({ message: "Pet not found." });
    };

    const token = getToken(req);
    const user = await getUserByToken(token);

    if(!pet.user._id.equals(user._id)) {
      return res.status(422).json({ message: "Error. try again later." });
    };

    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);
    return res.status(200).json({ message: "Congrats, pet adopted." });
  };
};