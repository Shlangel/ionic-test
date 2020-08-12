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

  public addSubtask(id: number): Observable<string> {
    const item = this.items.find(items => items.id === id);
    const subtaskId = `${item.id}` + (Math.max(...item.subtasks.map(i => i.id), 0)  % 10 + 1);
    const subtask = {
      id: +subtaskId,
      action: '',
      checked: false,
    };
    item.subtasks.push(subtask);
    if (item.checked) {
      item.checked = false;
    }
    return of(subtaskId);
  }

  public getItems(checked?: boolean, limit?: number, offset?: number): void {
    this.getItemsServer(checked === null ? this.checked : checked, limit, offset)
      .subscribe(list => this.items$.next({
        items: list,
        count: this.filteredItemsLength,
        checked: this.checked
      }));
  }

  public removeItem(id: number): Observable<string> {
    this.items = this.items.filter(items => items.id !== id);
    localStorage.setItem('items', JSON.stringify(this.items));
    this.getItemsServer();
    return of('ok');
  }

  public removeSubtask(itId: number, subId: number): Observable<string> {
    const item = this.items.find(i => i.id === itId);
    item.subtasks = item.subtasks.filter(subtask => subtask.id !== subId);
    localStorage.setItem('items', JSON.stringify(this.items));
    this.getItemsServer();
    return of('ok');
  }

  public check(itId: number, subId?: number): Observable<string> {
    const item = this.items.find(i => i.id === itId);
    if (!subId) {
      item.checked = !item.checked;
    } else {
      const subtask = item.subtasks.find(s => s.id === subId);
      subtask.checked = !subtask.checked;
      item.checked = item.subtasks.length === item.subtasks.filter(s => s.checked === true).length ? true : false;
    }
    return of('ok');
  }

  public editItem(id: number, value: string): Observable<string> {
    const target = this.items.find(item => item.id === id);
    target.action = value;
    return of('ok');
  }

  public editSubtask(itemId: number, subtaskId: number, value: string): Observable<string> {
    const item = this.items.find(item => item.id === itemId);
    const subtask = item.subtasks.find(subtask => subtask.id === subtaskId);
    value ? subtask.action = value : item.subtasks = item.subtasks.filter(subtask => subtask.id !== subtaskId);
    subtask.action = value;
    return of('ok');
  }

}
