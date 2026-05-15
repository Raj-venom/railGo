import type { Seat, Station, Train } from "../../prisma/generated/client";

type CreateTrainDTO = {
  trainNumber: Train["trainNumber"];
  trainName: Train["trainName"];
  coachName: Train["coachName"];
  seats: Seat[];
};

type createRouteDto = {
  trainId: string;
  stations: Station[] & { sequenceNumber: number }[];
};
export { CreateTrainDTO, createRouteDto };
