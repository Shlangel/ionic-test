import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { ListItem } from '../../interfaces/list-item.interface';
import { ListService } from '../../services/list.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  items: ListItem[] = [];

  public list = new FormGroup({});
  public checked: boolean;
  public currentPage = 0;
  public pageSize = 4;
  public length = 0;

  constructor(private listService: ListService) { }

  ngOnInit(): void {
    this.listService.items$
      .subscribe(itemsList => {
        this.items = itemsList.items;
        this.length = itemsList.count;
        this.list = new FormGroup({});
        if (this.checked !== itemsList.checked) {
          this.currentPage = 0;
        }
        this.checked = itemsList.checked;
        console.log(this.checked);
        this.items.forEach(item => {
          this.list.addControl(
            `${item.id}`, new FormControl({ value: `${item.action}`, disabled: true }, Validators.required));
          item.subtasks.forEach(subtask =>
            this.list.addControl(
              `${subtask.id}`, new FormControl({ value: `${subtask.action}`, disabled: true}, Validators.required)));
        });
        if (this.items.length < 1 && this.currentPage !== 0) {
          this.currentPage -= 1;
          this.getItems();
        }
      });
    this.getItems({
      pageSize: this.pageSize,
      pageIndex: this.currentPage,
    });
  }

  public getItems(event?): void {
    if (event) {
      this.currentPage = event.pageIndex;
    }
    this.listService.getItems(this.checked, event?.pageSize || 4, (event?.pageSize || 4) * (this.currentPage || 0));
    console.log(this.checked);
  }

  public removeItem(id: number, event): void {
    this.listService.removeItem(id)
      .subscribe(() => this.getItems());
    event.stopPropagation();
  }

  public check(itId: number, subId: number): void {
    this.listService.check(itId, subId)
      .subscribe(() => this.getItems());
  }

  public edit(id: number, event): void {
    const formControl = this.list.get(`${id}`);

    if (event.relatedTarget === document.getElementById(`${id}`)) {
      return;
    } else {

      if (formControl.enabled) {
        this.listService.edit(id, formControl.value)
          .subscribe(() => {
            formControl.disable();
            this.getItems();
          });
      } else {
        formControl.enable();
        event.target.parentElement.querySelector('ion-input').setFocus();
      }
    }
    event.stopPropagation();
  }

  public addSubtask(id: number, subtasks) {
    const inputId = +(`${id}` + (subtasks.length + 1));
    this.listService.addSubtask(id)
      .subscribe(() => {
        this.getItems();
        setTimeout(() => {
          this.list.get(`${inputId}`).enable();
          document.getElementById(`${inputId}`).focus();
        }, 0);
      });
  }

  public subtaskBlur(itId: number, subId: number, event) {
    const form = this.list.get(`${subId}`);
    this.listService.subtaskBlur(itId, subId, event.target.value)
      .subscribe(() => this.getItems());
    form.disable();
    event.stopPropagation();
  }
}
