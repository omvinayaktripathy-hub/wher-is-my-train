export type StopStatus = 'passed' | 'current' | 'upcoming';

export interface StationStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  distanceKm: number;
  day: number;
  platform: string;
  status: StopStatus;
  delayMinutes: number;
  actualArrival?: string;
  actualDeparture?: string;
  coordinates: [number, number]; // [lat, lng]
}

export interface TrainDetails {
  trainNumber: string;
  trainName: string;
  trainType: 'Vande Bharat' | 'Rajdhani' | 'Shatabdi' | 'Duronto' | 'Superfast' | 'Mail/Express';
  sourceStation: string;
  destinationStation: string;
  sourceCode: string;
  destCode: string;
  departureTime: string;
  arrivalTime: string;
  travelDuration: string;
  totalDistanceKm: number;
  runsOn: string[]; // ['Mon', 'Tue', 'Wed', ...]
  currentStatus: {
    statusText: string;
    speedKmH: number;
    delayMinutes: number;
    lastUpdated: string;
    currentStationName: string;
    nextStationName: string;
    distanceToNextKm: number;
    estimatedArrivalNext: string;
    currentCoordinates: [number, number];
    progressPercent: number;
    isTerminated: boolean;
  };
  stops: StationStop[];
}

export interface PassengerStatus {
  passengerNo: number;
  bookingStatus: string;
  currentStatus: string;
  coach: string;
  berthNumber: string;
  berthType: string;
  confirmationProbability?: number;
}

export interface PnrRecord {
  pnrNumber: string;
  trainNumber: string;
  trainName: string;
  doj: string;
  fromStation: string;
  fromCode: string;
  toStation: string;
  toCode: string;
  boardingStation: string;
  classType: string;
  chartStatus: 'Prepared' | 'Not Prepared';
  passengers: PassengerStatus[];
}

export interface StationBoardTrain {
  trainNumber: string;
  trainName: string;
  type: string;
  origin: string;
  destination: string;
  scheduledTime: string;
  expectedTime: string;
  platform: string;
  delayMinutes: number;
  status: 'On Time' | 'Delayed' | 'Departed' | 'Arrived' | 'Approaching';
  direction: 'Arrival' | 'Departure';
}

export interface SeatClassOption {
  code: string;
  name: string;
  fare: number;
  availability: 'AVAILABLE' | 'RAC' | 'WL';
  seatsCount: number;
  updatedAgo: string;
}

export interface TrainFareResult {
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  classes: SeatClassOption[];
}
