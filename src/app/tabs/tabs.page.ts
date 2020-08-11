import { Component, OnInit, ViewChild } from '@angular/core';
import { ListService } from '../services/list.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit{

  checked: boolean;

  constructor(
    private listService: ListService,
    private router: Router) {}

  ngOnInit(): void {
    this.router.navigate([''], {});
  }

  filter(checked: boolean) {
    if (this.checked === checked) {
      return;
    }
    this.checked = checked;
    this.listService.getItems(checked, 4, 0);
  }
}
