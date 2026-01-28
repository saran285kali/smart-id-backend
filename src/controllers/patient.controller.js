const Patient = require('../models/Patient');

//
// 🟢 CREATE PATIENT PROFILE (Patient only, once)
//
exports.createPatientProfile = async (req, res) => {
  try {
    // Check if patient profile already exists
    const existingPatient = await Patient.findOne({ user: req.user._id });
    if (existingPatient) {
      return res.status(400).json({
        message: 'Patient profile already exists'
      });
    }

    const patient = await Patient.create({
      user: req.user._id,
      ...req.body
    });

    res.status(201).json({
      message: 'Patient profile created successfully',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while creating patient profile'
    });
  }
};

//
// 🔵 GET OWN PATIENT PROFILE
//
exports.getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate(
      'user',
      'name email role'
    );

    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found'
      });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while fetching patient profile'
    });
  }
};

//
// 🟡 UPDATE OWN PATIENT PROFILE
//
exports.updateMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        message: 'Patient profile not found'
      });
    }

    res.json({
      message: 'Patient profile updated successfully',
      patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while updating patient profile'
    });
  }
};
