const schedule = require("node-schedule");
const Room = require("../models/roomModel");
const notificationController = require("../controllers/notificationController");

// Map pour stocker les tâches planifiées
const scheduledJobs = new Map();

/**
 * Planifie le démarrage automatique d'une room
 * @param {Object} room - L'objet room à démarrer
 */
const scheduleRoomStart = async (room) => {
  try {
    // Vérifier si la room a une date de démarrage
    if (!room.room_start_time) {
      console.log(`La room ${room._id} n'a pas de date de démarrage définie`);
      return;
    }

    // Convertir la date de démarrage en objet Date
    const startTime = new Date(room.room_start_time);

    // Calculer la date de rappel (5 minutes avant)
    const reminderTime = new Date(startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 5);

    const now = new Date();

    // Vérifier si la date est dans le futur
    if (startTime <= now) {
      console.log(
        `La date de démarrage de la room ${room._id} est déjà passée`
      );
      return;
    }

    console.log(
      `Planification du démarrage de la room ${room._id} pour ${startTime}`
    );

    // Annuler les tâches existantes si elles existent
    cancelRoomStart(room._id.toString());

    // Planifier la notification de rappel 5 minutes avant
    if (reminderTime > now) {
      const reminderId = `${room._id.toString()}_reminder`;

      console.log(
        `Planification du rappel pour la room ${room._id} à ${reminderTime} (5 minutes avant)`
      );

      const reminderJob = schedule.scheduleJob(reminderTime, async () => {
        try {
          console.log(
            `Envoi du rappel pour la room ${room._id} (5 minutes avant)`
          );

          // Récupérer la room avec les participants
          const updatedRoom = await Room.findById(room._id).populate(
            "room_participants"
          );

          if (!updatedRoom) {
            console.log(
              `Room ${room._id} introuvable lors de l'envoi du rappel`
            );
            return;
          }

          // Envoyer une notification à tous les participants
          const participantsToNotify = updatedRoom.room_participants;

          console.log(
            `Envoi de rappels à ${participantsToNotify.length} participants`
          );

          for (const participant of participantsToNotify) {
            try {
              await notificationController.createNotification(participant._id, {
                sender: updatedRoom.room_owner,
                type: "room_reminder",
                roomId: updatedRoom._id,
              });
              console.log(`Rappel envoyé à ${participant._id}`);
            } catch (notifError) {
              console.error(
                `Erreur lors de l'envoi du rappel à ${participant._id}:`,
                notifError
              );
            }
          }

          // Supprimer la tâche de rappel de la map
          scheduledJobs.delete(reminderId);
        } catch (error) {
          console.error(
            `Erreur lors de l'envoi du rappel pour la room ${room._id}:`,
            error
          );
        }
      });

      // Stocker la tâche de rappel dans la map
      scheduledJobs.set(reminderId, reminderJob);
    }

    // Planifier la tâche de démarrage
    const startJob = schedule.scheduleJob(startTime, async () => {
      try {
        console.log(`Démarrage automatique de la room ${room._id}`);

        // Récupérer la room avec les participants
        const updatedRoom = await Room.findById(room._id).populate(
          "room_participants"
        );

        if (!updatedRoom) {
          console.log(
            `Room ${room._id} introuvable lors du démarrage automatique`
          );
          return;
        }

        // Envoyer une notification à tous les participants
        const participantsToNotify = updatedRoom.room_participants;

        console.log(
          `Envoi de notifications à ${participantsToNotify.length} participants`
        );

        for (const participant of participantsToNotify) {
          try {
            await notificationController.createNotification(participant._id, {
              sender: updatedRoom.room_owner,
              type: "room_start",
              roomId: updatedRoom._id,
            });
            console.log(`Notification envoyée à ${participant._id}`);
          } catch (notifError) {
            console.error(
              `Erreur lors de l'envoi de la notification à ${participant._id}:`,
              notifError
            );
          }
        }

        // Supprimer la tâche de la map
        scheduledJobs.delete(room._id.toString());

        console.log(`Room ${room._id} démarrée avec succès`);
      } catch (error) {
        console.error(
          `Erreur lors du démarrage automatique de la room ${room._id}:`,
          error
        );
      }
    });

    // Stocker la tâche de démarrage dans la map
    scheduledJobs.set(room._id.toString(), startJob);

    console.log(`Tâches planifiées pour la room ${room._id}`);
  } catch (error) {
    console.error(
      `Erreur lors de la planification du démarrage de la room ${room._id}:`,
      error
    );
  }
};

/**
 * Annule la planification du démarrage d'une room
 * @param {string} roomId - L'ID de la room
 */
const cancelRoomStart = (roomId) => {
  // Annuler la tâche de démarrage
  if (scheduledJobs.has(roomId)) {
    scheduledJobs.get(roomId).cancel();
    scheduledJobs.delete(roomId);
    console.log(`Planification de démarrage annulée pour la room ${roomId}`);
  }

  // Annuler la tâche de rappel
  const reminderId = `${roomId}_reminder`;
  if (scheduledJobs.has(reminderId)) {
    scheduledJobs.get(reminderId).cancel();
    scheduledJobs.delete(reminderId);
    console.log(`Planification de rappel annulée pour la room ${roomId}`);
  }

  return true;
};

/**
 * Planifie le démarrage de toutes les rooms futures au démarrage du serveur
 */
const scheduleAllFutureRooms = async () => {
  try {
    const now = new Date();

    // Récupérer toutes les rooms dont la date de démarrage est dans le futur
    const futureRooms = await Room.find({
      room_start_time: { $gt: now },
    });

    console.log(
      `Planification du démarrage de ${futureRooms.length} rooms futures`
    );

    // Planifier le démarrage de chaque room
    for (const room of futureRooms) {
      await scheduleRoomStart(room);
    }

    console.log("Planification terminée");
  } catch (error) {
    console.error("Erreur lors de la planification des rooms futures:", error);
  }
};

module.exports = {
  scheduleRoomStart,
  cancelRoomStart,
  scheduleAllFutureRooms,
};
