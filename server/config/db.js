import mongoose from "mongoose";

// Function to connect to the MongoDB database
const connectDB = async () => {
    const retryInterval = 5000; // 5 seconds between retries
    const maxRetries = 5;
    let retries = 0;

    const tryConnect = async () => {
        try {
            const conn = await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            
            // Setup event listeners after successful connection
            mongoose.connection.on('error', (err) => {
                console.log('❌ Database Error:', err);
                attemptReconnect();
            });
            
            mongoose.connection.on('disconnected', () => {
                console.log('❌ Database Disconnected');
                attemptReconnect();
            });

            return true;
        } catch (error) {
            console.error('❌ Connection attempt failed:', error.message);
            return false;
        }
    };

    const attemptReconnect = async () => {
        if (retries < maxRetries) {
            retries++;
            console.log(`Retrying connection... Attempt ${retries} of ${maxRetries}`);
            setTimeout(async () => {
                const success = await tryConnect();
                if (!success && retries === maxRetries) {
                    console.error('❌ Failed to connect after maximum retries');
                    process.exit(1);
                }
            }, retryInterval);
        }
    };

    // Initial connection attempt
    const success = await tryConnect();
    if (!success) {
        await attemptReconnect();
    }
};

export default connectDB;