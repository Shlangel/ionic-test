import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ListItem } from '../../interfaces/list-item.interface';
import { ListService } from '../../services/list.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  @ViewChild('listInput') listInput: ElementRef;
  @ViewChild('edit') editBtn: ElementRef;

  items: ListItem[] = [];

  public list = new FormGroup({});
  private checked: boolean;
  public currentPage = 0;
  public pageSize = 4;
  public length = 0;

  constructor(private listService: ListService) { }

  ngOnInit(): void {
    this.listService.items$
      .subscribe(itemsList => {
        this.items = itemsList.items;
        this.length = itemsList.count;
        this.items.forEach(item => this.list.addControl(
          `${item.id}`, new FormControl({ value: `${item.action}`, disabled: true }, Validators.required)));
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

  }

  public removeItem(id: number, event): void {
    this.listService.removeItem(id)
      .subscribe(() => this.getItems());
    event.stopPropagation();
  }

  public check(id: number): void {
    this.listService.check(id)
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
        event.target.parentElement.querySelector('input').focus();
      }
    }
    event.stopPropagation();
  }

  public filter(checked): void {
    this.checked = checked;
    this.currentPage = 0;
    this.getItems();
  }

  public addSubtask(id: number, action: string) {
    this.listService(id, action)
      .subscribe(() => this.getItems())
  }

}
