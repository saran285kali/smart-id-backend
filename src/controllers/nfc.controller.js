import Patient from '../models/Patient.js';

export const getPatientByNfc = async (req, res) => {
  try {
    const { nfcId } = req.params;

    const patient = await Patient.findOne({ nfcUuid: nfcId })
      .populate('user', 'name username role');

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "NFC lookup failed" });
  }
};
