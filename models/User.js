const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        fullName: { type: String, default: '' },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isEmailVerified: { type: Boolean, default: false, enum: [true, false] },
        userType: { type: Number, default: 1, enum: [1, 2, 3] }, // 1 -> Admin, 2 -> Organiser, 3 -> Attendee
        emailVerifyToken: { type: String, default: '' },
        address: {
            fullAddress: { type: String, required: true },  // Full human-readable address
            location: {
              type: {
                type: String, 
                enum: ['Point'],  // For GeoJSON 'Point' type
                required: true,
              },
              coordinates: {
                type: [Number],  // Array of [longitude, latitude]
                required: true,
              }
            }
        },
        createdAt: { type: Date },
        updatedAt: { type: Date },
    },
    {
        timestamps: true
    }
);
userSchema.index({ 'address.location': '2dsphere' });  // Add geospatial index for location

const User = mongoose.model('User', userSchema);

module.exports = User;
