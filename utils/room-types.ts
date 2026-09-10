/** Flip Fixer–style room types for contractor multi-room carts. */

export type RoomType = {
  id: string;
  name: string;
};

export const ROOM_TYPES: RoomType[] = [
  { id: "kitchen", name: "Kitchen" },
  { id: "bathroom", name: "Bathroom" },
  { id: "bedroom", name: "Bedroom" },
  { id: "closet", name: "Closet" },
  { id: "laundry_room", name: "Laundry" },
  { id: "living_room", name: "Living room" },
  { id: "dining_room", name: "Dining room" },
  { id: "home_office", name: "Office" },
  { id: "hallway_entryway", name: "Hall / entry" },
  { id: "garage", name: "Garage" },
  { id: "other", name: "Other" },
];

export type CartRoom = {
  instanceId: string;
  roomId: string;
  displayName: string;
};

export function newRoomInstance(roomId: string): CartRoom {
  const type = ROOM_TYPES.find((r) => r.id === roomId) || ROOM_TYPES[ROOM_TYPES.length - 1];
  return {
    instanceId: crypto.randomUUID(),
    roomId: type.id,
    displayName: type.name,
  };
}

/** Kitchen → Kitchen; second kitchen → Kitchen 2 (Flip Fixer style). */
export function roomLabel(rooms: CartRoom[], room: CartRoom) {
  const same = rooms.filter((item) => item.roomId === room.roomId);
  if (same.length <= 1) return room.displayName;
  const number = same.findIndex((item) => item.instanceId === room.instanceId) + 1;
  return `${room.displayName} ${number}`;
}

export function labelForInstance(rooms: CartRoom[], instanceId: string) {
  const room = rooms.find((r) => r.instanceId === instanceId);
  if (!room) return "Unassigned";
  return roomLabel(rooms, room);
}
