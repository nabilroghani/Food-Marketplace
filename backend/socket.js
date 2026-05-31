import User from "./models/user.model.js"
import DeliveryAssignment from "./models/deliveryAssignment.model.js";
import { checkDelayedOrders } from "./utils/orderDelay.js";

export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        
        // Identity update
        socket.on('identity', async ({ userId }) => { 
            try {
                if (!userId) return;
                await User.findByIdAndUpdate(userId, {
                    socketId: socket.id, 
                    isOnline: true,
                }, { new: true });
                console.log(`User ${userId} online`);
            } catch (error) {
                console.log("Socket Identity Error:", error);
            }
        });

        // 🔥 NAYA: Order room join karwana (Refresh se bachne ke liye)
        socket.on('joinOrder', (orderId) => {
            socket.join(orderId);
            console.log(`Socket ${socket.id} joined room: ${orderId}`);
        });

        socket.on("updateLiveLocation", async (data) => {
            const { orderId, lat, lon, userId } = data;
            try {
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        location: {
                            type: "Point",
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        }
                    });
                }

                const assignment = await DeliveryAssignment.findOne({
                    order: orderId,
                    assignedTo: userId,
                    status: "assigned",
                });

                if (assignment) {
                    const locationChanged =
                        assignment.lastKnownLocation?.lat !== parseFloat(lat) ||
                        assignment.lastKnownLocation?.lon !== parseFloat(lon);

                    assignment.lastKnownLocation = {
                        lat: parseFloat(lat),
                        lon: parseFloat(lon),
                    };

                    if (locationChanged) {
                        assignment.lastLocationUpdateAt = new Date();
                        assignment.delayNotificationSent = false;
                        assignment.delayNotifiedAt = null;
                    }

                    await assignment.save();
                }

                io.to(orderId).emit(`locationUpdate-${orderId}`, { 
                    lat: parseFloat(lat), 
                    lon: parseFloat(lon) 
                });

                await checkDelayedOrders(io);
                
            } catch (error) {
                console.error("Location Update Error:", error);
            }
        });

        socket.on('disconnect', async () => {
            try {
                await User.findOneAndUpdate({ socketId: socket.id }, {
                    socketId: null,
                    isOnline: false,
                });
            } catch (error) {
                console.log("Disconnect Error:", error);
            }
        });
    });
}
