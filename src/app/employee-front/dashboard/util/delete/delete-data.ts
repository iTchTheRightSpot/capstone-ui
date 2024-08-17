import { Observable } from 'rxjs';

export interface DeleteData<T> {
  name: string; // represents name of data user would like to delete
  asyncButton: Observable<T>; // represents api call to server.
}
