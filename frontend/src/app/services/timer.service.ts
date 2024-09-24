import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timers: { [key: string]: number } = {};
  private timeLeftSubjects: { [key: string]: Subject<number> } = {};

  startTimer(rideId: string, duration: number) {
    if (!this.timers[rideId]) {
      this.timers[rideId] = duration;
      this.timeLeftSubjects[rideId] = new Subject<number>();
      this.countdown(rideId);
    }
  }

  private countdown(rideId: string) {
    if (this.timers[rideId] > 0) {
      setTimeout(() => {
        this.timers[rideId]--;
        this.timeLeftSubjects[rideId].next(this.timers[rideId]);
        this.countdown(rideId);
      }, 1000);
    } else {
      delete this.timers[rideId];
      delete this.timeLeftSubjects[rideId];
    }
  }

  getTimeLeft(rideId: string) {
    return this.timers[rideId];
  }

  getTimeLeftObservable(rideId: string) {
    if (!this.timeLeftSubjects[rideId]) {
      this.timeLeftSubjects[rideId] = new Subject<number>();
    }
    return this.timeLeftSubjects[rideId].asObservable();
  }
}