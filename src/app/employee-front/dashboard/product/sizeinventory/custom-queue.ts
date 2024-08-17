import { BehaviorSubject } from 'rxjs';

export class CustomQueue<T> {
  private readonly arr: T[];
  private readonly subject = new BehaviorSubject<boolean>(false);
  readonly queue$ = this.subject.asObservable();

  constructor() {
    this.arr = [];
  }

  /**
   * adds to the end of the array
   * */
  addToQueue(data: T): void {
    this.arr.push(data);
    this.subject.next(true);
  }

  removeFromQueue(index: number): void {
    this.arr.splice(index, 1);
    this.subject.next(!this.isEmpty());
  }

  endOfQueue(): T {
    return this.arr[this.arr.length - 1];
  }

  size(): number {
    return this.arr.length;
  }

  isEmpty(): boolean {
    return this.arr.length === 0;
  }

  toArray(): T[] {
    return this.arr;
  }

  clear(): void {
    this.arr.length = 0;
    this.subject.next(false);
  }
}
