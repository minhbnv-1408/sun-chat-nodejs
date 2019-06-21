'use strict';
/**
 * Module dependencies.
 */

const Room = require('../../models/room.js');
const User = require('../../models/user.js');

exports.makeAndSendNotficationMsg = async (io, roomId, userIdSend, userIdInNotification, contentPadding) => {
  const criteria = { _id: userIdInNotification };
  const user = await User.load({ criteria });
  const content = user.name + contentPadding;
  const room = await Room.storeMessage(roomId, userIdSend, content, true);
  const lastMessage = room.messages.pop();
  const message = await Room.getMessageInfo(roomId, lastMessage._id);

  io.to(roomId).emit('send_new_msg', { message: message });
};

exports.addToListMembers = async (io, roomId, newMemberIds) => {
  let newMemberOfRoom = await Room.getNewMemberOfRoom(roomId, newMemberIds);

  io.to(roomId).emit('add_to_list_members', newMemberOfRoom);
};

exports.addToListRooms = async (io, roomId, newMemberIds) => {
  const rooms = await Room.getRoomInfoNewMember(roomId, newMemberIds);

  rooms.map(room => {
    io.to(room.user).emit('add_to_list_rooms', room);
  });
};

exports.updateMemberOfRoom = async (io, userId, roomId) => {
  let roomInfo = await Room.getInforOfRoom(userId, roomId);

  io.to(roomId).emit('update_member_of_room', roomInfo[0].members_info);
};
