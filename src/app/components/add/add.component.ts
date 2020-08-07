import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ListService } from '../../services/list.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  @ViewChild('mainInput') mainInput: ElementRef;

  header = new FormGroup({action: new FormControl()});

  constructor( private listService: ListService ) { }

  ngOnInit(): void {
  }

  get action(): FormControl {
    return this.header.controls.action as FormControl;
  }

  public addItem(): void {
    const value = this.action.value?.trim();
    if (!value) {
      this.action.reset();
      return;
    }
    this.listService.addItem(value)
      .subscribe(() => this.listService.getItems(null));
    this.action.reset();
  }

}
