import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    icon: { 
        type: String, 
        required: true 
    },
    features: [{
        type: String
    }],
    category: {
        type: String,
        required: true,
        enum: ['Career Development', 'Job Search', 'Resume & Portfolio', 'Recruiting', 'Training', 'Other']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

export default Service;