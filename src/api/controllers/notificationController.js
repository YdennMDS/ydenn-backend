const Notification = require("../models/notificationModel");

// Récupérer l'instance io depuis index.js
let socketInstance;

exports.setSocketInstance = (instance) => {
  socketInstance = instance;
};

exports.createNotification = async (recipientId, data) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: data.sender,
      type: data.type,
      roomId: data.roomId,
    });

    await notification.save();

    // Envoyer la notification en temps réel via Socket.IO
    if (socketInstance) {
      socketInstance.sendNotification(recipientId, {
        id: notification._id,
        type: notification.type,
        sender: notification.sender,
        roomId: notification.roomId,
        createdAt: notification.createdAt,
      });
    } else {
      console.warn(
        "socketInstance n'est pas défini, impossible d'envoyer la notification en temps réel"
      );
    }

    return notification;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw error;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    console.log(req.user);
    const userId = req.user.id;
    console.log("ID utilisateur:", userId);

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username avatar")
      .populate("roomId", "name");

    // console.log(notifications);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des notifications",
      error,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la notification",
      error,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.status(200).json({
      message: "Toutes les notifications ont été marquées comme lues",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des notifications",
      error,
    });
  }
};
