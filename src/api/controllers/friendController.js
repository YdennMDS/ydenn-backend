const Friend = require("../models/friendModel");
const User = require("../models/userModel");
const notificationController = require("./notificationController");

// Envoyer une demande d'ami
exports.sendFriendRequest = async (req, res) => {
  try {
    // Utiliser toString() pour s'assurer que les IDs sont des chaînes
    const requesterId = req.user.id.toString();
    const { recipientId } = req.body;

    // console.log("Requester ID:", requesterId);
    // console.log("Recipient ID:", recipientId);

    // Vérifier que les IDs sont valides
    if (!requesterId) {
      return res.status(401).json({
        error: "Utilisateur non authentifié ou ID utilisateur manquant",
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        error: "ID du destinataire manquant",
      });
    }

    // Vérifier que l'utilisateur n'envoie pas une demande à lui-même
    if (requesterId === recipientId) {
      return res.status(400).json({
        error: "Vous ne pouvez pas vous envoyer une demande d'ami à vous-même",
      });
    }

    // Vérifier que le destinataire existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Vérifier si une demande d'ami existe déjà
    const existingFriendship = await Friend.findOne({
      $or: [
        { friend_requester: requesterId, friend_recipient: recipientId },
        { friend_requester: recipientId, friend_recipient: requesterId },
      ],
    });

    if (existingFriendship) {
      // Vérifier le statut de la demande existante
      if (existingFriendship.friend_status === "accepted") {
        return res.status(400).json({
          error: "Vous êtes déjà ami avec cet utilisateur",
        });
      } else if (
        existingFriendship.friend_status === "pending" &&
        existingFriendship.friend_requester.toString() === requesterId
      ) {
        return res.status(400).json({
          error: "Vous avez déjà envoyé une demande d'ami à cet utilisateur",
        });
      } else if (
        existingFriendship.friend_status === "pending" &&
        existingFriendship.friend_recipient.toString() === requesterId
      ) {
        return res.status(400).json({
          error: "Cet utilisateur vous a déjà envoyé une demande d'ami",
        });
      } else if (existingFriendship.friend_status === "blocked") {
        return res.status(400).json({
          error:
            "Vous ne pouvez pas envoyer de demande d'ami à cet utilisateur",
        });
      } else if (existingFriendship.friend_status === "rejected") {
        // Si la demande a été rejetée, on peut la réactiver
        existingFriendship.friend_requester = requesterId;
        existingFriendship.friend_recipient = recipientId;
        existingFriendship.friend_status = "pending";
        await existingFriendship.save();

        // Envoyer une notification
        await notificationController.createNotification(recipientId, {
          sender: requesterId,
          type: "friend_request",
        });

        return res.status(200).json({
          message: "Demande d'ami envoyée avec succès",
          friendship: existingFriendship,
        });
      }
    }

    // Créer une nouvelle demande d'ami
    const newFriendship = new Friend({
      friend_requester: requesterId,
      friend_recipient: recipientId,
      friend_status: "pending",
    });

    await newFriendship.save();

    // Envoyer une notification à l'utilisateur qui reçoit la demande d'ami
    await notificationController.createNotification(recipientId, {
      sender: requesterId,
      type: "friend_request",
    });

    res.status(201).json({
      message: "Demande d'ami envoyée avec succès",
      friendship: newFriendship,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande d'ami:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'envoi de la demande d'ami" });
  }
};

// Accepter une demande d'ami
exports.acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const friendship = await Friend.findById(friendId);

    if (!friendship) {
      return res.status(404).json({ error: "Demande d'ami introuvable" });
    }

    // Vérifier que l'utilisateur est bien le destinataire de la demande
    if (friendship.friend_recipient.toString() !== userId) {
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à accepter cette demande d'ami",
      });
    }

    // Vérifier que la demande est en attente
    if (friendship.friend_status !== "pending") {
      return res.status(400).json({
        error: "Cette demande d'ami ne peut pas être acceptée",
        status: friendship.friend_status,
      });
    }

    // Mettre à jour le statut de la demande
    friendship.friend_status = "accepted";
    await friendship.save();

    // Envoyer une notification au demandeur initial pour l'informer que sa demande a été acceptée
    const requesterId = friendship.friend_requester.toString();
    await notificationController.createNotification(requesterId, {
      sender: userId,
      type: "friend_accept",
    });

    // Récupérer les informations de l'ami pour la réponse avec les détails de l'avatar
    const friend = await User.findById(friendship.friend_requester)
      .select("username userAvatar")
      .populate("userAvatar");

    res.json({
      message: "Demande d'ami acceptée avec succès",
      friendship: {
        _id: friendship._id,
        friend: {
          _id: friend._id,
          username: friend.username,
          avatar: friend.userAvatar,
        },
        status: friendship.friend_status,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'acceptation de la demande d'ami:", error);
    res.status(500).json({
      error: "Erreur lors de l'acceptation de la demande d'ami",
    });
  }
};

// Rejeter une demande d'ami
exports.rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const friendship = await Friend.findById(friendId);

    if (!friendship) {
      return res.status(404).json({ error: "Demande d'ami introuvable" });
    }

    // Vérifier que l'utilisateur est bien le destinataire de la demande
    if (friendship.friend_recipient.toString() !== userId) {
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à rejeter cette demande d'ami",
      });
    }

    // Vérifier que la demande est en attente
    if (friendship.friend_status !== "pending") {
      return res.status(400).json({
        error: "Cette demande d'ami ne peut pas être rejetée",
        status: friendship.friend_status,
      });
    }

    // Mettre à jour le statut de la demande
    friendship.friend_status = "rejected";
    await friendship.save();

    res.json({
      message: "Demande d'ami rejetée avec succès",
      friendship: {
        _id: friendship._id,
        status: friendship.friend_status,
      },
    });
  } catch (error) {
    console.error("Erreur lors du rejet de la demande d'ami:", error);
    res.status(500).json({
      error: "Erreur lors du rejet de la demande d'ami",
    });
  }
};

// Supprimer un ami
exports.removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    // Vérifier que l'ami existe
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    // Trouver la relation d'amitié
    const friendship = await Friend.findOne({
      $or: [
        {
          friend_requester: userId,
          friend_recipient: friendId,
          friend_status: "accepted",
        },
        {
          friend_requester: friendId,
          friend_recipient: userId,
          friend_status: "accepted",
        },
      ],
    });

    if (!friendship) {
      return res.status(404).json({ error: "Relation d'amitié introuvable" });
    }

    // Supprimer la relation d'amitié
    await Friend.deleteOne({ _id: friendship._id });

    res.json({
      message: "Ami supprimé avec succès",
      removedFriendId: friendId,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'ami:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'ami" });
  }
};

// Obtenir la liste des amis
exports.getFriendsList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver toutes les relations d'amitié acceptées
    const friendships = await Friend.find({
      $or: [
        { friend_requester: userId, friend_status: "accepted" },
        { friend_recipient: userId, friend_status: "accepted" },
      ],
    })
      .populate({
        path: "friend_requester",
        select: "username userAvatar",
        populate: { path: "userAvatar" },
      })
      .populate({
        path: "friend_recipient",
        select: "username userAvatar",
        populate: { path: "userAvatar" },
      });

    // Extraire les amis
    const friends = friendships.map((friendship) => {
      const friend =
        friendship.friend_requester._id.toString() === userId
          ? friendship.friend_recipient
          : friendship.friend_requester;

      return {
        _id: friend._id,
        username: friend.username,
        avatar: friend.userAvatar,
        friendshipId: friendship._id,
      };
    });

    res.json({ friends });
  } catch (error) {
    console.error("Erreur lors de la récupération des amis:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des amis" });
  }
};

// Obtenir les demandes d'ami en attente
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver toutes les demandes d'ami en attente où l'utilisateur est le destinataire
    const pendingRequests = await Friend.find({
      friend_recipient: userId,
      friend_status: "pending",
    }).populate({
      path: "friend_requester",
      select: "username userAvatar",
      populate: { path: "userAvatar" },
    });

    const requests = pendingRequests.map((request) => ({
      _id: request._id,
      requester: {
        _id: request.friend_requester._id,
        username: request.friend_requester.username,
        avatar: request.friend_requester.userAvatar,
      },
      createdAt: request.createdAt,
    }));

    res.json({ requests });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'ami:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des demandes d'ami",
    });
  }
};
