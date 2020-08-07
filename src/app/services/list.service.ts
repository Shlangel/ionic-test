import { Injectable } from '@angular/core';
import { ListItem } from '../interfaces/list-item.interface';
import { Observable, of, BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  items: ListItem[] = [];

  items$ = new BehaviorSubject<any>({
    items: this.items,
    count: this.items.length,
  });

  filteredItemsLength: number;
  checked = undefined;

  public getItemsServer(checked?: boolean, limit = 4, offset = 0): Observable<any> {
    this.checked = checked;
    if (this.items.length) {
      localStorage.setItem('items', JSON.stringify(this.items));
    } else {
      this.items = JSON.parse(localStorage.getItem('items')) || [];
    }
    if (checked) {
      this.checked = checked;
      this.filteredItemsLength = this.items.filter(item => item.checked === true).length;
      return of(this.items.filter(item => item.checked === true).slice(offset, offset + limit));
    }
    if (checked === false) {
      this.checked = checked;
      this.filteredItemsLength = this.items.filter(item => item.checked === false).length;
      return of(this.items.filter(item => item.checked === false).slice(offset, offset + limit));
    }
    this.filteredItemsLength = this.items.length;
    return of(this.items.slice(offset, offset + limit));
  }

  public addItem(action: string): Observable<string> {
    const item = {
      id: Math.max(...this.items.map(i => i.id), 0) + 1,
      action,
      checked: false,
      subtasks: [],
    };
    this.items.unshift(item);
    return of('ok');
  }

  public addSubtask(action: string, id: number): Observable<string> {
    const item = this.items.find(items => items.id === id);
    const subtask = {
      id: Math.max(...item.subtasks.map(i => i.id), 0) + 1,
      action,
      checked: false,
    };
    item.subtasks.push(subtask);
    return of('ok');
  }

  public getItems(checked?: boolean, limit?: number, offset?: number): void {
    this.getItemsServer(checked === null ? this.checked : checked, limit, offset)
      .subscribe(list => this.items$.next({
        items: list,
        count: this.filteredItemsLength,
      }));
  }

  public removeItem(id: number): Observable<string> {
    this.items = this.items.filter(items => items.id !== id);
    localStorage.setItem('items', JSON.stringify(this.items));
    return of('ok');
  }

  public check(id: number): Observable<string> {
    const item = this.items.find(i => i.id === id);
    item.checked = !item.checked;
    return of('ok');
  }

  public edit(id: number, value: string): Observable<string> {
    const target = this.items.find(item => item.id === id);
    target.action = value;
    return of('ok');
  }

}
