const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// Get all students for teacher
exports.getAllStudentsForTeacher = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("firstName lastName username email status isActive createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("getAllStudentsForTeacher error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
    });
  }
};

// Get one student profile
exports.getStudentProfileForTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({
      _id: id,
      role: "student",
    }).select("firstName lastName username email status isActive createdAt updatedAt");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("getStudentProfileForTeacher error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
    });
  }
};

// Suspend student
exports.suspendStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { status: "suspended", isActive: false },
      { new: true }
    ).select("firstName lastName username email status isActive");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student suspended successfully",
      student,
    });
  } catch (error) {
    console.error("suspendStudent error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to suspend student",
    });
  }
};

// Activate student
exports.activateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { status: "active", isActive: true },
      { new: true }
    ).select("firstName lastName username email status isActive");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student activated successfully",
      student,
    });
  } catch (error) {
    console.error("activateStudent error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to activate student",
    });
  }
};

// Reset student password
exports.resetStudentPasswordByTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      {
        password: hashedPassword,
        passwordResetRequired: true,
      },
      { new: true }
    ).select("firstName lastName username email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      student,
    });
  } catch (error) {
    console.error("resetStudentPasswordByTeacher error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
